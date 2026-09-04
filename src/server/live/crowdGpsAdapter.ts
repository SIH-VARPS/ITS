import { getTrain } from "@/data/trains";
import type { TrainRoute } from "@/data/trainTypes";
import { getTrainByNumber } from "@/server/trains/store.server";
import type { ObservationIntake } from "@/server/schemas/observations";
import { delayMinFromPair, epochMsToMinAfterMidnightIst, istRunDate } from "./parseLegacy";
import { snapToNearestSection } from "./geometry";
import { roundGpsCoord } from "./privacy";
import type { ObservationStore } from "./store";
import type { LiveFeedAdapter, TrainObservation } from "./types";

export type CrowdGpsAdapterOptions = {
  store: ObservationStore;
  getRoute?: (trainNo: string) => TrainRoute | undefined;
  now?: () => number;
  /** Reject fixes further than this from the route, kilometres. */
  maxDistanceKm?: number;
};

export type CrowdIngestResult =
  | { accepted: true; observation: TrainObservation }
  | { accepted: false; reason: "unknown_train" | "too_far" };

/**
 * Tier B — passenger GPS snapped to the nearest timetable section.
 */
export class CrowdGpsAdapter implements LiveFeedAdapter {
  private readonly store: ObservationStore;
  private readonly getRoute: (trainNo: string) => TrainRoute | undefined;
  private readonly now: () => number;
  private readonly maxDistanceKm: number;

  constructor(options: CrowdGpsAdapterOptions) {
    this.store = options.store;
    this.getRoute =
      options.getRoute ?? ((trainNo) => getTrain(trainNo) ?? getTrainByNumber(trainNo));
    this.now = options.now ?? (() => Date.now());
    this.maxDistanceKm = options.maxDistanceKm ?? 25;
  }

  async ingest(input: ObservationIntake): Promise<CrowdIngestResult> {
    const route = this.getRoute(input.trainNo);
    if (!route) return { accepted: false, reason: "unknown_train" };
    const snap = snapToNearestSection(input.lat, input.lng, route, this.maxDistanceKm);
    if (!snap) return { accepted: false, reason: "too_far" };
    const receivedAt = this.now();
    const matching = route.halts[snap.sequence - 1];
    const scheduledMin = (((route.startsAt + (matching?.dep ?? 0)) % 1440) + 1440) % 1440;
    const actualMin = epochMsToMinAfterMidnightIst(input.recordedAt || receivedAt);
    const delayMin = delayMinFromPair(scheduledMin, actualMin) ?? 0;
    const observation: TrainObservation = {
      trainNo: input.trainNo,
      runDate: istRunDate(input.recordedAt || receivedAt),
      stationCode: snap.stationCode,
      sequence: snap.sequence,
      eventType: "GPS",
      scheduledMin,
      actualMin,
      delayMin,
      segmentProgress: snap.segmentProgress,
      lat: roundGpsCoord(snap.lat),
      lng: roundGpsCoord(snap.lng),
      source: "crowd",
      receivedAt,
    };
    await this.store.putLatest(observation.trainNo, observation.runDate, [observation]);
    await this.store.setDiverted(observation.trainNo, observation.runDate, false);
    return { accepted: true, observation };
  }

  async fetchTrain(trainNo: string): Promise<TrainObservation[]> {
    const runDate = istRunDate(this.now());
    const latest = await this.store.getLatest(trainNo, runDate);
    if (!latest) return [];
    return latest.filter((row) => row.source === "crowd");
  }
}
