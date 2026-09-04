import { z } from "zod";

/**
 * Crowd-GPS observation intake. `consent` must be true — W11 rejects the
 * request otherwise. `recordedAt` is epoch milliseconds.
 */
export const observationIntakeSchema = z.object({
  trainNo: z.string().min(1),
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  /** Client capture time, epoch milliseconds. */
  recordedAt: z.number().int().nonnegative(),
  consent: z.literal(true),
  /** Horizontal accuracy, metres. */
  accuracyM: z.number().finite().positive().optional(),
});

export const observationIntakeResponseSchema = z.object({
  accepted: z.literal(true),
  /** Server receive time, epoch milliseconds. */
  receivedAt: z.number().int().nonnegative(),
});

export const observationDeleteQuerySchema = z.object({
  train: z.string().min(1),
  runDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const observationDeleteResponseSchema = z.object({
  deleted: z.literal(true),
});

export type ObservationIntake = z.infer<typeof observationIntakeSchema>;
export type ObservationIntakeResponse = z.infer<typeof observationIntakeResponseSchema>;
