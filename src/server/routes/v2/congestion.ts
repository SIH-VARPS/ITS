import { getTrain, trainRoutes } from "@/data/trains";
import { inferLiveState } from "@/lib/etaEngine";
import { jsonWithEtag } from "@/server/middleware/etag";
import { bucketNow } from "@/server/middleware/rateLimit";
import { congestionResponseSchema } from "@/server/schemas/congestion";
import { getObservationStore } from "@/server/live/store";

export async function handleCongestion(request: Request, requestId: string): Promise<Response> {
  const store = getObservationStore();
  const listed = await store.listLatest();
  const now = bucketNow();
  const buckets = new Map<string, { fromCode: string; toCode: string; delays: number[] }>();

  function add(fromCode: string, toCode: string, delayMin: number): void {
    const key = `${fromCode.toUpperCase()}|${toCode.toUpperCase()}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.delays.push(delayMin);
      return;
    }
    buckets.set(key, { fromCode, toCode, delays: [delayMin] });
  }

  const seen = new Set<string>();
  for (const entry of listed) {
    const route =
      getTrain(entry.trainNo) ?? trainRoutes.find((row) => row.number === entry.trainNo);
    if (!route) continue;
    seen.add(entry.trainNo);
    const live = inferLiveState(route, now, entry.rows);
    const from = route.halts[live.lastHaltIndex];
    const to = route.halts[live.lastHaltIndex + 1];
    if (!from || !to) continue;
    add(from.code, to.code, live.currentDelayMin);
  }

  if (buckets.size === 0) {
    for (const route of trainRoutes.slice(0, 40)) {
      if (seen.has(route.number)) continue;
      const live = inferLiveState(route, now);
      const from = route.halts[live.lastHaltIndex];
      const to = route.halts[live.lastHaltIndex + 1];
      if (!from || !to) continue;
      add(from.code, to.code, live.currentDelayMin);
    }
  }

  const sections = [...buckets.values()].map((row) => ({
    fromCode: row.fromCode,
    toCode: row.toCode,
    occupancy: row.delays.length,
    meanDelayMin: Math.round((row.delays.reduce((a, b) => a + b, 0) / row.delays.length) * 10) / 10,
  }));
  sections.sort((a, b) => b.occupancy - a.occupancy || b.meanDelayMin - a.meanDelayMin);

  const body = congestionResponseSchema.parse({
    updatedAt: now.getTime(),
    sections,
  });
  return jsonWithEtag(body, request, { "x-request-id": requestId });
}
