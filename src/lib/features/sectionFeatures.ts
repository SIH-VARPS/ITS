import type { Halt, TrainRoute } from "@/data/trainTypes";
import { historicalDelayAt } from "@/lib/etaModel";
import type { TrainObservation } from "@/server/live/types";
import { FEATURE_ORDER, featureVectorSchema, type FeatureVector } from "./schema";
import { indianSeason, istMidnightUtcMs, istParts } from "./ist";

export const DOWNSTREAM_SECTION_WINDOW = 3;

export type SectionStats = {
  meanRunMin: number;
  p80RunMin: number;
};

export type OccupancyFix = {
  trainNo: string;
  fromCode: string;
  toCode: string;
};

export type RawHalt = {
  code: string;
  lat: number;
  lng: number;
  km: number;
  arr: number;
  dep: number;
  dayOfJourney: number;
  speedToNextStationKmph: number;
  delayMin: number;
  meanRunMin: number;
  p80RunMin: number;
};

export type RawRun = {
  trainNo: string;
  trainClass: string;
  runDate: string;
  startsAt: number;
  occupancyBySection?: number[];
  weatherByHalt?: number[];
  /** Present on training JSONL rows; optional so fixtures stay valid. */
  provenance?: "synthetic" | "railradar";
  halts: RawHalt[];
};

export type BuildSectionFeaturesInput = {
  train: TrainRoute;
  /** 0-based halt at section entry. Requires a next halt. */
  haltIndex: number;
  at: Date;
  /** This train's observations; future sequences are ignored (no leakage). */
  observations?: readonly TrainObservation[];
  occupancy?: readonly OccupancyFix[];
  weatherCode?: number;
  sectionLookup?: (fromCode: string, toCode: string) => SectionStats | undefined;
};

function finite(value: number, fallback: number = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

function wrapDeltaMin(later: number, earlier: number): number {
  let delta = later - earlier;
  if (delta < -12 * 60) delta += 1440;
  if (delta > 12 * 60) delta -= 1440;
  return delta;
}

export function sectionPairKey(fromCode: string, toCode: string): string {
  return `${fromCode.toUpperCase()}|${toCode.toUpperCase()}`;
}

/** Numeric columns in ensemble order. */
export function orderedFeatureValues(vector: FeatureVector): number[] {
  return FEATURE_ORDER.map((key) => {
    const value = vector[key];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`Non-finite feature ${key}`);
    }
    return value;
  });
}

export function publishedSpeedKmph(from: Halt, to: Halt): number {
  const published = from.speedToNextStationKmph;
  if (typeof published === "number" && Number.isFinite(published) && published > 0) {
    return published;
  }
  const hours = Math.max(1 / 60, (to.arr - from.dep) / 60);
  return Math.max(0, to.km - from.km) / hours;
}

function scheduledRunMin(from: Halt, to: Halt): number {
  return Math.max(1, to.arr - from.dep);
}

function delayAtHalt(
  train: TrainRoute,
  haltIndex: number,
  observations: readonly TrainObservation[],
): number {
  const halt = train.halts[haltIndex];
  if (!halt) return 0;
  const maxSeq = haltIndex + 1;
  const atHalt = observations.filter(
    (row) =>
      row.sequence <= maxSeq &&
      (row.stationCode.toUpperCase() === halt.code.toUpperCase() || row.sequence === maxSeq),
  );
  const last = atHalt[atHalt.length - 1];
  if (last && Number.isFinite(last.delayMin)) return last.delayMin;
  return historicalDelayAt(train, haltIndex);
}

function dwellOverrunMin(
  train: TrainRoute,
  haltIndex: number,
  observations: readonly TrainObservation[],
): number {
  const halt = train.halts[haltIndex];
  if (!halt) return 0;
  const maxSeq = haltIndex + 1;
  const code = halt.code.toUpperCase();
  const atHalt = observations.filter(
    (row) => row.sequence <= maxSeq && row.stationCode.toUpperCase() === code,
  );
  const arr = [...atHalt].reverse().find((row) => row.eventType === "ARR");
  const dep = [...atHalt].reverse().find((row) => row.eventType === "DEP");
  if (!arr || !dep) return 0;
  const scheduled = Math.max(0, halt.dep - halt.arr);
  const observed = wrapDeltaMin(dep.actualMin, arr.actualMin);
  return finite(observed - scheduled, 0);
}

