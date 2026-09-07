import { getTrain } from "@/data/trains";
import type { TrainRoute } from "@/data/trainTypes";
import { occupancyFixesFromRoutes } from "@/lib/features/sectionFeatures";
import { getWeatherClient } from "@/lib/features/weather";
import { inferLiveState, type EtaEngineOptions, type LiveEngineState } from "@/lib/etaEngine";
import { getLiveFeed } from "@/server/live/adapter";
import { getObservationStore } from "@/server/live/store";
import type { ObservationSource, TrainObservation } from "@/server/live/types";
import { bucketNow } from "@/server/middleware/rateLimit";

export type V2EngineContext = {
  train: TrainRoute;
  now: Date;
  live: LiveEngineState;
  observations: TrainObservation[];
  occupancy: ReturnType<typeof occupancyFixesFromRoutes>;
  weatherCode: number;
  precipitationMm: number;
  visibilityKm: number;
  windSpeedKmph: number;
  source: ObservationSource;
  options: EtaEngineOptions;
};

export async function resolveTrainRoute(trainNo: string): Promise<TrainRoute | undefined> {
  const featured = getTrain(trainNo);
  if (featured) return featured;
  const { getTrainByNumber } = await import("@/server/trains/store.server");
  return getTrainByNumber(trainNo);
}

export async function occupancyFromStore(): Promise<ReturnType<typeof occupancyFixesFromRoutes>> {
  const listed = await getObservationStore().listLatest();
  const entries = [];
  for (const entry of listed) {
    const route = await resolveTrainRoute(entry.trainNo);
    if (!route) continue;
    entries.push({ trainNo: entry.trainNo, route, observations: entry.rows });
  }
  return occupancyFixesFromRoutes(entries);
}

export async function loadEngineContext(
  trainNo: string,
  occupancyOverride?: ReturnType<typeof occupancyFixesFromRoutes>,
): Promise<V2EngineContext | null> {
  const train = await resolveTrainRoute(trainNo);
  if (!train) return null;
  const store = getObservationStore();
  const occupancy = occupancyOverride ?? (await occupancyFromStore());
  let observations = (await store.getLatestByTrain(trainNo)) ?? [];
  let source: ObservationSource = observations[0]?.source ?? "replay";
  if (observations.length === 0) {
    const snap = await getLiveFeed().fetchTrainDetailed(trainNo);
    observations = snap.observations;
    source = snap.source;
  }
  const now = bucketNow();
  const live = inferLiveState(train, now, observations);
  const nextHalt = train.halts[Math.min(live.lastHaltIndex + 1, train.halts.length - 1)]!;
  const weather = await getWeatherClient().weatherSnapshotAt(
    nextHalt.code,
    nextHalt.lat,
    nextHalt.lng,
    now,
  );
  const options: EtaEngineOptions = {
    observations,
    occupancy,
    weatherCode: weather.weatherCode,
    precipitationMm: weather.precipitationMm,
    visibilityKm: weather.visibilityKm,
    windSpeedKmph: weather.windSpeedKmph,
    source,
    ...(observations[0]?.runDate ? { runDate: observations[0].runDate } : {}),
  };
  return {
    train,
    now,
    live,
    observations,
    occupancy,
    weatherCode: weather.weatherCode,
    precipitationMm: weather.precipitationMm,
    visibilityKm: weather.visibilityKm,
    windSpeedKmph: weather.windSpeedKmph,
    source,
    options,
  };
}
