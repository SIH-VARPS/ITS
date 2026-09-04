import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { EngineEtaBlock } from "@/components/rail/EtaBand";
import { useEngineEta } from "@/hooks/useEngineEta";
import { serveEtaResponse } from "@/lib/etaEngine";
import type { EtaResponse } from "@/server/schemas/eta";
import { handleApiRequest } from "@/server/apiRouter";
import { getLiveFeed } from "@/server/live/adapter";
import { getObservationStore, setV2RateConfigForTests } from "@/server/live/store";
import { loadEngineContext, occupancyFromStore } from "@/server/routes/v2/engine";
import { getTrainByNumber } from "@/server/trains/store.server";

const SAMPLE = 100;
const SEED = 20260315;
const HOOK_PROBE = 5;

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleTrainNumbers(count: number, seed: number): string[] {
  const indexPath = join(
    dirname(fileURLToPath(import.meta.url)),
    "../data/generated/trainIndex.json",
  );
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as Record<string, string>;
  const keys = Object.keys(index).sort();
  const rng = mulberry32(seed);
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = keys[i]!;
    keys[i] = keys[j]!;
    keys[j] = tmp;
  }
  const preferred = ["12951", "12001", "12301", "12953", "12259"];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const n of [...preferred, ...keys]) {
    if (seen.has(n) || !index[n]) continue;
    const route = getTrainByNumber(n);
    if (!route || route.halts.length < 2) continue;
    seen.add(n);
    out.push(n);
    if (out.length >= count) break;
  }
  return out;
}

async function apiJson(path: string): Promise<{ status: number; body: EtaResponse }> {
  const response = await handleApiRequest(new Request(`http://localhost${path}`));
  expect(response).not.toBeNull();
  const body = (await response!.json()) as EtaResponse;
  return { status: response!.status, body };
}

function PassengerEta({ trainNo, station }: { trainNo: string; station: string }) {
  const { payload, error } = useEngineEta(trainNo, station, 60_000);
  if (error) return <div data-testid="eta-error">{error}</div>;
  if (!payload) return <div data-testid="eta-pending" />;
  return <EngineEtaBlock payload={payload} />;
}

describe("cross-surface ETA consistency", { timeout: 180_000 }, () => {
  const trains = sampleTrainNumbers(SAMPLE, SEED);

  beforeAll(async () => {
    setV2RateConfigForTests({ capacity: 10_000, refillPerSec: 1_000 });
    const feed = getLiveFeed();
    for (const trainNo of trains) {
      await feed.fetchTrainDetailed(trainNo);
    }
  });

  afterEach(() => {
    cleanup();
  });

  afterAll(() => {
    getObservationStore().clearRateBuckets();
    setV2RateConfigForTests(null);
  });

  it(`keeps EtaEngine, /api/v2/eta, /api/v2/events, and the passenger band identical for ${SAMPLE} trains`, async () => {
    expect(trains).toHaveLength(SAMPLE);
    const occupancy = await occupancyFromStore();

    for (const trainNo of trains) {
      const ctx = await loadEngineContext(trainNo, occupancy);
      expect(ctx, `missing engine context for ${trainNo}`).not.toBeNull();
      const dest = ctx!.train.halts[ctx!.train.halts.length - 1]!.code;
      const engine = serveEtaResponse(ctx!.train, dest, ctx!.live, ctx!.now, ctx!.options);
      expect(engine, `engine miss for ${trainNo} ${dest}`).not.toBeNull();

      const eta = await apiJson(
        `/api/v2/eta?train=${encodeURIComponent(trainNo)}&station=${encodeURIComponent(dest)}`,
      );
      expect(eta.status, `eta HTTP ${trainNo}`).toBe(200);
      const events = await apiJson(
        `/api/v2/events?train=${encodeURIComponent(trainNo)}&station=${encodeURIComponent(dest)}`,
      );
      expect(events.status, `events HTTP ${trainNo}`).toBe(200);

      expect(eta.body.eta, trainNo).toBe(engine!.eta);
      expect(events.body.eta, trainNo).toBe(engine!.eta);
      expect(eta.body.p50, trainNo).toBe(engine!.p50);
      expect(eta.body.delayMin, trainNo).toBe(engine!.delayMin);
      expect(eta.body.modelVersion, trainNo).toBe(engine!.modelVersion);

      const { unmount } = render(<EngineEtaBlock payload={eta.body} stationName={dest} />);
      const node = document.querySelector("[data-engine-eta]");
      expect(node?.getAttribute("data-engine-eta"), `UI ${trainNo}`).toBe(engine!.eta);
      unmount();
    }
  });

  it("hydrates the passenger hook from /api/v2/events with the same eta as the engine", async () => {
    const occupancy = await occupancyFromStore();
    vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
      const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const url = raw.startsWith("http") ? raw : `http://localhost${raw}`;
      const response = await handleApiRequest(new Request(url, init));
      if (!response) throw new Error(`unhandled ${url}`);
      return response;
    });

    try {
      for (const trainNo of trains.slice(0, HOOK_PROBE)) {
        const ctx = await loadEngineContext(trainNo, occupancy);
        const dest = ctx!.train.halts[ctx!.train.halts.length - 1]!.code;
        const engine = serveEtaResponse(ctx!.train, dest, ctx!.live, ctx!.now, ctx!.options);
        const { unmount } = render(<PassengerEta trainNo={trainNo} station={dest} />);
        await waitFor(() => {
          expect(screen.queryByTestId("eta-pending")).toBeNull();
          expect(screen.queryByTestId("eta-error")).toBeNull();
        });
        const node = document.querySelector("[data-engine-eta]");
        expect(node?.getAttribute("data-engine-eta"), trainNo).toBe(engine!.eta);
        unmount();
      }
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
