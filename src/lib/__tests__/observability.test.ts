import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { consumeLastCapturedError } from "../error-capture";
import {
  captureException,
  initClientErrorTracking,
  initServerErrorTracking,
  parseSentryDsn,
} from "../errorTracking";
import { FEATURE_VERSION } from "../features/schema";
import { log, logger, setLogSink } from "../logger";
import {
  getMetricsSnapshot,
  recordEtaLatency,
  recordPrediction,
  resetMetrics,
  setQuotaCounter,
} from "../metrics";
import { loadModelArtifact } from "../model/loadArtifact";
import { createRequestId, runWithRequestId, setRequestId } from "../requestId";
import { handleApiRequest } from "@/server/apiRouter";
import { buildHealthResponse } from "@/server/routes/v2/health";
import { MemoryObservationStore, setObservationStoreForTests } from "@/server/live/store";
import { monthKeyIst } from "@/server/live/quota";

const FAKE_KEY = "rr_live_fake_secret_scan_key_xyz";

const lines: string[] = [];

beforeEach(() => {
  lines.length = 0;
  setLogSink((line) => {
    lines.push(line);
  });
  resetMetrics();
  setRequestId("boot");
  process.env["RAILRADAR_API_KEY"] = FAKE_KEY;
});

afterEach(() => {
  setLogSink(null);
  consumeLastCapturedError();
  delete process.env["RAILRADAR_API_KEY"];
  setObservationStoreForTests(null);
});

describe("structured logger", () => {
  it("emits valid JSON containing a request id on every line", async () => {
    await runWithRequestId("req-test-1", () => {
      logger.info("live_tier_a", { trainNo: "12951", delayMin: 12 });
      logger.warn("live_quota_exhausted", { cap: 1000 });
      logger.error("live_tier_a_failed", { message: `auth ${FAKE_KEY}` });
      log("debug", "eta_trace", { station: "NDLS" });
    });
    expect(lines.length).toBeGreaterThanOrEqual(4);
    for (const line of lines) {
      const parsed = JSON.parse(line) as { requestId?: unknown };
      expect(typeof parsed.requestId).toBe("string");
      expect(String(parsed.requestId).length).toBeGreaterThan(0);
    }
  });

  it("never writes a seeded secret into any log line", async () => {
    await runWithRequestId("req-secret", () => {
      logger.info("vendor", { authorization: `Bearer ${FAKE_KEY}` });
      logger.error("exception", { message: FAKE_KEY });
      console.error(new Error(`RailRadar rejected ${FAKE_KEY}`));
    });
    const blob = lines.join("\n");
    expect(blob).not.toContain(FAKE_KEY);
    expect(blob).toContain("[redacted]");
  });
});

describe("health and quota metrics", () => {
  it("reports degraded when the model artifact is missing", async () => {
    expect(loadModelArtifact("this-file-does-not-exist.json")).toBeNull();
    const health = await buildHealthResponse({
      modelLoaded: false,
      modelVersion: null,
      storePing: async () => true,
      quotaRemaining: 800,
      lastHarvestAt: null,
      now: () => 1,
    });
    expect(health.status).toBe("degraded");
    expect(health.modelLoaded).toBe(false);

    const down = await buildHealthResponse({
      modelLoaded: true,
      modelVersion: "1.0.0",
      storePing: async () => false,
      quotaRemaining: 0,
      lastHarvestAt: 1,
      now: () => 1,
    });
    expect(down.status).toBe("down");

    const thrown = await buildHealthResponse({
      storePing: async () => {
        throw new Error("store_offline");
      },
      modelLoaded: true,
      modelVersion: "1.0.0",
      quotaRemaining: 1,
      lastHarvestAt: null,
      now: () => 1,
    });
    expect(thrown.status).toBe("down");

    const response = await handleApiRequest(new Request("http://localhost/api/v2/health"));
    expect(response).not.toBeNull();
    const body = (await response!.json()) as { status: string; modelLoaded: boolean };
    expect(body.modelLoaded).toBe(true);
    expect(body.status).toBe("ok");
  });

  it("quota metric equals the store counter", async () => {
    const store = new MemoryObservationStore();
    setObservationStoreForTests(store);
    const used = await store.incrementQuota(
      monthKeyIst(Date.parse("2026-09-04T00:15:18+05:30")),
      17,
    );
    setQuotaCounter(used, 1000);
    const snap = getMetricsSnapshot();
    expect(snap.quotaUsed).toBe(17);
    expect(snap.quotaUsed).toBe(used);
    recordEtaLatency(10);
    recordEtaLatency(20);
    recordEtaLatency(40);
    recordPrediction(3);
    recordEtaLatency(Number.NaN);
    recordEtaLatency(-1);
    recordPrediction(0);
    const after = getMetricsSnapshot();
    expect(after.etaLatencyP50Ms).toBeGreaterThan(0);
    expect(after.predictionVolume).toBe(3);
  });
});

