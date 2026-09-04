export type CacheEntry<T> = {
  value: T;
  fetchedAt: number;
};

export type PullThroughCacheOptions = {
  /** Fresh window, milliseconds. */
  ttlMs: number;
  /** Stale-while-revalidate window after TTL, milliseconds. */
  swrMs?: number;
  now?: () => number;
};

/**
 * Pull-through cache. Fresh hits never invoke the loader. Concurrent misses
 * share one in-flight loader. After TTL, a stale value is returned immediately
 * while a single revalidate runs in the background.
 */
export class PullThroughCache<T> {
  private readonly ttlMs: number;
  private readonly swrMs: number;
  private readonly now: () => number;
  private readonly entries = new Map<string, CacheEntry<T>>();
  private readonly inflight = new Map<string, Promise<T>>();

  constructor(options: PullThroughCacheOptions) {
    this.ttlMs = options.ttlMs;
    this.swrMs = options.swrMs ?? options.ttlMs;
    this.now = options.now ?? (() => Date.now());
  }

  peek(key: string): CacheEntry<T> | undefined {
    return this.entries.get(key);
  }

  set(key: string, value: T, fetchedAt: number = this.now()): void {
    this.entries.set(key, { value, fetchedAt });
  }

  clear(): void {
    this.entries.clear();
    this.inflight.clear();
  }

  /**
   * @returns `{ value, hit }` where `hit` is true when the loader was not awaited
   */
  async get(key: string, loader: () => Promise<T>): Promise<{ value: T; hit: boolean }> {
    const now = this.now();
    const entry = this.entries.get(key);
    if (entry && now - entry.fetchedAt < this.ttlMs) {
      return { value: entry.value, hit: true };
    }

    const existing = this.inflight.get(key);
    if (existing) {
      const value = await existing;
      return { value, hit: true };
    }

    const staleUsable = entry !== undefined && now - entry.fetchedAt < this.ttlMs + this.swrMs;
    if (staleUsable && entry) {
      this.revalidate(key, loader);
      return { value: entry.value, hit: true };
    }

    const pending = this.load(key, loader);
    const value = await pending;
    return { value, hit: false };
  }

  private revalidate(key: string, loader: () => Promise<T>): void {
    if (this.inflight.has(key)) return;
    void this.load(key, loader);
  }

  private load(key: string, loader: () => Promise<T>): Promise<T> {
    const pending = loader()
      .then((value) => {
        this.entries.set(key, { value, fetchedAt: this.now() });
        return value;
      })
      .finally(() => {
        this.inflight.delete(key);
      });
    this.inflight.set(key, pending);
    return pending;
  }
}
