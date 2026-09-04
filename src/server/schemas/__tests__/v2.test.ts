import { describe, expect, it } from "vitest";
import type { z } from "zod";
import {
  boardResponseSchema,
  congestionResponseSchema,
  errorEnvelopeSchema,
  etaQuerySchema,
  etaResponseSchema,
  forecastResponseSchema,
  healthResponseSchema,
  observationDeleteQuerySchema,
  observationIntakeSchema,
  trainGeoJsonResponseSchema,
  trainObservationSchema,
} from "../index";

function roundTrip(schema: z.ZodType, valid: unknown, malformed: unknown): void {
  const parsed = schema.parse(valid);
  expect(schema.parse(JSON.parse(JSON.stringify(parsed)))).toEqual(parsed);
  expect(schema.safeParse(malformed).success).toBe(false);
}

const etaValid = {
  trainNo: "12951",
  station: "NDLS",
  eta: "2026-03-16T08:47:00+05:30",
  p50: "2026-03-16T08:47:00+05:30",
  p80: "2026-03-16T09:05:00+05:30",
  p90: "2026-03-16T09:20:00+05:30",
  delayMin: 12,
  baselineEta: "2026-03-16T08:50:00+05:30",
  improvementMin: 3,
  confidence: 0.72,
  reason: "congestion",
  features: [{ name: "currentDelayMin", value: 12, unit: "min" }],
  modelVersion: "1.0.0",
  source: "railradar" as const,
  updatedAt: Date.parse("2026-03-16T01:20:00+05:30"),
};

describe("v2 HTTP schemas", () => {
  it("round-trips every published schema and rejects a malformed payload", () => {
    roundTrip(etaQuerySchema, { train: "12951", station: "NDLS" }, { train: "12951" });
    roundTrip(etaResponseSchema, etaValid, { ...etaValid, p80: etaValid.p50, p50: etaValid.p90 });
    roundTrip(
      forecastResponseSchema,
      {
        trainNo: "12951",
        runDate: "2026-03-15",
        source: "railradar",
        modelVersion: "1.0.0",
        updatedAt: 1,
        halts: [
          {
            stationCode: "NDLS",
            sequence: 5,
            eta: etaValid.eta,
            p50: etaValid.p50,
            p80: etaValid.p80,
            p90: etaValid.p90,
            delayMin: 12,
          },
        ],
      },
      { trainNo: "12951" },
    );
    roundTrip(
      boardResponseSchema,
      {
        stationCode: "NDLS",
        updatedAt: 1,
        entries: [
          {
            trainNo: "12951",
            trainName: "Mumbai Rajdhani",
            eta: etaValid.eta,
            p50: etaValid.p50,
            p80: etaValid.p80,
            p90: etaValid.p90,
            delayMin: 12,
            platform: "1",
            source: "railradar",
          },
        ],
      },
      { stationCode: "NDLS", entries: [] },
    );
    roundTrip(
      congestionResponseSchema,
      {
        updatedAt: 1,
        sections: [{ fromCode: "UJN", toCode: "NDLS", occupancy: 2, meanDelayMin: 14 }],
      },
      { sections: [{ fromCode: "UJN" }] },
    );
    roundTrip(
      trainGeoJsonResponseSchema,
      {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [72.8194, 18.969],
                [77.22, 28.6423],
              ],
            },
            properties: { trainNo: "12951", fromCode: "MMCT", toCode: "NDLS" },
          },
        ],
      },
      { type: "FeatureCollection", features: [{ type: "Feature" }] },
    );
    roundTrip(
      observationIntakeSchema,
      {
        trainNo: "12951",
        lat: 23.18,
        lng: 75.78,
        recordedAt: 1,
        consent: true,
        accuracyM: 25,
      },
      {
        trainNo: "12951",
        lat: 23.18,
        lng: 75.78,
        recordedAt: 1,
        consent: false,
      },
    );
    roundTrip(
      observationDeleteQuerySchema,
      { train: "12951", runDate: "2026-09-04" },
      { train: "" },
    );
    roundTrip(
      healthResponseSchema,
      {
        status: "ok",
        storeReachable: true,
        modelLoaded: true,
        modelVersion: "1.0.0",
        lastHarvestAt: 1,
        quotaRemaining: 800,
        updatedAt: 1,
      },
      { status: "ok" },
    );
    roundTrip(
      errorEnvelopeSchema,
      {
        error: true,
        status: 404,
        message: "unknown train",
        timestamp: "2026-03-16T01:20:00+05:30",
      },
      { error: false, status: 404, message: "nope", timestamp: "x" },
    );
    roundTrip(
      trainObservationSchema,
      {
        trainNo: "12951",
        runDate: "2026-03-15",
        stationCode: "UJN",
        sequence: 4,
        eventType: "ARR",
        scheduledMin: 55,
        actualMin: 67,
        delayMin: 12,
        source: "railradar",
        receivedAt: 1,
      },
      {
        trainNo: "12951",
        runDate: "2026-03-15",
        stationCode: "UJN",
        sequence: 4,
        eventType: "ARR",
        scheduledMin: 55,
        actualMin: 67,
        delayMin: Number.NaN,
        source: "railradar",
        receivedAt: 1,
      },
    );
  });
});
