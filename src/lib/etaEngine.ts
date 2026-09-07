import type { TrainRoute } from "@/data/trainTypes";
import bundledModel from "@/data/generated/model.json";
import { baselineEta, recoveryAllowanceMin, scheduledArrivalMin } from "@/lib/baseline";
import { classifyDelay } from "@/lib/delayReasons";
import {
  buildFeatures,
  predictDelay,
  reasonLabel,
  type DelayForecast as UiDelayForecast,
} from "@/lib/etaModel";
import { FEATURE_ORDER, type FeatureVector } from "@/lib/features/schema";
import {
  buildSectionFeatures,
  occupancyFixesFromRoutes,
  orderedFeatureValues,
  type OccupancyFix,
} from "@/lib/features/sectionFeatures";
import { istMidnightUtcMs, istParts, pad2 } from "@/lib/features/ist";
import { logger } from "@/lib/logger";
import { recordEtaLatency, recordPrediction, setModelVersionServed } from "@/lib/metrics";
import { parseModelArtifact } from "@/lib/model/parseArtifact";
import { enforceQuantileMonotonicity, scoreQuantiles } from "@/lib/model/treeEnsemble";
import type { DelayForecast, ModelArtifact } from "@/lib/model/types";
import { getSectionBiasMin, resetResidualTable } from "@/lib/refine/residual";
import {
  getCachedSection,
  hashFeatureRow,
  resetEtaCache,
  sectionCacheKey,
  setCachedSection,
} from "@/lib/etaCache";
import type { ObservationSource, TrainObservation } from "@/server/live/types";

export const FALLBACK_MODEL_VERSION = "fallback";

export type LiveEngineState = {
  elapsedMin: number;
  currentDelayMin: number;
  currentKm: number;
  lastHaltIndex: number;
  haltedDurationMin: number;
  isHalted: boolean;
};

export type HaltEta = {
  haltIndex: number;
  stationCode: string;
  /** Incremental delay summed from the current section through this halt. */
  incremental: DelayForecast;
  /** Absolute delay vs published schedule (P50). */
  delayMin: number;
  etaMin: number;
  p10Min: number;
  p50Min: number;
  p80Min: number;
  p90Min: number;
  ui: UiDelayForecast;
  modelVersion: string;
  features: ReturnType<typeof buildSectionFeatures> | null;
};

export type EtaEngineOptions = {
  artifact?: ModelArtifact | null;
  observations?: readonly TrainObservation[];
  occupancy?: readonly OccupancyFix[];
  weatherCode?: number;
  precipitationMm?: number;
  visibilityKm?: number;
  windSpeedKmph?: number;
  runDate?: string;
  source?: ObservationSource;
  /** When true, skip the (train, halt, featureHash) cache. */
  skipCache?: boolean;
};

