import type { Halt, TrainRoute } from "@/data/trainTypes";
import { persistenceDelayMin, recoveredDelayMin, recoveryAllowanceMin } from "@/lib/baseline";
import { FEATURE_ORDER, type FeatureVector } from "@/lib/features/schema";
import { buildFeaturesFromRawRun, rawRunAt, type RawRun } from "@/lib/features/sectionFeatures";
import { istParts } from "@/lib/features/ist";

export const HORIZONS = ["next", "plus3h", "destination"] as const;
export type Horizon = (typeof HORIZONS)[number];

export const PLUS_3H_MIN = 180;
export const DEFAULT_FOLD_COUNT = 3;
export const DEFAULT_EVAL_SEED = 20260315;
export const METRIC_DECIMALS = 6;
export const WORST_K = 100;

export type Provenance = "synthetic" | "railradar";

export type DelayPrediction = {
  p10Min: number;
  p50Min: number;
  p80Min: number;
  p90Min: number;
};

export type Predictor = (sample: EvalSample) => DelayPrediction;

export type ErrorMetrics = {
  mae: number;
  medae: number;
  rmse: number;
};

export type ReliabilityBin = {
  bin: string;
  predictedMean: number;
  observedMean: number;
  n: number;
};

export type Calibration = {
  p80Coverage: number;
  p10Coverage: number;
  reliability: ReliabilityBin[];
};

export type SliceRow = {
  key: string;
  n: number;
  mae: number;
  medae: number;
  rmse: number;
};

export type Breakdowns = {
  zone: SliceRow[];
  trainClass: SliceRow[];
  hour: SliceRow[];
  dayOfJourney: SliceRow[];
  delayMagnitude: SliceRow[];
};

export type WorstRow = {
  trainNo: string;
  runDate: string;
  horizon: Horizon;
  currentHaltIndex: number;
  targetHaltIndex: number;
  actualDelayMin: number;
  predictedP50Min: number;
  absErrorMin: number;
  provenance: Provenance;
  zone: string;
  trainClass: string;
  features: Record<string, number>;
};

export type HorizonBlock = {
  n: number;
  model: ErrorMetrics;
  baselineA: ErrorMetrics;
  baselineB: ErrorMetrics;
  baselineC: ErrorMetrics;
  improvementVsBPct: number;
  calibration: Calibration;
  breakdowns: Breakdowns;
};

export type CohortReport = {
  n: number;
  horizons: Record<Horizon, HorizonBlock>;
  worst100: WorstRow[];
};

export type FoldSpec = {
  id: number;
  trainCutoff: string;
  trainRunCount: number;
  testRunCount: number;
  trainKeys: string[];
  testKeys: string[];
};

export type EvalReport = {
  generatedAt: string;
  seed: number;
  foldCount: number;
  modelVersion: string;
  folds: FoldSpec[];
  synthetic: CohortReport;
  real: CohortReport;
};

export type EvalSample = {
  trainNo: string;
  runDate: string;
  provenance: Provenance;
  zone: string;
  trainClass: string;
  hourOfDay: number;
  dayOfJourney: number;
  horizon: Horizon;
  currentHaltIndex: number;
  targetHaltIndex: number;
  currentDelayMin: number;
  actualDelayMin: number;
  scheduledArrivalMin: number;
  recoveryMin: number;
  atMs: number;
  weatherCode: number;
  features: Record<string, number>;
};

export type EvaluateOptions = {
  predictor: Predictor;
  seed?: number;
  foldCount?: number;
  now?: Date;
  modelVersion?: string;
};

const RELIABILITY_EDGES = [0, 5, 15, 30, 60, Number.POSITIVE_INFINITY] as const;

export function runKey(trainNo: string, runDate: string): string {
  return `${trainNo}|${runDate}`;
}

export function sampleRunKey(sample: EvalSample): string {
  return runKey(sample.trainNo, sample.runDate);
}

