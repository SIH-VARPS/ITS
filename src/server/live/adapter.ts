import { logger } from "@/lib/logger";
import {
  recordCacheHit,
  recordCacheMiss,
  recordTier,
  recordVendorCall,
  setQuotaCounter,
} from "@/lib/metrics";
import { PullThroughCache } from "./cache";
import { CrowdGpsAdapter } from "./crowdGpsAdapter";
import { HarvestLog, getHarvestLog } from "./harvest";
import { istRunDate } from "./parseLegacy";
import { canSpendQuota, monthKeyIst, readMonthlyQuotaCap, spendQuota } from "./quota";
import { RailRadarAdapter } from "./railRadarAdapter";
import { ReplayAdapter } from "./replayAdapter";
import { getObservationStore, type ObservationStore } from "./store";
import { LIVE_CONTRACT_VERSION } from "./types";
import type { LiveFeedAdapter, ObservationSource, TrainObservation } from "./types";

export { LIVE_CONTRACT_VERSION };
export type { LiveFeedAdapter };

const BREAKER_THRESHOLD = 3;
const CACHE_TTL_MS = 60_000;
const CACHE_SWR_MS = 120_000;

export type LiveFetchResult = {
  observations: TrainObservation[];
  source: ObservationSource;
  diverted: boolean;
  cacheHit: boolean;
};

export type TieredLiveFeedOptions = {
  store?: ObservationStore;
  harvest?: HarvestLog;
  railRadar?: RailRadarAdapter;
  crowd?: CrowdGpsAdapter;
  replay?: ReplayAdapter;
  cache?: PullThroughCache<LiveFetchResult>;
  ttlMs?: number;
  now?: () => number;
  quotaCap?: number;
  /** When true, never call the vendor (CI / vitest). */
  disableVendor?: boolean;
};

function isVitest(): boolean {
  return typeof process !== "undefined" && process.env["VITEST"] === "true";
}

function vendorDisabledFromEnv(): boolean {
  return typeof process !== "undefined" && process.env["LIVE_FEED_DISABLE_VENDOR"] === "1";
}

export class CircuitBreaker {
  consecutiveFailures = 0;
  openedAt: number | null = null;

  constructor(private readonly threshold: number = BREAKER_THRESHOLD) {}

  get open(): boolean {
    return this.openedAt !== null;
  }

  recordSuccess(): void {
    this.consecutiveFailures = 0;
    this.openedAt = null;
  }

  recordFailure(nowMs: number): void {
    this.consecutiveFailures += 1;
    if (this.consecutiveFailures >= this.threshold) {
      this.openedAt = nowMs;
    }
  }
}

/**
 * Tiered live feed: RailRadar (A) → crowd GPS in the store (B) → replay (C).
 */
export class TieredLiveFeed implements LiveFeedAdapter {
  readonly breaker = new CircuitBreaker();
  private readonly store: ObservationStore;
  private readonly harvest: HarvestLog;
  private readonly railRadar: RailRadarAdapter;
  private readonly crowd: CrowdGpsAdapter;
  private readonly replay: ReplayAdapter;
  private readonly cache: PullThroughCache<LiveFetchResult>;
  private readonly now: () => number;
  private readonly quotaCap: number;
  private readonly disableVendor: boolean;
  private readonly ttlMs: number;
  private readonly inflight = new Map<string, Promise<LiveFetchResult>>();

  constructor(options: TieredLiveFeedOptions = {}) {
    this.store = options.store ?? getObservationStore();
    this.harvest = options.harvest ?? getHarvestLog();
    this.railRadar = options.railRadar ?? new RailRadarAdapter();
    this.crowd = options.crowd ?? new CrowdGpsAdapter({ store: this.store });
    this.replay = options.replay ?? new ReplayAdapter(options.now ? { now: options.now } : {});
    this.now = options.now ?? (() => Date.now());
    this.ttlMs = options.ttlMs ?? CACHE_TTL_MS;
    this.cache =
      options.cache ??
      new PullThroughCache<LiveFetchResult>({
        ttlMs: this.ttlMs,
        swrMs: CACHE_SWR_MS,
        now: this.now,
      });
    this.quotaCap = options.quotaCap ?? readMonthlyQuotaCap();
    this.disableVendor = options.disableVendor ?? (isVitest() || vendorDisabledFromEnv());
  }

  async fetchTrain(trainNo: string): Promise<TrainObservation[]> {
    const result = await this.fetchTrainDetailed(trainNo);
    return result.observations;
  }

  async fetchTrainDetailed(trainNo: string): Promise<LiveFetchResult> {
    const nowMs = this.now();
    const entry = this.cache.peek(trainNo);
    if (entry && nowMs - entry.fetchedAt < this.ttlMs) {
      recordCacheHit();
      recordTier(entry.value.source);
      return { ...entry.value, cacheHit: true };
    }
    const pending = this.inflight.get(trainNo);
    if (pending) {
      recordCacheHit();
      const value = await pending;
      recordTier(value.source);
      return { ...value, cacheHit: true };
    }
    if (entry && nowMs - entry.fetchedAt < this.ttlMs + CACHE_SWR_MS) {
      void this.loadAndMaybeCache(trainNo);
      recordCacheHit();
      recordTier(entry.value.source);
      return { ...entry.value, cacheHit: true };
    }
    recordCacheMiss();
    const value = await this.loadAndMaybeCache(trainNo);
    recordTier(value.source);
    return { ...value, cacheHit: false };
  }

