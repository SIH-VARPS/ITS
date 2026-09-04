import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { featuredRoutes } from "@/data/generated/featured";
import type { TrainRoute } from "@/data/trainTypes";
import type { RawRun } from "@/lib/features/sectionFeatures";
import { generateRawRuns } from "../../../scripts/generate-training-data.mjs";
import {
  collectEvalSamples,
  DEFAULT_EVAL_SEED,
  evaluate,
  serializeReport,
  type EvalReport,
  type Predictor,
} from "./harness";
import { createEtaEnginePredictor, servedModelVersion } from "./modelPredictor";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
export const DEFAULT_REPORT_PATH = join(ROOT, "eval", "report.json");
const RAW_RUNS_PATH = join(ROOT, "ml", "data", "raw-runs.jsonl");

export type WriteEvalReportOptions = {
  outPath?: string;
  seed?: number;
  foldCount?: number;
  now?: Date;
  maxSyntheticRuns?: number;
  haltStride?: number;
  runs?: RawRun[];
  routes?: Map<string, TrainRoute>;
  predictor?: Predictor;
  modelVersion?: string;
};

function isRawRun(value: unknown): value is RawRun {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row["trainNo"] === "string" && Array.isArray(row["halts"]);
}

export function parseRawRunsJsonl(text: string): RawRun[] {
  const runs: RawRun[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const parsed: unknown = JSON.parse(line);
      if (isRawRun(parsed)) runs.push(parsed);
    } catch {
      /* skip malformed line */
    }
  }
  return runs;
}

export function loadEvalRuns(jsonlPath: string = RAW_RUNS_PATH): RawRun[] {
  if (existsSync(jsonlPath)) {
    return parseRawRunsJsonl(readFileSync(jsonlPath, "utf8"));
  }
  const generated = generateRawRuns({ seed: DEFAULT_EVAL_SEED, runsPerTrain: 6 });
  return generated.runs.filter(isRawRun);
}

/**
 * Spread synthetic runs across trains and calendar dates so walk-forward
 * folds have a real time gap. A naive `slice(0, n)` would pin the cap to the
 * first train's first few days.
 */
export function selectEvalRuns(runs: readonly RawRun[], maxSyntheticRuns: number): RawRun[] {
  const real = runs.filter((run) => run.provenance === "railradar");
  const synthetic = runs.filter((run) => run.provenance !== "railradar");
  if (!Number.isFinite(maxSyntheticRuns) || maxSyntheticRuns < 0) {
    return [...synthetic, ...real];
  }
  if (maxSyntheticRuns === 0) return [...real];

  const byTrain = new Map<string, RawRun[]>();
  for (const run of synthetic) {
    const list = byTrain.get(run.trainNo);
    if (list) list.push(run);
    else byTrain.set(run.trainNo, [run]);
  }
  const trains = [...byTrain.keys()].sort();
  const dates = [...new Set(synthetic.map((run) => run.runDate))].sort();
  const dateStride = Math.max(1, Math.floor(dates.length / 12));
  const keepDates = dates.filter((_, index) => index % dateStride === 0);
  const trainCap = Math.max(8, Math.min(trains.length, Math.ceil(maxSyntheticRuns / 10)));
  const chosenTrains = trains.slice(0, trainCap);
  const picked: RawRun[] = [];
  for (const date of keepDates) {
    for (const trainNo of chosenTrains) {
      const run = byTrain.get(trainNo)?.find((row) => row.runDate === date);
      if (!run) continue;
      picked.push(run);
      if (picked.length >= maxSyntheticRuns) return [...picked, ...real];
    }
  }
  return [...picked, ...real];
}

function publicReport(report: EvalReport): EvalReport {
  return {
    generatedAt: report.generatedAt,
    seed: report.seed,
    foldCount: report.foldCount,
    modelVersion: report.modelVersion,
    folds: report.folds.map((fold) => ({
      id: fold.id,
      trainCutoff: fold.trainCutoff,
      trainRunCount: fold.trainRunCount,
      testRunCount: fold.testRunCount,
      trainKeys: [],
      testKeys: [],
    })),
    synthetic: report.synthetic,
    real: report.real,
  };
}

export function writeEvalReport(options: WriteEvalReportOptions = {}): EvalReport {
  const seed = options.seed ?? DEFAULT_EVAL_SEED;
  const now = options.now ?? new Date("2026-03-15T00:00:00.000Z");
  const haltStride = options.haltStride ?? 3;
  const maxSyntheticRuns = options.maxSyntheticRuns ?? 240;
  const routes =
    options.routes ?? new Map(featuredRoutes.map((train) => [train.number, train] as const));
  const runs = selectEvalRuns(options.runs ?? loadEvalRuns(), maxSyntheticRuns);
  const samples = collectEvalSamples(runs, routes, { haltStride });
  const predictor = options.predictor ?? createEtaEnginePredictor(routes);
  const report = evaluate(samples, {
    predictor,
    seed,
    foldCount: options.foldCount ?? 3,
    now,
    modelVersion: options.modelVersion ?? servedModelVersion(),
  });
  const outPath = options.outPath ?? DEFAULT_REPORT_PATH;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, serializeReport(publicReport(report)), "utf8");
  return report;
}
