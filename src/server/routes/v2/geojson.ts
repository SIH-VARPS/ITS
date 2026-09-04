import { trainGeoJsonResponseSchema } from "@/server/schemas/geojson";
import { jsonWithEtag } from "@/server/middleware/etag";
import { errorResponse } from "@/server/middleware/rateLimit";
import { resolveTrainRoute } from "./engine";

export async function handleGeoJson(
  request: Request,
  trainNo: string,
  requestId: string,
): Promise<Response> {
  const train = await resolveTrainRoute(trainNo);
  if (!train) return errorResponse("Unknown train.", 404, requestId);
  const coordinates = train.halts.map((halt) => [halt.lng, halt.lat] as [number, number]);
  if (coordinates.length < 2) {
    return errorResponse("Train route has insufficient geometry.", 404, requestId);
  }
  const origin = train.halts[0]!;
  const dest = train.halts[train.halts.length - 1]!;
  const body = trainGeoJsonResponseSchema.parse({
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates,
        },
        properties: {
          trainNo: train.number,
          fromCode: origin.code,
          toCode: dest.code,
        },
      },
    ],
  });
  return jsonWithEtag(body, request, { "x-request-id": requestId });
}
