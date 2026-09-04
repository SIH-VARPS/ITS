import { recordCacheHit, recordCacheMiss } from "@/lib/metrics";
import type { FeatureVector } from "@/lib/features/schema";
import type { DelayForecast } from "@/lib/model/types";

export const ETA_CACHE_MAX = 32_768;

export type CachedSection = {
  delta: DelayForecast;
  modelVersion: string;
  features: FeatureVector | null;
};

type Stats = { hits: number; misses: number; size: number };

const cache = new Map<string, CachedSection>();
let hits = 0;
let misses = 0;

export function hashFeatureRow(values: readonly number[]): string {
  let h = 2166136261;
  for (const value of values) {
    const x = Math.round(value * 10_000);
    h ^= (x + 0x9e3779b9) >>> 0;
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export function sectionCacheKey(
  trainNo: string,
  haltIndex: number,
  featureHash: string,
  modelVersion: string,
  biasMin: number,
): string {
  return `${trainNo}|${haltIndex}|${modelVersion}|${featureHash}|${biasMin.toFixed(3)}`;
}

function touch(key: string, value: CachedSection): void {
  cache.delete(key);
  cache.set(key, value);
  while (cache.size > ETA_CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

export function getCachedSection(key: string): CachedSection | undefined {
  const hit = cache.get(key);
  if (!hit) {
    misses += 1;
    recordCacheMiss();
    return undefined;
  }
  hits += 1;
  recordCacheHit();
  touch(key, hit);
  return hit;
}

export function setCachedSection(key: string, value: CachedSection): void {
  touch(key, value);
}

export function resetEtaCacheCounters(): void {
  hits = 0;
  misses = 0;
}

export function resetEtaCache(): void {
  cache.clear();
  resetEtaCacheCounters();
}

export function etaCacheStats(): Stats {
  return { hits, misses, size: cache.size };
}

export function etaCacheHitRatio(): number {
  const total = hits + misses;
  return total === 0 ? 0 : hits / total;
}
