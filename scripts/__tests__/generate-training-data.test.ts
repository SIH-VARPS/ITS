import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  applyWeatherDelayBump,
  generateRawRuns,
  harvestRuns,
  mulberry32,
  simulateAr1Delays,
  syntheticWeatherAt,
} from "../../scripts/generate-training-data.mjs";
import {
  ArchiveWeatherClient,
  attachArchiveWeather,
  haltInstant,
  normalizeHaltWeather,
} from "../../scripts/weather-archive.mjs";

describe("calibrated delay simulator", () => {
  it("reproduces per-station means within 10%", () => {
    const rng = mulberry32(42);
    const halts = [{ code: "AAA" }, { code: "BBB" }, { code: "CCC" }, { code: "DDD" }];
    const means: Record<string, number> = { AAA: 0, BBB: 20, CCC: 40, DDD: 35 };
    const sums = [0, 0, 0, 0];
    const n = 800;
    for (let i = 0; i < n; i++) {
      const delays = simulateAr1Delays(halts, means, rng);
      for (let h = 0; h < halts.length; h++) sums[h]! += delays[h]!;
    }
    for (let h = 0; h < halts.length; h++) {
      const actual = sums[h]! / n;
      const expected = means[halts[h]!.code]!;
      const tol = Math.max(2, Math.abs(expected) * 0.1);
      expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tol);
    }
  });

  it("marks synthetic weather and never RNG-fills harvested rows", () => {
    const rng = mulberry32(7);
    const fog = syntheticWeatherAt(1, rng);
    expect(fog.weatherCode === 0 || fog.weatherCode === 45).toBe(true);
    const bumped = applyWeatherDelayBump([4, 4], [
      { weatherCode: 45, precipitationMm: 0, visibilityKm: 0.3, windSpeedKmph: 2 },
      { weatherCode: 0, precipitationMm: 0, visibilityKm: 12, windSpeedKmph: 6 },
    ]);
    expect(bumped[0]).toBe(14);
    expect(bumped[1]).toBe(4);

    const { runs } = generateRawRuns({ seed: 1, runsPerTrain: 1, harvestRoot: join(tmpdir(), "no-harvest") });
    expect(runs.length).toBeGreaterThan(0);
    expect(runs.every((run) => (run as { provenance: string }).provenance === "synthetic")).toBe(
      true,
    );
    expect(
      runs.every((run) => (run as { weatherProvenance: string }).weatherProvenance === "synthetic"),
    ).toBe(true);
  });

  it("fetches Open-Meteo Archive weather onto harvested runs and persists snapshots", async () => {
    const harvestRoot = mkdtempSync(join(tmpdir(), "harvest-wx-"));
    const dayDir = join(harvestRoot, "2024-07-15");
    mkdirSync(dayDir, { recursive: true });
    const record = {
      trainNo: "12951",
      body: {
        data: {
          liveData: {
            journeyDate: "2024-07-15",
            route: [
              { stationCode: "BCT", delayDepartureMinutes: 8, delayArrivalMinutes: 8 },
              { stationCode: "BVI", delayDepartureMinutes: 19, delayArrivalMinutes: 16 },
              { stationCode: "ST", delayDepartureMinutes: 11, delayArrivalMinutes: 7 },
            ],
          },
        },
      },
    };
    writeFileSync(join(dayDir, "12951.jsonl"), `${JSON.stringify(record)}\n`, "utf8");

    const { runs, featured } = generateRawRuns({
      seed: 1,
      runsPerTrain: 0,
      harvestRoot,
    });
    const harvested = runs.filter((run) => (run as { provenance: string }).provenance === "railradar");
    expect(harvested.length).toBe(1);
    const before = harvested[0] as {
      weatherByHalt: unknown[];
      weatherProvenance: string;
      provenance: string;
      halts: Array<{ lat: number; lng: number }>;
    };
    expect(before.weatherProvenance).toBe("unavailable");
    expect(before.weatherByHalt.every((slot) => normalizeHaltWeather(slot).weatherCode === 0)).toBe(
      true,
    );

    const fetchImpl = vi.fn(async (url: string) => {
      expect(String(url)).toContain("archive-api.open-meteo.com");
      const dateMatch = String(url).match(/start_date=(\d{4}-\d{2}-\d{2})/);
      const date = dateMatch?.[1] ?? "2024-07-15";
      const hours = Array.from({ length: 24 }, (_, hour) => {
        const stamp = `${date}T${String(hour).padStart(2, "0")}:00`;
        return { stamp, code: 61, precip: 6.5, vis: 9000, wind: 22 };
      });
      return {
        ok: true,
        json: async () => ({
          hourly: {
            time: hours.map((row) => row.stamp),
            weather_code: hours.map((row) => row.code),
            precipitation: hours.map((row) => row.precip),
            visibility: hours.map((row) => row.vis),
            wind_speed_10m: hours.map((row) => row.wind),
          },
        }),
      };
    });

    await attachArchiveWeather(harvested, { fetchImpl, offline: false });
    const after = harvested[0] as {
      weatherByHalt: unknown[];
      weatherProvenance: string;
      provenance: string;
    };
    expect(after.provenance).toBe("railradar");
    expect(after.weatherProvenance).toBe("open-meteo-archive");
    const snaps = after.weatherByHalt.map((slot) => normalizeHaltWeather(slot));
    expect(snaps.some((snap) => snap.weatherCode === 61 || snap.weatherCode === 45)).toBe(true);
    expect(snaps.some((snap) => snap.precipitationMm > 0 || snap.visibilityKm > 0)).toBe(true);
    expect(fetchImpl).toHaveBeenCalled();

    const graph = new Map();
    const trainsByNumber = new Map(
      (featured as Array<{ number: string }>).map((train) => [train.number, train]),
    );
    const reparsed = harvestRuns(graph, trainsByNumber as Map<string, unknown>, harvestRoot);
    expect((reparsed[0] as { weatherProvenance: string }).weatherProvenance).toBe("unavailable");

    const at = haltInstant(after, 0);
    expect(at.getTime()).toBeGreaterThan(0);
    const client = new ArchiveWeatherClient({ offline: true });
    const offline = await client.weatherAt(18.97, 72.82, at);
    expect(offline.source).toBe("unavailable");
  });
});
