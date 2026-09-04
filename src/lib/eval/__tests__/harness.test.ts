import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getTrain } from "@/data/trains";
import { recoveredDelayMin } from "@/lib/baseline";
import type { TrainRoute } from "@/data/trainTypes";
import type { RawRun } from "@/lib/features/sectionFeatures";
import {
  collectEvalSamples,
  evaluate,
  foldHasLeak,
  mulberry32,
  oraclePredictor,
  persistencePredictor,
  routeFromRawRun,
  samplesFromRawRun,
  serializeReport,
  shuffleTargetsInPlace,
  walkForwardFolds,
  zeroPredictor,
  type DelayPrediction,
  type EvalSample,
} from "../harness";
import committedReport from "../../../../eval/report.json";
import { parseRawRunsJsonl, loadEvalRuns, selectEvalRuns, writeEvalReport } from "../writeReport";
import { createEtaEnginePredictor, servedModelVersion } from "../modelPredictor";

const NOW = new Date("2026-03-15T00:00:00.000Z");
const SEED = 20260315;

function halt(
  code: string,
  km: number,
  arr: number,
  dep: number,
  delayMin: number,
  dayOfJourney: number = 1,
): RawRun["halts"][number] {
  return {
    code,
    lat: 28.6,
    lng: 77.2,
    km,
    arr,
    dep,
    dayOfJourney,
    speedToNextStationKmph: 80,
    delayMin,
    meanRunMin: Math.max(1, arr > 0 ? 40 : 1),
    p80RunMin: Math.max(1, arr > 0 ? 48 : 1),
  };
}

function fixtureRoute(): TrainRoute {
  return {
    number: "00001",
    name: "Eval Fixture",
    type: "Express",
    startsAt: 360,
    runsOn: ["Daily"],
    zone: "NR",
    halts: [
      {
        code: "AAA",
        name: "Alpha",
        lat: 28.6,
        lng: 77.2,
        km: 0,
        arr: 0,
        dep: 5,
        platform: "1",
        day: 1,
        dayOfJourney: 1,
        coordSource: "lookup",
      },
      {
        code: "BBB",
        name: "Beta",
        lat: 27.0,
        lng: 76.0,
        km: 80,
        arr: 90,
        dep: 95,
        platform: "2",
        day: 1,
        dayOfJourney: 1,
        coordSource: "lookup",
      },
      {
        code: "CCC",
        name: "Gamma",
        lat: 26.0,
        lng: 75.0,
        km: 200,
        arr: 200,
        dep: 208,
        platform: "1",
        day: 1,
        dayOfJourney: 1,
        coordSource: "lookup",
      },
      {
        code: "DDD",
        name: "Delta",
        lat: 25.0,
        lng: 74.0,
        km: 360,
        arr: 400,
        dep: 400,
        platform: "3",
        day: 1,
        dayOfJourney: 1,
        coordSource: "lookup",
      },
    ],
  };
}

function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, (m ?? 1) - 1, (d ?? 1) + days));
  return dt.toISOString().slice(0, 10);
}

function runOnDate(runDate: string, delay: number, provenance: EvalSample["provenance"]): RawRun {
  return {
    trainNo: "00001",
    trainClass: "Express",
    runDate,
    startsAt: 360,
    occupancyBySection: [0, 1, 0, 0],
    weatherByHalt: [0, 0, 61, 0],
    provenance,
    halts: [
      halt("AAA", 0, 0, 5, delay),
      halt("BBB", 80, 90, 95, delay),
      halt("CCC", 200, 200, 208, delay),
      halt("DDD", 360, 400, 400, delay),
    ],
  };
}

function residualPredictor(sample: EvalSample): DelayPrediction {
  const baselineB = recoveredDelayMin(sample.currentDelayMin, sample.recoveryMin);
  const residual = sample.features["delayTrendMin"] ?? 0;
  const p50 = baselineB + residual;
  return { p10Min: p50, p50Min: p50, p80Min: p50, p90Min: p50 };
}

function withResidualHints(samples: EvalSample[]): EvalSample[] {
  return samples.map((sample) => {
    const baselineB = recoveredDelayMin(sample.currentDelayMin, sample.recoveryMin);
    return {
      ...sample,
      features: { ...sample.features, delayTrendMin: sample.actualDelayMin - baselineB },
    };
  });
}

