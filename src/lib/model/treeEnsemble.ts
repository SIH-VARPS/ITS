import { FEATURE_ORDER, assertFeatureVersion } from "@/lib/features/schema";
import type { DelayForecast, EnsembleTreeNode, ModelArtifact, QuantileKey } from "./types";

const QUANTILES: readonly QuantileKey[] = ["p10", "p50", "p80", "p90"];

/**
 * sklearn GradientBoosting: `x[feature] <= threshold` goes left.
 * NaN comparisons are false, so missing values go right.
 */
export function evalTree(node: EnsembleTreeNode, values: readonly number[]): number {
  if (node.kind === "leaf") return node.value;
  const feature = values[node.featureIndex];
  if (feature === undefined || Number.isNaN(feature)) {
    return evalTree(node.right, values);
  }
  return feature <= node.threshold ? evalTree(node.left, values) : evalTree(node.right, values);
}

export function evalEnsemble(
  trees: readonly EnsembleTreeNode[],
  values: readonly number[],
): number {
  let sum = 0;
  for (const tree of trees) sum += evalTree(tree, values);
  return sum;
}

export function enforceQuantileMonotonicity(forecast: DelayForecast): DelayForecast {
  const p10Min = forecast.p10Min;
  const p50Min = Math.max(p10Min, forecast.p50Min);
  const p80Min = Math.max(p50Min, forecast.p80Min);
  const p90Min = Math.max(p80Min, forecast.p90Min);
  return { p10Min, p50Min, p80Min, p90Min };
}

const validatedArtifacts = new WeakSet<ModelArtifact>();

function assertArtifactShape(artifact: ModelArtifact): void {
  if (validatedArtifacts.has(artifact)) return;
  assertFeatureVersion(artifact.featureVersion);
  if (artifact.featureOrder.length !== FEATURE_ORDER.length) {
    throw new Error("featureOrder length does not match FEATURE_ORDER");
  }
  for (let i = 0; i < FEATURE_ORDER.length; i++) {
    if (artifact.featureOrder[i] !== FEATURE_ORDER[i]) {
      throw new Error(`featureOrder mismatch at ${i}`);
    }
  }
  for (const key of QUANTILES) {
    if (!artifact.trees[key] || artifact.trees[key].length === 0) {
      throw new Error(`empty trees for ${key}`);
    }
  }
  validatedArtifacts.add(artifact);
}

/**
 * Score one feature row against a quantile ensemble.
 * Throws when `featureVersion` does not match {@link FEATURE_VERSION}.
 */
export function scoreQuantiles(artifact: ModelArtifact, values: readonly number[]): DelayForecast {
  assertArtifactShape(artifact);
  const raw: DelayForecast = {
    p10Min: evalEnsemble(artifact.trees.p10, values),
    p50Min: evalEnsemble(artifact.trees.p50, values),
    p80Min: evalEnsemble(artifact.trees.p80, values),
    p90Min: evalEnsemble(artifact.trees.p90, values),
  };
  return enforceQuantileMonotonicity(raw);
}

export { QUANTILES };
