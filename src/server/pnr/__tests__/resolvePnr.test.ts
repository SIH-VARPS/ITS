import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mapRailradarPnr, resolvePnrStatus } from "../resolvePnr";

const fixture = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../__fixtures__/pnr-success.json"),
    "utf8",
  ),
) as unknown;

describe("PNR resolver", () => {
  it("returns null for a non-10-digit PNR", async () => {
    expect(await resolvePnrStatus("123")).toBeNull();
  });

  it("falls back to a deterministic demo payload when no key is present", async () => {
    const pnr = await resolvePnrStatus("1234567890", { apiKey: "", skipNetwork: true });
    expect(pnr?.pnr).toBe("1234567890");
    expect(pnr?.passengers.length).toBeGreaterThan(0);
    expect(pnr?.trainNumber).toMatch(/^\d+$/);
  });

  it("maps a RailRadar-shaped fixture without calling the network", () => {
    const mapped = mapRailradarPnr("1234567890", fixture);
    expect(mapped?.trainNumber).toBe("12001");
    expect(mapped?.fromStation.code).toBe("HBJ");
    expect(mapped?.passengers[0]?.coach).toBe("B1");
  });

  it("uses the live mapper when a fetch implementation is provided", async () => {
    const pnr = await resolvePnrStatus("1234567890", {
      apiKey: "test-key",
      skipNetwork: false,
      demo: false,
      fetchImpl: async () =>
        new Response(JSON.stringify(fixture), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    });
    expect(pnr?.trainNumber).toBe("12001");
    expect(pnr?.passengers).toHaveLength(1);
  });

  it("returns null when live fetch fails and demo is off", async () => {
    await expect(
      resolvePnrStatus("1234567890", {
        apiKey: "test-key",
        skipNetwork: false,
        demo: false,
        fetchImpl: async () => {
          throw new Error("network down");
        },
      }),
    ).resolves.toBeNull();
  });

  it("falls back to demo when live fetch throws", async () => {
    const pnr = await resolvePnrStatus("1234567890", {
      apiKey: "test-key",
      skipNetwork: false,
      demo: true,
      fetchImpl: async () => {
        throw new Error("network down");
      },
    });
    expect(pnr?.pnr).toBe("1234567890");
  });

  it("returns null on a non-OK live response when demo is off", async () => {
    await expect(
      resolvePnrStatus("1234567890", {
        apiKey: "test-key",
        skipNetwork: false,
        demo: false,
        fetchImpl: async () => new Response("{}", { status: 500 }),
      }),
    ).resolves.toBeNull();
  });

  it("maps missing or unusable payloads to null", () => {
    expect(mapRailradarPnr("1234567890", null)).toBeNull();
    expect(mapRailradarPnr("1234567890", { data: { trainName: "x" } })).toBeNull();
  });

  it("fills optional PNR fields from the timetable when the payload is sparse", () => {
    const mapped = mapRailradarPnr("1234567890", {
      data: {
        trainNumber: "12001",
        sourceStation: "HBJ",
        passengers: [{ number: "1", berthType: "Sofa", coach: "", berth: "x" }],
        chartPrepared: false,
        fare: "n/a",
      },
    });
    expect(mapped?.trainNumber).toBe("12001");
    expect(mapped?.chartStatus).toBe("CHART NOT PREPARED");
    expect(mapped?.fromStation.code).toBe("HBJ");
    expect(mapped?.passengers[0]?.coach).toBe("S1");
    expect(mapped?.fare).toBe(0);
  });
});