export function roundMetric(value: number, decimals: number = METRIC_DECIMALS): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * In-place Fisher–Yates shuffle of `actualDelayMin`. Predictors that read the
 * label still "oracle" after this; honest predictors lose their edge vs B.
 */
export function shuffleTargetsInPlace(samples: EvalSample[], seed: number): void {
  const rng = mulberry32(seed);
  const values = samples.map((sample) => sample.actualDelayMin);
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = values[i]!;
    values[i] = values[j]!;
    values[j] = tmp;
  }
  for (let i = 0; i < samples.length; i++) {
    samples[i]!.actualDelayMin = values[i]!;
  }
}

export function errorMetrics(errors: readonly number[]): ErrorMetrics {
  if (errors.length === 0) {
    return { mae: 0, medae: 0, rmse: 0 };
  }
  const abs = errors.map((error) => Math.abs(error));
  const mae = abs.reduce((sum, value) => sum + value, 0) / abs.length;
  const sorted = [...abs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const medae =
    sorted.length % 2 === 1
      ? (sorted[mid] ?? 0)
      : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
  const mse = errors.reduce((sum, error) => sum + error * error, 0) / errors.length;
  return {
    mae: roundMetric(mae),
    medae: roundMetric(medae),
    rmse: roundMetric(Math.sqrt(mse)),
  };
}

export function improvementVsBPct(modelMae: number, baselineBMae: number): number {
  if (!Number.isFinite(baselineBMae) || baselineBMae === 0) return 0;
  return roundMetric(((baselineBMae - modelMae) / baselineBMae) * 100);
}

export function delayMagnitudeKey(actualDelayMin: number): string {
  if (actualDelayMin < 5) return "on-time";
  if (actualDelayMin < 30) return "moderate";
  return "severe";
}

function reliabilityBinLabel(lo: number, hi: number): string {
  if (!Number.isFinite(hi)) return `${lo}+`;
  return `${lo}–${hi}`;
}

function binIndex(predictedP50: number): number {
  for (let i = 0; i < RELIABILITY_EDGES.length - 1; i++) {
    const lo = RELIABILITY_EDGES[i]!;
    const hi = RELIABILITY_EDGES[i + 1]!;
    if (predictedP50 >= lo && predictedP50 < hi) return i;
  }
  return RELIABILITY_EDGES.length - 2;
}

function emptyHorizonBlock(): HorizonBlock {
  return {
    n: 0,
    model: { mae: 0, medae: 0, rmse: 0 },
    baselineA: { mae: 0, medae: 0, rmse: 0 },
    baselineB: { mae: 0, medae: 0, rmse: 0 },
    baselineC: { mae: 0, medae: 0, rmse: 0 },
    improvementVsBPct: 0,
    calibration: { p80Coverage: 0, p10Coverage: 0, reliability: [] },
    breakdowns: {
      zone: [],
      trainClass: [],
      hour: [],
      dayOfJourney: [],
      delayMagnitude: [],
    },
  };
}

function emptyCohort(): CohortReport {
  return {
    n: 0,
    horizons: {
      next: emptyHorizonBlock(),
      plus3h: emptyHorizonBlock(),
      destination: emptyHorizonBlock(),
    },
    worst100: [],
  };
}

function sliceRows(groups: Map<string, number[]>): SliceRow[] {
  const rows: SliceRow[] = [];
  const keys = [...groups.keys()].sort();
  for (const key of keys) {
    const errors = groups.get(key) ?? [];
    const metrics = errorMetrics(errors);
    rows.push({ key, n: errors.length, ...metrics });
  }
  return rows;
}

type ScoredSample = {
  sample: EvalSample;
  prediction: DelayPrediction;
  modelError: number;
  errorA: number;
  errorB: number;
  errorC: number;
};

function scoreSample(sample: EvalSample, predictor: Predictor): ScoredSample {
  const prediction = predictor(sample);
  const actual = sample.actualDelayMin;
  const predA = 0;
  const predB = recoveredDelayMin(sample.currentDelayMin, sample.recoveryMin);
  const predC = persistenceDelayMin(sample.currentDelayMin);
  return {
    sample,
    prediction,
    modelError: prediction.p50Min - actual,
    errorA: predA - actual,
    errorB: predB - actual,
    errorC: predC - actual,
  };
}

function calibrationOf(rows: readonly ScoredSample[]): Calibration {
  if (rows.length === 0) {
    return { p80Coverage: 0, p10Coverage: 0, reliability: [] };
  }
  let p80Hits = 0;
  let p10Hits = 0;
  const buckets: Array<{ pred: number[]; obs: number[] }> = RELIABILITY_EDGES.slice(0, -1).map(
    () => ({ pred: [], obs: [] }),
  );
  for (const row of rows) {
    if (row.sample.actualDelayMin <= row.prediction.p80Min) p80Hits += 1;
    if (row.sample.actualDelayMin >= row.prediction.p10Min) p10Hits += 1;
    const idx = binIndex(row.prediction.p50Min);
    const bucket = buckets[idx];
    if (bucket) {
      bucket.pred.push(row.prediction.p50Min);
      bucket.obs.push(row.sample.actualDelayMin);
    }
  }
  const reliability: ReliabilityBin[] = [];
  for (let i = 0; i < buckets.length; i++) {
    const bucket = buckets[i]!;
    if (bucket.pred.length === 0) continue;
    const lo = RELIABILITY_EDGES[i]!;
    const hi = RELIABILITY_EDGES[i + 1]!;
    const predictedMean = bucket.pred.reduce((sum, value) => sum + value, 0) / bucket.pred.length;
    const observedMean = bucket.obs.reduce((sum, value) => sum + value, 0) / bucket.obs.length;
    reliability.push({
      bin: reliabilityBinLabel(lo, hi),
      predictedMean: roundMetric(predictedMean),
      observedMean: roundMetric(observedMean),
      n: bucket.pred.length,
    });
  }
  return {
    p80Coverage: roundMetric(p80Hits / rows.length),
    p10Coverage: roundMetric(p10Hits / rows.length),
    reliability,
  };
}

function breakdownsOf(rows: readonly ScoredSample[]): Breakdowns {
  const zone = new Map<string, number[]>();
  const trainClass = new Map<string, number[]>();
  const hour = new Map<string, number[]>();
  const dayOfJourney = new Map<string, number[]>();
  const delayMagnitude = new Map<string, number[]>();
  const push = (map: Map<string, number[]>, key: string, error: number) => {
    const list = map.get(key);
    if (list) list.push(error);
    else map.set(key, [error]);
  };
  for (const row of rows) {
    const { sample, modelError } = row;
    push(zone, sample.zone, modelError);
    push(trainClass, sample.trainClass, modelError);
    push(hour, String(sample.hourOfDay), modelError);
    push(dayOfJourney, String(sample.dayOfJourney), modelError);
    push(delayMagnitude, delayMagnitudeKey(sample.actualDelayMin), modelError);
  }
  return {
    zone: sliceRows(zone),
    trainClass: sliceRows(trainClass),
    hour: sliceRows(hour),
    dayOfJourney: sliceRows(dayOfJourney),
    delayMagnitude: sliceRows(delayMagnitude),
  };
}

function horizonBlockOf(rows: readonly ScoredSample[]): HorizonBlock {
  if (rows.length === 0) return emptyHorizonBlock();
  const model = errorMetrics(rows.map((row) => row.modelError));
  const baselineA = errorMetrics(rows.map((row) => row.errorA));
  const baselineB = errorMetrics(rows.map((row) => row.errorB));
  const baselineC = errorMetrics(rows.map((row) => row.errorC));
  return {
    n: rows.length,
    model,
    baselineA,
    baselineB,
    baselineC,
    improvementVsBPct: improvementVsBPct(model.mae, baselineB.mae),
    calibration: calibrationOf(rows),
    breakdowns: breakdownsOf(rows),
  };
}

function roundFeatures(features: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  const keys = Object.keys(features).sort();
  for (const key of keys) {
    const value = features[key];
    out[key] = typeof value === "number" ? roundMetric(value) : 0;
  }
  return out;
}

function worstRowsOf(rows: readonly ScoredSample[]): WorstRow[] {
  const ranked = [...rows].sort((a, b) => {
    const absA = Math.abs(a.modelError);
    const absB = Math.abs(b.modelError);
    if (absB !== absA) return absB - absA;
    if (a.sample.trainNo !== b.sample.trainNo) {
      return a.sample.trainNo < b.sample.trainNo ? -1 : 1;
    }
    if (a.sample.runDate !== b.sample.runDate) {
      return a.sample.runDate < b.sample.runDate ? -1 : 1;
    }
    if (a.sample.horizon !== b.sample.horizon) {
      return a.sample.horizon < b.sample.horizon ? -1 : 1;
    }
    return a.sample.currentHaltIndex - b.sample.currentHaltIndex;
  });
  return ranked.slice(0, WORST_K).map((row) => ({
    trainNo: row.sample.trainNo,
    runDate: row.sample.runDate,
    horizon: row.sample.horizon,
    currentHaltIndex: row.sample.currentHaltIndex,
    targetHaltIndex: row.sample.targetHaltIndex,
    actualDelayMin: roundMetric(row.sample.actualDelayMin),
    predictedP50Min: roundMetric(row.prediction.p50Min),
    absErrorMin: roundMetric(Math.abs(row.modelError)),
    provenance: row.sample.provenance,
    zone: row.sample.zone,
    trainClass: row.sample.trainClass,
    features: roundFeatures(row.sample.features),
  }));
}

function cohortReport(rows: readonly ScoredSample[]): CohortReport {
  if (rows.length === 0) return emptyCohort();
  const byHorizon: Record<Horizon, ScoredSample[]> = {
    next: [],
    plus3h: [],
    destination: [],
  };
  for (const row of rows) {
    byHorizon[row.sample.horizon].push(row);
  }
  return {
    n: rows.length,
    horizons: {
      next: horizonBlockOf(byHorizon.next),
      plus3h: horizonBlockOf(byHorizon.plus3h),
      destination: horizonBlockOf(byHorizon.destination),
    },
    worst100: worstRowsOf(rows),
  };
}

function uniqueSorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort();
}

