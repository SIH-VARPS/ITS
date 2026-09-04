import { etaQuerySchema, etaResponseSchema } from "@/server/schemas/eta";
import { jsonWithEtag } from "@/server/middleware/etag";
import { errorResponse } from "@/server/middleware/rateLimit";
import { serveEtaResponse } from "@/lib/etaEngine";
import { loadEngineContext } from "./engine";

export async function handleEta(request: Request, url: URL, requestId: string): Promise<Response> {
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
  return jsonWithEtag(etaResponseSchema.parse(served), request, { "x-request-id": requestId });
}
