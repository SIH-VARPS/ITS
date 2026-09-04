import { describe, expect, it } from "vitest";
import { evaluatePromotion, ModelRegistry, rollbackDiskState } from "../registry";
import { stubArtifact } from "../stubArtifact";

const champMetrics = { maeMin: 10, medaeMin: 8, rmseMin: 12, p80Coverage: 0.8 };
const betterMae = { maeMin: 8, medaeMin: 6, rmseMin: 10, p80Coverage: 0.8 };

describe("champion/challenger registry", () => {
  it("does not promote a challenger worse than the champion", () => {
    const registry = new ModelRegistry();
    const champion = stubArtifact("1.0.0", champMetrics);
    registry.seedChampion(champion);
    const worse = stubArtifact("1.0.1", { ...champMetrics, maeMin: 11 });
    const decision = registry.consider(worse);
    expect(decision.promoted).toBe(false);
    expect(decision.maeImproved).toBe(false);
    expect(registry.champion?.artifact.version).toBe("1.0.0");
    expect(registry.champion?.metrics).toEqual(champMetrics);
  });

  it("does not promote a challenger that is better on MAE but worse on calibration", () => {
    const registry = new ModelRegistry();
    registry.seedChampion(stubArtifact("1.0.0", champMetrics));
    const overconfident = stubArtifact("1.0.1", { ...betterMae, p80Coverage: 0.65 });
    const decision = registry.consider(overconfident);
    expect(decision.promoted).toBe(false);
    expect(decision.maeImproved).toBe(true);
    expect(decision.calibrationOk).toBe(false);
    expect(decision.reason).toMatch(/calibration/i);
    expect(registry.champion?.artifact.version).toBe("1.0.0");
  });

  it("promotes a challenger that beats MAE by the margin without calibration regression", () => {
    const registry = new ModelRegistry();
    registry.seedChampion(stubArtifact("1.0.0", champMetrics, { trainedAt: 10 }));
    const decision = registry.consider(stubArtifact("1.0.1", betterMae, { trainedAt: 20 }));
    expect(decision.promoted).toBe(true);
    expect(registry.champion?.artifact.version).toBe("1.0.1");
    expect(registry.champion?.metrics.maeMin).toBe(8);
    expect(registry.previous?.artifact.version).toBe("1.0.0");
    expect(registry.history.map((entry) => entry.artifact.version)).toEqual(["1.0.0", "1.0.1"]);
  });

  it("rollbacks restore the previous artifact and its metrics", () => {
    const registry = new ModelRegistry();
    const first = stubArtifact("1.0.0", champMetrics, { trainedAt: 1, rowCount: 100 });
    const second = stubArtifact("1.0.1", betterMae, { trainedAt: 2, rowCount: 120 });
    registry.seedChampion(first);
    expect(registry.consider(second).promoted).toBe(true);

    const restored = registry.rollback();
    expect(restored.artifact.version).toBe("1.0.0");
    expect(restored.artifact).toBe(first);
    expect(restored.metrics).toEqual(champMetrics);
    expect(registry.champion?.artifact.version).toBe("1.0.0");
    expect(registry.champion?.metrics).toEqual(champMetrics);
    expect(registry.champion?.artifact.rowCount).toBe(100);
    expect(registry.previous?.artifact.version).toBe("1.0.1");
    expect(registry.previous?.metrics).toEqual(betterMae);
  });

  it("seeds the first challenger as champion and rejects a combined failure", () => {
    const registry = new ModelRegistry();
    const first = registry.consider(stubArtifact("1.0.0", champMetrics));
    expect(first.promoted).toBe(true);
    expect(first.reason).toMatch(/first champion/);
    const rejected = evaluatePromotion(champMetrics, {
      maeMin: 12,
      medaeMin: 9,
      rmseMin: 14,
      p80Coverage: 0.5,
    });
    expect(rejected.promoted).toBe(false);
    expect(rejected.reason).toMatch(/MAE margin and calibration/);
    expect(() => registry.rollback()).toThrow(/no previous champion/);
  });

  it("rollbacks a disk pointer state including metrics", () => {
    const state = {
      champion: {
        version: "1.0.1",
        artifactPath: "src/data/generated/model.json",
        metrics: betterMae,
      },
      previous: {
        version: "1.0.0",
        artifactPath: "src/data/generated/models/1.0.0.json",
        metrics: champMetrics,
      },
    };
    const rolled = rollbackDiskState(state);
    expect(rolled.champion.version).toBe("1.0.0");
    expect(rolled.champion.metrics).toEqual(champMetrics);
    expect(rolled.previous?.version).toBe("1.0.1");
    expect(rolled.previous?.metrics).toEqual(betterMae);
    expect(() => rollbackDiskState({ ...state, previous: null })).toThrow(/no previous champion/);
  });
});