function fmtClock(minutesAfterMidnight: number): string {
  const m = ((Math.round(minutesAfterMidnight) % 1440) + 1440) % 1440;
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function istRunDate(at: Date): string {
  const parts = istParts(at);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

export function minutesFromDay0ToIso(runDate: string, minutes: number): string {
  return new Date(istMidnightUtcMs(runDate) + minutes * 60 * 1000).toISOString();
}

let resolvedArtifact: ModelArtifact | null | undefined;
const featureTemplateCache = new Map<string, FeatureVector>();

export function resetEtaEngineForTests(): void {
  resolvedArtifact = undefined;
  resetResidualTable();
  resetEtaCache();
  featureTemplateCache.clear();
}

export function resolveArtifact(override?: ModelArtifact | null): ModelArtifact | null {
  if (override !== undefined) return override;
  if (resolvedArtifact !== undefined) return resolvedArtifact;
  resolvedArtifact = parseModelArtifact(bundledModel);
  return resolvedArtifact;
}

function heuristicSectionDelta(
  train: TrainRoute,
  haltIndex: number,
  live: LiveEngineState,
  now: Date,
): DelayForecast {
  const features = buildFeatures(train, { ...live, date: now });
  const here = predictDelay(features, haltIndex);
  const next = predictDelay(features, haltIndex + 1);
  const p50Min = next.delayMin - here.delayMin;
  const width = Math.max(1, next.intervalMin - here.intervalMin, 2);
  return enforceQuantileMonotonicity({
    p10Min: p50Min - width,
    p50Min,
    p80Min: p50Min + width * 0.5,
    p90Min: p50Min + width,
  });
}

function applySectionResidual(
  train: TrainRoute,
  haltIndex: number,
  delta: DelayForecast,
): DelayForecast {
  const from = train.halts[haltIndex];
  const to = train.halts[haltIndex + 1];
  if (!from || !to) return delta;
  const biasMin = getSectionBiasMin(from.code, to.code);
  if (biasMin === 0) return delta;
  return enforceQuantileMonotonicity({
    p10Min: delta.p10Min + biasMin,
    p50Min: delta.p50Min + biasMin,
    p80Min: delta.p80Min + biasMin,
    p90Min: delta.p90Min + biasMin,
  });
}

function artifactHasTrees(artifact: ModelArtifact): boolean {
  return (
    (artifact.trees.p10?.length ?? 0) > 0 &&
    (artifact.trees.p50?.length ?? 0) > 0 &&
    (artifact.trees.p80?.length ?? 0) > 0 &&
    (artifact.trees.p90?.length ?? 0) > 0
  );
}

function sectionBiasMin(train: TrainRoute, haltIndex: number): number {
  const from = train.halts[haltIndex];
  const to = train.halts[haltIndex + 1];
  if (!from || !to) return 0;
  return getSectionBiasMin(from.code, to.code);
}

function sectionFeaturesForScore(
  train: TrainRoute,
  haltIndex: number,
  live: LiveEngineState,
  now: Date,
  options: EtaEngineOptions,
): FeatureVector {
  const occupancy = options.occupancy;
  const observations = options.observations;
  const shareable = (occupancy?.length ?? 0) === 0 && (observations?.length ?? 0) === 0;
  if (shareable) {
    const from = train.halts[haltIndex]?.code ?? "";
    const to = train.halts[haltIndex + 1]?.code ?? "";
    const key = [
      from,
      to,
      haltIndex,
      live.lastHaltIndex,
      live.currentDelayMin,
      live.currentKm,
      live.elapsedMin,
      live.haltedDurationMin,
      live.isHalted ? 1 : 0,
      train.startsAt,
      train.type,
      options.weatherCode ?? 0,
      options.precipitationMm ?? 0,
      options.visibilityKm ?? 0,
      options.windSpeedKmph ?? 0,
      Math.floor(now.getTime() / 60_000),
    ].join("|");
    const hit = featureTemplateCache.get(key);
    if (hit) return { ...hit, trainNo: train.number };
    const built = buildSectionFeatures({
      train,
      haltIndex,
      at: now,
      ...weatherOptions(options),
    });
    featureTemplateCache.set(key, built);
    return built;
  }
  return buildSectionFeatures({
    train,
    haltIndex,
    at: now,
    ...(observations ? { observations } : {}),
    ...(occupancy ? { occupancy } : {}),
    ...weatherOptions(options),
  });
}

function weatherOptions(options: EtaEngineOptions): {
  weatherCode?: number;
  precipitationMm?: number;
  visibilityKm?: number;
  windSpeedKmph?: number;
} {
  return {
    ...(options.weatherCode !== undefined ? { weatherCode: options.weatherCode } : {}),
    ...(options.precipitationMm !== undefined ? { precipitationMm: options.precipitationMm } : {}),
    ...(options.visibilityKm !== undefined ? { visibilityKm: options.visibilityKm } : {}),
    ...(options.windSpeedKmph !== undefined ? { windSpeedKmph: options.windSpeedKmph } : {}),
  };
}

function scoreSection(
  train: TrainRoute,
  haltIndex: number,
  live: LiveEngineState,
  now: Date,
  options: EtaEngineOptions,
  artifact: ModelArtifact | null,
): { delta: DelayForecast; modelVersion: string; features: HaltEta["features"] } {
  try {
    const features = sectionFeaturesForScore(train, haltIndex, live, now, options);
    if (artifact) {
      if (!artifactHasTrees(artifact)) throw new Error("empty trees");
      const values = orderedFeatureValues(features);
      const key = sectionCacheKey(
        train.number,
        haltIndex,
        hashFeatureRow(values),
        artifact.version,
        sectionBiasMin(train, haltIndex),
      );
      if (!options.skipCache) {
        const hit = getCachedSection(key);
        if (hit) return hit;
      }
      const computed = {
        delta: applySectionResidual(train, haltIndex, scoreQuantiles(artifact, values)),
        modelVersion: artifact.version,
        features,
      };
      if (!options.skipCache) setCachedSection(key, computed);
      return computed;
    }
  } catch {
    /* fall through to heuristic */
  }
  return {
    delta: applySectionResidual(
      train,
      haltIndex,
      heuristicSectionDelta(train, haltIndex, live, now),
    ),
    modelVersion: FALLBACK_MODEL_VERSION,
    features: null,
  };
}

function emptyIncremental(): DelayForecast {
  return { p10Min: 0, p50Min: 0, p80Min: 0, p90Min: 0 };
}

function addDelta(into: DelayForecast, delta: DelayForecast): void {
  into.p10Min += delta.p10Min;
  into.p50Min += delta.p50Min;
  into.p80Min += delta.p80Min;
  into.p90Min += delta.p90Min;
}

function finalizeHaltEta(
  train: TrainRoute,
  haltIndex: number,
  live: LiveEngineState,
  options: EtaEngineOptions,
  incremental: DelayForecast,
  lastFeatures: HaltEta["features"],
  modelVersion: string,
): HaltEta {
  const mono = enforceQuantileMonotonicity(incremental);
  const delayP50 = live.currentDelayMin + mono.p50Min;
  const halt = train.halts[haltIndex]!;
  const etaMin = scheduledArrivalMin(train, haltIndex) + delayP50;
  const ui = toUiForecast(train, haltIndex, live, delayP50, mono, options.weatherCode ?? 0);
  setModelVersionServed(modelVersion);
  return {
    haltIndex,
    stationCode: halt.code,
    incremental: mono,
    delayMin: delayP50,
    etaMin,
    p10Min: live.currentDelayMin + mono.p10Min,
    p50Min: delayP50,
    p80Min: live.currentDelayMin + mono.p80Min,
    p90Min: live.currentDelayMin + mono.p90Min,
    ui,
    modelVersion,
    features: lastFeatures,
  };
}

function toUiForecast(
  train: TrainRoute,
  haltIndex: number,
  live: LiveEngineState,
  delayMin: number,
  incremental: DelayForecast,
  weatherCode: number,
): UiDelayForecast {
  const scheduled = scheduledArrivalMin(train, haltIndex);
  const etaMin = scheduled + delayMin;
  const intervalMin = Math.max(1, Math.round((incremental.p90Min - incremental.p10Min) / 2));
  const reason = classifyDelay({
    delayMin,
    weatherActive: weatherCode >= 45,
    timeOfDayHours: live.elapsedMin / 60,
    isHalted: live.isHalted,
    haltedDurationMin: live.haltedDurationMin,
  });
  return {
    predictedDelayShiftMin: Math.round(incremental.p50Min * 100) / 100,
    delayMin: Math.round(delayMin),
    etaMin: Math.round(etaMin),
    eta: fmtClock(etaMin),
    confidence: confidenceFromInterval(incremental, haltIndex, live.lastHaltIndex),
    intervalMin,
    lowerEta: fmtClock(etaMin - intervalMin),
    upperEta: fmtClock(etaMin + intervalMin),
    reason,
  };
}

function confidenceFromInterval(
  incremental: DelayForecast,
  haltIndex: number,
  lastHaltIndex: number,
): number {
  const width = Math.max(0, incremental.p90Min - incremental.p10Min);
  const horizon = Math.max(1, haltIndex - lastHaltIndex);
  const conf = 0.88 - Math.min(0.4, width / 80) - Math.min(0.2, horizon * 0.03);
  return Math.min(0.95, Math.max(0.35, Math.round(conf * 100) / 100));
}

/**
 * ETA(halt_k) = scheduledArrival(k) + currentDelay + Σ Δ̂[current..k).
 * Quantile bands widen with remaining distance.
 */
export function etaAtHalt(
  train: TrainRoute,
  haltIndex: number,
  live: LiveEngineState,
  now: Date,
  options: EtaEngineOptions = {},
): HaltEta {
  const started = typeof performance !== "undefined" ? performance.now() : Date.now();
  const artifact = resolveArtifact(options.artifact);
  const target = Math.max(0, Math.min(haltIndex, train.halts.length - 1));
  const current = Math.max(0, Math.min(live.lastHaltIndex, train.halts.length - 1));

  let modelVersion = artifact?.version ?? FALLBACK_MODEL_VERSION;
  let lastFeatures: HaltEta["features"] = null;
  const incremental = emptyIncremental();

  if (target > current) {
    for (let i = current; i < target; i++) {
      const scored = scoreSection(train, i, live, now, options, artifact);
      if (scored.modelVersion === FALLBACK_MODEL_VERSION) modelVersion = FALLBACK_MODEL_VERSION;
      else if (modelVersion !== FALLBACK_MODEL_VERSION) modelVersion = scored.modelVersion;
      addDelta(incremental, scored.delta);
      lastFeatures = scored.features;
    }
  } else if (current < train.halts.length - 1) {
    const scored = scoreSection(train, current, live, now, options, artifact);
    lastFeatures = scored.features;
    if (scored.modelVersion !== FALLBACK_MODEL_VERSION) modelVersion = scored.modelVersion;
  }

  const result = finalizeHaltEta(
    train,
    target,
    live,
    options,
    incremental,
    lastFeatures,
    modelVersion,
  );
  recordPrediction(1);
  const elapsed = (typeof performance !== "undefined" ? performance.now() : Date.now()) - started;
  recordEtaLatency(elapsed);
  return result;
}

/**
 * One section-scoring pass for the remaining route, then prefix-sum per halt.
 * Identical ETAs to calling {@link etaAtHalt} for each index.
 */
export function etaAlongRoute(
  train: TrainRoute,
  live: LiveEngineState,
  now: Date,
  options: EtaEngineOptions = {},
): HaltEta[] {
  const started = typeof performance !== "undefined" ? performance.now() : Date.now();
  const artifact = resolveArtifact(options.artifact);
  const current = Math.max(0, Math.min(live.lastHaltIndex, train.halts.length - 1));
  const lastScoreable = train.halts.length - 1;
  const scored: Array<ReturnType<typeof scoreSection>> = [];
  if (current < lastScoreable) {
    for (let i = current; i < lastScoreable; i++) {
      scored.push(scoreSection(train, i, live, now, options, artifact));
    }
  }

  const out = train.halts.map((_, target) => {
    let modelVersion = artifact?.version ?? FALLBACK_MODEL_VERSION;
    let lastFeatures: HaltEta["features"] = null;
    const incremental = emptyIncremental();
    if (target > current) {
      for (let k = 0; k < target - current; k++) {
        const row = scored[k]!;
        if (row.modelVersion === FALLBACK_MODEL_VERSION) modelVersion = FALLBACK_MODEL_VERSION;
        else if (modelVersion !== FALLBACK_MODEL_VERSION) modelVersion = row.modelVersion;
        addDelta(incremental, row.delta);
        lastFeatures = row.features;
      }
    } else if (current < lastScoreable) {
      const row = scored[0]!;
      lastFeatures = row.features;
      if (row.modelVersion !== FALLBACK_MODEL_VERSION) modelVersion = row.modelVersion;
    }
    return finalizeHaltEta(train, target, live, options, incremental, lastFeatures, modelVersion);
  });

  recordPrediction(out.length);
  const elapsed = (typeof performance !== "undefined" ? performance.now() : Date.now()) - started;
  recordEtaLatency(elapsed);
  return out;
}

/** Next-halt (or destination) score for a fleet. Shared occupancy/artifact via options. */
export function scoreFleet(
  trains: readonly TrainRoute[],
  now: Date,
  options: EtaEngineOptions = {},
): HaltEta[] {
  return trains.map((train) => {
    const live = inferLiveState(train, now, options.observations);
    const target = Math.min(live.lastHaltIndex + 1, Math.max(0, train.halts.length - 1));
    return etaAtHalt(train, target, live, now, options);
  });
}

export function occupancyFromStoreEntries(
  entries: ReadonlyArray<{
    trainNo: string;
    route: TrainRoute;
    observations: readonly TrainObservation[];
  }>,
): OccupancyFix[] {
  return occupancyFixesFromRoutes(entries);
}

/** Clock + observation overlay used by the API and tests. */
export function inferLiveState(
  train: TrainRoute,
  now: Date,
  observations?: readonly TrainObservation[],
): LiveEngineState {
  const minutesNow = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  let elapsed = minutesNow - train.startsAt;
  if (elapsed < 0) elapsed += 1440;

  let lastHaltIndex = 0;
  for (let i = 0; i < train.halts.length; i++) {
    if (train.halts[i]!.arr <= elapsed) lastHaltIndex = i;
  }
  let currentDelayMin = 0;
  if (observations && observations.length > 0) {
    const latest = observations.reduce((best, row) =>
      row.sequence > best.sequence ||
      (row.sequence === best.sequence && row.receivedAt >= best.receivedAt)
        ? row
        : best,
    );
    const byCode = train.halts.findIndex(
      (halt) => halt.code.toUpperCase() === latest.stationCode.toUpperCase(),
    );
    lastHaltIndex =
      byCode >= 0 ? byCode : Math.max(0, Math.min(train.halts.length - 1, latest.sequence - 1));
    currentDelayMin = latest.delayMin;
  }
  const lastHalt = train.halts[lastHaltIndex]!;
  const nextHalt = train.halts[lastHaltIndex + 1];
  const isHalted = Boolean(nextHalt) && elapsed <= lastHalt.dep;
  return {
    elapsedMin: elapsed,
    currentDelayMin,
    currentKm: lastHalt.km,
    lastHaltIndex,
    haltedDurationMin: isHalted ? Math.min(20, Math.max(0, elapsed - lastHalt.arr)) : 0,
    isHalted,
  };
}

export type ServedEta = {
  trainNo: string;
  station: string;
  eta: string;
  p50: string;
  p80: string;
  p90: string;
  delayMin: number;
  baselineEta: string;
  improvementMin: number;
  confidence: number;
  reason: string;
  features: Array<{ name: string; value: number; unit: string }>;
  modelVersion: string;
  source: ObservationSource;
  updatedAt: number;
};

const FEATURE_UNITS: Record<string, string> = {
  currentDelayMin: "min",
  delayTrendMin: "min",
  sectionMeanRunMin: "min",
  sectionP80RunMin: "min",
  hourOfDay: "hour",
  dayOfWeek: "dow",
  season: "season",
  dayOfJourney: "day",
  remainingKm: "km",
  remainingHalts: "halts",
  downstreamOccupancy: "trains",
  weatherCode: "wmo",
  precipitationMm: "mm",
  visibilityKm: "km",
  windSpeedKmph: "km/h",
  dwellOverrunMin: "min",
  speedDeviationKmph: "km/h",
};

export function serveEtaResponse(
  train: TrainRoute,
  stationCode: string,
  live: LiveEngineState,
  now: Date,
  options: EtaEngineOptions = {},
): ServedEta | null {
  const haltIndex = train.halts.findIndex(
    (halt) => halt.code.toUpperCase() === stationCode.toUpperCase(),
  );
  if (haltIndex < 0) return null;
  const predicted = etaAtHalt(train, haltIndex, live, now, options);
  logger.info("eta_predict", {
    trainNo: train.number,
    station: train.halts[haltIndex]!.code,
    haltIndex,
    modelVersion: predicted.modelVersion,
    p10Min: Math.round(predicted.p10Min),
    p50Min: Math.round(predicted.p50Min),
    p80Min: Math.round(predicted.p80Min),
    p90Min: Math.round(predicted.p90Min),
    currentDelayMin: live.currentDelayMin,
    remainingHalts:
      predicted.features?.remainingHalts ?? train.halts.length - 1 - live.lastHaltIndex,
    weatherCode: options.weatherCode ?? 0,
    downstreamOccupancy: predicted.features?.downstreamOccupancy ?? 0,
  });
  const runDate = options.runDate ?? options.observations?.[0]?.runDate ?? istRunDate(now);
  const recovery = recoveryAllowanceMin(train, live.lastHaltIndex, haltIndex);
  const baseline = baselineEta(train, haltIndex, live.currentDelayMin, recovery);
  const featureRows =
    predicted.features === null
      ? []
      : FEATURE_ORDER.map((name) => ({
          name,
          value: predicted.features![name],
          unit: FEATURE_UNITS[name] ?? "1",
        }));

  return {
    trainNo: train.number,
    station: train.halts[haltIndex]!.code,
    eta: minutesFromDay0ToIso(runDate, predicted.etaMin),
    p50: minutesFromDay0ToIso(runDate, scheduledArrivalMin(train, haltIndex) + predicted.p50Min),
    p80: minutesFromDay0ToIso(runDate, scheduledArrivalMin(train, haltIndex) + predicted.p80Min),
    p90: minutesFromDay0ToIso(runDate, scheduledArrivalMin(train, haltIndex) + predicted.p90Min),
    delayMin: Math.round(predicted.delayMin),
    baselineEta: minutesFromDay0ToIso(runDate, baseline.etaMin),
    improvementMin: Math.round(baseline.delayMin - predicted.delayMin),
    confidence: predicted.ui.confidence,
    reason: reasonLabel(predicted.ui.reason),
    features: featureRows,
    modelVersion: predicted.modelVersion,
    source: options.source ?? "replay",
    updatedAt: options.observations?.[0]?.receivedAt ?? now.getTime(),
  };
}