function corpus(
  options: {
    dates?: number;
    provenance?: EvalSample["provenance"];
    delayFor?: (dateIndex: number) => number;
  } = {},
): EvalSample[] {
  const route = fixtureRoute();
  const n = options.dates ?? 10;
  const provenance = options.provenance ?? "synthetic";
  const delayFor = options.delayFor ?? ((i) => 8 + (i % 5) * 4);
  const samples: EvalSample[] = [];
  for (let i = 0; i < n; i++) {
    samples.push(
      ...samplesFromRawRun(runOnDate(addDays("2026-01-05", i), delayFor(i), provenance), route),
    );
  }
  return samples;
}

describe("evaluation harness", () => {
  it("anti-leakage: shuffling the target collapses improvement over Baseline B to ~0%", () => {
    const samples = withResidualHints(
      corpus({ dates: 12, delayFor: (i) => 12 + (i % 4) * 6 }).map((sample) => ({
        ...sample,
        recoveryMin: 1.5,
      })),
    );
    const honest = evaluate(samples, {
      predictor: residualPredictor,
      seed: SEED,
      now: NOW,
      modelVersion: "test",
    });
    expect(honest.synthetic.horizons.next.improvementVsBPct).toBeGreaterThan(20);

    shuffleTargetsInPlace(samples, SEED);
    const shuffled = evaluate(samples, {
      predictor: residualPredictor,
      seed: SEED,
      now: NOW,
      modelVersion: "test",
    });
    expect(Math.abs(shuffled.synthetic.horizons.next.improvementVsBPct)).toBeLessThan(8);
    expect(Math.abs(shuffled.synthetic.horizons.destination.improvementVsBPct)).toBeLessThan(8);
  });

  it("perfect oracle → MAE 0 and 100% coverage", () => {
    const report = evaluate(corpus(), {
      predictor: oraclePredictor,
      seed: SEED,
      now: NOW,
      modelVersion: "oracle",
    });
    for (const horizon of ["next", "plus3h", "destination"] as const) {
      const block = report.synthetic.horizons[horizon];
      expect(block.n).toBeGreaterThan(0);
      expect(block.model.mae).toBe(0);
      expect(block.model.medae).toBe(0);
      expect(block.model.rmse).toBe(0);
      expect(block.calibration.p80Coverage).toBe(1);
      expect(block.calibration.p10Coverage).toBe(1);
    }
  });

  it("constant-zero predictor → exactly Baseline A's numbers", () => {
    const report = evaluate(corpus(), {
      predictor: zeroPredictor,
      seed: SEED,
      now: NOW,
      modelVersion: "zero",
    });
    for (const horizon of ["next", "plus3h", "destination"] as const) {
      const block = report.synthetic.horizons[horizon];
      expect(block.model).toEqual(block.baselineA);
      expect(block.model.mae).not.toEqual(block.baselineB.mae);
    }
  });

  it("fixed seed → byte-identical report.json", () => {
    const samples = corpus({ dates: 10 });
    const a = serializeReport(
      evaluate(samples, {
        predictor: persistencePredictor,
        seed: SEED,
        now: NOW,
        modelVersion: "v",
      }),
    );
    const b = serializeReport(
      evaluate(samples, {
        predictor: persistencePredictor,
        seed: SEED,
        now: NOW,
        modelVersion: "v",
      }),
    );
    expect(a).toBe(b);
    expect(a).toContain('"seed": 20260315');
  });

  it("fold independence: no (trainNo, runDate) appears in both train and test of any fold", () => {
    const samples = corpus({ dates: 12 });
    const folds = walkForwardFolds(samples, 3);
    expect(folds.length).toBe(3);
    for (const fold of folds) {
      expect(foldHasLeak(fold)).toBe(false);
      expect(fold.testRunCount).toBeGreaterThan(0);
      expect(fold.trainRunCount).toBeGreaterThan(0);
      const overlap = fold.trainKeys.filter((key) => fold.testKeys.includes(key));
      expect(overlap).toEqual([]);
    }
    const report = evaluate(samples, {
      predictor: zeroPredictor,
      seed: SEED,
      now: NOW,
    });
    expect(report.folds.every((fold) => !foldHasLeak(fold))).toBe(true);
  });

  it("reports synthetic and real hold-outs separately and never blends them", () => {
    const mixed = [
      ...corpus({ dates: 10, provenance: "synthetic" }),
      ...corpus({ dates: 10, provenance: "railradar" }).map((sample) => ({
        ...sample,
        trainNo: "00002",
      })),
    ];
    const report = evaluate(mixed, {
      predictor: persistencePredictor,
      seed: SEED,
      now: NOW,
    });
    expect(report.synthetic.n).toBeGreaterThan(0);
    expect(report.real.n).toBeGreaterThan(0);
    expect(report.synthetic.n + report.real.n).toBe(
      report.synthetic.horizons.next.n +
        report.synthetic.horizons.plus3h.n +
        report.synthetic.horizons.destination.n +
        report.real.horizons.next.n +
        report.real.horizons.plus3h.n +
        report.real.horizons.destination.n,
    );
    expect(report.synthetic.worst100.every((row) => row.provenance === "synthetic")).toBe(true);
    expect(report.real.worst100.every((row) => row.provenance === "railradar")).toBe(true);
  });

  it("builds next / +3h / destination samples and skips a plus3h when the remaining trip is short", () => {
    const route = fixtureRoute();
    const samples = samplesFromRawRun(runOnDate("2026-01-05", 10, "synthetic"), route);
    const horizons = new Set(samples.map((sample) => sample.horizon));
    expect(horizons.has("next")).toBe(true);
    expect(horizons.has("plus3h")).toBe(true);
    expect(horizons.has("destination")).toBe(true);
    const fromOrigin = samples.filter((sample) => sample.currentHaltIndex === 0);
    expect(fromOrigin.find((sample) => sample.horizon === "plus3h")?.targetHaltIndex).toBe(2);

    const short: RawRun = {
      trainNo: "00003",
      trainClass: "Passenger",
      runDate: "2026-01-06",
      startsAt: 400,
      provenance: "synthetic",
      halts: [halt("AAA", 0, 0, 2, 4), halt("BBB", 20, 40, 42, 6)],
    };
    const shortRoute = routeFromRawRun(short, "WR");
    const shortSamples = samplesFromRawRun(short, shortRoute);
    expect(shortSamples.some((sample) => sample.horizon === "plus3h")).toBe(false);
    expect(shortRoute.zone).toBe("WR");
    expect(samplesFromRawRun({ ...short, halts: [halt("AAA", 0, 0, 2, 4)] }, shortRoute)).toEqual(
      [],
    );
  });

  it("empty real hold-out is zeroed rather than blended into synthetic", () => {
    const report = evaluate(corpus({ dates: 8 }), {
      predictor: zeroPredictor,
      seed: SEED,
      now: NOW,
    });
    expect(report.real.n).toBe(0);
    expect(report.real.horizons.next.n).toBe(0);
    expect(report.real.worst100).toEqual([]);
    expect(report.synthetic.n).toBeGreaterThan(0);
  });

  it("covers empty metrics, NaN recovery, and a leaking predictor still oracles after shuffle", () => {
    expect(walkForwardFolds([], 3).every((fold) => fold.testRunCount === 0)).toBe(true);
    const lonely: EvalSample = {
      trainNo: "9",
      runDate: "2026-01-01",
      provenance: "synthetic",
      zone: "SR",
      trainClass: "Rajdhani",
      hourOfDay: 3,
      dayOfJourney: 2,
      horizon: "next",
      currentHaltIndex: 0,
      targetHaltIndex: 1,
      currentDelayMin: Number.NaN,
      actualDelayMin: 11,
      scheduledArrivalMin: 500,
      recoveryMin: Number.NaN,
      atMs: NOW.getTime(),
      weatherCode: 0,
      features: { currentDelayMin: 0 },
    };
    const report = evaluate([lonely], {
      predictor: zeroPredictor,
      seed: 1,
      now: NOW,
      foldCount: 1,
    });
    expect(report.synthetic.n).toBeGreaterThan(0);
    expect(report.synthetic.horizons.next.baselineA.mae).toBe(
      report.synthetic.horizons.next.model.mae,
    );

    const leakable = corpus({ dates: 10 });
    shuffleTargetsInPlace(leakable, 7);
    const leaked = evaluate(leakable, {
      predictor: oraclePredictor,
      seed: 7,
      now: NOW,
    });
    expect(leaked.synthetic.horizons.next.model.mae).toBe(0);
    expect(mulberry32(1)()).toBeGreaterThan(0);
  });

  it("collectEvalSamples uses the route map zone and parseRawRunsJsonl skips junk", () => {
    const route = fixtureRoute();
    const routes = new Map<string, TrainRoute>([["00001", route]]);
    const samples = collectEvalSamples([runOnDate("2026-02-01", 9, "railradar")], routes);
    expect(samples[0]?.zone).toBe("NR");
    expect(samples[0]?.provenance).toBe("railradar");
    expect(parseRawRunsJsonl("{}\nnot-json\n")).toEqual([]);
    expect(parseRawRunsJsonl('{"trainNo":"1","halts":[]}\n')).toHaveLength(1);
  });

  it("writeEvalReport emits a deterministic file for an injected corpus", () => {
    const dir = mkdtempSync(join(tmpdir(), "raildristhi-eval-"));
    const outPath = join(dir, "report.json");
    const route = fixtureRoute();
    const runs = Array.from({ length: 10 }, (_, i) =>
      runOnDate(addDays("2026-01-05", i), 10 + i, "synthetic"),
    );
    const a = writeEvalReport({
      runs,
      routes: new Map([["00001", route]]),
      predictor: persistencePredictor,
      outPath,
      seed: SEED,
      now: NOW,
      modelVersion: "fixture",
      haltStride: 1,
      maxSyntheticRuns: 10,
    });
    const b = writeEvalReport({
      runs,
      routes: new Map([["00001", route]]),
      predictor: persistencePredictor,
      outPath,
      seed: SEED,
      now: NOW,
      modelVersion: "fixture",
      haltStride: 1,
      maxSyntheticRuns: 10,
    });
    expect(serializeReport(a)).toBe(serializeReport(b));
    const written = JSON.parse(readFileSync(outPath, "utf8")) as { modelVersion: string };
    expect(written.modelVersion).toBe("fixture");
    expect(selectEvalRuns(runs, 3)).toHaveLength(3);
    expect(selectEvalRuns(runs, Number.NaN)).toHaveLength(runs.length);
    const mixed = [
      ...runs.slice(0, 2),
      { ...runs[0]!, trainNo: "00009", provenance: "railradar" as const },
    ];
    expect(selectEvalRuns(mixed, 0).every((run) => run.provenance === "railradar")).toBe(true);
    expect(
      (JSON.parse(readFileSync(outPath, "utf8")) as { folds: Array<{ trainKeys: string[] }> })
        .folds[0]?.trainKeys,
    ).toEqual([]);
    const jsonlPath = join(dir, "raw-runs.jsonl");
    writeFileSync(
      jsonlPath,
      `${JSON.stringify(runOnDate("2026-01-05", 4, "synthetic"))}\n`,
      "utf8",
    );
    expect(loadEvalRuns(jsonlPath)).toHaveLength(1);
    const unknown = collectEvalSamples(
      [{ ...runOnDate("2026-02-02", 3, "synthetic"), trainNo: "99999" }],
      new Map(),
      { haltStride: 2 },
    );
    expect(unknown[0]?.zone).toBe("UNK");
  });

  it("covers remaining metric, fold, and sample-construction branches", () => {
    const onTime = evaluate(corpus({ dates: 10, delayFor: () => 0 }), {
      predictor: zeroPredictor,
      now: NOW,
    });
    expect(onTime.synthetic.horizons.next.improvementVsBPct).toBe(0);
    expect(onTime.synthetic.horizons.next.breakdowns.delayMagnitude[0]?.key).toBe("on-time");

    const defaults = evaluate(corpus({ dates: 8 }), { predictor: zeroPredictor });
    expect(defaults.seed).toBe(SEED);
    expect(defaults.modelVersion).toBe("unknown");

    const nanPred = evaluate(corpus({ dates: 8 }), {
      predictor: () => ({
        p10Min: Number.NaN,
        p50Min: Number.NaN,
        p80Min: Number.NaN,
        p90Min: Number.NaN,
      }),
      now: NOW,
    });
    expect(nanPred.synthetic.horizons.next.model.mae).toBeGreaterThanOrEqual(0);

    const base = corpus({ dates: 10, delayFor: () => 40 })[0]!;
    const tied = evaluate(
      [
        {
          ...base,
          trainNo: "b",
          runDate: "2026-02-02",
          horizon: "next",
          currentHaltIndex: 0,
          features: { x: "nope" as unknown as number },
        },
        {
          ...base,
          trainNo: "a",
          runDate: "2026-02-01",
          horizon: "plus3h",
          currentHaltIndex: 1,
          features: { weird: 1 },
        },
        {
          ...base,
          trainNo: "a",
          runDate: "2026-02-02",
          horizon: "destination",
          currentHaltIndex: 2,
        },
        { ...base, trainNo: "a", runDate: "2026-02-02", horizon: "next", currentHaltIndex: 3 },
      ],
      { predictor: zeroPredictor, now: NOW, foldCount: 1 },
    );
    expect(tied.synthetic.worst100.length).toBeGreaterThan(0);

    const source = runOnDate("2026-03-01", 9, "synthetic");
    const { occupancyBySection: _occ, weatherByHalt: _wx, provenance: _prov, ...rest } = source;
    const blankClass: RawRun = {
      ...rest,
      trainClass: "",
      halts: rest.halts.map((halt) => ({ ...halt, dayOfJourney: 0 })),
    };
    const zoned = routeFromRawRun(blankClass, "");
    zoned.zone = "";
    zoned.type = "Mail";
    const built = samplesFromRawRun(blankClass, zoned, { haltStride: 0 });
    expect(built[0]?.zone).toBe("UNK");
    expect(built[0]?.trainClass).toBe("Mail");
    expect(built[0]?.dayOfJourney).toBe(1);

    const holey = runOnDate("2026-03-02", 5, "synthetic");
    holey.halts.splice(1, 1, undefined as unknown as RawRun["halts"][number]);
    expect(samplesFromRawRun(holey, fixtureRoute()).length).toBeGreaterThan(0);

    const neg = evaluate(corpus({ dates: 8 }), {
      predictor: () => ({ p10Min: -8, p50Min: -3, p80Min: 1, p90Min: 4 }),
      now: NOW,
    });
    expect(neg.synthetic.horizons.next.calibration.reliability.length).toBeGreaterThan(0);
  });

  it("eta engine predictor scores a featured train and zeros unknown trains", () => {
    const train = getTrain("12951");
    expect(train).toBeTruthy();
    const routes = new Map([[train!.number, train!]]);
    const pred = createEtaEnginePredictor(routes);
    const next = train!.halts[1];
    expect(next).toBeTruthy();
    const sample: EvalSample = {
      trainNo: train!.number,
      runDate: "2026-03-15",
      provenance: "synthetic",
      zone: train!.zone,
      trainClass: train!.type,
      hourOfDay: 16,
      dayOfJourney: 1,
      horizon: "next",
      currentHaltIndex: 0,
      targetHaltIndex: 1,
      currentDelayMin: 6,
      actualDelayMin: 8,
      scheduledArrivalMin: train!.startsAt + next!.arr,
      recoveryMin: 0,
      atMs: new Date("2026-03-15T16:00:00+05:30").getTime(),
      weatherCode: 61,
      features: { downstreamOccupancy: 2, currentDelayMin: 6 },
    };
    const out = pred(sample);
    expect(Number.isFinite(out.p50Min)).toBe(true);
    expect(out.p80Min).toBeGreaterThanOrEqual(out.p50Min);
    expect(pred({ ...sample, trainNo: "missing" }).p50Min).toBe(0);
    expect(pred({ ...sample, features: { downstreamOccupancy: 0 } }).p50Min).toBeTypeOf("number");
    expect(pred({ ...sample, features: {} }).p50Min).toBeTypeOf("number");
    expect(
      pred({ ...sample, currentHaltIndex: 9999, features: { downstreamOccupancy: 4 } }).p50Min,
    ).toBeTypeOf("number");
    const last = train!.halts.length - 1;
    expect(
      pred({
        ...sample,
        currentHaltIndex: last,
        targetHaltIndex: last,
        features: { downstreamOccupancy: 3 },
      }).p50Min,
    ).toBeTypeOf("number");
    expect(
      evaluate(corpus({ dates: 8 }), {
        predictor: () => ({ p10Min: -2, p50Min: 72, p80Min: 80, p90Min: 90 }),
        seed: 1,
        now: NOW,
      }).synthetic.horizons.next.calibration.reliability.some((bin) => bin.bin === "60+"),
    ).toBe(true);
    expect(servedModelVersion().length).toBeGreaterThan(0);
    expect(
      (committedReport as { synthetic: { horizons: { next: { n: number } } } }).synthetic.horizons
        .next.n,
    ).toBeGreaterThan(0);
  });
});
