import { afterEach, describe, expect, it } from "vitest";
import { occupancyFromStore, resolveTrainRoute } from "../engine";
import { MemoryObservationStore, setObservationStoreForTests } from "@/server/live/store";

afterEach(() => {
  setObservationStoreForTests(null);
});

describe("v2 engine occupancy", () => {
  it("resolves occupancy via server shards, not only featured routes", async () => {
    const shardTrain = await resolveTrainRoute("12951");
    expect(shardTrain).toBeDefined();
    const store = new MemoryObservationStore();
    setObservationStoreForTests(store);
    await store.putLatest("12951", "2026-03-15", [
      {
        trainNo: "12951",
        runDate: "2026-03-15",
        stationCode: shardTrain!.halts[0]!.code,
        sequence: 1,
        eventType: "GPS",
        scheduledMin: 0,
        actualMin: 0,
        delayMin: 0,
        source: "replay",
        receivedAt: 1,
      },
    ]);
    const occupancy = await occupancyFromStore();
    expect(occupancy.length).toBeGreaterThan(0);
  });
});
