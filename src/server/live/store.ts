import type { TrainObservation } from "./types";

export const DEFAULT_HISTORY_BOUND = 256;

function runKey(trainNo: string, runDate: string): string {
  return `${trainNo}:${runDate}`;
}

/**
 * Latest observations plus a bounded history per (trainNo, runDate).
 * In-memory now; the same methods map onto KV / Postgres later.
 */
export interface ObservationStore {
  getLatest(trainNo: string, runDate: string): Promise<TrainObservation[] | null>;
  /** Most recently written latest payload for this train, any runDate. */
  getLatestByTrain(trainNo: string): Promise<TrainObservation[] | null>;
  putLatest(trainNo: string, runDate: string, rows: TrainObservation[]): Promise<void>;
  getHistory(trainNo: string, runDate: string): Promise<TrainObservation[]>;
  appendHistory(rows: TrainObservation[]): Promise<void>;
  getQuotaUsed(monthKey: string): Promise<number>;
  incrementQuota(monthKey: string, by?: number): Promise<number>;
  ping(): Promise<boolean>;
  getLastHarvestAt(): Promise<number | null>;
  setLastHarvestAt(epochMs: number): Promise<void>;
  getDiverted(trainNo: string, runDate: string): Promise<boolean>;
  setDiverted(trainNo: string, runDate: string, diverted: boolean): Promise<void>;
  listLatest(): Promise<Array<{ trainNo: string; runDate: string; rows: TrainObservation[] }>>;
  /**
   * Drop latest + history for a train-run. When `runDate` is omitted, deletes
   * the most recently written run for `trainNo`. Bumps revision when anything
   * was removed.
   */
  deleteLatest(trainNo: string, runDate?: string): Promise<boolean>;
  /** Monotonic generation; bumps on every write. Used for ETags. */
  revision(): number;
  /**
   * Token-bucket take for v2 rate limiting. `nowMs` is injectable so tests
   * can advance the window without sleeping.
   */
  takeToken(
    bucketKey: string,
    nowMs?: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number; limit: number }>;
  clearRateBuckets(): void;
}

type MemoryOptions = {
  historyBound?: number;
};

export type RateLimitConfig = {
  capacity: number;
  refillPerSec: number;
};

export const DEFAULT_V2_RATE: RateLimitConfig = { capacity: 120, refillPerSec: 2 };

let rateConfig: RateLimitConfig = { ...DEFAULT_V2_RATE };

export function getV2RateConfig(): RateLimitConfig {
  return rateConfig;
}

export function setV2RateConfigForTests(config: RateLimitConfig | null): void {
  rateConfig = config ? { ...config } : { ...DEFAULT_V2_RATE };
}

export class MemoryObservationStore implements ObservationStore {
  private readonly latest = new Map<string, TrainObservation[]>();
  private readonly history = new Map<string, TrainObservation[]>();
  private readonly quota = new Map<string, number>();
  private readonly diverted = new Map<string, boolean>();
  private lastHarvestAt: number | null = null;
  private readonly historyBound: number;
  private gen = 0;
  private readonly buckets = new Map<string, { tokens: number; updatedAt: number }>();

  private readonly latestByTrain = new Map<string, string>();

  constructor(options: MemoryOptions = {}) {
    this.historyBound = options.historyBound ?? DEFAULT_HISTORY_BOUND;
  }

  async getLatest(trainNo: string, runDate: string): Promise<TrainObservation[] | null> {
    return this.latest.get(runKey(trainNo, runDate)) ?? null;
  }

  async getLatestByTrain(trainNo: string): Promise<TrainObservation[] | null> {
    const runDate = this.latestByTrain.get(trainNo);
    if (!runDate) return null;
    return this.getLatest(trainNo, runDate);
  }

  async putLatest(trainNo: string, runDate: string, rows: TrainObservation[]): Promise<void> {
    this.latest.set(runKey(trainNo, runDate), rows);
    this.latestByTrain.set(trainNo, runDate);
    this.gen += 1;
    await this.appendHistory(rows);
  }