/**
 * Expanding walk-forward folds: train on dates before cutoff T, test on the
 * next date band. A (trainNo, runDate) never appears on both sides of a fold.
 */
export function walkForwardFolds(
  samples: readonly EvalSample[],
  foldCount: number = DEFAULT_FOLD_COUNT,
): FoldSpec[] {
  const keysByDate = new Map<string, Set<string>>();
  for (const sample of samples) {
    const key = sampleRunKey(sample);
    const bucket = keysByDate.get(sample.runDate);
    if (bucket) bucket.add(key);
    else keysByDate.set(sample.runDate, new Set([key]));
  }
  const dates = [...keysByDate.keys()].sort();
  const folds: FoldSpec[] = [];
  const count = Math.max(1, Math.floor(foldCount));
  for (let f = 0; f < count; f++) {
    const trainEnd = Math.floor(dates.length * (0.4 + f * 0.2));
    const testEnd = f === count - 1 ? dates.length : Math.floor(dates.length * (0.6 + f * 0.2));
    const trainDates = dates.slice(0, trainEnd);
    const testDates = dates.slice(trainEnd, testEnd);
    const trainKeys = uniqueSorted(trainDates.flatMap((date) => [...(keysByDate.get(date) ?? [])]));
    const testKeys = uniqueSorted(testDates.flatMap((date) => [...(keysByDate.get(date) ?? [])]));
    const trainCutoff = testDates[0] ?? trainDates[trainDates.length - 1] ?? "";
    folds.push({
      id: f,
      trainCutoff,
      trainRunCount: trainKeys.length,
      testRunCount: testKeys.length,
      trainKeys,
      testKeys,
    });
  }
  return folds;
}

