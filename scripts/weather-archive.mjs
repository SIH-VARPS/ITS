/**
 * Open-Meteo Archive join for harvested training rows.
 * No API key. Live forecast serving stays in src/lib/features/weather.ts.
 */
const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const HOURLY_VARS = "weather_code,precipitation,visibility,wind_speed_10m";
const IST_OFFSET_MS = 330 * 60 * 1000;

export const CLEAR_WEATHER = {
  weatherCode: 0,
  precipitationMm: 0,
  visibilityKm: 0,
  windSpeedKmph: 0,
};

export function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asFiniteNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** Coerce a raw `weatherByHalt` slot (legacy WMO number or snapshot object). */
export function normalizeHaltWeather(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return { ...CLEAR_WEATHER, weatherCode: Math.max(0, Math.round(value)) };
  }
  if (isRecord(value)) {
    const code = asFiniteNumber(value.weatherCode);
    const precip = asFiniteNumber(value.precipitationMm);
    const vis = asFiniteNumber(value.visibilityKm);
    const wind = asFiniteNumber(value.windSpeedKmph);
    return {
      weatherCode: code === null ? 0 : Math.max(0, Math.round(code)),
      precipitationMm: precip === null ? 0 : Math.max(0, precip),
      visibilityKm: vis === null ? 0 : Math.max(0, vis),
      windSpeedKmph: wind === null ? 0 : Math.max(0, wind),
    };
  }
  return { ...CLEAR_WEATHER };
}

