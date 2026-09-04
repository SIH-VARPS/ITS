import { z } from "zod";
import { observationSourceSchema } from "./common";

export const forecastHaltSchema = z
  .object({
    stationCode: z.string().min(1),
    sequence: z.number().int().positive(),
    /** Predicted arrival, ISO-8601 instant. */
    eta: z.string().min(1),
    p50: z.string().min(1),
    p80: z.string().min(1),
    p90: z.string().min(1),
    /** Predicted delay vs published schedule, minutes. */
    delayMin: z.number().finite(),
  })
  .refine((row) => Date.parse(row.p50) <= Date.parse(row.p80), {
    message: "p50 must be ≤ p80",
    path: ["p80"],
  })
  .refine((row) => Date.parse(row.p80) <= Date.parse(row.p90), {
    message: "p80 must be ≤ p90",
    path: ["p90"],
  });

export const forecastResponseSchema = z.object({
  trainNo: z.string().min(1),
  runDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  source: observationSourceSchema,
  modelVersion: z.string().min(1),
  /** Last observation time, epoch milliseconds. */
  updatedAt: z.number().int().nonnegative(),
  halts: z.array(forecastHaltSchema),
});

export type ForecastHalt = z.infer<typeof forecastHaltSchema>;
export type ForecastResponse = z.infer<typeof forecastResponseSchema>;
