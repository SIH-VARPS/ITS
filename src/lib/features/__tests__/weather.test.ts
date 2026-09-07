import { describe, expect, it, vi } from "vitest";
import { getTrain } from "@/data/trains";
import { OPEN_METEO_ARCHIVE_URL, WeatherClient, normalizeHaltWeather } from "../weather";

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

  it("parses precipitation, visibility, and wind from the hourly block", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        hourly: {
          time: ["2026-03-15T10:00"],
          weather_code: [61],
          precipitation: [4.2],
          visibility: [8000],
          wind_speed_10m: [18.5],
        },
      }),
    }));
    const client = new WeatherClient({ offline: false, fetchImpl });
    const halt = train.halts[0]!;
    const snap = await client.weatherSnapshotAt(halt.code, halt.lat, halt.lng, at);
    expect(snap).toEqual({
      weatherCode: 61,
      precipitationMm: 4.2,
      visibilityKm: 8,
      windSpeedKmph: 18.5,
    });
  });

  it("queries Open-Meteo Archive when archive mode is on", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        hourly: {
          time: ["2026-03-15T10:00"],
          weather_code: [45],
          precipitation: [0],
          visibility: [400],
          wind_speed_10m: [3],
        },
      }),
    }));
    const client = new WeatherClient({ offline: false, archive: true, fetchImpl });
    const halt = train.halts[0]!;
    const code = await client.weatherCodeAt(halt.code, halt.lat, halt.lng, at);
    expect(code).toBe(45);
    expect(client.lastFetchUrl.startsWith(OPEN_METEO_ARCHIVE_URL)).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("normalizes legacy weatherByHalt numbers and snapshot objects", () => {
    expect(normalizeHaltWeather(61).weatherCode).toBe(61);
    expect(normalizeHaltWeather({ weatherCode: 45, visibilityKm: 0.4 }).visibilityKm).toBe(0.4);
    expect(normalizeHaltWeather(undefined).weatherCode).toBe(0);
  });
});
