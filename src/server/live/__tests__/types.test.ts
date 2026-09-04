import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { trainObservationSchema } from "@/server/schemas/common";
import type { LiveFeedAdapter, TrainObservation } from "../types";
import { LIVE_CONTRACT_VERSION } from "../types";
import {
  clockToMin,
  delayMinFromPair,
  isoToEpochMs,
  parseLegacyTrainToObservations,
} from "../parseLegacy";

const fixturePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "__fixtures__",
  "legacy-train-full.json",
);

function loadFixture(): unknown {
  return JSON.parse(readFileSync(fixturePath, "utf8"));
}

describe("live contract", () => {
  it("freezes LIVE_CONTRACT_VERSION at 1", () => {
    expect(LIVE_CONTRACT_VERSION).toBe(1);
  });

  it("parses the RailRadar fixture into observations that match the zod schema", () => {
    const observations = parseLegacyTrainToObservations(
      loadFixture(),
      Date.parse("2026-03-16T01:20:00+05:30"),
    );
    expect(observations.length).toBeGreaterThanOrEqual(1);
    for (const observation of observations) {
      const parsed = trainObservationSchema.safeParse(observation);
      expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true);
    }
  });

  it("implements LiveFeedAdapter against the fixture with no network", async () => {
    const adapter: LiveFeedAdapter = {
      async fetchTrain(_trainNo: string): Promise<TrainObservation[]> {
        return parseLegacyTrainToObservations(loadFixture());
      },
    };
    const rows = await adapter.fetchTrain("12951");
    expect(rows.every((row) => row.trainNo === "12951")).toBe(true);
    expect(rows.some((row) => row.eventType === "DEP")).toBe(true);
  });
});

describe("legacy clock helpers", () => {
  it("maps IST clocks to minutes after midnight", () => {
    expect(clockToMin("00:55")).toBe(55);
    expect(clockToMin("16:35")).toBe(16 * 60 + 35);
    expect(clockToMin("2026-09-03T17:00:00+05:30")).toBe(17 * 60);
    expect(clockToMin(1020)).toBe(1020);
    expect(clockToMin(null)).toBeNull();
  });

  it("parses +05:30 timestamps to the correct absolute instant", () => {
    expect(isoToEpochMs("2026-03-15T01:12:00+05:30")).toBe(Date.parse("2026-03-14T19:42:00.000Z"));
    expect(isoToEpochMs("2026-03-16T00:10:00+05:30")).toBe(Date.parse("2026-03-15T18:40:00.000Z"));
    expect(isoToEpochMs("2026-03-16T01:20:00+05:30")).toBe(Date.parse("2026-03-15T19:50:00.000Z"));
  });

  it("wraps midnight so 23:50 → 00:10 is +20 min, not a day shift", () => {
    expect(delayMinFromPair(clockToMin("23:50"), clockToMin("00:10"))).toBe(20);
  });
});
