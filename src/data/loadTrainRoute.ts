import { createIsomorphicFn } from "@tanstack/react-start";
import { getTrain } from "@/data/trains";
import type { TrainRoute } from "@/data/trainTypes";

/**
 * Full timetable for one train. Featured trains resolve from the client
 * bundle; everything else is loaded from a zone shard on the server or
 * via `/api/v1/train/:number/route` in the browser.
 */
export const loadTrainRoute = createIsomorphicFn()
  .client(async (number: string): Promise<TrainRoute | undefined> => {
    const local = getTrain(number);
    if (local) return local;
    const res = await fetch(`/api/v1/train/${encodeURIComponent(number)}/route`);
    if (!res.ok) return undefined;
    const body = (await res.json()) as { data?: TrainRoute };
    return body.data;
  })
  .server(async (number: string): Promise<TrainRoute | undefined> => {
    const local = getTrain(number);
    if (local) return local;
    const { getTrainByNumber } = await import("@/server/trains/store.server");
    return getTrainByNumber(number);
  });
