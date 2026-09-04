import { FEATURE_VERSION } from "@/lib/features/schema";

/**
 * Frozen model-artifact contract (v1). Changing this file requires bumping
 * {@link MODEL_CONTRACT_VERSION} and updating every consumer in the same PR.
 */
export const MODEL_CONTRACT_VERSION = 1 as const;

export type EnsembleTreeNode =
  | { readonly kind: "leaf"; readonly value: number }
  | {
      readonly kind: "split";
      readonly featureIndex: number;
      readonly threshold: number;
      readonly left: EnsembleTreeNode;
      readonly right: EnsembleTreeNode;
    };

export type QuantileKey = "p10" | "p50" | "p80" | "p90";

export type QuantileTrees = Record<QuantileKey, readonly EnsembleTreeNode[]>;

export type ModelProvenance = "synthetic" | "railradar" | "mixed";

export type ModelMetrics = {
  /** Mean absolute error of P50, minutes. */
  maeMin: number;
  /** Median absolute error of P50, minutes. */
  medaeMin: number;
  /** Root mean squared error of P50, minutes. */
  rmseMin: number;
  /** Fraction of realised delays that fell at or below the P80 prediction, 0..1. */
  p80Coverage: number;
};

/**
 * Versioned tree-ensemble artifact exported by `ml/train.py` and loaded by
 * TypeScript inference. `featureVersion` must equal {@link FEATURE_VERSION}.
 */
export type ModelArtifact = {
  version: string;
  featureVersion: typeof FEATURE_VERSION;
  /** Training completion time, epoch milliseconds. */
  trainedAt: number;
  rowCount: number;
  provenance: ModelProvenance;
  featureOrder: readonly string[];
  trees: QuantileTrees;
  metrics: ModelMetrics;
};

/**
 * Quantile delay forecast for one section (or a summed horizon).
 *
 * Units: all `*Min` fields are minutes of incremental delay.
 */
export type DelayForecast = {
  p10Min: number;
  p50Min: number;
  p80Min: number;
  p90Min: number;
};
