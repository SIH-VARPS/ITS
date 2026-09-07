import { describe, expect, it } from "vitest";
import { getTrain } from "@/data/trains";
import { buildSectionFeatures, orderedFeatureValues } from "../features/sectionFeatures";
import { scoreQuantiles } from "../model/treeEnsemble";
import {
  FALLBACK_MODEL_VERSION,
  etaAtHalt,
  inferLiveState,
  occupancyFromStoreEntries,
  resetEtaEngineForTests,
  resolveArtifact,
  serveEtaResponse,
  etaAlongRoute,
} from "../etaEngine";
import { parseModelArtifact } from "../model/parseArtifact";
import bundled from "@/data/generated/model.json";
import { setSectionBiasMin } from "../refine/residual";

const train = getTrain("12951")!;
const now = new Date("2026-03-15T16:00:00+05:30");

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

describe("etaEngine", () => {
  it("sums origin→destination equal to a direct destination call", () => {
    const live = liveAtOrigin();
    const destIdx = train.halts.length - 1;
    const artifact = resolveArtifact();
    expect(artifact).not.toBeNull();
    let summedP50 = 0;
    for (let i = live.lastHaltIndex; i < destIdx; i++) {
      const vector = buildSectionFeatures({ train, haltIndex: i, at: now, weatherCode: 0 });
      summedP50 += scoreQuantiles(artifact!, orderedFeatureValues(vector)).p50Min;
    }
    const direct = etaAtHalt(train, destIdx, live, now, { weatherCode: 0 });
    expect(Math.abs(direct.incremental.p50Min - summedP50)).toBeLessThan(1e-6);
    expect(direct.modelVersion).not.toBe(FALLBACK_MODEL_VERSION);
  });

  it("widens the destination interval past the next-halt interval", () => {
    const live = liveAtOrigin();
    const next = etaAtHalt(train, 1, live, now);
    const dest = etaAtHalt(train, train.halts.length - 1, live, now);
    const nextWidth = next.p90Min - next.p10Min;
    const destWidth = dest.p90Min - dest.p10Min;
    expect(destWidth).toBeGreaterThan(nextWidth);
  });

  it("falls back to the heuristic with modelVersion fallback when the artifact is missing", () => {
    const predicted = etaAtHalt(train, 2, liveAtOrigin(), now, { artifact: null });
    expect(predicted.modelVersion).toBe(FALLBACK_MODEL_VERSION);
    const served = serveEtaResponse(train, train.halts[2]!.code, liveAtOrigin(), now, {
      artifact: null,
    });
    expect(served?.modelVersion).toBe(FALLBACK_MODEL_VERSION);
  });

  it("falls back when the artifact is corrupt", () => {
    const parsed = parseModelArtifact(bundled);
    expect(parsed).not.toBeNull();
    const corrupt = {
      ...parsed!,
      trees: { p10: [], p50: [], p80: [], p90: [] },
    };
    const predicted = etaAtHalt(train, 2, liveAtOrigin(), now, { artifact: corrupt });
    expect(predicted.modelVersion).toBe(FALLBACK_MODEL_VERSION);
  });

  it("changes the P50 when weather features change", () => {
    const artifact = resolveArtifact();
    expect(artifact).not.toBeNull();
    const clear = buildSectionFeatures({
      train,
      haltIndex: 0,
      at: now,
      weatherCode: 0,
      precipitationMm: 0,
      visibilityKm: 12,
      windSpeedKmph: 6,
    });
    const rain = buildSectionFeatures({
      train,
      haltIndex: 0,
      at: now,
      weatherCode: 61,
      precipitationMm: 8,
      visibilityKm: 3,
      windSpeedKmph: 22,
    });
    const fog = buildSectionFeatures({
      train,
      haltIndex: 0,
      at: now,
      weatherCode: 45,
      precipitationMm: 0,
      visibilityKm: 0.3,
      windSpeedKmph: 4,
    });
    const scores = [clear, rain, fog].map(
      (vector) => scoreQuantiles(artifact!, orderedFeatureValues(vector)).p50Min,
    );
    expect(new Set(scores).size).toBeGreaterThan(1);
  });

  it("serves artifact quantiles by default", () => {
    resetEtaEngineForTests();
    expect(resolveArtifact()?.version).not.toBe(FALLBACK_MODEL_VERSION);
    const served = serveEtaResponse(
      train,
      train.halts[train.halts.length - 1]!.code,
      liveAtOrigin(),
      now,
    );
    expect(served).not.toBeNull();
    expect(served!.modelVersion).not.toBe(FALLBACK_MODEL_VERSION);
    expect(Date.parse(served!.p50)).toBeLessThanOrEqual(Date.parse(served!.p80));
    expect(Date.parse(served!.p80)).toBeLessThanOrEqual(Date.parse(served!.p90));
  });

  it("applies live per-section residual bias between retrains", () => {
    resetEtaEngineForTests();
    const before = etaAtHalt(train, 1, liveAtOrigin(), now);
    setSectionBiasMin(train.halts[0]!.code, train.halts[1]!.code, 5);
    const after = etaAtHalt(train, 1, liveAtOrigin(), now);
    expect(after.incremental.p50Min).toBeCloseTo(before.incremental.p50Min + 5, 5);
    const heuristic = etaAtHalt(train, 1, liveAtOrigin(), now, { artifact: null });
    resetEtaEngineForTests();
    const heuristicBase = etaAtHalt(train, 1, liveAtOrigin(), now, { artifact: null });
    expect(heuristic.incremental.p50Min).toBeCloseTo(heuristicBase.incremental.p50Min + 5, 5);
    resetEtaEngineForTests();
  });

  it("infers live state from the clock", () => {
    const state = inferLiveState(train, now);
    expect(state.lastHaltIndex).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(state.elapsedMin)).toBe(true);
    const early = inferLiveState(train, new Date("2026-03-15T00:05:00+05:30"));
    expect(early.elapsedMin).toBeGreaterThan(0);
    const withObs = inferLiveState(train, now, [
      {
        trainNo: train.number,
        runDate: "2026-03-15",
        stationCode: train.halts[1]!.code,
        sequence: 2,
        eventType: "ARR",
        scheduledMin: 1,
        actualMin: 10,
        delayMin: 9,
        source: "replay",
        receivedAt: 2,
      },
    ]);
    expect(withObs.currentDelayMin).toBe(9);
    expect(withObs.lastHaltIndex).toBe(1);
    expect(serveEtaResponse(train, "NOPE", liveAtOrigin(), now)).toBeNull();
    expect(etaAlongRoute(train, liveAtOrigin(), now).length).toBe(train.halts.length);
    const skip = { skipCache: true as const, weatherCode: 0 };
    const along = etaAlongRoute(train, liveAtOrigin(), now, skip);
    const looped = train.halts.map((_, i) => etaAtHalt(train, i, liveAtOrigin(), now, skip));
    expect(along.map((row) => row.p50Min)).toEqual(looped.map((row) => row.p50Min));
    expect(
      occupancyFromStoreEntries([
        {
          trainNo: train.number,
          route: train,
          observations: [
            {
              trainNo: train.number,
              runDate: "2026-03-15",
              stationCode: train.halts[0]!.code,
              sequence: 1,
              eventType: "GPS",
              scheduledMin: 0,
              actualMin: 0,
              delayMin: 0,
              source: "replay",
              receivedAt: 1,
            },
          ],
        },
      ]).length,
    ).toBeGreaterThan(0);
  });
});
