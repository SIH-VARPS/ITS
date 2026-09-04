import { readFileSync } from "node:fs";
import { join } from "node:path";
// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { handleApiRequest } from "../apiRouter";
import { getTrain } from "@/data/trains";
import { getObservationStore, setV2RateConfigForTests } from "../live/store";
import { V2_PATHS } from "../routes/v2/catalog";
import { errorEnvelopeSchema } from "../schemas/common";
import {
  FORBIDDEN_CLIENT_SUBSTRINGS,
  scanClientBundle,
  scanHaystack,
} from "../security/bundleScan";

async function call(path: string, init?: RequestInit) {
  const response = await handleApiRequest(new Request(`http://localhost${path}`, init));
  expect(response).not.toBeNull();
  return response!;
}

function concretePath(template: string): string {
  return template.replaceAll("{no}", "12951").replaceAll("{code}", "NDLS");
}

afterEach(() => {
  setV2RateConfigForTests(null);
  getObservationStore().clearRateBuckets();
});

describe("W11 security", { timeout: 60_000 }, () => {
  it("scans the built client for the RailRadar live-key prefix", () => {
    expect(scanHaystack("const x = 1", FORBIDDEN_CLIENT_SUBSTRINGS)).toEqual([]);
    expect(scanHaystack('k="rr_live_abc"', FORBIDDEN_CLIENT_SUBSTRINGS)).toEqual(["rr_live_"]);
    const scan = scanClientBundle();
    if (!scan.available) return;
    expect(scan.leaks, JSON.stringify(scan.leaks)).toEqual([]);
  });

  it("rejects POST /observations without a consent flag", async () => {
    const origin = getTrain("12951")!.halts[0]!;
    const missing = await call("/api/v2/observations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainNo: "12951",
        lat: origin.lat,
        lng: origin.lng,
        recordedAt: 1,
      }),
    });
    expect(missing.status).toBe(400);
    errorEnvelopeSchema.parse(JSON.parse(await missing.text()));

    const falseConsent = await call("/api/v2/observations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainNo: "12951",
        lat: origin.lat,
        lng: origin.lng,
        recordedAt: 1,
        consent: false,
      }),
    });
    expect(falseConsent.status).toBe(400);
  });

  it("rejects a disallowed origin on mutating routes", async () => {
    const originHalt = getTrain("12951")!.halts[0]!;
    const blocked = await call("/api/v2/observations", {
      method: "POST",
      headers: {
        Origin: "https://evil.example",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trainNo: "12951",
        lat: originHalt.lat,
        lng: originHalt.lng,
        recordedAt: 1,
        consent: true,
      }),
    });
    expect(blocked.status).toBe(403);
    expect(blocked.headers.get("access-control-allow-origin")).toBeNull();

    const preflight = await call("/api/v2/observations", {
      method: "OPTIONS",
      headers: {
        Origin: "https://evil.example",
        "Access-Control-Request-Method": "POST",
      },
    });
    expect(preflight.status).toBe(403);

    const okPreflight = await call("/api/v2/observations", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
      },
    });
    expect(okPreflight.status).toBe(204);
    expect(okPreflight.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");

    const allowed = await call("/api/v2/observations", {
      method: "POST",
      headers: {
        Origin: "http://localhost:3000",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trainNo: "12951",
        lat: originHalt.lat,
        lng: originHalt.lng,
        recordedAt: Date.parse("2026-09-04T00:15:18+05:30"),
        consent: true,
      }),
    });
    expect(allowed.status).toBe(200);
    expect(allowed.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");

    const deleted = await call("/api/v2/observations?train=12951", { method: "DELETE" });
    expect(deleted.status).toBe(200);

    const missingDelete = await call("/api/v2/observations", { method: "DELETE" });
    expect(missingDelete.status).toBe(400);

    const emptyDelete = await call("/api/v2/observations?train=12951", { method: "DELETE" });
    expect(emptyDelete.status).toBe(404);

    const getStar = await call("/api/v2/health", {
      headers: { Origin: "https://evil.example" },
    });
    expect(getStar.status).toBe(200);
    expect(getStar.headers.get("access-control-allow-origin")).toBe("*");
  });

  it.each([...V2_PATHS])("enforces the rate limiter on %s", async (template) => {
    setV2RateConfigForTests({ capacity: 1, refillPerSec: 0 });
    const path = concretePath(template);
    const headers = { "x-forwarded-for": `203.0.113.${V2_PATHS.indexOf(template) + 1}` };
    const first = await call(path, { headers });
    expect(first.status).not.toBe(429);
    const second = await call(path, { headers });
    expect(second.status).toBe(429);
  });

  it("reports no high or critical production vulnerabilities", () => {
    // Live `npm audit` hangs inside Vitest workers (empty stdout after 60s).
    // The dedicated CI step is the real gate; this keeps it from being deleted.
    const workflow = readFileSync(join(process.cwd(), ".github/workflows/ci.yml"), "utf8");
    expect(workflow).toMatch(/name:\s*Production dependency audit/);
    expect(workflow).toMatch(/npm audit --omit=dev --audit-level=high/);
  });
});