  private loadAndMaybeCache(trainNo: string): Promise<LiveFetchResult> {
    const pending = this.load(trainNo)
      .then((value) => {
        if (this.shouldCache(value)) this.cache.set(trainNo, value);
        return value;
      })
      .finally(() => {
        this.inflight.delete(trainNo);
      });
    this.inflight.set(trainNo, pending);
    return pending;
  }

  private shouldCache(value: LiveFetchResult): boolean {
    return (
      value.source === "railradar" ||
      this.breaker.open ||
      !this.railRadar.hasKey() ||
      this.disableVendor
    );
  }

  private async load(trainNo: string): Promise<LiveFetchResult> {
    const nowMs = this.now();
    const fromVendor = await this.tryTierA(trainNo, nowMs);
    if (fromVendor) return fromVendor;

    const fromCrowd = await this.crowd.fetchTrain(trainNo);
    if (fromCrowd.length > 0) {
      await this.persist(fromCrowd, false);
      return { observations: fromCrowd, source: "crowd", diverted: false, cacheHit: false };
    }

    const replayed = await this.replay.fetchTrain(trainNo);
    await this.persist(replayed, false);
    return { observations: replayed, source: "replay", diverted: false, cacheHit: false };
  }

  private async tryTierA(trainNo: string, nowMs: number): Promise<LiveFetchResult | null> {
    if (this.disableVendor) return null;
    if (!this.railRadar.hasKey()) {
      logger.info("live_tier_a_skipped", { trainNo, reason: "missing_key" });
      return null;
    }
    if (this.breaker.open) {
      logger.warn("live_circuit_open", {
        trainNo,
        consecutiveFailures: this.breaker.consecutiveFailures,
      });
      return null;
    }
    const allowed = await canSpendQuota(this.store, this.quotaCap, nowMs);
    if (!allowed) {
      logger.warn("live_quota_exhausted", {
        trainNo,
        cap: this.quotaCap,
        month: monthKeyIst(nowMs),
      });
      return null;
    }

    try {
      recordVendorCall();
      const used = await spendQuota(this.store, nowMs);
      setQuotaCounter(used, this.quotaCap);
      const fetched = await this.railRadar.fetchTrainDetailed(trainNo);
      this.breaker.recordSuccess();
      this.harvest.append({
        harvestedAt: nowMs,
        trainNo,
        ok: true,
        source: "railradar",
        status: fetched.status,
        body: fetched.body,
      });
      await this.store.setLastHarvestAt(nowMs);
      await this.persist(fetched.observations, fetched.diverted);
      logger.info("live_tier_a", {
        trainNo,
        count: fetched.observations.length,
        diverted: fetched.diverted,
        delayMin: fetched.observations.find((row) => row.eventType === "GPS")?.delayMin,
      });
      return {
        observations: fetched.observations,
        source: "railradar",
        diverted: fetched.diverted,
        cacheHit: false,
      };
    } catch (error) {
      this.breaker.recordFailure(nowMs);
      logger.error("live_tier_a_failed", {
        trainNo,
        consecutiveFailures: this.breaker.consecutiveFailures,
        message: error instanceof Error ? error.message : "railradar_error",
      });
      return null;
    }
  }

  private async persist(observations: TrainObservation[], diverted: boolean): Promise<void> {
    if (observations.length === 0) return;
    const first = observations[0]!;
    await this.store.putLatest(first.trainNo, first.runDate, observations);
    await this.store.setDiverted(first.trainNo, first.runDate, diverted);
  }

  /** Map overlay: store latest, else replay. Never issues a vendor call. */
  async positionsFor(trainNos: string[]): Promise<LiveFetchResult[]> {
    const out: LiveFetchResult[] = [];
    for (const trainNo of trainNos) {
      const runDate = istRunDate(this.now());
      const latest =
        (await this.store.getLatestByTrain(trainNo)) ??
        (await this.store.getLatest(trainNo, runDate));
      if (latest && latest.length > 0) {
        const source = latest[latest.length - 1]!.source;
        out.push({
          observations: latest,
          source,
          diverted: await this.store.getDiverted(trainNo, runDate),
          cacheHit: true,
        });
        continue;
      }
      const replayed = await this.replay.fetchTrain(trainNo);
      out.push({
        observations: replayed,
        source: "replay",
        diverted: false,
        cacheHit: false,
      });
    }
    return out;
  }
}

let sharedFeed: TieredLiveFeed | null = null;

export function getLiveFeed(): TieredLiveFeed {
  if (!sharedFeed) sharedFeed = new TieredLiveFeed();
  return sharedFeed;
}

export function setLiveFeedForTests(feed: TieredLiveFeed | null): void {
  sharedFeed = feed;
}
