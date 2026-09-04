import { afterEach, describe, expect, it } from "vitest";
import { getTrain } from "@/data/trains";
import { etaAlongRoute, etaAtHalt, resetEtaEngineForTests, scoreFleet } from "../etaEngine";
import {
  ETA_CACHE_MAX,
  etaCacheHitRatio,
  etaCacheStats,
  resetEtaCacheCounters,
  setCachedSection,
} from "../etaCache";
import { syntheticFleet } from "../perf/fleet";
import { stubArtifact } from "../refine/stubArtifact";
import { DEFAULT_HISTORY_BOUND, MemoryObservationStore } from "@/server/live/store";
import { scanClientBundle } from "@/server/security/bundleScan";
import type { TrainObservation } from "@/server/live/types";

const now = new Date("2026-03-15T16:00:00+05:30");
const stub = stubArtifact("perf-stub", {
  maeMin: 0,
  medaeMin: 0,
  rmseMin: 0,
  p80Coverage: 1,
});

function liveAtOrigin() {
  return {
    elapsedMin: 10,
    currentDelayMin: 6,
    currentKm: 0,
    lastHaltIndex: 0,
    haltedDurationMin: 0,
    isHalted: false,
  };
}

afterEach(() => {
  resetEtaEngineForTests();
});

describe("W8 performance", () => {
  it("scores 5,000 trains under 500 ms", { timeout: 20_000 }, () => {
    const trains = syntheticFleet(5_000, 10_000, now);
    resetEtaEngineForTests();
    const t0 = performance.now();
    const scored = scoreFleet(trains, now, { artifact: stub });
    const elapsed = performance.now() - t0;
    expect(scored).toHaveLength(5_000);
    expect(elapsed).toBeLessThan(500);
  });

  it("keeps cache hit ratio above 90% in steady state", () => {
    const trains = syntheticFleet(400, 10_000, now);
    resetEtaEngineForTests();
    scoreFleet(trains, now, { artifact: stub });
    resetEtaCacheCounters();
    scoreFleet(trains, now, { artifact: stub });
    expect(etaCacheHitRatio()).toBeGreaterThan(0.9);
    expect(etaCacheStats().hits).toBeGreaterThan(0);
  });

  it("bounds observation history and the ETA cache after 10,000 writes", async () => {
    const store = new MemoryObservationStore({ historyBound: DEFAULT_HISTORY_BOUND });
    const rows: TrainObservation[] = [];
    for (let i = 0; i < 10_000; i++) {
      rows.push({
        trainNo: "12951",
        runDate: "2026-03-15",
        stationCode: "NDLS",
        sequence: (i % 20) + 1,
        eventType: "GPS",
        scheduledMin: i % 1440,
        actualMin: i % 1440,
        delayMin: i % 30,
        source: "crowd",
        receivedAt: i + 1,
      });
    }
    await store.appendHistory(rows);
    const history = await store.getHistory("12951", "2026-03-15");
    expect(history).toHaveLength(DEFAULT_HISTORY_BOUND);

    resetEtaEngineForTests();
    for (let i = 0; i < ETA_CACHE_MAX + 500; i++) {
      setCachedSection(`k${i}`, {
        delta: { p10Min: 0, p50Min: 0, p80Min: 0, p90Min: 0 },
        modelVersion: "perf-stub",
        features: null,
      });
    }
    expect(etaCacheStats().size).toBe(ETA_CACHE_MAX);
  });

  it("produces identical ETAs from batch scoring and per-halt scoring", () => {
    const train = getTrain("12951")!;
    const live = liveAtOrigin();
    resetEtaEngineForTests();
    const batch = etaAlongRoute(train, live, now, { artifact: stub, skipCache: true });
    const perHalt = train.halts.map((_, index) =>
      etaAtHalt(train, index, live, now, { artifact: stub, skipCache: true }),
    );
    expect(batch).toHaveLength(perHalt.length);
    for (let i = 0; i < batch.length; i++) {
      expect(batch[i]!.p50Min).toBeCloseTo(perHalt[i]!.p50Min, 8);
      expect(batch[i]!.p10Min).toBeCloseTo(perHalt[i]!.p10Min, 8);
      expect(batch[i]!.p90Min).toBeCloseTo(perHalt[i]!.p90Min, 8);
      expect(batch[i]!.etaMin).toBeCloseTo(perHalt[i]!.etaMin, 8);
    }
  });

  it("stays within the client bundle budget when a production build is present", () => {
    const scan = scanClientBundle();
    if (!scan.available) return;
    expect(scan.leaks).toEqual([]);
    expect(scan.overBudget).toEqual([]);
  });
});
