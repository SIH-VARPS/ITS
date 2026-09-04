import { scheduledArrivalMin } from "@/lib/baseline";
import { etaAlongRoute, istRunDate, minutesFromDay0ToIso } from "@/lib/etaEngine";
import { jsonWithEtag } from "@/server/middleware/etag";
import { errorResponse } from "@/server/middleware/rateLimit";
import { forecastResponseSchema } from "@/server/schemas/forecast";
import { loadEngineContext } from "./engine";

export async function handleForecast(
  request: Request,
  trainNo: string,
  requestId: string,
): Promise<Response> {
  const ctx = await loadEngineContext(trainNo);
  if (!ctx) return errorResponse("Unknown train.", 404, requestId);
  const runDate = ctx.options.runDate ?? ctx.observations[0]?.runDate ?? istRunDate(ctx.now);
  const along = etaAlongRoute(ctx.train, ctx.live, ctx.now, ctx.options);
  const start = ctx.live.lastHaltIndex;
  const halts = [];
  let modelVersion = along[start]?.modelVersion ?? ctx.train.number;
  for (let haltIndex = start; haltIndex < ctx.train.halts.length; haltIndex++) {
    const predicted = along[haltIndex];
    if (!predicted) continue;
    if (haltIndex === start) modelVersion = predicted.modelVersion;
    const halt = ctx.train.halts[haltIndex]!;
    const scheduled = scheduledArrivalMin(ctx.train, haltIndex);
    halts.push({
      stationCode: halt.code,
      sequence: haltIndex + 1,
      eta: minutesFromDay0ToIso(runDate, predicted.etaMin),
      p50: minutesFromDay0ToIso(runDate, scheduled + predicted.p50Min),
      p80: minutesFromDay0ToIso(runDate, scheduled + predicted.p80Min),
      p90: minutesFromDay0ToIso(runDate, scheduled + predicted.p90Min),
      delayMin: Math.round(predicted.delayMin),
    });
  }
  const body = forecastResponseSchema.parse({
    trainNo: ctx.train.number,
    runDate,
    source: ctx.source,
    modelVersion,
    updatedAt: ctx.observations[0]?.receivedAt ?? ctx.now.getTime(),
    halts,
  });
  return jsonWithEtag(body, request, { "x-request-id": requestId });
}