export function foldHasLeak(fold: FoldSpec): boolean {
  const train = new Set(fold.trainKeys);
  return fold.testKeys.some((key) => train.has(key));
}

function testSamplesForFolds(
  samples: readonly EvalSample[],
  folds: readonly FoldSpec[],
): EvalSample[] {
  const testKeys = new Set(folds.flatMap((fold) => fold.testKeys));
  const seen = new Set<string>();
  const out: EvalSample[] = [];
  for (const sample of samples) {
    const key = sampleRunKey(sample);
    if (!testKeys.has(key)) continue;
    const id = `${key}|${sample.horizon}|${sample.currentHaltIndex}|${sample.targetHaltIndex}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(sample);
  }
  return out;
}

export function evaluate(samples: readonly EvalSample[], options: EvaluateOptions): EvalReport {
  const seed = options.seed ?? DEFAULT_EVAL_SEED;
  const foldCount = options.foldCount ?? DEFAULT_FOLD_COUNT;
  const now = options.now ?? new Date("2026-03-15T00:00:00.000Z");
  const folds = walkForwardFolds(samples, foldCount);
  const holdout = testSamplesForFolds(samples, folds);
  const scored = holdout.map((sample) => scoreSample(sample, options.predictor));
  const synthetic = scored.filter((row) => row.sample.provenance === "synthetic");
  const real = scored.filter((row) => row.sample.provenance === "railradar");
  return {
    generatedAt: now.toISOString(),
    seed,
    foldCount,
    modelVersion: options.modelVersion ?? "unknown",
    folds,
    synthetic: cohortReport(synthetic),
    real: cohortReport(real),
  };
}

export function serializeReport(report: EvalReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

function numericFeatures(vector: FeatureVector): Record<string, number> {
  const out: Record<string, number> = {};
  for (const key of FEATURE_ORDER) {
    out[key] = vector[key];
  }
  return out;
}

function fallbackFeatureVector(
  run: RawRun,
  haltIndex: number,
  current: RawRun["halts"][number],
  hourOfDay: number,
  weatherCode: number,
  last: number,
): FeatureVector {
  return {
    trainNo: run.trainNo,
    fromStationCode: current.code,
    toStationCode: run.halts[haltIndex + 1]?.code ?? current.code,
    currentDelayMin: current.delayMin,
    delayTrendMin: 0,
    sectionMeanRunMin: current.meanRunMin,
    sectionP80RunMin: current.p80RunMin,
    hourOfDay,
    dayOfWeek: 0,
    season: 1,
    dayOfJourney: Math.max(1, Math.round(current.dayOfJourney || 1)),
    trainClass: run.trainClass || "Unknown",
    remainingKm: Math.max(0, (run.halts[last]?.km ?? current.km) - current.km),
    remainingHalts: last - haltIndex,
    downstreamOccupancy: run.occupancyBySection?.[haltIndex] ?? 0,
    weatherCode,
    dwellOverrunMin: 0,
    speedDeviationKmph: 0,
  };
}

function plus3hIndex(arrivals: readonly number[], currentIndex: number): number | null {
  const current = arrivals[currentIndex];
  if (current === undefined) return null;
  const threshold = current + PLUS_3H_MIN;
  for (let j = currentIndex + 1; j < arrivals.length; j++) {
    const arrival = arrivals[j];
    if (arrival !== undefined && arrival >= threshold) return j;
  }
  return null;
}

export function routeFromRawRun(run: RawRun, zone: string): TrainRoute {
  const halts: Halt[] = run.halts.map((halt) => ({
    code: halt.code,
    name: halt.code,
    lat: halt.lat,
    lng: halt.lng,
    km: halt.km,
    arr: halt.arr,
    dep: halt.dep,
    platform: "1",
    day: halt.dayOfJourney,
    dayOfJourney: halt.dayOfJourney,
    coordSource: "lookup",
    ...(typeof halt.speedToNextStationKmph === "number"
      ? { speedToNextStationKmph: halt.speedToNextStationKmph }
      : {}),
  }));
  return {
    number: run.trainNo,
    name: run.trainNo,
    type: run.trainClass || "Unknown",
    startsAt: run.startsAt,
    runsOn: ["Daily"],
    zone,
    halts,
  };
}

function provenanceOf(run: RawRun): Provenance {
  return run.provenance === "railradar" ? "railradar" : "synthetic";
}

export function samplesFromRawRun(
  run: RawRun,
  route: TrainRoute,
  options: { haltStride?: number } = {},
): EvalSample[] {
  const stride = Math.max(1, options.haltStride ?? 1);
  const last = run.halts.length - 1;
  if (last < 1) return [];
  const arrivals = run.halts.map((halt) => halt?.arr ?? 0);
  const samples: EvalSample[] = [];
  const zone = route.zone || "UNK";
  const trainClass = run.trainClass || route.type || "Unknown";
  const provenance = provenanceOf(run);

  for (let i = 0; i < last; i += stride) {
    const current = run.halts[i];
    if (!current) continue;
    const at = rawRunAt(run, i);
    const hourOfDay = istParts(at).hour;
    const weatherCode = Math.max(0, Math.round(run.weatherByHalt?.[i] ?? 0));
    let featureDump: Record<string, number>;
    try {
      featureDump = numericFeatures(buildFeaturesFromRawRun(run, i, at));
    } catch {
      featureDump = numericFeatures(
        fallbackFeatureVector(run, i, current, hourOfDay, weatherCode, last),
      );
    }

    const pushHorizon = (horizon: Horizon, targetHaltIndex: number) => {
      if (targetHaltIndex <= i || targetHaltIndex > last) return;
      const target = run.halts[targetHaltIndex];
      if (!target) return;
      samples.push({
        trainNo: run.trainNo,
        runDate: run.runDate,
        provenance,
        zone,
        trainClass,
        hourOfDay,
        dayOfJourney: Math.max(1, Math.round(current.dayOfJourney || 1)),
        horizon,
        currentHaltIndex: i,
        targetHaltIndex,
        currentDelayMin: current.delayMin,
        actualDelayMin: target.delayMin,
        scheduledArrivalMin: route.startsAt + target.arr,
        recoveryMin: recoveryAllowanceMin(route, i, targetHaltIndex),
        atMs: at.getTime(),
        weatherCode,
        features: featureDump,
      });
    };

    pushHorizon("next", i + 1);
    const plus3 = plus3hIndex(arrivals, i);
    if (plus3 !== null) pushHorizon("plus3h", plus3);
    pushHorizon("destination", last);
  }
  return samples;
}

export function collectEvalSamples(
  runs: readonly RawRun[],
  routes: Map<string, TrainRoute>,
  options: { haltStride?: number } = {},
): EvalSample[] {
  const samples: EvalSample[] = [];
  for (const run of runs) {
    const known = routes.get(run.trainNo);
    const route = known ?? routeFromRawRun(run, "UNK");
    samples.push(...samplesFromRawRun(run, route, options));
  }
  return samples;
}

export function zeroPredictor(_sample: EvalSample): DelayPrediction {
  return { p10Min: 0, p50Min: 0, p80Min: 0, p90Min: 0 };
}

export function oraclePredictor(sample: EvalSample): DelayPrediction {
  const y = sample.actualDelayMin;
  return { p10Min: y, p50Min: y, p80Min: y, p90Min: y };
}

export function persistencePredictor(sample: EvalSample): DelayPrediction {
  const delay = persistenceDelayMin(sample.currentDelayMin);
  return { p10Min: delay, p50Min: delay, p80Min: delay, p90Min: delay };
}