function speedDeviationKmph(
  train: TrainRoute,
  haltIndex: number,
  observations: readonly TrainObservation[],
): number {
  if (haltIndex <= 0) return 0;
  const from = train.halts[haltIndex - 1];
  const to = train.halts[haltIndex];
  if (!from || !to) return 0;
  const fromSeq = haltIndex;
  const toSeq = haltIndex + 1;
  const dep = [...observations]
    .reverse()
    .find(
      (row) =>
        row.sequence <= fromSeq &&
        row.eventType === "DEP" &&
        row.stationCode.toUpperCase() === from.code.toUpperCase(),
    );
  const arr = [...observations]
    .reverse()
    .find(
      (row) =>
        row.sequence <= toSeq &&
        row.eventType === "ARR" &&
        row.stationCode.toUpperCase() === to.code.toUpperCase(),
    );
  const published = publishedSpeedKmph(from, to);
  if (!dep || !arr) return 0;
  const runMin = Math.max(1 / 60, wrapDeltaMin(arr.actualMin, dep.actualMin));
  const observed = ((to.km - from.km) / runMin) * 60;
  return finite(observed - published, 0);
}

function delayTrendMin(
  train: TrainRoute,
  haltIndex: number,
  observations: readonly TrainObservation[],
): number {
  const current = delayAtHalt(train, haltIndex, observations);
  const lookback = Math.min(3, haltIndex);
  if (lookback === 0) return 0;
  const earlier = delayAtHalt(train, haltIndex - lookback, observations);
  return finite(current - earlier, 0);
}

export function occupancyFixesFromRoutes(
  entries: ReadonlyArray<{
    trainNo: string;
    route: TrainRoute;
    observations: readonly TrainObservation[];
  }>,
): OccupancyFix[] {
  const fixes: OccupancyFix[] = [];
  for (const entry of entries) {
    if (entry.observations.length === 0) continue;
    const latest = entry.observations.reduce((best, row) =>
      row.sequence > best.sequence ||
      (row.sequence === best.sequence && row.receivedAt > best.receivedAt)
        ? row
        : best,
    );
    const idx = entry.route.halts.findIndex(
      (halt) => halt.code.toUpperCase() === latest.stationCode.toUpperCase(),
    );
    const fromIdx = idx >= 0 ? idx : Math.max(0, latest.sequence - 1);
    const from = entry.route.halts[fromIdx];
    const to = entry.route.halts[fromIdx + 1];
    if (!from || !to) continue;
    fixes.push({ trainNo: entry.trainNo, fromCode: from.code, toCode: to.code });
  }
  return fixes;
}

function downstreamOccupancy(
  train: TrainRoute,
  haltIndex: number,
  occupancy: readonly OccupancyFix[],
): number {
  const wanted = new Set<string>();
  for (let i = haltIndex; i < haltIndex + DOWNSTREAM_SECTION_WINDOW; i++) {
    const from = train.halts[i];
    const to = train.halts[i + 1];
    if (!from || !to) break;
    wanted.add(sectionPairKey(from.code, to.code));
  }
  if (wanted.size === 0) return 0;
  let count = 0;
  for (const fix of occupancy) {
    if (fix.trainNo === train.number) continue;
    if (wanted.has(sectionPairKey(fix.fromCode, fix.toCode))) count += 1;
  }
  return count;
}

function observationsUpTo(
  observations: readonly TrainObservation[] | undefined,
  haltIndex: number,
): TrainObservation[] {
  const maxSeq = haltIndex + 1;
  if (!observations) return [];
  return observations.filter((row) => row.sequence <= maxSeq);
}

function resolveSectionStats(
  from: Halt,
  to: Halt,
  lookup: BuildSectionFeaturesInput["sectionLookup"],
): SectionStats {
  const scheduled = scheduledRunMin(from, to);
  const hit = lookup?.(from.code, to.code);
  return {
    meanRunMin: finite(hit?.meanRunMin ?? scheduled, scheduled),
    p80RunMin: finite(hit?.p80RunMin ?? Math.max(scheduled, scheduled * 1.2), scheduled),
  };
}

function stampVector(fields: FeatureVector): FeatureVector {
  return featureVectorSchema.parse(fields);
}

