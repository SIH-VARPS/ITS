/**
 * Frozen live-feed contract (v1). Changing this file requires bumping
 * {@link LIVE_CONTRACT_VERSION} and updating every consumer in the same PR.
 */
export const LIVE_CONTRACT_VERSION = 1 as const;

/** Observation event at a halt or interpolated GPS ping. */
export type ObservationEventType = "ARR" | "DEP" | "GPS";

/** Which adapter produced the observation. */
export type ObservationSource = "railradar" | "crowd" | "replay";

/**
 * One per-halt or GPS sample from a live feed.
 *
 * Units: `*Min` = minutes after midnight (IST); `receivedAt` = epoch ms;
 * `segmentProgress` = 0..1 along the current section.
 */
export type TrainObservation = {
  trainNo: string;
  /** Journey date in IST, `YYYY-MM-DD`. */
  runDate: string;
  stationCode: string;
  /** 1-based halt order along the published route. */
  sequence: number;
  eventType: ObservationEventType;
  /** Scheduled event clock, minutes after midnight IST. */
  scheduledMin: number;
  /** Observed event clock, minutes after midnight IST. */
  actualMin: number;
  /** `actualMin − scheduledMin` with midnight wrap; never NaN. */
  delayMin: number;
  /** Fraction of the current inter-station section already covered, 0..1. */
  segmentProgress?: number;
  lat?: number;
  lng?: number;
  source: ObservationSource;
  /** Wall-clock receive time, epoch milliseconds. */
  receivedAt: number;
};

/**
 * Tiered live-feed boundary. Implementations must not throw on a missing
 * train — return an empty array instead.
 */
export interface LiveFeedAdapter {
  /**
   * Fetch the latest observations for a train.
   * @param trainNo 5-digit IR train number
   */
  fetchTrain(trainNo: string): Promise<TrainObservation[]>;
}
