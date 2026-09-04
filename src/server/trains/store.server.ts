import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { TrainRoute } from "@/data/trainTypes";
import { CATALOG_ZONES, ROUTE_COUNT } from "@/data/generated/catalog";

const GENERATED = join(dirname(fileURLToPath(import.meta.url)), "../../data/generated");

const shardCache = new Map<string, Map<string, TrainRoute>>();
let trainIndex: Record<string, string> | null = null;
let stationIndex: Record<string, string[]> | null = null;
let allRoutes: TrainRoute[] | null = null;

function loadTrainIndex(): Record<string, string> {
  if (!trainIndex) {
    trainIndex = JSON.parse(readFileSync(join(GENERATED, "trainIndex.json"), "utf8")) as Record<
      string,
      string
    >;
  }
  return trainIndex;
}

function loadShard(zone: string): Map<string, TrainRoute> {
  const cached = shardCache.get(zone);
  if (cached) return cached;
  const path = join(GENERATED, "shards", `${zone}.json`);
  const list: TrainRoute[] = existsSync(path)
    ? (JSON.parse(readFileSync(path, "utf8")) as TrainRoute[])
    : [];
  const map = new Map(list.map((route) => [route.number, route]));
  shardCache.set(zone, map);
  return map;
}

/** Full timetable for one train, loaded from its zone shard. */
export function getTrainByNumber(number: string): TrainRoute | undefined {
  const zone = loadTrainIndex()[number];
  if (!zone) return undefined;
  return loadShard(zone).get(number);
}

/** All ingested routes. Cached after the first call. */
export function getAllTrains(): TrainRoute[] {
  if (allRoutes) return allRoutes;
  const out: TrainRoute[] = [];
  for (const zone of CATALOG_ZONES) {
    out.push(...loadShard(zone).values());
  }
  allRoutes = out;
  return out;
}

export function getTrainsCallingAt(code: string): TrainRoute[] {
  if (!stationIndex) {
    stationIndex = JSON.parse(readFileSync(join(GENERATED, "stationIndex.json"), "utf8")) as Record<
      string,
      string[]
    >;
  }
  const upper = code.toUpperCase();
  const numbers = stationIndex[upper] ?? stationIndex[code] ?? [];
  const trains: TrainRoute[] = [];
  for (const n of numbers) {
    const train = getTrainByNumber(n);
    if (train) trains.push(train);
  }
  return trains;
}

export { ROUTE_COUNT };
