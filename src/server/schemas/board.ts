import { z } from "zod";
import { observationSourceSchema } from "./common";

export const boardQuerySchema = z.object({
  code: z.string().min(1),
  mode: z.enum(["all", "arrivals", "departures"]).default("all"),
});

export const boardEntrySchema = z
  .object({
    trainNo: z.string().min(1),
    trainName: z.string().min(1),
    /** Predicted arrival, ISO-8601 instant. */
    eta: z.string().min(1),
    p50: z.string().min(1),
    p80: z.string().min(1),
    p90: z.string().min(1),
    /** Predicted delay vs published schedule, minutes. */
    delayMin: z.number().finite(),
    platform: z.string().min(1),
    source: observationSourceSchema,
  })
  .refine((row) => Date.parse(row.p50) <= Date.parse(row.p80), {
    message: "p50 must be ≤ p80",
    path: ["p80"],
  })
  .refine((row) => Date.parse(row.p80) <= Date.parse(row.p90), {
    message: "p80 must be ≤ p90",
    path: ["p90"],
  });

export const boardResponseSchema = z.object({
  stationCode: z.string().min(1),
  /** Board generation time, epoch milliseconds. */
  updatedAt: z.number().int().nonnegative(),
  entries: z.array(boardEntrySchema),
});

export type BoardQuery = z.infer<typeof boardQuerySchema>;
export type BoardEntry = z.infer<typeof boardEntrySchema>;
export type BoardResponse = z.infer<typeof boardResponseSchema>;
