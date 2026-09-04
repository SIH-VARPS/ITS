import { describe, expect, it, vi } from "vitest";
import { getTrain, trainRoutes } from "@/data/trains";
import type { TrainObservation } from "@/server/live/types";
import { assertFeatureVersion, FEATURE_VERSION } from "../schema";
import {
  buildFeaturesFromRawRun,
  buildSectionFeatures,
  occupancyFixesFromRoutes,
  orderedFeatureValues,
  rawRunAt,
  type RawRun,
} from "../sectionFeatures";
import { WeatherClient, getWeatherClient, setWeatherClientForTests } from "../weather";
import pythonVectorsJson from "../__fixtures__/python-vectors.json";
import skewRawJson from "../__fixtures__/skew-raw.json";

const pythonVectors = pythonVectorsJson as Array<{
  trainNo: string;
  haltIndex: number;
  vector: Record<string, unknown>;
}>;
const skewRaw = skewRawJson as RawRun[];

const train = getTrain("12951") ?? trainRoutes[0]!;
const at = new Date("2026-03-15T10:00:00+05:30");

function obs(
  partial: Partial<TrainObservation> & Pick<TrainObservation, "sequence" | "stationCode">,
): TrainObservation {
  return {
    trainNo: train.number,
    runDate: "2026-03-15",
    eventType: "ARR",
    scheduledMin: 600,
    actualMin: 612,
    delayMin: 12,
    source: "replay",
    receivedAt: 1,
    ...partial,
  };
}

function cloneTrain(index: number) {
  const base = trainRoutes[index % trainRoutes.length]!;
  return { ...base, number: String(10000 + index), halts: base.halts };
}

