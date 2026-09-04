import { afterEach, describe, expect, it } from "vitest";
import { joinResiduals, type PredictionRecord } from "../outcomes";
import {
  applyCorrection,
  getSectionBiasMin,
  meanAbsErrorOnSection,
  resetResidualTable,
  setSectionBiasMin,
  snapshotResidualTable,
  updateFromResiduals,
} from "../residual";

afterEach(() => {
  resetResidualTable();
});

describe("residual correction", () => {
  it("reduces error on a synthetically biased section", () => {
    const fromCode = "UJN";
    const toCode = "NAD";
    const predicted = Array.from({ length: 24 }, () => 10);
    const actual = predicted.map((value) => value + 6);

    const before = meanAbsErrorOnSection(fromCode, toCode, predicted, actual, false);
    const preds: PredictionRecord[] = predicted.map((value, i) => ({
      trainNo: "19305",
      runDate: "2026-09-01",
      stationCode: toCode,
      sequence: 4,
      predictedAt: 1_000 + i,
      predictedDelayMin: value,
      p50Min: value,
      p80Min: value + 4,
      p90Min: value + 6,
      modelVersion: "1.0.0",
      fromStationCode: fromCode,
      toStationCode: toCode,
    }));
    const arrivals = actual.map((value, i) => ({
      trainNo: "19305",
      runDate: "2026-09-01",
      stationCode: toCode,
      sequence: 4,
      actualDelayMin: value,
      arrivedAt: 5_000 + i,
    }));
    updateFromResiduals(joinResiduals(preds, arrivals));

    const after = meanAbsErrorOnSection(fromCode, toCode, predicted, actual, true);
    expect(before).toBe(6);
    expect(after).toBeLessThan(before);
    expect(getSectionBiasMin(fromCode, toCode)).toBeGreaterThan(3);
    expect(applyCorrection(fromCode, toCode, 10)).toBeGreaterThan(13);
  });

  it("ignores rows without a section and snapshots the table", () => {
    expect(applyCorrection("AAA", "BBB", 4)).toBe(4);
    updateFromResiduals([
      {
        trainNo: "1",
        runDate: "2026-09-01",
        stationCode: "BBB",
        sequence: 1,
        predictedAt: 1,
        arrivedAt: 2,
        predictedDelayMin: 0,
        actualDelayMin: 3,
        residualMin: 3,
        horizonMin: 1,
        modelVersion: "1",
      },
    ]);
    expect(snapshotResidualTable()).toEqual([]);
    setSectionBiasMin("AAA", "BBB", 2.5);
    expect(snapshotResidualTable()).toEqual([{ key: "AAA|BBB", biasMin: 2.5, n: 1 }]);
    setSectionBiasMin("AAA", "BBB", 1);
    expect(getSectionBiasMin("AAA", "BBB")).toBe(1);
    expect(meanAbsErrorOnSection("AAA", "BBB", [], [1], true)).toBe(0);
  });
});
