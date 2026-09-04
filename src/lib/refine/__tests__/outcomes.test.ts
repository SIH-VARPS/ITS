import { describe, expect, it } from "vitest";
import {
  joinResiduals,
  meanAbsError,
  type ArrivalOutcome,
  type PredictionRecord,
} from "../outcomes";

function pred(
  partial: Partial<PredictionRecord> & Pick<PredictionRecord, "predictedAt" | "predictedDelayMin">,
): PredictionRecord {
  return {
    trainNo: "19305",
    runDate: "2026-09-01",
    stationCode: "NAD",
    sequence: 4,
    p50Min: partial.predictedDelayMin,
    p80Min: partial.predictedDelayMin + 4,
    p90Min: partial.predictedDelayMin + 6,
    modelVersion: "1.0.0",
    ...partial,
  };
}

describe("joinResiduals", () => {
  it("pairs a realised arrival with every earlier prediction for that halt", () => {
    const predictions: PredictionRecord[] = [
      pred({
        predictedAt: 1_000,
        predictedDelayMin: 10,
        fromStationCode: "UJN",
        toStationCode: "NAD",
      }),
      pred({
        predictedAt: 2_000,
        predictedDelayMin: 12,
        fromStationCode: "UJN",
        toStationCode: "NAD",
      }),
      pred({
        predictedAt: 3_000,
        predictedDelayMin: 11,
        fromStationCode: "UJN",
        toStationCode: "NAD",
      }),
    ];
    const arrivals: ArrivalOutcome[] = [
      {
        trainNo: "19305",
        runDate: "2026-09-01",
        stationCode: "NAD",
        sequence: 4,
        actualDelayMin: 15,
        arrivedAt: 2_500,
      },
    ];

    const rows = joinResiduals(predictions, arrivals);
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.predictedAt)).toEqual([1_000, 2_000]);
    expect(rows.map((row) => row.residualMin)).toEqual([5, 3]);
    expect(rows[0]?.fromStationCode).toBe("UJN");
    expect(rows[0]?.horizonMin).toBe((2_500 - 1_000) / 60_000);
  });

  it("does not join a different sequence, train, or post-arrival forecast", () => {
    const predictions: PredictionRecord[] = [
      pred({ predictedAt: 1_000, predictedDelayMin: 8, sequence: 3 }),
      pred({ trainNo: "12951", predictedAt: 1_000, predictedDelayMin: 8 }),
      pred({ predictedAt: 9_000, predictedDelayMin: 8 }),
    ];
    const arrivals: ArrivalOutcome[] = [
      {
        trainNo: "19305",
        runDate: "2026-09-01",
        stationCode: "NAD",
        sequence: 4,
        actualDelayMin: 10,
        arrivedAt: 5_000,
      },
    ];
    expect(joinResiduals(predictions, arrivals)).toEqual([]);
    expect(meanAbsError([])).toBe(0);
  });

  it("returns an empty stream when there are no matching arrivals", () => {
    expect(joinResiduals([pred({ predictedAt: 1, predictedDelayMin: 1 })], [])).toEqual([]);
    expect(
      joinResiduals(
        [],
        [
          {
            trainNo: "19305",
            runDate: "2026-09-01",
            stationCode: "NAD",
            sequence: 4,
            actualDelayMin: 1,
            arrivedAt: 2,
          },
        ],
      ),
    ).toEqual([]);
  });
});
