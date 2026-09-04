import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { trainObservationSchema } from "@/server/schemas/common";
import {
  delayMinFromPair,
  isoToEpochMs,
  parseLegacyTrainToObservations,
} from "@/server/live/parseLegacy";
import { harvest, requireApiKey } from "../harvest.mjs";

const fixturePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../src/server/live/__fixtures__/legacy-train-full.json",
);

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("harvest", () => {
  it("fails loudly when RAILRADAR_API_KEY is missing", async () => {
    expect(() => requireApiKey("")).toThrow(/RAILRADAR_API_KEY/);
    const outDir = mkdtempSync(path.join(tmpdir(), "harvest-nokey-"));
    tempDirs.push(outDir);
    await expect(
      harvest({
        apiKey: "",
        trainNos: ["12951"],
        outDir,
        loadEnv: false,
        now: new Date("2026-03-16T01:20:00+05:30"),
      }),
    ).rejects.toThrow(/RAILRADAR_API_KEY/);
  });

  it("parses the checked-in fixture into at least one observation", () => {
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as unknown;
    const observations = parseLegacyTrainToObservations(
      fixture,
      Date.parse("2026-09-04T00:08:46+05:30"),
    );
    expect(observations.length).toBeGreaterThanOrEqual(1);
    for (const observation of observations) {
      expect(trainObservationSchema.safeParse(observation).success).toBe(true);
    }
  });

  it("never produces NaN delayMin when actualArrival is null", () => {
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as {
      data: { liveData: { route: Array<{ actualArrival?: string; stationCode: string }> } };
    };
    const liveRoute = fixture.data.liveData.route;
    expect(liveRoute.some((halt) => halt.actualArrival === undefined)).toBe(true);

    const observations = parseLegacyTrainToObservations(fixture);
    expect(observations.length).toBeGreaterThanOrEqual(1);
    for (const observation of observations) {
      expect(Number.isFinite(observation.delayMin)).toBe(true);
      expect(Number.isNaN(observation.delayMin)).toBe(false);
    }
    expect(observations.some((row) => row.stationCode === "MMCT" && row.eventType === "ARR")).toBe(
      false,
    );
  });

  it("parses +05:30 timestamps to the correct absolute instant", () => {
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as {
      data: { liveData: { lastUpdatedAt: string } };
    };
    expect(isoToEpochMs(fixture.data.liveData.lastUpdatedAt)).toBe(
      Date.parse(fixture.data.liveData.lastUpdatedAt),
    );
    expect(fixture.data.liveData.lastUpdatedAt).toMatch(/\+05:30$/);
    expect(isoToEpochMs("2026-03-16T00:10:00+05:30")).toBe(Date.parse("2026-03-15T18:40:00.000Z"));
    expect(delayMinFromPair(23 * 60 + 50, 10)).toBe(20);
  });

  it("appends live fetches to data/harvest/YYYY-MM-DD/{trainNo}.jsonl", async () => {
    const outDir = mkdtempSync(path.join(tmpdir(), "harvest-live-"));
    tempDirs.push(outDir);
    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ success: true, data: { train: { trainNumber: "12951" } } }), {
        status: 200,
      });
    const now = new Date("2026-03-16T01:20:00+05:30");
    const result = await harvest({
      apiKey: "rr_live_test",
      trainNos: ["12951"],
      outDir,
      now,
      fetchImpl,
      loadEnv: false,
    });
    expect(result.mode).toBe("live");
    expect(result.records[0]?.source).toBe("railradar");
    const expected = path.join(outDir, "2026-03-16", "12951.jsonl");
    expect(result.records[0]?.outFile).toBe(expected);
    expect(readFileSync(expected, "utf8").trim().length).toBeGreaterThan(0);
  });
});
