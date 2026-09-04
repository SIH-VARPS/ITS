import { describe, expect, it } from "vitest";
import { FEATURE_VERSION } from "@/lib/features/schema";
import type { DelayForecast, ModelArtifact } from "../types";
import { MODEL_CONTRACT_VERSION } from "../types";

const artifact: ModelArtifact = {
  version: "1.0.0",
  featureVersion: FEATURE_VERSION,
  trainedAt: Date.parse("2026-03-01T00:00:00Z"),
  rowCount: 1000,
  provenance: "synthetic",
  featureOrder: ["currentDelayMin", "delayTrendMin"],
  trees: {
    p10: [{ kind: "leaf", value: -2 }],
    p50: [{ kind: "leaf", value: 0 }],
    p80: [{ kind: "leaf", value: 8 }],
    p90: [{ kind: "leaf", value: 14 }],
  },
  metrics: { maeMin: 6.2, medaeMin: 4.1, rmseMin: 9.4, p80Coverage: 0.81 },
};

const forecast: DelayForecast = {
  p10Min: -2,
  p50Min: 0,
  p80Min: 8,
  p90Min: 14,
};

describe("model types", () => {
  it("freezes MODEL_CONTRACT_VERSION at 1", () => {
    expect(MODEL_CONTRACT_VERSION).toBe(1);
  });

  it("accepts a well-formed artifact whose featureVersion matches FEATURE_VERSION", () => {
    expect(artifact.featureVersion).toBe(FEATURE_VERSION);
    expect(artifact.trees.p50[0]?.kind).toBe("leaf");
  });

  it("keeps quantile forecasts monotonic", () => {
    expect(forecast.p10Min).toBeLessThanOrEqual(forecast.p50Min);
    expect(forecast.p50Min).toBeLessThanOrEqual(forecast.p80Min);
    expect(forecast.p80Min).toBeLessThanOrEqual(forecast.p90Min);
  });
});
