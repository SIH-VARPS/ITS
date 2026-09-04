import { describe, expect, it } from "vitest";
import { REFINE_POLICY } from "../policy";
import {
  anyMaeAlarm,
  anyPsiAlarm,
  featureDriftReport,
  populationStabilityIndex,
  rollingMae,
} from "../drift";
import type { ResidualRow } from "../outcomes";

function residual(
  partial: Partial<ResidualRow> & Pick<ResidualRow, "residualMin" | "zone" | "trainClass">,
): ResidualRow {
  return {
    trainNo: "19305",
    runDate: "2026-09-01",
    stationCode: "NAD",
    sequence: 4,
    predictedAt: 1,
    arrivedAt: 2,
    predictedDelayMin: 10,
    actualDelayMin: 10 + partial.residualMin,
    horizonMin: 1,
    modelVersion: "1.0.0",
    ...partial,
  };
}

describe("populationStabilityIndex", () => {
  it("raises an alarm when the current distribution is shifted", () => {
    const reference = Array.from({ length: 400 }, (_, i) => (i % 20) + (i % 7) * 0.1);
    const current = reference.map((value) => value + 8);
    const shifted = populationStabilityIndex(reference, current);
    expect(shifted.psi).toBeGreaterThan(REFINE_POLICY.psiAlarm);
    expect(shifted.alarm).toBe(true);

    const report = featureDriftReport(
      { currentDelayMin: reference, hourOfDay: reference },
      {
        currentDelayMin: current,
        hourOfDay: reference,
      },
    );
    const delay = report.find((row) => row.feature === "currentDelayMin");
    const hour = report.find((row) => row.feature === "hourOfDay");
    expect(delay?.alarm).toBe(true);
    expect(hour?.alarm).toBe(false);
    expect(anyPsiAlarm(report)).toBe(true);
  });

  it("stays quiet on identical samples and empty inputs", () => {
    const sample = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const same = populationStabilityIndex(sample, sample);
    expect(same.alarm).toBe(false);
    expect(same.psi).toBeLessThan(REFINE_POLICY.psiAlarm);
    expect(populationStabilityIndex([], [1, 2])).toEqual({ psi: 0, alarm: false, binCount: 10 });
    expect(populationStabilityIndex([1], [1, 2]).psi).toBe(0);
    expect(populationStabilityIndex(sample, sample, 1).psi).toBe(0);
    expect(featureDriftReport({ a: sample }, { b: sample })).toEqual([]);
    expect(anyPsiAlarm([])).toBe(false);
  });

  it("handles a degenerate reference (all values equal)", () => {
    const reference = Array.from({ length: 30 }, () => 4);
    const current = Array.from({ length: 30 }, () => 4);
    const result = populationStabilityIndex(reference, current);
    expect(Number.isFinite(result.psi)).toBe(true);
    expect(result.alarm).toBe(false);
  });
});

describe("rollingMae", () => {
  it("alarms when a zone's MAE exceeds the threshold", () => {
    const wr = Array.from({ length: 8 }, (_, i) =>
      residual({ residualMin: 20, zone: "WR", trainClass: "Exp", arrivedAt: i }),
    );
    const nr = Array.from({ length: 8 }, (_, i) =>
      residual({ residualMin: 1, zone: "NR", trainClass: "Raj", arrivedAt: i }),
    );
    const rows = rollingMae([...wr, ...nr], "zone");
    const west = rows.find((row) => row.key === "WR");
    const north = rows.find((row) => row.key === "NR");
    expect(west?.alarm).toBe(true);
    expect(north?.alarm).toBe(false);
    expect(anyMaeAlarm(rows)).toBe(true);

    const byClass = rollingMae([...wr, ...nr], "trainClass", {
      window: 3,
      minSamples: 3,
      alarmMin: 10,
    });
    expect(byClass.find((row) => row.key === "Exp")?.n).toBe(3);
    expect(anyMaeAlarm([])).toBe(false);
  });

  it("buckets missing labels as unknown and ignores empty groups", () => {
    const rows = rollingMae(
      [residual({ residualMin: 1, zone: "", trainClass: "", arrivedAt: 1 })],
      "zone",
      { minSamples: 5 },
    );
    expect(rows[0]?.key).toBe("unknown");
    expect(rows[0]?.alarm).toBe(false);
    expect(rollingMae([], "zone")).toEqual([]);
    expect(
      rollingMae([residual({ residualMin: 1, zone: "WR", trainClass: "Exp" })], "zone", {
        window: 0,
      }),
    ).toEqual([]);
  });
});
