import { z } from "zod";

/** v2 HTTP contract version. Additive-only after freeze. */
export const API_V2_VERSION = 2 as const;

export const observationSourceSchema = z.enum(["railradar", "crowd", "replay"]);

export const observationEventTypeSchema = z.enum(["ARR", "DEP", "GPS"]);

export const trainObservationSchema = z.object({
  trainNo: z.string().min(1),
  runDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  stationCode: z.string().min(1),
  sequence: z.number().int().positive(),
  eventType: observationEventTypeSchema,
  /** Minutes after midnight IST. */
  scheduledMin: z.number().finite(),
  /** Minutes after midnight IST. */
  actualMin: z.number().finite(),
  /** Minutes; must be finite — NaN is a contract violation. */
  delayMin: z.number().finite(),
  segmentProgress: z.number().min(0).max(1).optional(),
  lat: z.number().finite().optional(),
  lng: z.number().finite().optional(),
  source: observationSourceSchema,
  /** Epoch milliseconds. */
  receivedAt: z.number().int().nonnegative(),
});

export const errorEnvelopeSchema = z.object({
  error: z.literal(true),
  status: z.number().int(),
  message: z.string(),
  details: z.unknown().optional(),
  timestamp: z.string().min(1),
});

export type ApiErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;
export type TrainObservationDto = z.infer<typeof trainObservationSchema>;
