import type { z } from "zod";

export type V2Method = "GET" | "POST" | "DELETE";

export type V2Operation = {
  method: V2Method;
  path: string;
  summary: string;
  query?: z.ZodTypeAny;
  body?: z.ZodTypeAny;
  response: z.ZodTypeAny;
};

/** Canonical v2 route list — dispatcher and OpenAPI share this. */
export const V2_PATHS = [
  "/api/v2/health",
  "/api/v2/metrics",
  "/api/v2/eta",
  "/api/v2/train/{no}/forecast",
  "/api/v2/station/{code}/board",
  "/api/v2/network/congestion",
  "/api/v2/train/{no}/geojson",
  "/api/v2/observations",
  "/api/v2/events",
  "/api/v2/openapi.json",
  "/api/v2/live/positions",
  "/api/v2/live/{no}",
  "/api/v2/internal/refresh",
] as const;
