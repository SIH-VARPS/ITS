import { istParts, pad2, stationHourKey } from "./ist";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
export const OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const HOURLY_VARS = "weather_code,precipitation,visibility,wind_speed_10m";

export type WeatherFetch = (
  input: string,
  init?: { signal?: AbortSignal },
) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

export type WeatherSnapshot = {
  weatherCode: number;
  precipitationMm: number;
  visibilityKm: number;
  windSpeedKmph: number;
};

export type WeatherLookupSource = "archive" | "forecast" | "cache" | "fixture" | "unavailable";

export type WeatherLookup = {
  snapshot: WeatherSnapshot;
  source: WeatherLookupSource;
};

export const CLEAR_WEATHER: WeatherSnapshot = {
  weatherCode: 0,
  precipitationMm: 0,
  visibilityKm: 0,
  windSpeedKmph: 0,
};

export type WeatherClientOptions = {
  /** When true, never hit the network; read `fixture` or return 0. */
  offline?: boolean;
  /** Map of `STATION:YYYY-MM-DDTHH` → WMO weather code. */
  fixture?: Readonly<Record<string, number>>;
  fetchImpl?: WeatherFetch;
  timeoutMs?: number;
  /** Use the Open-Meteo Archive API (historical). Live serving stays on forecast. */
  archive?: boolean;
};

