import { trainRoutes } from "@/data/trains";
import { serveEtaResponse } from "@/lib/etaEngine";
import { jsonWithEtag } from "@/server/middleware/etag";
import { bucketNow, errorResponse } from "@/server/middleware/rateLimit";
import { boardQuerySchema, boardResponseSchema } from "@/server/schemas/board";
import { loadEngineContext, occupancyFromStore } from "./engine";

const BOARD_CAP = 8;
const BOARD_PRIORITY = new Set(["12951", "12001"]);

export async function handleBoard(
  request: Request,
  code: string,
  url: URL,
  requestId: string,
): Promise<Response> {
  const parsed = boardQuerySchema.safeParse({
    code,
    mode: url.searchParams.get("mode") ?? "all",
  });
  if (!parsed.success) {
    return errorResponse("Invalid station board query.", 400, requestId);
  }
  const station = parsed.data.code.toUpperCase();
  const occupancy = await occupancyFromStore();
  const calling = trainRoutes.filter((train) =>
    train.halts.some((halt) => halt.code.toUpperCase() === station),
  );
  const priority = calling.filter((train) => BOARD_PRIORITY.has(train.number));
  const rest = calling.filter((train) => !BOARD_PRIORITY.has(train.number));
  const candidates = [...priority, ...rest].slice(0, BOARD_CAP);
  const entries = [];
  for (const train of candidates) {
    const ctx = await loadEngineContext(train.number, occupancy);
    if (!ctx) continue;
    const served = serveEtaResponse(ctx.train, station, ctx.live, ctx.now, ctx.options);
    if (!served) continue;
    const halt = ctx.train.halts.find((row) => row.code.toUpperCase() === station);
    const platform = halt?.platform?.trim() || "—";
    entries.push({
      trainNo: served.trainNo,
      trainName: ctx.train.name || served.trainNo,
      eta: served.eta,
      p50: served.p50,
      p80: served.p80,
      p90: served.p90,
      delayMin: served.delayMin,
      platform,
      source: served.source,
    });
  }
  entries.sort((a, b) => Date.parse(a.eta) - Date.parse(b.eta));
  const listed = parsed.data.mode === "departures" ? [...entries].reverse() : entries;
  const body = boardResponseSchema.parse({
    stationCode: station,
    updatedAt: bucketNow().getTime(),
    entries: listed,
  });
  return jsonWithEtag(body, request, { "x-request-id": requestId });
}
