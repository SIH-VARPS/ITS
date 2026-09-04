import { istParts, stationHourKey } from "./ist";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

export type WeatherFetch = (
  input: string,
  init?: { signal?: AbortSignal },
) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

export type WeatherClientOptions = {
  /** When true, never hit the network; read `fixture` or return 0. */
  offline?: boolean;
  /** Map of `STATION:YYYY-MM-DDTHH` → WMO weather code. */
  fixture?: Readonly<Record<string, number>>;
  fetchImpl?: WeatherFetch;
  timeoutMs?: number;
};

type HourlyBlock = {
  time?: unknown;
  weather_code?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseHourly(payload: unknown): Map<string, number> {
  const out = new Map<string, number>();
  if (!isRecord(payload)) return out;
  const hourly = payload["hourly"];
  if (!isRecord(hourly)) return out;
  const block = hourly as HourlyBlock;
  const times = Array.isArray(block.time) ? block.time : [];
  const codes = Array.isArray(block.weather_code) ? block.weather_code : [];
  for (let i = 0; i < times.length; i++) {
    const stamp = times[i];
    if (typeof stamp !== "string") continue;
    const code = asFiniteNumber(codes[i]);
    if (code === null) continue;
    // Open-Meteo hourly stamps look like `2026-03-15T10:00`.
    const hour = stamp.length >= 13 ? stamp.slice(0, 13) : stamp;
    out.set(hour, Math.max(0, Math.round(code)));
  }
  return out;
}

/**
 * Open-Meteo weather client. Cached per station-hour. Duplicate fetches for
 * the same station-hour coalesce onto one in-flight request.
 */
export class WeatherClient {
  private readonly offline: boolean;
  private readonly fixture: Readonly<Record<string, number>>;
  private readonly fetchImpl: WeatherFetch;
  private readonly timeoutMs: number;
  private readonly codeByStationHour = new Map<string, number>();
  private readonly hourlyByStation = new Map<string, Map<string, number>>();
  private readonly inflight = new Map<string, Promise<number>>();
  fetchCalls = 0;

  constructor(options: WeatherClientOptions = {}) {
    this.offline = options.offline === true;
    this.fixture = options.fixture ?? {};
    this.fetchImpl = options.fetchImpl ?? defaultFetch;
    this.timeoutMs = options.timeoutMs ?? 8_000;
  }

  /** Cached WMO code for a station-hour, or 0 when unknown. */
  peek(stationCode: string, at: Date): number {
    const key = stationHourKey(stationCode, at);
    const cached = this.codeByStationHour.get(key);
    if (cached !== undefined) return cached;
    const fixtureCode = this.fixture[key];
    if (fixtureCode !== undefined) return fixtureCode;
    return 0;
  }

  async weatherCodeAt(stationCode: string, lat: number, lng: number, at: Date): Promise<number> {
    const key = stationHourKey(stationCode, at);
    const cached = this.codeByStationHour.get(key);
    if (cached !== undefined) return cached;
    const fixtureCode = this.fixture[key];
    if (fixtureCode !== undefined) {
      this.codeByStationHour.set(key, fixtureCode);
      return fixtureCode;
    }
    if (this.offline) {
      this.codeByStationHour.set(key, 0);
      return 0;
    }

    const pending = this.inflight.get(key);
    if (pending) return pending;

    const job = this.fetchStationHour(stationCode, lat, lng, at, key);
    this.inflight.set(key, job);
    try {
      return await job;
    } finally {
      this.inflight.delete(key);
    }
  }

  private async fetchStationHour(
    stationCode: string,
    lat: number,
    lng: number,
    at: Date,
    key: string,
  ): Promise<number> {
    const station = stationCode.toUpperCase();
    const existingHourly = this.hourlyByStation.get(station);
    if (existingHourly) {
      const fromHourly = this.lookupHour(existingHourly, at);
      this.codeByStationHour.set(key, fromHourly);
      return fromHourly;
    }

    this.fetchCalls += 1;
    const parts = istParts(at);
    const date = `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
    const url =
      `${OPEN_METEO_URL}?latitude=${encodeURIComponent(String(lat))}` +
      `&longitude=${encodeURIComponent(String(lng))}` +
      `&hourly=weather_code&timezone=Asia%2FKolkata` +
      `&start_date=${date}&end_date=${date}`;

    let hourly = new Map<string, number>();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const response = await this.fetchImpl(url, { signal: controller.signal });
        if (response.ok) {
          hourly = parseHourly(await response.json());
        }
      } finally {
        clearTimeout(timer);
      }
    } catch {
      hourly = new Map();
    }

    this.hourlyByStation.set(station, hourly);
    const code = this.lookupHour(hourly, at);
    this.codeByStationHour.set(key, code);
    return code;
  }

  private lookupHour(hourly: Map<string, number>, at: Date): number {
    const parts = istParts(at);
    const stamp = `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}T${String(parts.hour).padStart(2, "0")}`;
    return hourly.get(stamp) ?? 0;
  }
}

async function defaultFetch(
  input: string,
  init?: { signal?: AbortSignal },
): Promise<{ ok: boolean; json: () => Promise<unknown> }> {
  const response = await fetch(input, init?.signal ? { signal: init.signal } : {});
  return {
    ok: response.ok,
    json: () => response.json() as Promise<unknown>,
  };
}

let sharedClient: WeatherClient | null = null;

export function getWeatherClient(): WeatherClient {
  if (!sharedClient) {
    const offline = process.env["VITEST"] === "true" || process.env["WEATHER_OFFLINE"] === "1";
    sharedClient = new WeatherClient({ offline });
  }
  return sharedClient;
}

export function setWeatherClientForTests(client: WeatherClient | null): void {
  sharedClient = client;
}