  async getHistory(trainNo: string, runDate: string): Promise<TrainObservation[]> {
    return [...(this.history.get(runKey(trainNo, runDate)) ?? [])];
  }

  async appendHistory(rows: TrainObservation[]): Promise<void> {
    for (const row of rows) {
      const key = runKey(row.trainNo, row.runDate);
      const existing = this.history.get(key) ?? [];
      existing.push(row);
      const overflow = existing.length - this.historyBound;
      if (overflow > 0) existing.splice(0, overflow);
      this.history.set(key, existing);
    }
  }

  async getQuotaUsed(monthKey: string): Promise<number> {
    return this.quota.get(monthKey) ?? 0;
  }

  async incrementQuota(monthKey: string, by: number = 1): Promise<number> {
    const next = (this.quota.get(monthKey) ?? 0) + by;
    this.quota.set(monthKey, next);
    return next;
  }

  async ping(): Promise<boolean> {
    return true;
  }

  async getLastHarvestAt(): Promise<number | null> {
    return this.lastHarvestAt;
  }

  async setLastHarvestAt(epochMs: number): Promise<void> {
    this.lastHarvestAt = epochMs;
  }

  async getDiverted(trainNo: string, runDate: string): Promise<boolean> {
    return this.diverted.get(runKey(trainNo, runDate)) ?? false;
  }

  async setDiverted(trainNo: string, runDate: string, diverted: boolean): Promise<void> {
    this.diverted.set(runKey(trainNo, runDate), diverted);
  }

  async listLatest(): Promise<
    Array<{ trainNo: string; runDate: string; rows: TrainObservation[] }>
  > {
    const out: Array<{ trainNo: string; runDate: string; rows: TrainObservation[] }> = [];
    for (const [key, rows] of this.latest) {
      const split = key.lastIndexOf(":");
      out.push({
        trainNo: key.slice(0, split),
        runDate: key.slice(split + 1),
        rows,
      });
    }
    return out;
  }

  async deleteLatest(trainNo: string, runDate?: string): Promise<boolean> {
    const date = runDate ?? this.latestByTrain.get(trainNo);
    if (!date) return false;
    const key = runKey(trainNo, date);
    const had = this.latest.has(key) || this.history.has(key);
    this.latest.delete(key);
    this.history.delete(key);
    this.diverted.delete(key);
    if (this.latestByTrain.get(trainNo) === date) this.latestByTrain.delete(trainNo);
    if (had) this.gen += 1;
    return had;
  }

  revision(): number {
    return this.gen;
  }

  async takeToken(
    bucketKey: string,
    nowMs: number = Date.now(),
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number; limit: number }> {
    const cfg = rateConfig;
    const prev = this.buckets.get(bucketKey) ?? { tokens: cfg.capacity, updatedAt: nowMs };
    const elapsedSec = Math.max(0, nowMs - prev.updatedAt) / 1000;
    const refilled = Math.min(cfg.capacity, prev.tokens + elapsedSec * cfg.refillPerSec);
    if (refilled < 1) {
      this.buckets.set(bucketKey, { tokens: refilled, updatedAt: nowMs });
      const waitSec = cfg.refillPerSec > 0 ? (1 - refilled) / cfg.refillPerSec : 60;
      return {
        allowed: false,
        remaining: 0,
        resetAt: nowMs + Math.ceil(waitSec * 1000),
        limit: cfg.capacity,
      };
    }
    const next = refilled - 1;
    this.buckets.set(bucketKey, { tokens: next, updatedAt: nowMs });
    return {
      allowed: true,
      remaining: Math.floor(next),
      resetAt: nowMs + 1000,
      limit: cfg.capacity,
    };
  }

  clearRateBuckets(): void {
    this.buckets.clear();
  }
}

let sharedStore: ObservationStore | null = null;

export function getObservationStore(): ObservationStore {
  if (!sharedStore) sharedStore = new MemoryObservationStore();
  return sharedStore;
}

export function setObservationStoreForTests(store: ObservationStore | null): void {
  sharedStore = store;
}
