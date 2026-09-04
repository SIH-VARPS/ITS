import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PullThroughCache } from "../cache";
import { HarvestLog } from "../harvest";
import { RailRadarAdapter } from "../railRadarAdapter";
import { ReplayAdapter } from "../replayAdapter";
import { MemoryObservationStore } from "../store";
import { TieredLiveFeed } from "../adapter";
import { monthKeyIst } from "../quota";

const fixturePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "__fixtures__",
  "legacy-train-full.json",
);

const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as unknown;

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function jsonOk(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("tiered live feed", () => {
  it("trips the breaker after 3 vendor failures and serves replay next", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("vendor_down");
    });
    const store = new MemoryObservationStore();
    const harvestDir = mkdtempSync(path.join(tmpdir(), "live-breaker-"));
    tempDirs.push(harvestDir);
    const harvest = new HarvestLog({
      rootDir: harvestDir,
    });
    const feed = new TieredLiveFeed({
      store,
      harvest,
      disableVendor: false,
      ttlMs: 60_000,
      railRadar: new RailRadarAdapter({
        apiKey: "test-key",
        fetchImpl: fetchImpl as unknown as typeof fetch,
        maxAttempts: 1,
        sleep: async () => undefined,
      }),
      replay: new ReplayAdapter({ now: () => Date.parse("2026-09-04T00:15:18+05:30") }),
    });

    await feed.fetchTrainDetailed("12951");
    await feed.fetchTrainDetailed("12951");
    await feed.fetchTrainDetailed("12951");
    expect(feed.breaker.open).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(3);

    const fourth = await feed.fetchTrainDetailed("12951");
    expect(fourth.source).toBe("replay");
    expect(fourth.observations.every((row) => row.source === "replay")).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(3);

    const positions = await feed.positionsFor(["12951"]);
    expect(positions[0]?.source).toBe("replay");
  });

  it("skips Tier A when the key is missing", async () => {
    const fetchImpl = vi.fn();
    const harvestDir = mkdtempSync(path.join(tmpdir(), "live-nokey-"));
    tempDirs.push(harvestDir);
    const feed = new TieredLiveFeed({
      store: new MemoryObservationStore(),
      harvest: new HarvestLog({ rootDir: harvestDir }),
      disableVendor: false,
      railRadar: new RailRadarAdapter({
        apiKey: "",
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    });
    const result = await feed.fetchTrainDetailed("12951");
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result.source).toBe("replay");
  });

  it("keeps the vendor skipped in Vitest even when LIVE_FEED_DISABLE_VENDOR is set", async () => {
    const previous = process.env["LIVE_FEED_DISABLE_VENDOR"];
    process.env["LIVE_FEED_DISABLE_VENDOR"] = "1";
    const fetchImpl = vi.fn();
    try {
      const harvestDir = mkdtempSync(path.join(tmpdir(), "live-env-"));
      tempDirs.push(harvestDir);
      const feed = new TieredLiveFeed({
        store: new MemoryObservationStore(),
        harvest: new HarvestLog({ rootDir: harvestDir }),
        railRadar: new RailRadarAdapter({
          apiKey: "test-key",
          fetchImpl: fetchImpl as unknown as typeof fetch,
        }),
      });
      const result = await feed.fetchTrainDetailed("12951");
      expect(fetchImpl).not.toHaveBeenCalled();
      expect(result.source).toBe("replay");
    } finally {
      if (previous === undefined) delete process.env["LIVE_FEED_DISABLE_VENDOR"];
      else process.env["LIVE_FEED_DISABLE_VENDOR"] = previous;
    }
  });

  it("refuses Tier A at the quota cap and never issues fetch", async () => {
    const fetchImpl = vi.fn();
    const store = new MemoryObservationStore();
    const now = Date.parse("2026-09-04T00:15:18+05:30");
    await store.incrementQuota(monthKeyIst(now), 1);
    const harvestDir = mkdtempSync(path.join(tmpdir(), "live-quota-"));
    tempDirs.push(harvestDir);
    const harvest = new HarvestLog({
      rootDir: harvestDir,
    });
    const feed = new TieredLiveFeed({
      store,
      harvest,
      disableVendor: false,
      quotaCap: 1,
      now: () => now,
      railRadar: new RailRadarAdapter({
        apiKey: "test-key",
        fetchImpl: fetchImpl as unknown as typeof fetch,
        maxAttempts: 1,
        sleep: async () => undefined,
      }),
    });
    const result = await feed.fetchTrainDetailed("12951");
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result.source).toBe("replay");
  });

  it("pull-through: two calls inside TTL issue exactly one vendor call", async () => {
    const fetchImpl = vi.fn(async () => jsonOk(fixture));
    const store = new MemoryObservationStore();
    const harvestDir = mkdtempSync(path.join(tmpdir(), "live-cache-"));
    tempDirs.push(harvestDir);
    const harvest = new HarvestLog({
      rootDir: harvestDir,
    });
    const feed = new TieredLiveFeed({
      store,
      harvest,
      disableVendor: false,
      ttlMs: 60_000,
      now: () => Date.parse("2026-09-04T00:15:18+05:30"),
      railRadar: new RailRadarAdapter({
        apiKey: "test-key",
        fetchImpl: fetchImpl as unknown as typeof fetch,
        maxAttempts: 1,
        sleep: async () => undefined,
        now: () => Date.parse("2026-09-04T00:15:18+05:30"),
      }),
    });
    const first = await feed.fetchTrainDetailed("12951");
    const second = await feed.fetchTrainDetailed("12951");
    expect(first.source).toBe("railradar");
    expect(second.cacheHit).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});

describe("PullThroughCache", () => {
  it("coalesces concurrent misses into one loader", async () => {
    let loads = 0;
    const cache = new PullThroughCache<number>({ ttlMs: 1_000, now: () => 0 });
    const loader = async () => {
      loads += 1;
      return 7;
    };
    const [a, b] = await Promise.all([cache.get("k", loader), cache.get("k", loader)]);
    expect(a.value).toBe(7);
    expect(b.value).toBe(7);
    expect(loads).toBe(1);
    const hit = await cache.get("k", loader);
    expect(hit.hit).toBe(true);
    expect(loads).toBe(1);
    cache.clear();
    const again = await cache.get("k", loader);
    expect(again.hit).toBe(false);
  });

  it("returns stale while a single revalidate runs", async () => {
    let now = 0;
    let loads = 0;
    const cache = new PullThroughCache<number>({
      ttlMs: 10,
      swrMs: 50,
      now: () => now,
    });
    await cache.get("k", async () => {
      loads += 1;
      return 1;
    });
    now = 15;
    const stale = await cache.get("k", async () => {
      loads += 1;
      return 2;
    });
    expect(stale.hit).toBe(true);
    expect(stale.value).toBe(1);
    await Promise.resolve();
    expect(loads).toBeGreaterThanOrEqual(2);
  });
});
