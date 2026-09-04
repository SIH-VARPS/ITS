import { describe, expect, it } from "vitest";
import {
  ETA_CACHE_MAX,
  etaCacheHitRatio,
  etaCacheStats,
  getCachedSection,
  hashFeatureRow,
  resetEtaCache,
  resetEtaCacheCounters,
  sectionCacheKey,
  setCachedSection,
} from "../etaCache";

describe("etaCache", () => {
  it("hashes rows, records hits/misses, and evicts LRU past the cap", () => {
    resetEtaCache();
    expect(hashFeatureRow([1, 2, 3])).toBe(hashFeatureRow([1, 2, 3]));
    expect(hashFeatureRow([1, 2, 3])).not.toBe(hashFeatureRow([1, 2, 4]));
    const key = sectionCacheKey("12001", 1, "abc", "v1", 0);
    expect(getCachedSection(key)).toBeUndefined();
    const value = {
      delta: { p10Min: 1, p50Min: 2, p80Min: 3, p90Min: 4 },
      modelVersion: "v1",
      features: null,
    };
    setCachedSection(key, value);
    expect(getCachedSection(key)?.modelVersion).toBe("v1");
    resetEtaCacheCounters();
    getCachedSection(key);
    expect(etaCacheHitRatio()).toBe(1);
    for (let i = 0; i < ETA_CACHE_MAX + 2; i++) {
      setCachedSection(`evict-${i}`, value);
    }
    expect(etaCacheStats().size).toBe(ETA_CACHE_MAX);
    expect(getCachedSection(key)).toBeUndefined();
  });
});
