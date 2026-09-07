import type { TrainRoute } from "@/data/trainTypes";
import { etaAtHalt, resolveArtifact, type LiveEngineState } from "@/lib/etaEngine";
import type { OccupancyFix } from "@/lib/features/sectionFeatures";
import type { DelayPrediction, EvalSample, Predictor } from "./harness";

function occupancyFor(sample: EvalSample, route: TrainRoute): OccupancyFix[] {
  const count = Math.max(0, Math.round(sample.features["downstreamOccupancy"] ?? 0));
  if (count <= 0) return [];
  const from = route.halts[sample.currentHaltIndex];
  const to = route.halts[sample.currentHaltIndex + 1];
  if (!from || !to) return [];
  return Array.from({ length: count }, (_, i) => ({
    trainNo: `OCC${i}`,
    fromCode: from.code,
    toCode: to.code,
  }));
}

function liveState(sample: EvalSample, route: TrainRoute): LiveEngineState {
  const halt = route.halts[sample.currentHaltIndex];
  return {
    elapsedMin: route.startsAt + (halt?.arr ?? 0) + sample.currentDelayMin,
    currentDelayMin: sample.currentDelayMin,
    currentKm: halt?.km ?? 0,
    lastHaltIndex: sample.currentHaltIndex,
    haltedDurationMin: 0,
    isHalted: false,
  };
}

export function createEtaEnginePredictor(routes: Map<string, TrainRoute>): Predictor {
  return (sample: EvalSample): DelayPrediction => {
    const route = routes.get(sample.trainNo);
    if (!route) {
      return { p10Min: 0, p50Min: 0, p80Min: 0, p90Min: 0 };
    }
    const eta = etaAtHalt(
      route,
      sample.targetHaltIndex,
      liveState(sample, route),
      new Date(sample.atMs),
      {
        weatherCode: sample.weatherCode,
        precipitationMm: sample.features["precipitationMm"] ?? 0,
        visibilityKm: sample.features["visibilityKm"] ?? 0,
        windSpeedKmph: sample.features["windSpeedKmph"] ?? 0,
        occupancy: occupancyFor(sample, route),
        runDate: sample.runDate,
      },
    );
    return {
      p10Min: eta.p10Min,
      p50Min: eta.p50Min,
      p80Min: eta.p80Min,
      p90Min: eta.p90Min,
    };
  };
}

export function servedModelVersion(): string {
  return resolveArtifact()?.version ?? "unknown";
}
