import { z } from "zod";
import { observationSourceSchema } from "./common";

export const etaQuerySchema = z.object({
  train: z.string().min(1),
  station: z.string().min(1),
});

export const etaFeatureAttributionSchema = z.object({
  name: z.string().min(1),
  value: z.number().finite(),
  unit: z.string().min(1),
});

export const etaResponseSchema = z
  .object({
    trainNo: z.string().min(1),
    station: z.string().min(1),
    /** Predicted arrival, ISO-8601 instant. */
    eta: z.string().min(1),
    /** P50 arrival, ISO-8601 instant. */
    p50: z.string().min(1),
    /** P80 arrival, ISO-8601 instant. */
    p80: z.string().min(1),
    /** P90 arrival, ISO-8601 instant. */
    p90: z.string().min(1),
    /** Predicted delay vs published schedule, minutes. */
    delayMin: z.number().finite(),
    /** Baseline B arrival, ISO-8601 instant. */
    baselineEta: z.string().min(1),
    /** Baseline delay minus model delay, minutes (positive = improvement). */
    improvementMin: z.number().finite(),
    /** Model confidence, 0..1. */
    confidence: z.number().min(0).max(1),
    reason: z.string().min(1),
    features: z.array(etaFeatureAttributionSchema),
    modelVersion: z.string().min(1),
    source: observationSourceSchema,
    /** Last observation time, epoch milliseconds. */
    updatedAt: z.number().int().nonnegative(),
  })
  .refine((row) => Date.parse(row.p50) <= Date.parse(row.p80), {
    message: "p50 must be ≤ p80",
    path: ["p80"],
  })
  .refine((row) => Date.parse(row.p80) <= Date.parse(row.p90), {
    message: "p80 must be ≤ p90",
    path: ["p90"],
  });

export type EtaQuery = z.infer<typeof etaQuerySchema>;
export type EtaResponse = z.infer<typeof etaResponseSchema>;
