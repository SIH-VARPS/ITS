import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { HarvestLog } from "../harvest";
import { MemoryObservationStore } from "../store";
import type { TrainObservation } from "../types";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function obs(sequence: number): TrainObservation {
  return {
    trainNo: "12951",
    runDate: "2026-09-03",
    stationCode: "BVI",
    sequence,
    eventType: "GPS",
    scheduledMin: 1022,
    actualMin: 1035,
    delayMin: 13,
    source: "railradar",
    receivedAt: 1_000 + sequence,
  };
}

describe("ObservationStore", () => {
  it("round-trips latest state per (trainNo, runDate)", async () => {
    const store = new MemoryObservationStore();
    const rows = [obs(1), obs(2)];
    await store.putLatest("12951", "2026-09-03", rows);
    await expect(store.getLatest("12951", "2026-09-03")).resolves.toEqual(rows);
    await expect(store.getLatest("12951", "2026-09-04")).resolves.toBeNull();
    await expect(store.getLatestByTrain("12951")).resolves.toEqual(rows);
    const listed = await store.listLatest();
    expect(listed).toEqual([{ trainNo: "12951", runDate: "2026-09-03", rows }]);
    expect(await store.ping()).toBe(true);
    await store.setDiverted("12951", "2026-09-03", true);
    await expect(store.getDiverted("12951", "2026-09-03")).resolves.toBe(true);
    await store.setLastHarvestAt(99);
    await expect(store.getLastHarvestAt()).resolves.toBe(99);
    expect(store.revision()).toBeGreaterThan(0);
  });

  it("takes tokens from the bucket and refills after the window", async () => {
    const { setV2RateConfigForTests } = await import("../store");
    setV2RateConfigForTests({ capacity: 2, refillPerSec: 1 });
    const store = new MemoryObservationStore();
    const t0 = 1_000_000;
    expect((await store.takeToken("k", t0)).allowed).toBe(true);
    expect((await store.takeToken("k", t0)).allowed).toBe(true);
    expect((await store.takeToken("k", t0)).allowed).toBe(false);
    expect((await store.takeToken("k", t0 + 2_000)).allowed).toBe(true);
    store.clearRateBuckets();
    setV2RateConfigForTests(null);
  });

  it("bounds history length", async () => {
    const store = new MemoryObservationStore({ historyBound: 3 });
    await store.appendHistory([obs(1), obs(2), obs(3), obs(4), obs(5)]);
    const history = await store.getHistory("12951", "2026-09-03");
    expect(history).toHaveLength(3);
    expect(history.map((row) => row.sequence)).toEqual([3, 4, 5]);
  });

  it("deletes latest and history for a train-run", async () => {
    const store = new MemoryObservationStore();
    await store.putLatest("12951", "2026-09-03", [obs(1)]);
    expect(await store.deleteLatest("12951")).toBe(true);
    await expect(store.getLatest("12951", "2026-09-03")).resolves.toBeNull();
    await expect(store.getHistory("12951", "2026-09-03")).resolves.toEqual([]);
    expect(await store.deleteLatest("12951")).toBe(false);
  });
});

describe("HarvestLog", () => {
  it("retrieves an appended observation after a simulated cold start", () => {
    const rootDir = mkdtempSync(path.join(tmpdir(), "harvest-cold-"));
    tempDirs.push(rootDir);
    const harvestedAt = Date.parse("2026-09-04T00:15:18+05:30");
    const first = new HarvestLog({ rootDir, now: () => harvestedAt });
    first.append({
      harvestedAt,
      trainNo: "12951",
      ok: true,
      source: "railradar",
      status: 200,
      body: { trainNo: "12951", fixture: true },
    });
    const restarted = new HarvestLog({ rootDir, now: () => harvestedAt });
    const rows = restarted.readTrain("12951", "2026-09-04");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.trainNo).toBe("12951");
    expect(rows[0]?.body).toMatchObject({ fixture: true });
    expect(restarted.lastHarvestAt()).toBe(harvestedAt);
  });

  it("scans JSONL when meta.json is unreadable", () => {
    const rootDir = mkdtempSync(path.join(tmpdir(), "harvest-scan-"));
    tempDirs.push(rootDir);
    const dayDir = path.join(rootDir, "2026-09-04");
    mkdirSync(dayDir, { recursive: true });
    writeFileSync(
      path.join(dayDir, "12951.jsonl"),
      `${JSON.stringify({
        harvestedAt: 42,
        trainNo: "12951",
        ok: true,
        source: "railradar",
        status: 200,
        body: {},
      })}\n`,
    );
    writeFileSync(path.join(rootDir, "meta.json"), "not-json");
    expect(new HarvestLog({ rootDir }).lastHarvestAt()).toBe(42);
  });
});