type HourlyBlock = {
  time?: unknown;
  weather_code?: unknown;
  precipitation?: unknown;
  visibility?: unknown;
  wind_speed_10m?: unknown;
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

function max0(value: number): number {
  return Math.max(0, value);
}

/** Coerce a raw `weatherByHalt` slot (legacy WMO number or snapshot object). */
export function normalizeHaltWeather(value: unknown): WeatherSnapshot {
  if (typeof value === "number" && Number.isFinite(value)) {
    return { ...CLEAR_WEATHER, weatherCode: Math.max(0, Math.round(value)) };
  }
  if (isRecord(value)) {
    const code = asFiniteNumber(value["weatherCode"]);
    const precip = asFiniteNumber(value["precipitationMm"]);
    const vis = asFiniteNumber(value["visibilityKm"]);
    const wind = asFiniteNumber(value["windSpeedKmph"]);
    return {
      weatherCode: code === null ? 0 : Math.max(0, Math.round(code)),
      precipitationMm: precip === null ? 0 : max0(precip),
      visibilityKm: vis === null ? 0 : max0(vis),
      windSpeedKmph: wind === null ? 0 : max0(wind),
    };
  }
  return { ...CLEAR_WEATHER };
}

export function parseHourlySnapshots(payload: unknown): Map<string, WeatherSnapshot> {
  const out = new Map<string, WeatherSnapshot>();
  if (!isRecord(payload)) return out;
  const hourly = payload["hourly"];
  if (!isRecord(hourly)) return out;
  const block = hourly as HourlyBlock;
  const times = Array.isArray(block.time) ? block.time : [];
  const codes = Array.isArray(block.weather_code) ? block.weather_code : [];
  const precip = Array.isArray(block.precipitation) ? block.precipitation : [];
  const visibility = Array.isArray(block.visibility) ? block.visibility : [];
  const wind = Array.isArray(block.wind_speed_10m) ? block.wind_speed_10m : [];
  for (let i = 0; i < times.length; i++) {
    const stamp = times[i];
    if (typeof stamp !== "string") continue;
    const code = asFiniteNumber(codes[i]);
    if (code === null && precip[i] == null && visibility[i] == null && wind[i] == null) continue;
    const visM = asFiniteNumber(visibility[i]);
    const hour = stamp.length >= 13 ? stamp.slice(0, 13) : stamp;
    out.set(hour, {
      weatherCode: code === null ? 0 : Math.max(0, Math.round(code)),
      precipitationMm: max0(asFiniteNumber(precip[i]) ?? 0),
      visibilityKm: visM === null ? 0 : max0(visM / 1000),
      windSpeedKmph: max0(asFiniteNumber(wind[i]) ?? 0),
    });
  }
  return out;
}

function hourStamp(at: Date): string {
  const parts = istParts(at);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}T${pad2(parts.hour)}`;
}

function istDate(at: Date): string {
  const parts = istParts(at);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

function weatherUrl(base: string, lat: number, lng: number, date: string): string {
  return (
    `${base}?latitude=${encodeURIComponent(String(lat))}` +
    `&longitude=${encodeURIComponent(String(lng))}` +
    `&hourly=${HOURLY_VARS}&timezone=Asia%2FKolkata` +
    `&start_date=${date}&end_date=${date}`
  );
}

/**
 * Open-Meteo weather client. Cached per station-hour. Duplicate fetches for
 * the same station-hour coalesce onto one in-flight request.
 *
 * Live serving uses the forecast endpoint (default). Pass `{ archive: true }`
 * for Open-Meteo Archive historical lookups used by training-data join.
 */
export class WeatherClient {
  private readonly offline: boolean;
  private readonly fixture: Readonly<Record<string, number>>;
  private readonly fetchImpl: WeatherFetch;
  private readonly timeoutMs: number;
  private readonly archive: boolean;
  private readonly snapByStationHour = new Map<string, WeatherSnapshot>();
  private readonly hourlyByStation = new Map<string, Map<string, WeatherSnapshot>>();
  private readonly inflight = new Map<string, Promise<WeatherSnapshot>>();
  fetchCalls = 0;
  lastFetchUrl = "";

  constructor(options: WeatherClientOptions = {}) {
    this.offline = options.offline === true;
    this.fixture = options.fixture ?? {};
    this.fetchImpl = options.fetchImpl ?? defaultFetch;
    this.timeoutMs = options.timeoutMs ?? 8_000;
    this.archive = options.archive === true;
  }

  /** Cached WMO code for a station-hour, or 0 when unknown. */
  peek(stationCode: string, at: Date): number {
    return this.peekSnapshot(stationCode, at).weatherCode;
  }

  peekSnapshot(stationCode: string, at: Date): WeatherSnapshot {
    const key = stationHourKey(stationCode, at);
    const cached = this.snapByStationHour.get(key);
    if (cached) return cached;
    const fixtureCode = this.fixture[key];
    if (fixtureCode !== undefined) {
      return { ...CLEAR_WEATHER, weatherCode: fixtureCode };
    }
    return { ...CLEAR_WEATHER };
  }

  async weatherCodeAt(stationCode: string, lat: number, lng: number, at: Date): Promise<number> {
    const snap = await this.weatherSnapshotAt(stationCode, lat, lng, at);
    return snap.weatherCode;
  }

  async weatherSnapshotAt(
    stationCode: string,
    lat: number,
    lng: number,
    at: Date,
  ): Promise<WeatherSnapshot> {
    const looked = await this.lookupWeather(stationCode, lat, lng, at);
    return looked.snapshot;
  }

  async lookupWeather(
    stationCode: string,
    lat: number,
    lng: number,
    at: Date,
  ): Promise<WeatherLookup> {
    const key = stationHourKey(stationCode, at);
    const cached = this.snapByStationHour.get(key);
    if (cached) return { snapshot: cached, source: "cache" };
    const fixtureCode = this.fixture[key];
    if (fixtureCode !== undefined) {
      const snapshot = { ...CLEAR_WEATHER, weatherCode: fixtureCode };
      this.snapByStationHour.set(key, snapshot);
      return { snapshot, source: "fixture" };
    }
    if (this.offline) {
      this.snapByStationHour.set(key, { ...CLEAR_WEATHER });
      return { snapshot: { ...CLEAR_WEATHER }, source: "unavailable" };
    }

    const pending = this.inflight.get(key);
    if (pending) {
      const snapshot = await pending;
      return { snapshot, source: "cache" };
    }

    const job = this.fetchStationHour(stationCode, lat, lng, at, key);
    this.inflight.set(key, job);
    try {
      const snapshot = await job;
      const source: WeatherLookupSource = this.hourlyByStation.has(stationCode.toUpperCase())
        ? this.archive
          ? "archive"
          : "forecast"
        : "unavailable";
      return { snapshot, source };
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
  ): Promise<WeatherSnapshot> {
    const date = istDate(at);
    const stationDay = `${stationCode.toUpperCase()}:${date}`;
    const existingHourly = this.hourlyByStation.get(stationDay);
    if (existingHourly) {
      const fromHourly = this.lookupHour(existingHourly, at);
      this.snapByStationHour.set(key, fromHourly);
      return fromHourly;
    }

    const primary = this.archive ? OPEN_METEO_ARCHIVE_URL : OPEN_METEO_URL;
    let hourly = await this.fetchHourly(primary, lat, lng, date);
    if (hourly.size === 0 && this.archive) {
      hourly = await this.fetchHourly(OPEN_METEO_URL, lat, lng, date);
    }

    this.hourlyByStation.set(stationDay, hourly);
    const snap = this.lookupHour(hourly, at);
    this.snapByStationHour.set(key, snap);
    return snap;
  }

  private async fetchHourly(
    base: string,
    lat: number,
    lng: number,
    date: string,
  ): Promise<Map<string, WeatherSnapshot>> {
    this.fetchCalls += 1;
    const url = weatherUrl(base, lat, lng, date);
    this.lastFetchUrl = url;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const response = await this.fetchImpl(url, { signal: controller.signal });
        if (response.ok) return parseHourlySnapshots(await response.json());
      } finally {
        clearTimeout(timer);
      }
    } catch {
      /* network / timeout → empty hour map */
    }
    return new Map();
  }

  private lookupHour(hourly: Map<string, WeatherSnapshot>, at: Date): WeatherSnapshot {
    return hourly.get(hourStamp(at)) ?? { ...CLEAR_WEATHER };
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
