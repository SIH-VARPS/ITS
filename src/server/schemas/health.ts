import { z } from "zod";

/**
 * `GET /api/v2/health` — operability snapshot for the control room and CI.
 */
export const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded", "down"]),
  storeReachable: z.boolean(),
  /** True when a model artifact matching FEATURE_VERSION is loaded. */
  modelLoaded: z.boolean(),
  modelVersion: z.string().nullable(),
  /** Last successful harvest time, epoch milliseconds. Null if never harvested. */
  lastHarvestAt: z.number().int().nonnegative().nullable(),
  /** Remaining RailRadar calls in the current quota window. Null if unknown. */
  quotaRemaining: z.number().int().nonnegative().nullable(),
  /** Snapshot time, epoch milliseconds. */
  updatedAt: z.number().int().nonnegative(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
