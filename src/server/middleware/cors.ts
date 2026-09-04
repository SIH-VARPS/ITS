import { AsyncLocalStorage } from "node:async_hooks";
import { errorEnvelopeSchema } from "@/server/schemas/common";

const requestStore = new AsyncLocalStorage<Request>();

export const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const LOCAL_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

function allowedOrigins(): string[] {
  const fromEnv = (process.env["CORS_ALLOWED_ORIGINS"] ?? "")
    .split(",")
    .map((row) => row.trim())
    .filter(Boolean);
  const appUrl = (process.env["APP_URL"] ?? "").trim();
  return [...new Set([...fromEnv, ...(appUrl ? [appUrl] : []), ...LOCAL_ORIGINS])];
}

export function effectiveMethod(request: Request): string {
  const method = request.method.toUpperCase();
  if (method !== "OPTIONS") return method;
  const requested = request.headers.get("access-control-request-method");
  return requested ? requested.toUpperCase() : method;
}

export function isMutatingMethod(method: string): boolean {
  return MUTATING_METHODS.has(method.toUpperCase());
}

export function isOriginAllowed(origin: string | null, method: string): boolean {
  if (!isMutatingMethod(method)) return true;
  if (!origin) return true;
  return allowedOrigins().includes(origin);
}

const SHARED_CORS = {
  "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH, PUT, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Refresh-Secret, X-Request-Id, If-None-Match",
  "Content-Type": "application/json; charset=utf-8",
};

export function corsHeadersFor(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  const method = effectiveMethod(request);
  if (!isMutatingMethod(method)) {
    return { ...SHARED_CORS, "Access-Control-Allow-Origin": "*" };
  }
  if (origin && isOriginAllowed(origin, method)) {
    return {
      ...SHARED_CORS,
      "Access-Control-Allow-Origin": origin,
      Vary: "Origin",
    };
  }
  return { ...SHARED_CORS };
}

export function runWithCorsRequest<T>(request: Request, fn: () => T): T {
  return requestStore.run(request, fn);
}

export function corsHeaders(): Record<string, string> {
  const request = requestStore.getStore();
  if (!request) {
    return { ...SHARED_CORS, "Access-Control-Allow-Origin": "*" };
  }
  return corsHeadersFor(request);
}

/** Star CORS for GET-style responses when no request is in ALS. */
export const CORS = {
  ...SHARED_CORS,
  "Access-Control-Allow-Origin": "*",
};

export function mutatingCorsRejection(request: Request, requestId: string): Response | null {
  const origin = request.headers.get("origin");
  const method = effectiveMethod(request);
  if (!isMutatingMethod(method)) return null;
  if (isOriginAllowed(origin, method)) return null;
  const body = errorEnvelopeSchema.parse({
    error: true as const,
    status: 403,
    message: "Origin not allowed.",
    timestamp: new Date().toISOString(),
  });
  return new Response(JSON.stringify(body), {
    status: 403,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-request-id": requestId,
    },
  });
}
