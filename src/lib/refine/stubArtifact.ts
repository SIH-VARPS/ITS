import { FEATURE_ORDER, FEATURE_VERSION } from "@/lib/features/schema";
import type { ModelArtifact, ModelMetrics } from "@/lib/model/types";

const ZERO_LEAF = { kind: "leaf" as const, value: 0 };

/** Metric-bearing stub used by registry tests and the retrain loop. */
export function stubArtifact(
  version: string,
  metrics: ModelMetrics,
  extras?: { trainedAt?: number; rowCount?: number },
): ModelArtifact {
  return {
    version,
    featureVersion: FEATURE_VERSION,
    trainedAt: extras?.trainedAt ?? 1,
    rowCount: extras?.rowCount ?? 10,
    provenance: "synthetic",
    featureOrder: [...FEATURE_ORDER],
    trees: {
      p10: [ZERO_LEAF],
      p50: [ZERO_LEAF],
      p80: [ZERO_LEAF],
      p90: [ZERO_LEAF],
    },
    metrics,
  };
}