export function parseHourlySnapshots(payload) {
  const out = new Map();
  if (!isRecord(payload)) return out;
  const hourly = payload.hourly;
  if (!isRecord(hourly)) return out;
  const times = Array.isArray(hourly.time) ? hourly.time : [];
  const codes = Array.isArray(hourly.weather_code) ? hourly.weather_code : [];
  const precip = Array.isArray(hourly.precipitation) ? hourly.precipitation : [];
  const visibility = Array.isArray(hourly.visibility) ? hourly.visibility : [];
  const wind = Array.isArray(hourly.wind_speed_10m) ? hourly.wind_speed_10m : [];
  for (let i = 0; i < times.length; i++) {
    const stamp = times[i];
    if (typeof stamp !== "string") continue;
    const code = asFiniteNumber(codes[i]);
    const visM = asFiniteNumber(visibility[i]);
    if (code === null && precip[i] == null && visibility[i] == null && wind[i] == null) continue;
    const hour = stamp.length >= 13 ? stamp.slice(0, 13) : stamp;
    out.set(hour, {
      weatherCode: code === null ? 0 : Math.max(0, Math.round(code)),
      precipitationMm: Math.max(0, asFiniteNumber(precip[i]) ?? 0),
      visibilityKm: visM === null ? 0 : Math.max(0, visM / 1000),
      windSpeedKmph: Math.max(0, asFiniteNumber(wind[i]) ?? 0),
    });
  }
  return out;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

export function istMidnightUtcMs(runDate) {
  const [year, month, day] = String(runDate)
    .split("-")
    .map((part) => Number(part));
  return Date.UTC(year ?? 2026, (month ?? 1) - 1, day ?? 1, 0, 0, 0) - IST_OFFSET_MS;
}

/** Observed halt instant: runDate midnight IST + startsAt + dep + delay. */
export function haltInstant(run, haltIndex) {
  const halt = run.halts?.[haltIndex];
  if (!halt) return new Date(istMidnightUtcMs(run.runDate));
  const extra = Number(halt.dep || 0) + Number(halt.delayMin || 0);
  return new Date(istMidnightUtcMs(run.runDate) + (Number(run.startsAt || 0) + extra) * 60 * 1000);
}

function istParts(at) {
  const shifted = new Date(at.getTime() + IST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
  };
}

function hourStamp(at) {
  const parts = istParts(at);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}T${pad2(parts.hour)}`;
}

function istDate(at) {
  const parts = istParts(at);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

function weatherUrl(base, lat, lng, date) {
  return (
    `${base}?latitude=${encodeURIComponent(String(lat))}` +
    `&longitude=${encodeURIComponent(String(lng))}` +
    `&hourly=${HOURLY_VARS}&timezone=Asia%2FKolkata` +
    `&start_date=${date}&end_date=${date}`
  );
}

function coordKey(lat, lng, date) {
  return `${Number(lat).toFixed(3)},${Number(lng).toFixed(3)}:${date}`;
}

export class ArchiveWeatherClient {
  constructor(options = {}) {
    this.fetchImpl = options.fetchImpl ?? defaultFetch;
    this.timeoutMs = options.timeoutMs ?? 8_000;
    this.offline = options.offline === true;
    /** @type {Map<string, Map<string, object>>} */
    this.hourlyByCoordDay = new Map();
    this.inflight = new Map();
    this.fetchCalls = 0;
    this.lastFetchUrl = "";
  }

  async weatherAt(lat, lng, at) {
    if (this.offline) {
      return { snapshot: { ...CLEAR_WEATHER }, source: "unavailable" };
    }
    const date = istDate(at);
    const key = coordKey(lat, lng, date);
    const cached = this.hourlyByCoordDay.get(key);
    if (cached) {
      return { snapshot: cached.get(hourStamp(at)) ?? { ...CLEAR_WEATHER }, source: "cache" };
    }
    const pending = this.inflight.get(key);
    if (pending) {
      const hourly = await pending;
      return { snapshot: hourly.get(hourStamp(at)) ?? { ...CLEAR_WEATHER }, source: "cache" };
    }
    const job = this.fetchCoordDay(lat, lng, date, key);
    this.inflight.set(key, job);
    try {
      const hourly = await job;
      const snapshot = hourly.get(hourStamp(at)) ?? { ...CLEAR_WEATHER };
      const source = hourly.size > 0 ? this.lastSource : "unavailable";
      return { snapshot, source };
    } finally {
      this.inflight.delete(key);
    }
  }

  async fetchCoordDay(lat, lng, date, key) {
    let hourly = await this.fetchHourly(ARCHIVE_URL, lat, lng, date);
    this.lastSource = hourly.size > 0 ? "archive" : "unavailable";
    if (hourly.size === 0) {
      hourly = await this.fetchHourly(FORECAST_URL, lat, lng, date);
      this.lastSource = hourly.size > 0 ? "forecast" : "unavailable";
    }
    this.hourlyByCoordDay.set(key, hourly);
    return hourly;
  }

  async fetchHourly(base, lat, lng, date) {
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
      /* network / timeout */
    }
    return new Map();
  }
}

async function defaultFetch(input, init) {
  const response = await fetch(input, init?.signal ? { signal: init.signal } : {});
  return {
    ok: response.ok,
    json: () => response.json(),
  };
}

/**
 * Replace `weatherByHalt` on railradar rows with Archive snapshots.
 * Synthetic rows are left untouched (they keep `weatherProvenance: "synthetic"`).
 */
export async function attachArchiveWeather(runs, options = {}) {
  const offline =
    options.offline === true ||
    (options.fetchImpl === undefined &&
      (process.env.WEATHER_OFFLINE === "1" || process.env.VITEST === "true"));
  const client =
    options.client ??
    new ArchiveWeatherClient({
      fetchImpl: options.fetchImpl,
      timeoutMs: options.timeoutMs,
      offline,
    });
  for (const run of runs) {
    if (run.provenance !== "railradar") continue;
    const snaps = [];
    let anyReal = false;
    for (let i = 0; i < run.halts.length; i++) {
      const halt = run.halts[i];
      const at = haltInstant(run, i);
      const looked = await client.weatherAt(halt.lat, halt.lng, at);
      snaps.push(looked.snapshot);
      if (looked.source === "archive" || looked.source === "forecast") anyReal = true;
    }
    run.weatherByHalt = snaps;
    run.weatherProvenance = anyReal ? "open-meteo-archive" : "unavailable";
  }
  return runs;
}
