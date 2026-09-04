import { z } from "zod";
import { zodToOpenApiSchema } from "@/server/openapi/fromZod";
import { boardQuerySchema, boardResponseSchema } from "@/server/schemas/board";
import { congestionResponseSchema } from "@/server/schemas/congestion";
import { errorEnvelopeSchema } from "@/server/schemas/common";
import { etaQuerySchema, etaResponseSchema } from "@/server/schemas/eta";
import { forecastResponseSchema } from "@/server/schemas/forecast";
import { trainGeoJsonResponseSchema } from "@/server/schemas/geojson";
import { healthResponseSchema } from "@/server/schemas/health";
import {
  observationDeleteQuerySchema,
  observationDeleteResponseSchema,
  observationIntakeResponseSchema,
  observationIntakeSchema,
} from "@/server/schemas/observations";
import { jsonResponse } from "@/server/middleware/rateLimit";
import { API_V2_VERSION } from "@/server/schemas/common";
import { V2_PATHS } from "./catalog";

const metricsResponseSchema = z.object({
  vendorCalls: z.number(),
  requestId: z.string(),
});

const livePositionsResponseSchema = z.object({
  trains: z.array(z.unknown()),
  updatedAt: z.number(),
});

const liveTrainResponseSchema = z.object({
  trainNo: z.string(),
  source: z.string(),
  diverted: z.boolean(),
  cacheHit: z.boolean().optional(),
  observations: z.array(z.unknown()),
});

const refreshResponseSchema = z.object({
  ok: z.literal(true),
  refreshed: z.array(z.unknown()),
});

const openapiSelfSchema = z.object({
  openapi: z.string(),
  info: z.object({ title: z.string(), version: z.string() }),
  paths: z.record(z.unknown()),
});

type PathItem = {
  path: string;
  method: "get" | "post" | "delete";
  summary: string;
  operationId: string;
  parameters?: Array<Record<string, unknown>>;
  requestBody?: Record<string, unknown>;
  responses: Record<string, unknown>;
};

const OPERATIONS: PathItem[] = [
  op("get", "/api/v2/health", "Health snapshot", healthResponseSchema),
  op("get", "/api/v2/metrics", "Process metrics", metricsResponseSchema),
  op("get", "/api/v2/eta", "ETA at a halt", etaResponseSchema, etaQuerySchema),
  op("get", "/api/v2/train/{no}/forecast", "Remaining-halt forecast", forecastResponseSchema),
  op(
    "get",
    "/api/v2/station/{code}/board",
    "Station arrival board",
    boardResponseSchema,
    boardQuerySchema,
  ),
  op("get", "/api/v2/network/congestion", "Section occupancy", congestionResponseSchema),
  op("get", "/api/v2/train/{no}/geojson", "Route LineString", trainGeoJsonResponseSchema),
  {
    method: "post",
    summary: "Crowd GPS observation",
    operationId: "postObservations",
    path: "/api/v2/observations",
    requestBody: {
      required: true,
      content: {
        "application/json": { schema: zodToOpenApiSchema(observationIntakeSchema) },
      },
    },
    responses: jsonResponses(observationIntakeResponseSchema),
  },
  op(
    "delete",
    "/api/v2/observations",
    "Delete stored crowd GPS for a train-run",
    observationDeleteResponseSchema,
    observationDeleteQuerySchema,
  ),
  op("get", "/api/v2/events", "ETA poll / one-shot SSE", etaResponseSchema, etaQuerySchema),
  op("get", "/api/v2/openapi.json", "Generated OpenAPI 3.0 document", openapiSelfSchema),
  op("get", "/api/v2/live/positions", "Live positions", livePositionsResponseSchema),
  op("get", "/api/v2/live/{no}", "Live snapshot for one train", liveTrainResponseSchema),
  op("get", "/api/v2/internal/refresh", "Hot-set refresh", refreshResponseSchema),
];

function op(
  method: "get" | "post" | "delete",
  path: string,
  summary: string,
  response: z.ZodTypeAny,
  query?: z.ZodTypeAny,
): PathItem {
  const parameters: Array<Record<string, unknown>> = [];
  for (const match of path.matchAll(/\{([^}]+)\}/g)) {
    parameters.push({
      name: match[1],
      in: "path",
      required: true,
      schema: { type: "string" },
    });
  }
  if (query) {
    const converted = zodToOpenApiSchema(query);
    const properties = (converted["properties"] ?? {}) as Record<string, unknown>;
    const required = new Set<string>(
      Array.isArray(converted["required"]) ? (converted["required"] as string[]) : [],
    );
    for (const name of Object.keys(properties)) {
      if (name === "code" && path.includes("{code}")) continue;
      parameters.push({
        name,
        in: "query",
        required: required.has(name),
        schema: properties[name],
      });
    }
  }
  return {
    method,
    path,
    summary,
    operationId: `${method}_${path.replace(/[/{}]/g, "_")}`,
    ...(parameters.length > 0 ? { parameters } : {}),
    responses: jsonResponses(response),
  };
}

function jsonResponses(schema: z.ZodTypeAny): Record<string, unknown> {
  return {
    "200": {
      description: "OK",
      content: { "application/json": { schema: zodToOpenApiSchema(schema) } },
    },
    "400": {
      description: "Bad request",
      content: { "application/json": { schema: zodToOpenApiSchema(errorEnvelopeSchema) } },
    },
    "404": {
      description: "Not found",
      content: { "application/json": { schema: zodToOpenApiSchema(errorEnvelopeSchema) } },
    },
    "429": {
      description: "Rate limit exceeded",
      content: { "application/json": { schema: zodToOpenApiSchema(errorEnvelopeSchema) } },
    },
  };
}

export function buildOpenApiDocument(): Record<string, unknown> {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const item of OPERATIONS) {
    const path = item.path;
    const { method, summary, operationId, parameters, requestBody, responses } = item;
    const entry = paths[path] ?? {};
    entry[method] = {
      summary,
      operationId,
      ...(parameters ? { parameters } : {}),
      ...(requestBody ? { requestBody } : {}),
      responses,
    };
    paths[path] = entry;
  }
  return {
    openapi: "3.0.0",
    info: {
      title: "RailDristhi v2 API",
      version: String(API_V2_VERSION),
      description:
        "Generated from frozen Zod schemas. Additive-only. All ETA fields round-trip through EtaEngine.",
    },
    paths,
    "x-registered-paths": [...V2_PATHS],
  };
}

export function handleOpenApi(requestId: string): Response {
  return jsonResponse(buildOpenApiDocument(), 200, { "x-request-id": requestId });
}