describe("sectionFeatures", () => {
  it("emits finite vectors across a 200-train sample", () => {
    const sample: ReturnType<typeof cloneTrain>[] = [];
    for (let i = 0; sample.length < 200; i++) {
      const route = cloneTrain(i);
      if (route.halts.length >= 2) sample.push(route);
    }
    expect(sample).toHaveLength(200);
    for (const route of sample) {
      const vector = buildSectionFeatures({ train: route, haltIndex: 0, at, weatherCode: 0 });
      const values = orderedFeatureValues(vector);
      expect(values.every((value) => Number.isFinite(value))).toBe(true);
      expect(vector.trainNo).toBe(route.number);
    }
  });

  it("ignores future-stuffed observations (no leakage)", () => {
    const past = [
      obs({ sequence: 1, stationCode: train.halts[0]!.code, delayMin: 5, eventType: "DEP" }),
    ];
    const future = [
      ...past,
      obs({
        sequence: train.halts.length,
        stationCode: train.halts[train.halts.length - 1]!.code,
        delayMin: 90,
        eventType: "ARR",
      }),
    ];
    const a = buildSectionFeatures({ train, haltIndex: 0, at, observations: past, weatherCode: 3 });
    const b = buildSectionFeatures({
      train,
      haltIndex: 0,
      at,
      observations: future,
      weatherCode: 3,
    });
    expect(JSON.stringify(b)).toBe(JSON.stringify(a));
  });

  it("raises downstream occupancy when another train occupies the next section", () => {
    const from = train.halts[0]!;
    const to = train.halts[1]!;
    const empty = buildSectionFeatures({ train, haltIndex: 0, at, occupancy: [] });
    const busy = buildSectionFeatures({
      train,
      haltIndex: 0,
      at,
      occupancy: [
        { trainNo: "99999", fromCode: from.code, toCode: to.code },
        { trainNo: "99998", fromCode: from.code, toCode: to.code },
      ],
    });
    expect(busy.downstreamOccupancy).toBeGreaterThan(empty.downstreamOccupancy);
    expect(busy.downstreamOccupancy).toBe(2);
    const inferred = occupancyFixesFromRoutes([
      {
        trainNo: "88888",
        route: train,
        observations: [obs({ sequence: 1, stationCode: from.code, trainNo: "88888" })],
      },
    ]);
    expect(inferred[0]?.fromCode).toBe(from.code);
  });

  it("caches Open-Meteo so a station-hour is fetched at most once", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        hourly: { time: ["2026-03-15T10:00"], weather_code: [61] },
      }),
    }));
    const client = new WeatherClient({ offline: false, fetchImpl });
    const halt = train.halts[1]!;
    const first = await client.weatherCodeAt(halt.code, halt.lat, halt.lng, at);
    const second = await client.weatherCodeAt(halt.code, halt.lat, halt.lng, at);
    expect(first).toBe(61);
    expect(second).toBe(61);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(client.fetchCalls).toBe(1);
  });

  it("throws on FEATURE_VERSION mismatch", () => {
    expect(() => assertFeatureVersion("0")).toThrow(/FEATURE_VERSION mismatch/);
    expect(FEATURE_VERSION).toBe("1");
    expect(() => assertFeatureVersion(FEATURE_VERSION)).not.toThrow();
  });

  it("is deterministic for identical inputs", () => {
    const first = buildSectionFeatures({ train, haltIndex: 0, at, weatherCode: 3 });
    const second = buildSectionFeatures({ train, haltIndex: 0, at, weatherCode: 3 });
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it("matches Python-built features on shared raw fixtures", () => {
    const runs = skewRaw;
    expect(pythonVectors.length).toBeGreaterThan(0);
    expect(runs.length).toBeGreaterThanOrEqual(pythonVectors.length);
    for (let i = 0; i < pythonVectors.length; i++) {
      const expected = pythonVectors[i]!;
      const run = runs[i]!;
      const vector = buildFeaturesFromRawRun(
        run,
        expected.haltIndex,
        rawRunAt(run, expected.haltIndex),
      );
      expect(vector).toEqual(expected.vector);
    }
  });

  it("uses section lookup, dwell overrun, speed deviation, and rejects a terminal halt", () => {
    const from = train.halts[1]!;
    const to = train.halts[2]!;
    const looked = buildSectionFeatures({
      train,
      haltIndex: 1,
      at,
      sectionLookup: () => ({ meanRunMin: 99, p80RunMin: 120 }),
    });
    expect(looked.sectionMeanRunMin).toBe(99);
    expect(looked.sectionP80RunMin).toBe(120);
    const dwell = buildSectionFeatures({
      train,
      haltIndex: 1,
      at,
      observations: [
        obs({
          sequence: 2,
          stationCode: from.code,
          eventType: "ARR",
          actualMin: 100,
          scheduledMin: 100,
        }),
        obs({
          sequence: 2,
          stationCode: from.code,
          eventType: "DEP",
          actualMin: 130,
          scheduledMin: 105,
        }),
      ],
    });
    expect(dwell.dwellOverrunMin).not.toBe(0);
    const speed = buildSectionFeatures({
      train,
      haltIndex: 1,
      at,
      observations: [
        obs({
          sequence: 1,
          stationCode: train.halts[0]!.code,
          eventType: "DEP",
          actualMin: 0,
        }),
        obs({
          sequence: 2,
          stationCode: from.code,
          eventType: "ARR",
          actualMin: 40,
        }),
      ],
    });
    expect(Number.isFinite(speed.speedDeviationKmph)).toBe(true);
    expect(() => buildSectionFeatures({ train, haltIndex: train.halts.length - 1, at })).toThrow(
      /No section/,
    );
    const occupancySkipSelf = buildSectionFeatures({
      train,
      haltIndex: 0,
      at,
      occupancy: [{ trainNo: train.number, fromCode: train.halts[0]!.code, toCode: to.code }],
    });
    expect(occupancySkipSelf.downstreamOccupancy).toBe(0);
    expect(occupancyFixesFromRoutes([{ trainNo: "1", route: train, observations: [] }])).toEqual(
      [],
    );
  });

  it("covers weather offline, fixture, errors, and the shared client", async () => {
    const halt = train.halts[0]!;
    const offline = new WeatherClient({ offline: true });
    expect(await offline.weatherCodeAt(halt.code, halt.lat, halt.lng, at)).toBe(0);
    const key = `${halt.code.toUpperCase()}:2026-03-15T10`;
    const fixtured = new WeatherClient({ offline: true, fixture: { [key]: 45 } });
    expect(await fixtured.weatherCodeAt(halt.code, halt.lat, halt.lng, at)).toBe(45);
    expect(fixtured.peek(halt.code, at)).toBe(45);
    const failing = new WeatherClient({
      offline: false,
      fetchImpl: async () => {
        throw new Error("net");
      },
    });
    expect(await failing.weatherCodeAt("XYZ", 1, 2, at)).toBe(0);
    const notOk = new WeatherClient({
      offline: false,
      fetchImpl: async () => ({ ok: false, json: async () => ({}) }),
    });
    expect(await notOk.weatherCodeAt("ABC", 1, 2, at)).toBe(0);
    const hourlyReuse = new WeatherClient({
      offline: false,
      fetchImpl: async () => ({
        ok: true,
        json: async () => ({
          hourly: {
            time: ["2026-03-15T10:00", "2026-03-15T11:00", 12],
            weather_code: [3, "5", null],
          },
        }),
      }),
    });
    expect(await hourlyReuse.weatherCodeAt("ZZZ", 1, 2, at)).toBe(3);
    expect(
      await hourlyReuse.weatherCodeAt("ZZZ", 1, 2, new Date("2026-03-15T11:00:00+05:30")),
    ).toBe(5);
    expect(hourlyReuse.fetchCalls).toBe(1);
    setWeatherClientForTests(null);
    expect(getWeatherClient().peek("NDLS", at)).toBe(0);
    setWeatherClientForTests(null);
    const later = new Date("2026-07-01T08:00:00+05:30");
    const monsoon = buildSectionFeatures({ train, haltIndex: 0, at: later });
    expect(monsoon.season).toBe(3);
    const post = buildSectionFeatures({
      train,
      haltIndex: 0,
      at: new Date("2026-11-01T08:00:00+05:30"),
    });
    expect(post.season).toBe(4);
    expect(() => buildFeaturesFromRawRun(skewRaw[0]!, 99, at)).toThrow(/No section/);
  });
});
