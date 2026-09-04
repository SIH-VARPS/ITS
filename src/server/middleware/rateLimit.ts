import { getObservationStore } from "@/server/live/store";
import { CORS, corsHeaders } from "@/server/middleware/cors";
import { errorEnvelopeSchema } from "@/server/schemas/common";

export { CORS, corsHeaders };

export const V2_TTL_MS = 30_000;

export function bucketNow(atMs: number = Date.now()): Date {
  return new Date(Math.floor(atMs / V2_TTL_MS) * V2_TTL_MS);
}

export function jsonResponse(
  data: unknown,
  status = 200,
  extra: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), ...extra },
  });
}

export function errorResponse(message: string, status: number, requestId: string): Response {
  const body = errorEnvelopeSchema.parse({
    error: true as const,
    status,
    message,
    timestamp: new Date().toISOString(),
  });
  return jsonResponse(body, status, { "x-request-id": requestId });
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "local";
}

export async function applyV2RateLimit(
  request: Request,
  requestId: string,
): Promise<Response | null> {
  if (request.method === "OPTIONS") return null;
  const store = getObservationStore();
  const result = await store.takeToken(clientKey(request));
  if (result.allowed) return null;
  const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  const body = errorEnvelopeSchema.parse({
    error: true as const,
    status: 429,
    message: "Rate limit exceeded.",
    timestamp: new Date().toISOString(),
  });
  return jsonResponse(body, 429, {
    "x-request-id": requestId,
    "retry-after": String(retryAfter),
    "x-ratelimit-limit": String(result.limit),
    "x-ratelimit-remaining": "0",
    "x-ratelimit-reset": String(Math.ceil(result.resetAt / 1000)),
  });
}
