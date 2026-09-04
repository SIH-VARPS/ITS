#!/usr/bin/env node
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function resolvePath(envName, fallback) {
  return process.env[envName] || join(ROOT, fallback);
}

function absFromRepo(relOrAbs) {
  return isAbsolute(relOrAbs) ? relOrAbs : join(ROOT, relOrAbs);
}

export function rollbackState(state) {
  if (!state.previous) {
    throw new Error("no previous champion to restore");
  }
  return {
    champion: state.previous,
    previous: state.champion,
  };
}

function main() {
  const modelPath = resolvePath("MODEL_PATH", "src/data/generated/model.json");
  const statePath = resolvePath("REGISTRY_STATE_PATH", "src/data/generated/registry-state.json");
  if (!existsSync(statePath)) {
    throw new Error(`missing registry state at ${statePath}`);
  }
  const state = JSON.parse(readFileSync(statePath, "utf8"));
  const next = rollbackState(state);
  const artifactPath = absFromRepo(next.champion.artifactPath);
  if (!existsSync(artifactPath)) {
    throw new Error(`missing previous artifact at ${artifactPath}`);
  }
  copyFileSync(artifactPath, modelPath);
  writeFileSync(statePath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(
    `rolled back to ${next.champion.version} (mae ${next.champion.metrics.maeMin.toFixed(3)})`,
  );
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
