#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Keep in sync with src/lib/refine/policy.ts */
const MAE_IMPROVE_RELATIVE = 0.02;
const MAE_IMPROVE_FLOOR_MIN = 0.05;
const TARGET_P80 = 0.8;

function resolvePath(envName, fallback) {
  return process.env[envName] || join(ROOT, fallback);
}

function calError(coverage) {
  return Math.abs(coverage - TARGET_P80);
}

function eligible(champion, challenger) {
  const margin = Math.max(champion.maeMin * MAE_IMPROVE_RELATIVE, MAE_IMPROVE_FLOOR_MIN);
  const maeImproved = champion.maeMin - challenger.maeMin >= margin;
  const calibrationOk = calError(challenger.p80Coverage) <= calError(champion.p80Coverage) + 1e-12;
  if (maeImproved && calibrationOk) {
    return { ok: true, reason: "promoted" };
  }
  if (!maeImproved && !calibrationOk) {
    return { ok: false, reason: "rejected: MAE margin and calibration" };
  }
  if (!maeImproved) {
    return { ok: false, reason: "rejected: MAE did not beat champion by the required margin" };
  }
  return { ok: false, reason: "rejected: calibration regressed" };
}

export function evaluateMetrics(champion, challenger) {
  return eligible(champion, challenger);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function pointerFor(artifactPath, artifact) {
  return {
    version: artifact.version,
    artifactPath,
    metrics: artifact.metrics,
  };
}

function main() {
  const modelPath = resolvePath("MODEL_PATH", "src/data/generated/model.json");
  const challengerPath = resolvePath("CHALLENGER_PATH", "src/data/generated/challenger.json");
  const statePath = resolvePath("REGISTRY_STATE_PATH", "src/data/generated/registry-state.json");
  const modelsDir = resolvePath("MODELS_DIR", "src/data/generated/models");

  if (!existsSync(challengerPath)) {
    throw new Error(`missing challenger at ${challengerPath}; run python ml/retrain.py`);
  }
  if (!existsSync(modelPath)) {
    throw new Error(`missing champion at ${modelPath}`);
  }

  const champion = readJson(modelPath);
  const challenger = readJson(challengerPath);
  const decision = eligible(champion.metrics, challenger.metrics);
  if (!decision.ok) {
    console.log(`not promoted: ${decision.reason}`);
    process.exitCode = 2;
    return;
  }

  mkdirSync(modelsDir, { recursive: true });
  const prevCopy = join(modelsDir, `${champion.version}.json`);
  if (!existsSync(prevCopy)) copyFileSync(modelPath, prevCopy);
  const nextCopy = join(modelsDir, `${challenger.version}.json`);
  if (!existsSync(nextCopy)) copyFileSync(challengerPath, nextCopy);
  copyFileSync(challengerPath, modelPath);

  const repoPath = (abs) => {
    const relative = path.relative(ROOT, abs);
    if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) {
      return relative.split(path.sep).join("/");
    }
    return abs;
  };
  const state = {
    champion: pointerFor(repoPath(nextCopy), challenger),
    previous: pointerFor(repoPath(prevCopy), champion),
  };
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
  console.log(`promoted ${challenger.version} (mae ${challenger.metrics.maeMin.toFixed(3)})`);
}

const invokedDirectly =
  Boolean(process.argv[1]) &&
  path.normalize(fileURLToPath(import.meta.url)) === path.normalize(path.resolve(process.argv[1]));

if (invokedDirectly) {
  try {
    main();
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
