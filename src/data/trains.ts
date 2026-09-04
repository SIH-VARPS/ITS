import type { Halt, TrainRoute, TrainSummary } from "./trainTypes";
import { featuredRoutes } from "./generated/featured";
import { catalogTrains, localCounts, networkCounts, ROUTE_COUNT } from "./generated/catalog";

export type { Halt, TrainRoute, TrainSummary };
export { localCounts, networkCounts, ROUTE_COUNT, catalogTrains };

/** Spotlight subset (delay-history + hot-set + sample multi-day). Not the full corpus. */
export const trainRoutes = featuredRoutes;

export function findTrains(query: string): TrainSummary[] {
  const q = query.trim().toLowerCase();
  if (!q) return catalogTrains.slice(0, 20);
  return catalogTrains.filter(
    (t) =>
      t.number.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.origin.toLowerCase() === q ||
      t.destination.toLowerCase() === q,
  );
}

export function getTrain(number: string): TrainRoute | undefined {
  return featuredRoutes.find((t) => t.number === number);
}
