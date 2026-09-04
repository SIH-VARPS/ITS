import { describe, expect, it } from "vitest";
import { handleApiRequest } from "../apiRouter";

async function getJson(path: string, init?: RequestInit) {
  const response = await handleApiRequest(new Request(`http://localhost${path}`, init));
  expect(response).not.toBeNull();
  const body: unknown = await response!.json();
  return { status: response!.status, body, headers: response!.headers };
}

describe("handleApiRequest", { timeout: 30_000 }, () => {
  it("ignores non-API routes", async () => {
    expect(await handleApiRequest(new Request("http://localhost/"))).toBeNull();
  });

  it("answers CORS preflight", async () => {
    const response = await handleApiRequest(
      new Request("http://localhost/api/v1/trains", { method: "OPTIONS" }),
    );
    expect(response?.status).toBe(204);
  });

  it("serves the OpenAPI index", async () => {
    const { body } = await getJson("/api/v1/docs");
    expect(body).toMatchObject({ openapi: "3.0.0" });
  });

  it("lists trains and a single live/timetable payload", async () => {
    const list = await getJson("/api/v1/trains?q=12001&limit=5&offset=0");
    expect(list.body).toMatchObject({ success: true });
    const alias = await getJson("/api/trains?type=Express&state=running&from=HBJ&to=NDLS");
    expect(alias.body).toMatchObject({ success: true });

    const live = await getJson("/api/v1/train/12001/live");
    expect(live.body).toMatchObject({ success: true });

    const missing = await getJson("/api/v1/train/00000/live");
    expect(missing.status).toBe(404);

    const tt = await getJson("/api/v1/train/12001/timetable");
    expect(tt.body).toMatchObject({ success: true });

    const missingTt = await getJson("/api/v1/train/00000/timetable");
    expect(missingTt.status).toBe(404);

    const combined = await getJson("/api/v1/train/12001");
    expect(combined.body).toMatchObject({ success: true });

    const missingCombined = await getJson("/api/v1/train/00000");
    expect(missingCombined.status).toBe(404);

    const route = await getJson("/api/v1/train/12001/route");
    expect(route.body).toMatchObject({ success: true });
    const missingRoute = await getJson("/api/v1/train/00000/route");
    expect(missingRoute.status).toBe(404);
  });

  it("serves stations, boards, between, control-room, connecting-impact, and PNR", async () => {
    const stations = await getJson("/api/v1/stations?q=NDLS");
    expect(stations.body).toMatchObject({ success: true });

    const board = await getJson("/api/v1/station/NDLS/board?mode=arrivals");
    expect(board.body).toMatchObject({ success: true });

    const missingBetween = await getJson("/api/v1/between");
    expect(missingBetween.status).toBe(400);

    const between = await getJson("/api/v1/between?from=HBJ&to=NDLS");
    expect(between.body).toMatchObject({ success: true });

    const control = await getJson("/api/v1/control-room");
    expect(control.body).toMatchObject({ success: true });

    const missingImpact = await getJson("/api/v1/connecting-impact");
    expect(missingImpact.status).toBe(400);

    const impact = await getJson(
      "/api/v1/connecting-impact?incoming=12001&connecting=12002&station=NDLS",
    );
    expect(impact.body).toMatchObject({ success: true });

    const badImpact = await getJson(
      "/api/v1/connecting-impact?incoming=00000&connecting=12002&station=NDLS",
    );
    expect(badImpact.status).toBe(404);

    const badPnr = await getJson("/api/v1/pnr/12");
    expect(badPnr.status).toBe(400);

    const pnr = await getJson("/api/v1/pnr/1234567890");
    expect(pnr.body).toMatchObject({ success: true });
  });

  it("returns 404 for unknown API paths", async () => {
    const { status } = await getJson("/api/v1/does-not-exist");
    expect(status).toBe(404);
  });

  it("serves v2 health, live replay, crowd rejection, and refresh guards", async () => {
    const health = await getJson("/api/v2/health");
    expect(health.body).toMatchObject({ status: "ok", modelLoaded: true });

    const live = await getJson("/api/v2/live/12951");
    expect(live.body).toMatchObject({ trainNo: "12951", source: "replay" });

    const positions = await getJson("/api/v2/live/positions?trains=12951");
    expect(positions.body).toMatchObject({ trains: [{ trainNo: "12951" }] });

    const far = await getJson("/api/v2/observations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainNo: "12951",
        lat: 0,
        lng: 0,
        recordedAt: 1,
        consent: true,
      }),
    });
    expect(far.status).toBe(400);

    const refreshUnset = await getJson("/api/v2/internal/refresh", { method: "POST" });
    expect([401, 503]).toContain(refreshUnset.status);

    const metrics = await getJson("/api/v2/metrics");
    expect(metrics.body).toMatchObject({ vendorCalls: expect.any(Number) });

    const badJson = await getJson("/api/v2/observations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    expect(badJson.status).toBe(400);

    const missing = await getJson("/api/v2/nope");
    expect(missing.status).toBe(404);

    const { getTrain } = await import("@/data/trains");
    const origin = getTrain("12951")!.halts[0]!;
    const okObs = await getJson("/api/v2/observations", {
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
    expect(okObs.status).toBe(200);

    const unknownTrain = await getJson("/api/v2/observations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainNo: "00000",
        lat: origin.lat,
        lng: origin.lng,
        recordedAt: 1,
        consent: true,
      }),
    });
    expect(unknownTrain.status).toBe(404);

    process.env["INTERNAL_REFRESH_SECRET"] = "unit-test-refresh";
    const unauthorized = await getJson("/api/v2/internal/refresh", {
      method: "POST",
      headers: { "x-refresh-secret": "nope" },
    });
    expect(unauthorized.status).toBe(401);
    const authorized = await getJson("/api/v2/internal/refresh", {
      method: "GET",
      headers: { "x-refresh-secret": "unit-test-refresh" },
    });
    expect(authorized.status).toBe(200);
    delete process.env["INTERNAL_REFRESH_SECRET"];
  });

  it("serves /api/v2/eta from the trained artifact", async () => {
    const missing = await getJson("/api/v2/eta");
    expect(missing.status).toBe(400);
    const unknown = await getJson("/api/v2/eta?train=00000&station=NDLS");
    expect(unknown.status).toBe(404);
    const eta = await getJson("/api/v2/eta?train=12951&station=NDLS");
    expect(eta.status).toBe(200);
    const body = eta.body as { modelVersion: string; p50: string; p80: string; delayMin: number };
    expect(body.modelVersion).not.toBe("fallback");
    expect(Date.parse(body.p50)).toBeLessThanOrEqual(Date.parse(body.p80));
    expect(Number.isFinite(body.delayMin)).toBe(true);
  });
});
