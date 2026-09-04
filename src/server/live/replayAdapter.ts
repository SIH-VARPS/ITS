import { getTrain } from "@/data/trains";
import type { TrainRoute } from "@/data/trainTypes";
import { getTrainByNumber } from "@/server/trains/store.server";
import { positionAtElapsed } from "./geometry";
import { delayMinFromPair, epochMsToMinAfterMidnightIst, istRunDate } from "./parseLegacy";
import type { LiveFeedAdapter, TrainObservation } from "./types";

export type ReplayAdapterOptions = {
  getRoute?: (trainNo: string) => TrainRoute | undefined;
  now?: () => number;
  /** Simulated clock multiplier. */
  speed?: number;
};

const DEFAULT_SPEED = 8;

/**
 * Tier C — accelerated-clock simulator. Demo safety net when Tier A is
 * unavailable (no key, quota, or open circuit).
 */
export class ReplayAdapter implements LiveFeedAdapter {
  private readonly getRoute: (trainNo: string) => TrainRoute | undefined;
  private readonly now: () => number;
  private readonly speed: number;

  constructor(options: ReplayAdapterOptions = {}) {
    this.getRoute =
      options.getRoute ?? ((trainNo) => getTrain(trainNo) ?? getTrainByNumber(trainNo));
    this.now = options.now ?? (() => Date.now());
    this.speed = options.speed ?? DEFAULT_SPEED;
  }

  async fetchTrain(trainNo: string): Promise<TrainObservation[]> {
    const route = this.getRoute(trainNo);
    if (!route || route.halts.length === 0) return [];
    const nowMs = this.now();
    const dest = route.halts[route.halts.length - 1]!;
    const journeyMin = Math.max(1, dest.arr);
    const istMin = epochMsToMinAfterMidnightIst(nowMs);
    let elapsed = istMin - route.startsAt;
    if (elapsed < 0) elapsed += 1440;
    const accelerated = (elapsed * this.speed) % (journeyMin + 30);
    const pos = positionAtElapsed(route, accelerated);
    const matching = route.halts[pos.sequence - 1];
    const scheduledMin =
      (((route.startsAt + (matching?.dep ?? matching?.arr ?? 0)) % 1440) + 1440) % 1440;
    const actualMin = epochMsToMinAfterMidnightIst(nowMs);
    const delayMin = delayMinFromPair(scheduledMin, actualMin) ?? 0;
    const observation: TrainObservation = {
      trainNo,
      runDate: istRunDate(nowMs),
      stationCode: pos.stationCode,
      sequence: pos.sequence,
      eventType: "GPS",
      scheduledMin,
      actualMin,
      delayMin,
      segmentProgress: pos.segmentProgress,
      lat: pos.lat,
      lng: pos.lng,
      source: "replay",
      receivedAt: nowMs,
    };
    return [observation];
  }
}
