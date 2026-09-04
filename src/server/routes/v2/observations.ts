import { CrowdGpsAdapter } from "@/server/live/crowdGpsAdapter";
import { getObservationStore } from "@/server/live/store";
import { jsonResponse, errorResponse } from "@/server/middleware/rateLimit";
import {
  observationDeleteQuerySchema,
  observationDeleteResponseSchema,
  observationIntakeResponseSchema,
  observationIntakeSchema,
} from "@/server/schemas/observations";

export async function handleObservations(request: Request, requestId: string): Promise<Response> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return errorResponse("Invalid JSON body.", 400, requestId);
  }
  const parsed = observationIntakeSchema.safeParse(raw);
  if (!parsed.success) {
    return errorResponse("Invalid observation payload.", 400, requestId);
  }
  const adapter = new CrowdGpsAdapter({ store: getObservationStore() });
  const result = await adapter.ingest(parsed.data);
  if (!result.accepted) {
    const status = result.reason === "unknown_train" ? 404 : 400;
    return errorResponse(
      result.reason === "too_far"
        ? "Fix is more than 25 km from the published route."
        : "Unknown train.",
      status,
      requestId,
    );
  }
  const body = observationIntakeResponseSchema.parse({
    accepted: true as const,
    receivedAt: result.observation.receivedAt,
  });
  return jsonResponse(body, 200, { "x-request-id": requestId });
}

export async function handleDeleteObservations(
  request: Request,
  requestId: string,
): Promise<Response> {
  const url = new URL(request.url);
  const runDate = url.searchParams.get("runDate");
  const parsed = observationDeleteQuerySchema.safeParse({
    train: url.searchParams.get("train") ?? "",
    ...(runDate ? { runDate } : {}),
  });
  if (!parsed.success) {
    return errorResponse("train query parameter is required.", 400, requestId);
  }
  const store = getObservationStore();
  const deleted = parsed.data.runDate
    ? await store.deleteLatest(parsed.data.train, parsed.data.runDate)
    : await store.deleteLatest(parsed.data.train);
  if (!deleted) return errorResponse("No observations to delete.", 404, requestId);
  const body = observationDeleteResponseSchema.parse({ deleted: true as const });
  return jsonResponse(body, 200, { "x-request-id": requestId });
}