describe("error tracking", () => {
  it("parses a DSN and no-ops when unset", () => {
    expect(parseSentryDsn("")).toBeNull();
    expect(parseSentryDsn("not a url")).toBeNull();
    expect(parseSentryDsn("https://abc@o123.ingest.sentry.io/456")).toEqual({
      publicKey: "abc",
      host: "o123.ingest.sentry.io",
      projectId: "456",
    });
    expect(createRequestId().length).toBeGreaterThan(4);
  });

  it("loads a matching model artifact and rejects mismatches", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "model-"));
    const good = path.join(dir, "good.json");
    writeFileSync(
      good,
      JSON.stringify({
        version: "1.0.0",
        featureVersion: FEATURE_VERSION,
        trainedAt: 1,
        rowCount: 1,
        provenance: "synthetic",
        featureOrder: [
          "currentDelayMin",
          "delayTrendMin",
          "sectionMeanRunMin",
          "sectionP80RunMin",
          "hourOfDay",
          "dayOfWeek",
          "season",
          "dayOfJourney",
          "remainingKm",
          "remainingHalts",
          "downstreamOccupancy",
          "weatherCode",
          "dwellOverrunMin",
          "speedDeviationKmph",
        ],
        trees: {
          p10: [{ kind: "leaf", value: 0 }],
          p50: [{ kind: "leaf", value: 0 }],
          p80: [{ kind: "leaf", value: 1 }],
          p90: [{ kind: "leaf", value: 2 }],
        },
        metrics: { maeMin: 1, medaeMin: 1, rmseMin: 1, p80Coverage: 0.8 },
      }),
    );
    expect(loadModelArtifact(good)?.version).toBe("1.0.0");
    const badVer = path.join(dir, "bad-ver.json");
    writeFileSync(badVer, JSON.stringify({ version: "1.0.0", featureVersion: "0" }));
    expect(loadModelArtifact(badVer)).toBeNull();
    const invalid = path.join(dir, "invalid.json");
    writeFileSync(invalid, "not-json");
    expect(loadModelArtifact(invalid)).toBeNull();
    writeFileSync(path.join(dir, "arr.json"), JSON.stringify([1]));
    expect(loadModelArtifact(path.join(dir, "arr.json"))).toBeNull();
  });

  it("posts to Sentry when a DSN is set and initializes client tracking", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchImpl as unknown as typeof fetch;
    process.env["SENTRY_DSN"] = "https://abc@example.invalid/99";
    try {
      initServerErrorTracking();
      captureException(new Error("tracked"), { origin: "test" });
      await Promise.resolve();
      await Promise.resolve();
      expect(fetchImpl).toHaveBeenCalled();
      const blob = lines.join("\n");
      expect(blob).not.toContain(FAKE_KEY);
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env["SENTRY_DSN"];
    }
    initClientErrorTracking();
    initClientErrorTracking();
  });
});
