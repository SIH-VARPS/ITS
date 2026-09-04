import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const champ = { maeMin: 10, medaeMin: 8, rmseMin: 12, p80Coverage: 0.8 };
const better = { maeMin: 8, medaeMin: 6, rmseMin: 10, p80Coverage: 0.8 };

function writeArtifact(path: string, version: string, metrics: typeof champ) {
  writeFileSync(
    path,
    JSON.stringify({
      version,
      featureVersion: "1",
      trainedAt: 1,
      rowCount: 10,
      provenance: "synthetic",
      featureOrder: ["currentDelayMin"],
      trees: {
        p10: [{ kind: "leaf", value: 0 }],
        p50: [{ kind: "leaf", value: 0 }],
        p80: [{ kind: "leaf", value: 0 }],
        p90: [{ kind: "leaf", value: 0 }],
      },
      metrics,
    }),
  );
}

describe("model promote/rollback scripts", () => {
  it("promotes a better challenger then rollback restores the previous artifact and metrics", () => {
    const dir = mkdtempSync(join(tmpdir(), "rail-promote-"));
    mkdirSync(join(dir, "models"), { recursive: true });
    const modelPath = join(dir, "model.json");
    const challengerPath = join(dir, "challenger.json");
    const statePath = join(dir, "registry-state.json");
    const modelsDir = join(dir, "models");
    writeArtifact(modelPath, "1.0.0", champ);
    writeArtifact(challengerPath, "1.0.1", better);

    execFileSync(process.execPath, [join(process.cwd(), "scripts/promote-model.mjs")], {
      env: {
        ...process.env,
        MODEL_PATH: modelPath,
        CHALLENGER_PATH: challengerPath,
        REGISTRY_STATE_PATH: statePath,
        MODELS_DIR: modelsDir,
      },
      encoding: "utf8",
    });

    const promoted = JSON.parse(readFileSync(modelPath, "utf8")) as {
      version: string;
      metrics: typeof champ;
    };
    expect(promoted.version).toBe("1.0.1");
    expect(promoted.metrics).toEqual(better);

    execFileSync(process.execPath, [join(process.cwd(), "scripts/rollback-model.mjs")], {
      env: { ...process.env, MODEL_PATH: modelPath, REGISTRY_STATE_PATH: statePath },
      encoding: "utf8",
    });

    const restored = JSON.parse(readFileSync(modelPath, "utf8")) as {
      version: string;
      metrics: typeof champ;
    };
    const state = JSON.parse(readFileSync(statePath, "utf8")) as {
      champion: { version: string; metrics: typeof champ };
      previous: { metrics: typeof champ };
    };
    expect(restored.version).toBe("1.0.0");
    expect(restored.metrics).toEqual(champ);
    expect(state.champion.metrics).toEqual(champ);
    expect(state.previous.metrics).toEqual(better);
  });

  it("does not overwrite the champion when the challenger is worse", () => {
    const dir = mkdtempSync(join(tmpdir(), "rail-reject-"));
    const modelPath = join(dir, "model.json");
    const challengerPath = join(dir, "challenger.json");
    writeArtifact(modelPath, "1.0.0", champ);
    writeArtifact(challengerPath, "1.0.1", { ...champ, maeMin: 12, p80Coverage: 0.5 });
    let code = 0;
    try {
      execFileSync(process.execPath, [join(process.cwd(), "scripts/promote-model.mjs")], {
        env: {
          ...process.env,
          MODEL_PATH: modelPath,
          CHALLENGER_PATH: challengerPath,
          REGISTRY_STATE_PATH: join(dir, "registry-state.json"),
          MODELS_DIR: join(dir, "models"),
        },
        encoding: "utf8",
      });
    } catch (err) {
      code = (err as { status?: number }).status ?? 1;
    }
    expect(code).toBe(2);
    const still = JSON.parse(readFileSync(modelPath, "utf8")) as { version: string };
    expect(still.version).toBe("1.0.0");
  });
});
