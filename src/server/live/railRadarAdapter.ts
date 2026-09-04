import { getTrain } from "@/data/trains";
import type { TrainRoute } from "@/data/trainTypes";
import { interpolateSegment } from "./geometry";
import { parseLegacyDiversion, parseLegacyTrainToObservations } from "./parseLegacy";
import type { LiveFeedAdapter, TrainObservation } from "./types";

export const RAILRADAR_BASE = "https://api.railradar.in/v1";

export type RailRadarAdapterOptions = {
  apiKey?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  maxAttempts?: number;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  getRoute?: (trainNo: string) => TrainRoute | undefined;
};

export type RailRadarFetchResult = {
  observations: TrainObservation[];
  diverted: boolean;
  status: number;
  body: unknown;
};

function readApiKey(override?: string): string {
  if (override !== undefined) return override.trim();
  if (typeof process === "undefined" || !process.env) return "";
  return (process.env["RAILRADAR_API_KEY"] ?? "").trim();
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const STATION_ALIASES: Record<string, string> = {
  MMCT: "BCT",
  BCT: "MMCT",
};

function mappedHaltCode(route: TrainRoute, stationCode: string): string | null {
  if (route.halts.some((halt) => halt.code === stationCode)) return stationCode;
  const aliased = STATION_ALIASES[stationCode];
  if (aliased && route.halts.some((halt) => halt.code === aliased)) return aliased;
  return null;
}

function previousFeaturedIndex(
  route: TrainRoute,
  observations: TrainObservation[],
  row: TrainObservation,
): number {
  let best = 0;
  for (const other of observations) {
    if (other.sequence > row.sequence) continue;
    const mapped = mappedHaltCode(route, other.stationCode);
    if (!mapped) continue;
    const index = route.halts.findIndex((halt) => halt.code === mapped);
    if (index > best) best = index;
  }
  return best;
}

function attachGeometry(
  observations: TrainObservation[],
  getRoute: (trainNo: string) => TrainRoute | undefined,
): TrainObservation[] {
  return observations.map((row) => {
    if (row.lat !== undefined && row.lng !== undefined) return row;
    const route = getRoute(row.trainNo);
    if (!route || route.halts.length === 0) return row;
    const mapped = mappedHaltCode(route, row.stationCode);
    const progress = row.segmentProgress ?? 0;
    if (mapped) {
      const point = interpolateSegment(route, mapped, progress);
      if (!point) return row;
      return { ...row, lat: point.lat, lng: point.lng };
    }
    const fromIdx = previousFeaturedIndex(route, observations, row);
    const from = route.halts[fromIdx]!;
    const to = route.halts[fromIdx + 1] ?? from;
    return {
      ...row,
      lat: from.lat + (to.lat - from.lat) * progress,
      lng: from.lng + (to.lng - from.lng) * progress,
    };
  });
}

/**
 * Tier A — `GET /v1/legacy/trains/{number}?dataType=full`.
 * Key from `process.env.RAILRADAR_API_KEY` only. Never throws on a missing train.
 */
export class RailRadarAdapter implements LiveFeedAdapter {
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  private readonly maxAttempts: number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly now: () => number;
  private readonly getRoute: (trainNo: string) => TrainRoute | undefined;

  constructor(options: RailRadarAdapterOptions = {}) {
    this.apiKey = readApiKey(options.apiKey);
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
    this.timeoutMs = options.timeoutMs ?? 8_000;
    this.maxAttempts = Math.max(1, options.maxAttempts ?? 3);
    this.sleep = options.sleep ?? defaultSleep;
    this.now = options.now ?? (() => Date.now());
    this.getRoute = options.getRoute ?? ((trainNo) => getTrain(trainNo));
  }

  hasKey(): boolean {
    return this.apiKey.length > 0;
  }

  async fetchTrain(trainNo: string): Promise<TrainObservation[]> {
    const result = await this.fetchTrainDetailed(trainNo);
    return result.observations;
  }

  async fetchTrainDetailed(trainNo: string): Promise<RailRadarFetchResult> {
    if (!this.hasKey()) {
      return { observations: [], diverted: false, status: 0, body: null };
    }
    const url = `${RAILRADAR_BASE}/legacy/trains/${encodeURIComponent(trainNo)}?dataType=full`;
    let lastError: unknown;
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      try {
        const body = await this.fetchOnce(url);
        const receivedAt = this.now();
        const observations = attachGeometry(
          parseLegacyTrainToObservations(body, receivedAt, "railradar"),
          this.getRoute,
        );
        return {
          observations,
          diverted: parseLegacyDiversion(body),
          status: 200,
          body,
        };
      } catch (error) {
        lastError = error;
        if (attempt < this.maxAttempts - 1) {
          await this.sleep(200 * 2 ** attempt);
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error("railradar_fetch_failed");
  }

  private async fetchOnce(url: string): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`railradar_http_${response.status}`);
      }
      return (await response.json()) as unknown;
    } finally {
      clearTimeout(timer);
    }
  }
}
