import { afterEach, describe, expect, it } from "vitest";
import { handleApiRequest } from "../apiRouter";
import { errorEnvelopeSchema } from "../schemas/common";
import { etaResponseSchema } from "../schemas/eta";
import { forecastResponseSchema } from "../schemas/forecast";
import { boardResponseSchema } from "../schemas/board";
import { congestionResponseSchema } from "../schemas/congestion";
import { trainGeoJsonResponseSchema } from "../schemas/geojson";
import { healthResponseSchema } from "../schemas/health";
import { observationIntakeResponseSchema } from "../schemas/observations";
import { getTrain } from "@/data/trains";
import { getObservationStore, setV2RateConfigForTests } from "../live/store";
import { V2_PATHS } from "../routes/v2/catalog";

async function call(path: string, init?: RequestInit) {
  const response = await handleApiRequest(new Request(`http://localhost${path}`, init));
  expect(response).not.toBeNull();
  return response!;
}

async function json(path: string, init?: RequestInit) {
  const response = await call(path, init);
  const text = await response.text();
  const body: unknown = text ? JSON.parse(text) : null;
  return { status: response.status, body, headers: response.headers, response };
}

function assertQuantiles(row: { p50: string; p80: string; p90: string }): void {
  expect(Date.parse(row.p50)).toBeLessThanOrEqual(Date.parse(row.p80));
  expect(Date.parse(row.p80)).toBeLessThanOrEqual(Date.parse(row.p90));
}