/**
 * Per-(train, section) feature vector. Halt `i` uses only observations with
 * sequence ≤ i+1 — nothing derived from later actuals.
 */
export function buildSectionFeatures(input: BuildSectionFeaturesInput): FeatureVector {
  const { train, haltIndex, at } = input;
  const from = train.halts[haltIndex];
  const to = train.halts[haltIndex + 1];
  if (!from || !to) {
    throw new Error(`No section at haltIndex ${haltIndex} for train ${train.number}`);
  }
  const dest = train.halts[train.halts.length - 1]!;
  const relevant = observationsUpTo(input.observations, haltIndex);
  const stats = resolveSectionStats(from, to, input.sectionLookup);
  const ist = istParts(at);
  const weatherCode = Math.max(0, Math.round(finite(input.weatherCode ?? 0, 0)));

  return stampVector({
    trainNo: train.number,
    fromStationCode: from.code,
    toStationCode: to.code,
    currentDelayMin: finite(delayAtHalt(train, haltIndex, relevant), 0),
    delayTrendMin: finite(delayTrendMin(train, haltIndex, relevant), 0),
    sectionMeanRunMin: stats.meanRunMin,
    sectionP80RunMin: stats.p80RunMin,
    hourOfDay: ist.hour,
    dayOfWeek: ist.dayOfWeek,
    season: indianSeason(ist.month),
    dayOfJourney: Math.max(1, Math.round(from.dayOfJourney || from.day || 1)),
    trainClass: train.type || "Unknown",
    remainingKm: Math.max(0, dest.km - from.km),
    remainingHalts: Math.max(0, train.halts.length - 1 - haltIndex),
    downstreamOccupancy: Math.max(0, downstreamOccupancy(train, haltIndex, input.occupancy ?? [])),
    weatherCode,
    dwellOverrunMin: finite(dwellOverrunMin(train, haltIndex, relevant), 0),
    speedDeviationKmph: finite(speedDeviationKmph(train, haltIndex, relevant), 0),
  });
}

/** Build a vector from a simulated / harvested raw run (training + skew tests). */
export function buildFeaturesFromRawRun(run: RawRun, haltIndex: number, at: Date): FeatureVector {
  const from = run.halts[haltIndex];
  const to = run.halts[haltIndex + 1];
  if (!from || !to) {
    throw new Error(`No section at haltIndex ${haltIndex} for train ${run.trainNo}`);
  }
  const dest = run.halts[run.halts.length - 1]!;
  const currentDelayMin = finite(from.delayMin, 0);
  const lookback = Math.min(3, haltIndex);
  const earlier =
    lookback === 0 ? currentDelayMin : finite(run.halts[haltIndex - lookback]!.delayMin, 0);
  const ist = istParts(at);
  const occupancy = run.occupancyBySection?.[haltIndex] ?? 0;
  const weatherCode = Math.max(0, Math.round(finite(run.weatherByHalt?.[haltIndex] ?? 0, 0)));

  return stampVector({
    trainNo: run.trainNo,
    fromStationCode: from.code,
    toStationCode: to.code,
    currentDelayMin,
    delayTrendMin: finite(currentDelayMin - earlier, 0),
    sectionMeanRunMin: finite(from.meanRunMin, 1),
    sectionP80RunMin: finite(from.p80RunMin, 1),
    hourOfDay: ist.hour,
    dayOfWeek: ist.dayOfWeek,
    season: indianSeason(ist.month),
    dayOfJourney: Math.max(1, Math.round(from.dayOfJourney || 1)),
    trainClass: run.trainClass || "Unknown",
    remainingKm: Math.max(0, dest.km - from.km),
    remainingHalts: Math.max(0, run.halts.length - 1 - haltIndex),
    downstreamOccupancy: Math.max(0, occupancy),
    weatherCode,
    dwellOverrunMin: 0,
    speedDeviationKmph: 0,
  });
}

export function rawRunAt(run: RawRun, haltIndex: number): Date {
  const halt = run.halts[haltIndex];
  if (!halt) return new Date(istMidnightUtcMs(run.runDate));
  const extra = halt.dep + halt.delayMin;
  return new Date(istMidnightUtcMs(run.runDate) + (run.startsAt + extra) * 60 * 1000);
}
