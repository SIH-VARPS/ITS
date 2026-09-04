import { describe, expect, it } from "vitest";
import {
  clockToMin,
  delayMinFromPair,
  isoToEpochMs,
  parseLegacyDiversion,
  parseLegacyTrainToObservations,
} from "../parseLegacy";

describe("parseLegacyTrainToObservations edge cases", () => {
  it("returns [] for a non-object payload", () => {
    expect(parseLegacyTrainToObservations(null)).toEqual([]);
    expect(parseLegacyTrainToObservations("nope")).toEqual([]);
  });

  it("unwraps a { data } envelope and accepts trainNo", () => {
    const rows = parseLegacyTrainToObservations({
      data: {
        trainNo: "12001",
        route: [
          {
            stationCode: "BPL",
            sequence: 1,
            scheduledArrival: "10:00",
            scheduledDeparture: "10:05",
            actualArrival: "10:08",
            actualDeparture: "10:12",
          },
        ],
        liveData: { journeyDate: "2026-03-15" },
      },
    });
    expect(rows.some((row) => row.trainNo === "12001" && row.eventType === "ARR")).toBe(true);
    expect(rows.find((row) => row.eventType === "ARR")?.delayMin).toBe(8);
  });

  it("skips GPS when currentLocation has no station", () => {
    const rows = parseLegacyTrainToObservations({
      trainNumber: "12001",
      route: [],
      liveData: { currentLocation: { status: "unknown" } },
    });
    expect(rows).toEqual([]);
  });

  it("accepts ISO-8601 +05:30 stamps and numeric minutes-after-midnight", () => {
    expect(clockToMin("2026-09-03T17:00:00+05:30")).toBe(17 * 60);
    expect(clockToMin(1020)).toBe(1020);
  });

  it("reads train.trainNumber from the live RailRadar envelope", () => {
    const rows = parseLegacyTrainToObservations({
      success: true,
      data: {
        train: { trainNumber: "12951" },
        liveData: {
          journeyDate: "2026-09-03",
          route: [
            {
              sequence: 1,
              stationCode: "MMCT",
              scheduledDeparture: "2026-09-03T17:00:00+05:30",
              actualDeparture: "2026-09-03T17:05:00+05:30",
            },
          ],
        },
      },
    });
    expect(rows.some((row) => row.trainNo === "12951" && row.eventType === "DEP")).toBe(true);
    expect(rows.find((row) => row.eventType === "DEP")?.delayMin).toBe(5);
  });

  it("rejects invalid clocks and ISO stamps", () => {
    expect(clockToMin("25:00")).toBeNull();
    expect(clockToMin("not-a-clock")).toBeNull();
    expect(isoToEpochMs("yesterday")).toBeNull();
    expect(delayMinFromPair(10, 23 * 60 + 50)).toBe(-20);
    expect(delayMinFromPair(null, 10)).toBeNull();
    expect(delayMinFromPair(10, Number.NaN)).toBeNull();
  });

  it("treats exceptionInfo as a diversion flag", () => {
    expect(parseLegacyDiversion(null)).toBe(false);
    expect(parseLegacyDiversion({ liveData: { exceptionInfo: { diverted: true } } })).toBe(true);
    expect(parseLegacyDiversion({ exceptionInfo: "diverted via UJN" })).toBe(true);
    expect(parseLegacyDiversion({ liveData: { exceptionInfo: { type: "DIVERSION" } } })).toBe(true);
  });
});
