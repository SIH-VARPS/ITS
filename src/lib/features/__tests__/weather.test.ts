import { describe, expect, it, vi } from "vitest";
import { getTrain } from "@/data/trains";
import { WeatherClient } from "../weather";

const train = getTrain("12951")!;
const at = new Date("2026-03-15T10:00:00+05:30");

describe("Open-Meteo weather client", () => {
  it("caches a station-hour so a duplicate fetch is never issued", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        hourly: { time: ["2026-03-15T10:00"], weather_code: [61] },
      }),
    }));
    const client = new WeatherClient({ offline: false, fetchImpl });
    const halt = train.halts[1]!;
    const first = await client.weatherCodeAt(halt.code, halt.lat, halt.lng, at);
    const second = await client.weatherCodeAt(halt.code, halt.lat, halt.lng, at);
    expect(first).toBe(61);
    expect(second).toBe(61);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(client.fetchCalls).toBe(1);
  });

  it("returns 0 in offline mode without calling fetch", async () => {
    const fetchImpl = vi.fn();
    const client = new WeatherClient({ offline: true, fetchImpl });
    const halt = train.halts[0]!;
    expect(await client.weatherCodeAt(halt.code, halt.lat, halt.lng, at)).toBe(0);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
