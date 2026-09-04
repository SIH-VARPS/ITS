import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import bundledModel from "@/data/generated/model.json";
import type { ModelArtifact } from "./types";
import { parseModelArtifact } from "./parseArtifact";

const DEFAULT_MODEL_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../data/generated/model.json",
);

/**
 * Load the model artifact. Prefers the on-disk file; falls back to the
 * bundled JSON so serverless health checks still see a loaded model.
 *
 * @param artifactPath filesystem path to `model.json`
 */
export function loadModelArtifact(artifactPath?: string): ModelArtifact | null {
  const path = artifactPath ?? DEFAULT_MODEL_PATH;
  if (existsSync(path)) {
    try {
      const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
      const artifact = parseModelArtifact(parsed);
      if (artifact) return artifact;
    } catch {
      /* fall through */
    }
  }
  if (artifactPath !== undefined && artifactPath !== DEFAULT_MODEL_PATH) return null;
  return parseModelArtifact(bundledModel);
}
