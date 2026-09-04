import { z } from "zod";

export const congestionSectionSchema = z.object({
  fromCode: z.string().min(1),
  toCode: z.string().min(1),
  occupancy: z.number().int().nonnegative(),
  /** Mean delay of occupying trains, minutes. */
  meanDelayMin: z.number().finite(),
});

export const congestionResponseSchema = z.object({
  /** Snapshot time, epoch milliseconds. */
  updatedAt: z.number().int().nonnegative(),
  sections: z.array(congestionSectionSchema),
});

export type CongestionSection = z.infer<typeof congestionSectionSchema>;
export type CongestionResponse = z.infer<typeof congestionResponseSchema>;
