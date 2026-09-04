import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FEATURE_ORDER, FEATURE_VERSION } from "@/lib/features/schema";
import { assertFeatureVersion } from "@/lib/features/schema";
import bundled from "@/data/generated/model.json";
import { parseModelArtifact } from "../parseArtifact";
import { evalEnsemble, scoreQuantiles } from "../treeEnsemble";
import type { ModelArtifact } from "../types";
import parity from "../__fixtures__/parity.json";

describe("treeEnsemble", () => {
  it("matches Python scores on 100 fixed vectors within 1e-6", () => {
    const artifact = parseModelArtifact(bundled);
    expect(artifact).not.toBeNull();
    const fixture = parity as {
      rows: Array<{ values: number[]; expected: Record<string, number> }>;
    };
    expect(fixture.rows.length).toBeGreaterThanOrEqual(100);
    for (const row of fixture.rows) {
      const p10 = evalEnsemble(artifact!.trees.p10, row.values);
      const p50 = evalEnsemble(artifact!.trees.p50, row.values);
      const p80 = evalEnsemble(artifact!.trees.p80, row.values);
      const p90 = evalEnsemble(artifact!.trees.p90, row.values);
      expect(Math.abs(p10 - row.expected["p10"]!)).toBeLessThanOrEqual(1e-6);
      expect(Math.abs(p50 - row.expected["p50"]!)).toBeLessThanOrEqual(1e-6);
      expect(Math.abs(p80 - row.expected["p80"]!)).toBeLessThanOrEqual(1e-6);
      expect(Math.abs(p90 - row.expected["p90"]!)).toBeLessThanOrEqual(1e-6);
      const scored = scoreQuantiles(artifact as ModelArtifact, row.values);
      expect(scored.p10Min).toBeLessThanOrEqual(scored.p50Min);
      expect(scored.p50Min).toBeLessThanOrEqual(scored.p80Min);
      expect(scored.p80Min).toBeLessThanOrEqual(scored.p90Min);
    }
  });

  it("throws when FEATURE_VERSION does not match", () => {
    const artifact = parseModelArtifact(bundled)!;
    expect(() =>
      scoreQuantiles(
        { ...artifact, featureVersion: "0" as typeof FEATURE_VERSION },
        new Array(FEATURE_ORDER.length).fill(0),
      ),
    ).toThrow(/FEATURE_VERSION mismatch/);
    expect(() => assertFeatureVersion("9")).toThrow(/FEATURE_VERSION mismatch/);
  });

  it("sends missing values to the right child", () => {
    const sum = evalEnsemble(
      [
        {
          kind: "split",
          featureIndex: 0,
          threshold: 0,
          left: { kind: "leaf", value: 1 },
          right: { kind: "leaf", value: 2 },
        },
      ],
      [Number.NaN],
    );
    expect(sum).toBe(2);
  });

  it("loads the checked-in artifact from disk bytes", () => {
    const raw = JSON.parse(
      readFileSync(join(process.cwd(), "src/data/generated/model.json"), "utf8"),
    ) as unknown;
    expect(parseModelArtifact(raw)?.featureVersion).toBe(FEATURE_VERSION);
  });

  it("rejects corrupt artifacts", () => {
    expect(parseModelArtifact(null)).toBeNull();
    expect(parseModelArtifact([])).toBeNull();
    expect(parseModelArtifact({ featureVersion: "1", version: "x" })).toBeNull();
    const artifact = parseModelArtifact(bundled)!;
    expect(parseModelArtifact({ ...artifact, trees: { p10: [{ kind: "nope" }] } })).toBeNull();
    expect(parseModelArtifact({ ...artifact, featureOrder: ["a"] })).toBeNull();
    expect(parseModelArtifact({ ...artifact, featureOrder: [1, 2] })).toBeNull();
    expect(parseModelArtifact({ ...artifact, metrics: { maeMin: "x" } })).toBeNull();
    expect(parseModelArtifact({ ...artifact, provenance: "nope" })).toBeNull();
    expect(parseModelArtifact({ ...artifact, trees: "nope" })).toBeNull();
    expect(() =>
      scoreQuantiles(
        { ...artifact, featureOrder: ["nope", ...FEATURE_ORDER.slice(1)] },
        new Array(FEATURE_ORDER.length).fill(0),
      ),
    ).toThrow(/featureOrder mismatch/);
    expect(() =>
      scoreQuantiles({ ...artifact, featureOrder: FEATURE_ORDER.slice(0, 3) }, [0, 0, 0]),
    ).toThrow(/featureOrder length/);
  });
});
