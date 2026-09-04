import { etaQuerySchema, etaResponseSchema } from "@/server/schemas/eta";
import { jsonWithEtag } from "@/server/middleware/etag";
import { corsHeaders, errorResponse, V2_TTL_MS } from "@/server/middleware/rateLimit";
import { serveEtaResponse } from "@/lib/etaEngine";
import { loadEngineContext } from "./engine";

export async function handleEvents(
  request: Request,
  url: URL,
  requestId: string,
): Promise<Response> {
  const parsed = etaQuerySchema.safeParse({
    train: url.searchParams.get("train") ?? "",
    station: url.searchParams.get("station") ?? "",
  });
  if (!parsed.success) {
    return errorResponse("train and station query parameters are required.", 400, requestId);
  }
  const ctx = await loadEngineContext(parsed.data.train);
  if (!ctx) return errorResponse("Unknown train.", 404, requestId);
  const served = serveEtaResponse(ctx.train, parsed.data.station, ctx.live, ctx.now, ctx.options);
  if (!served) {
    return errorResponse("Station is not on this train's route.", 404, requestId);
  }
  const body = etaResponseSchema.parse(served);
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/event-stream")) {
    const payload = `event: eta\ndata: ${JSON.stringify(body)}\n\n`;
    return new Response(payload, {
      status: 200,
      headers: {
        ...corsHeaders(),
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache",
        "x-request-id": requestId,
      },
    });
  }
  return jsonWithEtag(body, request, { "x-request-id": requestId }, Math.round(V2_TTL_MS / 1000));
}
