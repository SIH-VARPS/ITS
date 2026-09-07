import { z } from "zod";

/**
 * Feature schema version. A model artifact whose `featureVersion` does not
 * equal this constant must be rejected at load time.
 */
export const FEATURE_VERSION = "2";

/** Throw when a model artifact or vector stamp does not match this schema. */
export function assertFeatureVersion(version: string): void {
  if (version !== FEATURE_VERSION) {
    throw new Error(`FEATURE_VERSION mismatch: got ${version}, expected ${FEATURE_VERSION}`);
  }
}

export const featureVectorSchema = z.object({
  trainNo: z.string().min(1),
  fromStationCode: z.string().min(1),
  toStationCode: z.string().min(1),
  /** Current delay at section entry, minutes. */
  currentDelayMin: z.number().finite(),
  /** Delay change across the last 3 completed halts, minutes. */
  delayTrendMin: z.number().finite(),
  /** Historical mean run time for this section, minutes. */
  sectionMeanRunMin: z.number().finite(),
  /** Historical p80 run time for this section, minutes. */
  sectionP80RunMin: z.number().finite(),
  /** Hour of day in IST, 0–23. */
  hourOfDay: z.number().int().min(0).max(23),
  /** Day of week, 0 = Sunday … 6 = Saturday (IST). */
  dayOfWeek: z.number().int().min(0).max(6),
  /** Indian meteorological season: 1 winter, 2 pre-monsoon, 3 monsoon, 4 post-monsoon. */
  season: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  /** Calendar day of this journey counting from origin departure, 1-based. */
  dayOfJourney: z.number().int().positive(),
  trainClass: z.string().min(1),
  remainingKm: z.number().finite().nonnegative(),
  remainingHalts: z.number().int().nonnegative(),
  /** Count of tracked trains occupying the next N downstream sections. */
  downstreamOccupancy: z.number().finite().nonnegative(),
  /** Open-Meteo WMO weather code at the next halt. */
  weatherCode: z.number().int().nonnegative(),
  /** Hourly precipitation at the next halt, millimetres. */
  precipitationMm: z.number().finite().nonnegative(),
  /** Horizontal visibility at the next halt, kilometres. */
  visibilityKm: z.number().finite().nonnegative(),
  /** 10 m wind speed at the next halt, km/h. */
  windSpeedKmph: z.number().finite().nonnegative(),
  /** Observed dwell minus scheduled halt, minutes (unscheduled stoppage proxy). */
  dwellOverrunMin: z.number().finite(),
  /** Observed speed minus `speedToNextStationKmph` (TSR proxy). */
  speedDeviationKmph: z.number().finite(),
});

export type FeatureVector = z.infer<typeof featureVectorSchema>;

/** Canonical feature order consumed by the tree ensemble. */
export const FEATURE_ORDER = [
  "currentDelayMin",
  "delayTrendMin",
  "sectionMeanRunMin",
  "sectionP80RunMin",
  "hourOfDay",
  "dayOfWeek",
  "season",
  "dayOfJourney",
  "remainingKm",
  "remainingHalts",
  "downstreamOccupancy",
  "weatherCode",
  "precipitationMm",
  "visibilityKm",
  "windSpeedKmph",
  "dwellOverrunMin",
  "speedDeviationKmph",
] as const satisfies ReadonlyArray<keyof FeatureVector>;
