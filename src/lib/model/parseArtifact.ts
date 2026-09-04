import { FEATURE_ORDER, FEATURE_VERSION } from "@/lib/features/schema";
import type { EnsembleTreeNode, ModelArtifact, QuantileKey } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNode(value: unknown): value is EnsembleTreeNode {
  if (!isRecord(value) || typeof value["kind"] !== "string") return false;
  if (value["kind"] === "leaf") {
    return typeof value["value"] === "number" && Number.isFinite(value["value"]);
  }
  if (value["kind"] === "split") {
    return (
      typeof value["featureIndex"] === "number" &&
      Number.isFinite(value["featureIndex"]) &&
      typeof value["threshold"] === "number" &&
      Number.isFinite(value["threshold"]) &&
      isNode(value["left"]) &&
      isNode(value["right"])
    );
  }
  return false;
}

function parseTrees(value: unknown): ModelArtifact["trees"] | null {
  if (!isRecord(value)) return null;
  const keys: QuantileKey[] = ["p10", "p50", "p80", "p90"];
  const trees = {} as ModelArtifact["trees"];
  for (const key of keys) {
    const list = value[key];
    if (!Array.isArray(list) || list.length === 0 || !list.every(isNode)) return null;
    trees[key] = list as EnsembleTreeNode[];
  }
  return trees;
}

/**
 * Validate a parsed artifact. Returns null when corrupt or when
 * `featureVersion` does not match {@link FEATURE_VERSION}.
 */
export function parseModelArtifact(parsed: unknown): ModelArtifact | null {
  if (!isRecord(parsed)) return null;
  if (parsed["featureVersion"] !== FEATURE_VERSION) return null;
  if (typeof parsed["version"] !== "string" || parsed["version"].length === 0) return null;
  if (typeof parsed["trainedAt"] !== "number" || !Number.isFinite(parsed["trainedAt"])) return null;
  if (typeof parsed["rowCount"] !== "number" || !Number.isFinite(parsed["rowCount"])) return null;
  const trees = parseTrees(parsed["trees"]);
  if (!trees) return null;
  const featureOrder = parsed["featureOrder"];
  if (!Array.isArray(featureOrder) || featureOrder.some((item) => typeof item !== "string")) {
    return null;
  }
  if (featureOrder.length !== FEATURE_ORDER.length) return null;
  const metrics = parsed["metrics"];
  if (!isRecord(metrics)) return null;
  const maeMin = metrics["maeMin"];
  const medaeMin = metrics["medaeMin"];
  const rmseMin = metrics["rmseMin"];
  const p80Coverage = metrics["p80Coverage"];
  if (
    typeof maeMin !== "number" ||
    typeof medaeMin !== "number" ||
    typeof rmseMin !== "number" ||
    typeof p80Coverage !== "number"
  ) {
    return null;
  }
  const provenance = parsed["provenance"];
  if (provenance !== "synthetic" && provenance !== "railradar" && provenance !== "mixed") {
    return null;
  }
  return {
    version: parsed["version"],
    featureVersion: FEATURE_VERSION,
    trainedAt: parsed["trainedAt"],
    rowCount: parsed["rowCount"],
    provenance,
    featureOrder: featureOrder as string[],
    trees,
    metrics: { maeMin, medaeMin, rmseMin, p80Coverage },
  };
}
