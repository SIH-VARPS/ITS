import { joinResiduals, type ArrivalOutcome, type PredictionRecord } from "./outcomes";
import { ModelRegistry } from "./registry";
import { applyCorrection, resetResidualTable, updateFromResiduals } from "./residual";
import { stubArtifact } from "./stubArtifact";

export const RETRAIN_HISTORY_SEED = 20260904;

export type RetrainHistoryPoint = {
  version: string;
  step: string;
  trainedAt: number;
  maeMin: number;
  p80Coverage: number;
  promoted: boolean;
  source: "champion" | "residual" | "retrain";
  reason: string;
};

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function mae(actual: readonly number[], predicted: readonly number[]): number {
  const n = Math.min(actual.length, predicted.length);
  if (n === 0) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += Math.abs(actual[i]! - predicted[i]!);
  return sum / n;
}

function p80Coverage(actual: readonly number[], p80: readonly number[]): number {
  const n = Math.min(actual.length, p80.length);
  if (n === 0) return 0;
  let hits = 0;
  for (let i = 0; i < n; i++) if (actual[i]! <= p80[i]!) hits += 1;
  return hits / n;
}

/**
 * Deterministic refinement loop used by the control-room chart and tests.
 *
 * A synthetically biased section is scored, residual-corrected within the day,
 * then "retrained" (the next artifact absorbs most of the remaining bias).
 * Champion/challenger promotion is the same gate the registry uses in production.
 */
export function buildRetrainHistory(seed: number = RETRAIN_HISTORY_SEED): RetrainHistoryPoint[] {
  resetResidualTable();
  const rng = mulberry32(seed);
  const registry = new ModelRegistry(seed);
  const points: RetrainHistoryPoint[] = [];
  const fromCode = "UJN";
  const toCode = "NAD";
  const trueDelay = 18;
  const n = 48;
  let modelBias = 8.4;
  let trainedAt = Date.parse("2026-09-01T00:00:00Z");

  const sampleDay = (bias: number, correct: boolean) => {
    const predicted: number[] = [];
    const actual: number[] = [];
    const p80: number[] = [];
    const preds: PredictionRecord[] = [];
    const arrivals: ArrivalOutcome[] = [];
    for (let i = 0; i < n; i++) {
      const noise = (rng() - 0.5) * 0.6;
      const raw = trueDelay - bias + noise;
      const used = correct ? applyCorrection(fromCode, toCode, raw) : raw;
      predicted.push(used);
      actual.push(trueDelay);
      p80.push(used + 3.5);
      const predictedAt = trainedAt + i * 60_000;
      const arrivedAt = predictedAt + 45 * 60_000;
      preds.push({
        trainNo: "19305",
        runDate: "2026-09-01",
        stationCode: toCode,
        sequence: 4,
        predictedAt,
        predictedDelayMin: raw,
        p50Min: raw,
        p80Min: raw + 3.5,
        p90Min: raw + 5,
        modelVersion: "loop",
        fromStationCode: fromCode,
        toStationCode: toCode,
        zone: "WR",
        trainClass: "Exp",
      });
      arrivals.push({
        trainNo: "19305",
        runDate: "2026-09-01",
        stationCode: toCode,
        sequence: 4,
        actualDelayMin: trueDelay,
        arrivedAt,
      });
    }
    return { predicted, actual, p80, preds, arrivals };
  };

  const record = (
    version: string,
    step: string,
    source: RetrainHistoryPoint["source"],
    maeMin: number,
    coverage: number,
    promoted: boolean,
    reason: string,
  ) => {
    points.push({
      version,
      step,
      trainedAt,
      maeMin,
      p80Coverage: coverage,
      promoted,
      source,
      reason,
    });
  };

  const baseline = sampleDay(modelBias, false);
  const championMae = mae(baseline.actual, baseline.predicted);
  const championCover = p80Coverage(baseline.actual, baseline.p80);
  const champion = stubArtifact(
    "1.0.0",
    {
      maeMin: championMae,
      medaeMin: championMae * 0.85,
      rmseMin: championMae * 1.2,
      p80Coverage: championCover,
    },
    { trainedAt, rowCount: n },
  );
  registry.seedChampion(champion);
  record("1.0.0", "v1.0.0", "champion", championMae, championCover, true, "seeded champion");

  for (let round = 1; round <= 4; round++) {
    trainedAt += 24 * 60 * 60 * 1000;
    const day = sampleDay(modelBias, false);
    const residuals = joinResiduals(day.preds, day.arrivals);
    updateFromResiduals(residuals);
    const rawPred = residuals.map((row) => row.predictedDelayMin);
    const actual = residuals.map((row) => row.actualDelayMin);
    const afterResidual = rawPred.map((p) => applyCorrection(fromCode, toCode, p));
    const residualMae = mae(actual, afterResidual);
    const residualCover = p80Coverage(
      actual,
      afterResidual.map((v) => v + 3.5),
    );
    record(
      `1.0.${round - 1}+residual`,
      `residual day ${round}`,
      "residual",
      residualMae,
      residualCover,
      false,
      "intra-day section bias correction",
    );

    modelBias *= 0.42;
    resetResidualTable();
    const holdout = sampleDay(modelBias, false);
    const holdoutMae = mae(holdout.actual, holdout.predicted);
    const holdoutCover = p80Coverage(holdout.actual, holdout.p80);
    const challenger = stubArtifact(
      `1.0.${round}`,
      {
        maeMin: holdoutMae,
        medaeMin: holdoutMae * 0.85,
        rmseMin: holdoutMae * 1.2,
        p80Coverage: holdoutCover,
      },
      { trainedAt, rowCount: n },
    );
    const decision = registry.consider(challenger);
    record(
      `1.0.${round}`,
      `v1.0.${round}`,
      "retrain",
      holdoutMae,
      holdoutCover,
      decision.promoted,
      decision.reason,
    );
  }

  return points;
}

/** Precomputed once so the control-room chart and tests share the same loop output. */
export const RETRAIN_HISTORY = buildRetrainHistory();

export function promotedMaeSeries(
  history: readonly RetrainHistoryPoint[] = RETRAIN_HISTORY,
): number[] {
  return history.filter((point) => point.promoted).map((point) => point.maeMin);
}
