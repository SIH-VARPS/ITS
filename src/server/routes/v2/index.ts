import { timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "@/lib/logger";
import { getMetricsSnapshot } from "@/lib/metrics";
import { createRequestId, runWithRequestId } from "@/lib/requestId";
import { getLiveFeed } from "@/server/live/adapter";
import {
  applyV2RateLimit,
  corsHeaders,
  errorResponse,
  jsonResponse,
} from "@/server/middleware/rateLimit";
import { mutatingCorsRejection, runWithCorsRequest } from "@/server/middleware/cors";
import { buildHealthResponse } from "./health";
import { handleEta } from "./eta";
import { handleForecast } from "./forecast";
import { handleBoard } from "./board";
import { handleCongestion } from "./congestion";
import { handleGeoJson } from "./geojson";
import { handleObservations, handleDeleteObservations } from "./observations";
import { handleEvents } from "./events";
import { handleOpenApi } from "./openapi";

const HOT_SET_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../scripts/hot-set.json",
);

function secretsEqual(provided: string, expected: string): boolean {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
}

export function loadHotSet(): string[] {
  if (!existsSync(HOT_SET_PATH)) return [];
  try {
    const parsed = JSON.parse(readFileSync(HOT_SET_PATH, "utf8")) as { trains?: unknown };
    return Array.isArray(parsed.trains) ? parsed.trains.map(String) : [];
  } catch {
    return [];
  }
}

function gpsPosition(result: {
  observations: Array<{ eventType: string; lat?: number; lng?: number; delayMin: number }>;
  source: string;
  diverted: boolean;
}) {
  const gps = [...result.observations]
    .reverse()
    .find((row) => row.lat !== undefined && row.lng !== undefined);
  if (!gps || gps.lat === undefined || gps.lng === undefined) return null;
  return {
    lat: gps.lat,
    lng: gps.lng,
    delayMin: gps.delayMin,
    source: result.source,
    diverted: result.diverted,
  };
}

/**
 * v2 HTTP surface. Returns null when the path is not a `/api/v2` route.
 */
export async function handleV2Request(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/v2")) return null;

  const requestId = request.headers.get("x-request-id")?.trim() || createRequestId();
  return runWithRequestId(requestId, () =>
    runWithCorsRequest(request, () => dispatchV2(request, url, requestId)),
  );
}

async function dispatchV2(request: Request, url: URL, requestId: string): Promise<Response> {
  const pathname = url.pathname;
  const extra = { "x-request-id": requestId };

  const limited = await applyV2RateLimit(request, requestId);
  if (limited) return limited;

  const corsBlock = mutatingCorsRejection(request, requestId);
  if (corsBlock) return corsBlock;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    if (pathname === "/api/v2/health" && request.method === "GET") {
      const health = await buildHealthResponse();
      return jsonResponse(health, 200, extra);
    }

    if (pathname === "/api/v2/metrics" && request.method === "GET") {
      return jsonResponse({ ...getMetricsSnapshot(), requestId }, 200, extra);
    }

    if (pathname === "/api/v2/eta" && request.method === "GET") {
      return handleEta(request, url, requestId);
    }

    const forecastMatch = pathname.match(/^\/api\/v2\/train\/([^/]+)\/forecast$/);
    if (forecastMatch && request.method === "GET") {
      return handleForecast(request, decodeURIComponent(forecastMatch[1]!), requestId);
    }

    const boardMatch = pathname.match(/^\/api\/v2\/station\/([^/]+)\/board$/);
    if (boardMatch && request.method === "GET") {
      return handleBoard(request, decodeURIComponent(boardMatch[1]!), url, requestId);
    }

    if (pathname === "/api/v2/network/congestion" && request.method === "GET") {
      return handleCongestion(request, requestId);
    }

    const geoMatch = pathname.match(/^\/api\/v2\/train\/([^/]+)\/geojson$/);
    if (geoMatch && request.method === "GET") {
      return handleGeoJson(request, decodeURIComponent(geoMatch[1]!), requestId);
    }

    if (pathname === "/api/v2/observations" && request.method === "POST") {
      return handleObservations(request, requestId);
    }

    if (pathname === "/api/v2/observations" && request.method === "DELETE") {
      return handleDeleteObservations(request, requestId);
    }

    if (pathname === "/api/v2/events" && request.method === "GET") {
      return handleEvents(request, url, requestId);
    }

    if (pathname === "/api/v2/openapi.json" && request.method === "GET") {
      return handleOpenApi(requestId);
    }

    if (pathname === "/api/v2/live/positions" && request.method === "GET") {
      const requested = url.searchParams.get("trains");
      const { trainRoutes } = await import("@/data/trains");
      const trainNos = requested
        ? requested
            .split(",")
            .map((n) => n.trim())
            .filter(Boolean)
        : trainRoutes.map((train) => train.number);
      const feed = getLiveFeed();
      const snapshots = await feed.positionsFor(trainNos);
      const trains = snapshots.map((snap, index) => {
        const trainNo = trainNos[index]!;
        const pos = gpsPosition(snap);
        return {
          trainNo,
          source: snap.source,
          diverted: snap.diverted,
          observations: snap.observations,
          ...(pos ? { lat: pos.lat, lng: pos.lng, delayMin: pos.delayMin } : {}),
        };
      });
      return jsonResponse({ trains, updatedAt: Date.now() }, 200, extra);
    }

    const liveMatch = pathname.match(/^\/api\/v2\/live\/([^/]+)$/);
    if (liveMatch && request.method === "GET") {
      const trainNo = decodeURIComponent(liveMatch[1]!);
      const result = await getLiveFeed().fetchTrainDetailed(trainNo);
      const pos = gpsPosition(result);
      logger.info("live_fetch", {
        trainNo,
        source: result.source,
        diverted: result.diverted,
        cacheHit: result.cacheHit,
        count: result.observations.length,
      });
      return jsonResponse(
        {
          trainNo,
          source: result.source,
          diverted: result.diverted,
          cacheHit: result.cacheHit,
          observations: result.observations,
          ...(pos ? { lat: pos.lat, lng: pos.lng, delayMin: pos.delayMin } : {}),
        },
        200,
        extra,
      );
    }

    if (
      pathname === "/api/v2/internal/refresh" &&
      (request.method === "GET" || request.method === "POST")
    ) {
      const expected = (process.env["INTERNAL_REFRESH_SECRET"] ?? "").trim();
      if (!expected) {
        logger.warn("refresh_secret_unset");
        return errorResponse("Refresh is not configured.", 503, requestId);
      }
      const provided = (request.headers.get("x-refresh-secret") ?? "").trim();
      if (!secretsEqual(provided, expected)) {
        logger.warn("refresh_unauthorized");
        return errorResponse("Unauthorized.", 401, requestId);
      }
      const trains = loadHotSet();
      const feed = getLiveFeed();
      const refreshed = [];
      for (const trainNo of trains) {
        const result = await feed.fetchTrainDetailed(trainNo);
        refreshed.push({ trainNo, source: result.source, count: result.observations.length });
      }
      logger.info("refresh_complete", { count: refreshed.length });
      return jsonResponse({ ok: true, refreshed }, 200, extra);
    }

    return errorResponse(`API endpoint '${pathname}' not found.`, 404, requestId);
  } catch (error) {
    logger.error("v2_unhandled", {
      message: error instanceof Error ? error.message : "Internal API error",
    });
    return errorResponse("Internal API error", 500, requestId);
  }
}
