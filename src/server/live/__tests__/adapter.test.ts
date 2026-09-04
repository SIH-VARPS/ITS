import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { getTrain } from "@/data/trains";
import { trainObservationSchema } from "@/server/schemas/common";
import { CrowdGpsAdapter } from "../crowdGpsAdapter";
import type { TrainRoute } from "@/data/trainTypes";
import { interpolateSegment, positionAtElapsed, snapToNearestSection } from "../geometry";
import { ReplayAdapter } from "../replayAdapter";
import { isoToEpochMs, parseLegacyDiversion, parseLegacyTrainToObservations } from "../parseLegacy";
import { RailRadarAdapter } from "../railRadarAdapter";
import { MemoryObservationStore } from "../store";
import { roundGpsCoord } from "../privacy";

const fixturePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "__fixtures__",
  "legacy-train-full.json",
);

function loadFixture(): Record<string, unknown> {
  return JSON.parse(readFileSync(fixturePath, "utf8")) as Record<string, unknown>;
}

describe("RailRadar normalisation", () => {
  it("maps the checked-in fixture to schema-valid observations and skips null actualArrival", () => {
    const fixture = loadFixture();
    const receivedAt = Date.parse("2026-09-04T00:15:18+05:30");
    const rows = parseLegacyTrainToObservations(fixture, receivedAt);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(trainObservationSchema.safeParse(row).success).toBe(true);
      expect(Number.isFinite(row.delayMin)).toBe(true);
    }
    expect(rows.some((row) => row.stationCode === "MMCT" && row.eventType === "ARR")).toBe(false);
    const gps = rows.find((row) => row.eventType === "GPS");
    expect(gps?.stationCode).toBe("BILD");
    expect(gps?.segmentProgress).toBe(0);
  });

  it("maps segmentProgress onto inter-station coordinates", () => {
    const fixture = loadFixture();
    const data = fixture["data"] as Record<string, unknown>;
    const live = data["liveData"] as Record<string, unknown>;
    live["currentLocation"] = {
      stationCode: "BILD",
      segmentProgress: 0.4,
      status: "running",
    };
    live["exceptionInfo"] = { diverted: true };
    expect(parseLegacyDiversion(fixture)).toBe(true);
    const rows = parseLegacyTrainToObservations(fixture, Date.parse("2026-09-04T00:15:18+05:30"));
    const gps = rows.find((row) => row.eventType === "GPS");
    expect(gps?.segmentProgress).toBe(0.4);
    const route = getTrain("12951");
    expect(route).toBeDefined();
    const point = interpolateSegment(route!, "BVI", 0.4);
    expect(point).not.toBeNull();
  });

  it("parses +05:30 timestamps to the correct absolute instant and does not shift a midnight-crossing runDate", () => {
    const fixture = loadFixture();
    const data = fixture["data"] as Record<string, unknown>;
    const live = data["liveData"] as Record<string, unknown>;
    const lastUpdatedAt = live["lastUpdatedAt"] as string;
    expect(lastUpdatedAt).toMatch(/\+05:30$/);
    expect(isoToEpochMs(lastUpdatedAt)).toBe(Date.parse("2026-09-03T18:45:18.000Z"));
    const rows = parseLegacyTrainToObservations(fixture, Date.parse(lastUpdatedAt));
    expect(rows.every((row) => row.runDate === "2026-09-03")).toBe(true);
    const bildArr = rows.find((row) => row.stationCode === "BILD" && row.eventType === "ARR");
    expect(bildArr?.actualMin).toBe(8);
    expect(bildArr?.scheduledMin).toBe(10);
  });

  it("returns empty observations when the API key is missing (no fetch)", async () => {
    const fetchImpl = vi.fn();
    const adapter = new RailRadarAdapter({
      apiKey: "",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(adapter.hasKey()).toBe(false);
    await expect(adapter.fetchTrain("12951")).resolves.toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("retries a failed vendor call then parses the fixture", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(loadFixture()), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    const adapter = new RailRadarAdapter({
      apiKey: "test-key",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      maxAttempts: 3,
      sleep: async () => undefined,
      now: () => Date.parse("2026-09-04T00:15:18+05:30"),
    });
    const rows = await adapter.fetchTrain("12951");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(rows.some((row) => row.eventType === "GPS")).toBe(true);
    expect(rows.some((row) => row.lat !== undefined)).toBe(true);
  });

  it("throws after exhausting retries on HTTP errors", async () => {
    const fetchImpl = vi.fn(async () => new Response("nope", { status: 500 }));
    const adapter = new RailRadarAdapter({
      apiKey: "test-key",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      maxAttempts: 2,
      sleep: async () => undefined,
    });
    await expect(adapter.fetchTrain("12951")).rejects.toThrow(/railradar_http_500/);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});

describe("Crowd GPS adapter", () => {
  it("rejects a fix more than 25 km from the route", async () => {
    const store = new MemoryObservationStore();
    const adapter = new CrowdGpsAdapter({ store });
    const result = await adapter.ingest({
      trainNo: "12951",
      lat: 0,
      lng: 0,
      recordedAt: Date.parse("2026-09-04T00:15:18+05:30"),
      consent: true,
    });
    expect(result.accepted).toBe(false);
    if (!result.accepted) expect(result.reason).toBe("too_far");
  });

  it("snaps an on-route fix to the nearest section", async () => {
    const route = getTrain("12951");
    expect(route).toBeDefined();
    const origin = route!.halts[0]!;
    const store = new MemoryObservationStore();
    const adapter = new CrowdGpsAdapter({ store });
    const result = await adapter.ingest({
      trainNo: "12951",
      lat: origin.lat,
      lng: origin.lng,
      recordedAt: Date.parse("2026-09-04T00:15:18+05:30"),
      consent: true,
    });
    expect(result.accepted).toBe(true);
    if (result.accepted) {
      expect(result.observation.source).toBe("crowd");
      expect(result.observation.stationCode).toBe(origin.code);
    }
  });

  it("stores coordinates rounded to ~111 m", async () => {
    const route = getTrain("12951")!;
    const origin = route.halts[0]!;
    const store = new MemoryObservationStore();
    const adapter = new CrowdGpsAdapter({ store });
    const result = await adapter.ingest({
      trainNo: "12951",
      lat: origin.lat + 0.0004,
      lng: origin.lng + 0.0004,
      recordedAt: Date.parse("2026-09-04T00:15:18+05:30"),
      consent: true,
    });
    expect(result.accepted).toBe(true);
    if (result.accepted) {
      expect(result.observation.lat).toBe(roundGpsCoord(result.observation.lat ?? 0));
      expect(result.observation.lng).toBe(roundGpsCoord(result.observation.lng ?? 0));
      expect(roundGpsCoord(28.613939)).toBe(28.614);
    }
  });

  it("rejects an unknown train", async () => {
    const adapter = new CrowdGpsAdapter({ store: new MemoryObservationStore() });
    const result = await adapter.ingest({
      trainNo: "00000",
      lat: 28.6,
      lng: 77.2,
      recordedAt: 1,
      consent: true,
    });
    expect(result).toEqual({ accepted: false, reason: "unknown_train" });
  });

  it("round-trips a stored crowd observation through fetchTrain", async () => {
    const route = getTrain("12951")!;
    const origin = route.halts[0]!;
    const store = new MemoryObservationStore();
    const adapter = new CrowdGpsAdapter({
      store,
      now: () => Date.parse("2026-09-04T00:15:18+05:30"),
    });
    await adapter.ingest({
      trainNo: "12951",
      lat: origin.lat,
      lng: origin.lng,
      recordedAt: Date.parse("2026-09-04T00:15:18+05:30"),
      consent: true,
    });
    const rows = await adapter.fetchTrain("12951");
    expect(rows.some((row) => row.source === "crowd")).toBe(true);
  });
});

describe("geometry and replay", () => {
  it("snaps, interpolates, and rejects empty routes", async () => {
    const empty = {
      number: "0",
      name: "x",
      type: "Express",
      startsAt: 0,
      runsOn: ["Mon"],
      zone: "NR",
      halts: [] as TrainRoute["halts"],
    };
    expect(snapToNearestSection(0, 0, empty)).toBeNull();
    const oneHalt: TrainRoute = {
      ...empty,
      number: "1",
      halts: [
        {
          code: "AAA",
          name: "Alpha",
          lat: 20,
          lng: 70,
          km: 0,
          arr: 0,
          dep: 0,
          platform: "1",
          day: 1,
          dayOfJourney: 1,
          coordSource: "lookup",
        },
      ],
    };
    expect(snapToNearestSection(20, 70, oneHalt)?.stationCode).toBe("AAA");
    expect(snapToNearestSection(0, 0, oneHalt)).toBeNull();
    const two = getTrain("12951")!;
    const pos = positionAtElapsed(two, 10_000);
    expect(pos.stationCode).toBe(two.halts[two.halts.length - 1]!.code);
    await expect(new ReplayAdapter().fetchTrain("00000")).resolves.toEqual([]);
  });

  it("replays a shard-only train that is not on the featured client list", async () => {
    const { catalogTrains } = await import("@/data/trains");
    const { getTrainByNumber } = await import("@/server/trains/store.server");
    const tail = catalogTrains.find((row) => !getTrain(row.number));
    expect(tail).toBeDefined();
    expect(getTrainByNumber(tail!.number)).toBeDefined();
    const rows = await new ReplayAdapter().fetchTrain(tail!.number);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.source).toBe("replay");
    expect(rows[0]!.trainNo).toBe(tail!.number);
  });
});