function shapeOf(value: unknown): unknown {
  if (Array.isArray(value)) {
    const first = value[0];
    return first === undefined ? [] : [shapeOf(first)];
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = shapeOf((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  if (value === null) return "null";
  return typeof value;
}

describe("api v2 contract", { timeout: 60_000 }, () => {
  afterEach(() => {
    setV2RateConfigForTests(null);
    getObservationStore().clearRateBuckets();
  });

  it("validates health, eta, forecast, board, congestion, and geojson against published schemas", async () => {
    const health = await json("/api/v2/health");
    expect(health.status).toBe(200);
    expect(healthResponseSchema.parse(health.body).status).toBe("ok");

    const eta = await json("/api/v2/eta?train=12951&station=NDLS");
    expect(eta.status).toBe(200);
    const etaBody = etaResponseSchema.parse(eta.body);
    assertQuantiles(etaBody);
    expect(etaBody.trainNo).toBe("12951");
    expect(etaBody.station).toBe("NDLS");

    const forecast = await json("/api/v2/train/12951/forecast");
    expect(forecast.status).toBe(200);
    const forecastBody = forecastResponseSchema.parse(forecast.body);
    expect(forecastBody.halts.length).toBeGreaterThan(0);
    for (const halt of forecastBody.halts) assertQuantiles(halt);

    const board = await json("/api/v2/station/NDLS/board");
    expect(board.status).toBe(200);
    const boardBody = boardResponseSchema.parse(board.body);
    expect(boardBody.stationCode).toBe("NDLS");
    for (const entry of boardBody.entries) assertQuantiles(entry);
    const etas = boardBody.entries.map((row) => Date.parse(row.eta));
    expect(etas).toEqual([...etas].sort((a, b) => a - b));

    const congestion = await json("/api/v2/network/congestion");
    expect(congestion.status).toBe(200);
    congestionResponseSchema.parse(congestion.body);

    const geo = await json("/api/v2/train/12951/geojson");
    expect(geo.status).toBe(200);
    const geoBody = trainGeoJsonResponseSchema.parse(geo.body);
    expect(geoBody.features[0]?.geometry.coordinates.length).toBeGreaterThanOrEqual(2);
    const origin = getTrain("12951")!.halts[0]!;
    expect(geoBody.features[0]?.geometry.coordinates[0]).toEqual([origin.lng, origin.lat]);
  });

  it("returns the documented error envelope for an unknown train", async () => {
    const missing = await json("/api/v2/eta?train=00000&station=NDLS");
    expect(missing.status).toBe(404);
    const envelope = errorEnvelopeSchema.parse(missing.body);
    expect(envelope.error).toBe(true);
    expect(envelope.status).toBe(404);

    const forecast = await json("/api/v2/train/00000/forecast");
    expect(forecast.status).toBe(404);
    errorEnvelopeSchema.parse(forecast.body);

    const geo = await json("/api/v2/train/00000/geojson");
    expect(geo.status).toBe(404);
    errorEnvelopeSchema.parse(geo.body);
  });

  it("rate-limits at the threshold and allows traffic after the window resets", async () => {
    setV2RateConfigForTests({ capacity: 1, refillPerSec: 0 });
    getObservationStore().clearRateBuckets();
    const ip = "203.0.113.9";
    const headers = { "x-forwarded-for": ip };
    const first = await json("/api/v2/health", { headers });
    expect(first.status).toBe(200);
    const blocked = await json("/api/v2/health", { headers });
    expect(blocked.status).toBe(429);
    const envelope = errorEnvelopeSchema.parse(blocked.body);
    expect(envelope.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBeTruthy();

    setV2RateConfigForTests({ capacity: 1, refillPerSec: 1 });
    const later = Date.now() + 2_000;
    const refill = await getObservationStore().takeToken(ip, later);
    expect(refill.allowed).toBe(true);
  });

  it("keeps ETag stable within TTL and changes it after a new observation", async () => {
    const first = await call("/api/v2/eta?train=12951&station=NDLS");
    const etag = first.headers.get("etag");
    expect(etag).toBeTruthy();
    const second = await call("/api/v2/eta?train=12951&station=NDLS", {
      headers: { "if-none-match": etag! },
    });
    expect(second.status).toBe(304);
    expect(second.headers.get("etag")).toBe(etag);

    const origin = getTrain("12951")!.halts[0]!;
    const posted = await json("/api/v2/observations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainNo: "12951",
        lat: origin.lat,
        lng: origin.lng,
        recordedAt: Date.parse("2026-09-04T00:15:18+05:30"),
        consent: true,
      }),
    });
    expect(posted.status).toBe(200);
    observationIntakeResponseSchema.parse(posted.body);

    const third = await call("/api/v2/eta?train=12951&station=NDLS");
    expect(third.headers.get("etag")).not.toBe(etag);
  });

  it("rejects malformed observations without writing", async () => {
    const store = getObservationStore();
    const revision = store.revision();
    const malformed = await json("/api/v2/observations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainNo: "12951",
        lat: 28.6,
        lng: 77.2,
        recordedAt: 1,
        consent: false,
      }),
    });
    expect(malformed.status).toBe(400);
    errorEnvelopeSchema.parse(malformed.body);
    expect(store.revision()).toBe(revision);
  });

  it("serves generated OpenAPI that lists every registered v2 route", async () => {
    const doc = await json("/api/v2/openapi.json");
    expect(doc.status).toBe(200);
    const body = doc.body as {
      openapi: string;
      paths: Record<string, unknown>;
      "x-registered-paths": string[];
    };
    expect(body.openapi).toBe("3.0.0");
    expect(body["x-registered-paths"]).toEqual([...V2_PATHS]);
    for (const path of V2_PATHS) {
      expect(body.paths[path], path).toBeTruthy();
    }
    expect(JSON.parse(JSON.stringify(body)).openapi).toBe("3.0.0");
  });

  it("snapshots response shapes so breaking changes fail CI", async () => {
    const eta = await json("/api/v2/eta?train=12951&station=NDLS");
    const forecast = await json("/api/v2/train/12951/forecast");
    const events = await json("/api/v2/events?train=12951&station=NDLS");
    expect(events.status).toBe(200);
    etaResponseSchema.parse(events.body);
    expect(shapeOf(eta.body)).toMatchSnapshot("eta");
    expect(shapeOf(forecast.body)).toMatchSnapshot("forecast");
    expect(shapeOf(events.body)).toMatchSnapshot("events");
    const openapi = await json("/api/v2/openapi.json");
    expect(
      (openapi.body as { "x-registered-paths": string[] })["x-registered-paths"],
    ).toMatchSnapshot("openapi-paths");
  });

  it("serves a one-shot SSE event when requested", async () => {
    const response = await call("/api/v2/events?train=12951&station=NDLS", {
      headers: { Accept: "text/event-stream" },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    const text = await response.text();
    expect(text).toContain("event: eta");
    const line = text.split("\n").find((row) => row.startsWith("data: "));
    expect(line).toBeTruthy();
    etaResponseSchema.parse(JSON.parse(line!.slice(6)));
  });
});
