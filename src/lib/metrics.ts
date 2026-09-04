import { DEFAULT_MONTHLY_QUOTA } from "@/server/live/quota";
import type { ObservationSource } from "@/server/live/types";

export type MetricsSnapshot = {
  vendorCalls: number;
  quotaUsed: number;
  quotaRemaining: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRatio: number;
  etaLatencyP50Ms: number;
  etaLatencyP95Ms: number;
  tierMix: Record<ObservationSource, number>;
  modelVersion: string | null;
  predictionVolume: number;
};

const LATENCY_CAP = 256;
const etaSamplesMs: number[] = [];

const state = {
  vendorCalls: 0,
  quotaUsed: 0,
  quotaCap: DEFAULT_MONTHLY_QUOTA,
  cacheHits: 0,
  cacheMisses: 0,
  tierMix: { railradar: 0, crowd: 0, replay: 0 } satisfies Record<ObservationSource, number>,
  modelVersion: null as string | null,
  predictionVolume: 0,
};

function percentile(samples: number[], p: number): number {
  if (samples.length === 0) return 0;
  const sorted = [...samples].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index] ?? 0;
}

export function resetMetrics(): void {
  state.vendorCalls = 0;
  state.quotaUsed = 0;
  state.quotaCap = DEFAULT_MONTHLY_QUOTA;
  state.cacheHits = 0;
  state.cacheMisses = 0;
  state.tierMix = { railradar: 0, crowd: 0, replay: 0 };
  state.modelVersion = null;
  state.predictionVolume = 0;
  etaSamplesMs.length = 0;
}

export function recordVendorCall(): void {
  state.vendorCalls += 1;
}

export function setQuotaCounter(used: number, cap: number = state.quotaCap): void {
  state.quotaUsed = used;
  state.quotaCap = cap;
}

export function recordCacheHit(): void {
  state.cacheHits += 1;
}

export function recordCacheMiss(): void {
  state.cacheMisses += 1;
}

export function recordTier(source: ObservationSource): void {
  state.tierMix[source] += 1;
}

export function recordEtaLatency(durationMs: number): void {
  if (!Number.isFinite(durationMs) || durationMs < 0) return;
  etaSamplesMs.push(durationMs);
  if (etaSamplesMs.length > LATENCY_CAP) etaSamplesMs.shift();
}

export function recordPrediction(count: number = 1): void {
  if (!Number.isFinite(count) || count <= 0) return;
  state.predictionVolume += Math.trunc(count);
}

export function setModelVersionServed(version: string | null): void {
  state.modelVersion = version;
}

export function getMetricsSnapshot(): MetricsSnapshot {
  const cacheTotal = state.cacheHits + state.cacheMisses;
  return {
    vendorCalls: state.vendorCalls,
    quotaUsed: state.quotaUsed,
    quotaRemaining: Math.max(0, state.quotaCap - state.quotaUsed),
    cacheHits: state.cacheHits,
    cacheMisses: state.cacheMisses,
    cacheHitRatio: cacheTotal === 0 ? 0 : state.cacheHits / cacheTotal,
    etaLatencyP50Ms: percentile(etaSamplesMs, 50),
    etaLatencyP95Ms: percentile(etaSamplesMs, 95),
    tierMix: { ...state.tierMix },
    modelVersion: state.modelVersion,
    predictionVolume: state.predictionVolume,
  };
}
