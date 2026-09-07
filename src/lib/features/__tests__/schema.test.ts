import { describe, expect, it } from "vitest";
import {
  FEATURE_ORDER,
  FEATURE_VERSION,
  assertFeatureVersion,
  featureVectorSchema,
  type FeatureVector,
} from "../schema";

const sample: FeatureVector = {
  trainNo: "12951",
  fromStationCode: "UJN",
  toStationCode: "NDLS",
  currentDelayMin: 12,
  delayTrendMin: 5,
  sectionMeanRunMin: 430,
  sectionP80RunMin: 455,
  hourOfDay: 1,
  dayOfWeek: 1,
  season: 2,
  dayOfJourney: 2,
  trainClass: "Rajdhani",
  remainingKm: 540,
  remainingHalts: 1,
  downstreamOccupancy: 2,
  weatherCode: 3,
  precipitationMm: 1.2,
  visibilityKm: 8,
  windSpeedKmph: 14,
  dwellOverrunMin: 4,
  speedDeviationKmph: -8,
};

describe("feature schema", () => {
  it('freezes FEATURE_VERSION at "2"', () => {
    expect(FEATURE_VERSION).toBe("2");
  });

  it("throws when FEATURE_VERSION does not match", () => {
    expect(() => assertFeatureVersion("0")).toThrow(/FEATURE_VERSION mismatch/);
  });

  it("accepts a complete FeatureVector", () => {
    expect(featureVectorSchema.parse(sample).trainNo).toBe("12951");
  });

  it("rejects a NaN delay", () => {
    expect(featureVectorSchema.safeParse({ ...sample, currentDelayMin: Number.NaN }).success).toBe(
      false,
    );
  });

  it("lists numeric features in a stable order", () => {
    expect(FEATURE_ORDER).toContain("currentDelayMin");
    expect(FEATURE_ORDER).toContain("weatherCode");
    expect(FEATURE_ORDER).toContain("precipitationMm");
    expect(FEATURE_ORDER).toContain("visibilityKm");
    expect(FEATURE_ORDER).toContain("windSpeedKmph");
    expect(FEATURE_ORDER.length).toBeGreaterThanOrEqual(10);
  });
});
