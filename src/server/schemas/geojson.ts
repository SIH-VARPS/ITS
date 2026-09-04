import { z } from "zod";

const geoJsonPositionSchema = z.tuple([z.number(), z.number()]).rest(z.number());

export const geoJsonLineStringSchema = z.object({
  type: z.literal("LineString"),
  coordinates: z.array(geoJsonPositionSchema).min(2),
});

export const trainGeoJsonFeatureSchema = z.object({
  type: z.literal("Feature"),
  geometry: geoJsonLineStringSchema,
  properties: z.object({
    trainNo: z.string().min(1),
    fromCode: z.string().min(1),
    toCode: z.string().min(1),
  }),
});

export const trainGeoJsonResponseSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(trainGeoJsonFeatureSchema),
});

export type TrainGeoJsonResponse = z.infer<typeof trainGeoJsonResponseSchema>;
