import { featuredRoutes } from "@/data/generated/featured";
import type { TrainRoute } from "@/data/trainTypes";
import { computeLiveStatus, fmtMinutes } from "../../lib/liveStatus";
import { getTrainByNumber } from "../trains/store.server";
import { isSamplePnr } from "./samplePnrs";
import { syntheticPnrStatus } from "./syntheticPnr";
import type { PnrLookupResult, PnrSource, PnrStatus } from "./types";

export { syntheticPnrStatus } from "./syntheticPnr";

const RAILRADAR_PNR = "https://api.railradar.in/v1/pnr";

type BerthType = PnrStatus["passengers"][number]["berthType"];

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function stationFrom(value: unknown, fallbackCode: string, fallbackName: string) {
  if (typeof value === "string" && value.trim()) {
    return { code: value.trim().toUpperCase(), name: fallbackName || value.trim() };
  }
  const rec = asRecord(value);
  if (!rec) return { code: fallbackCode, name: fallbackName };
  return {
    code: asString(rec["code"] ?? rec["stationCode"], fallbackCode),
    name: asString(rec["name"] ?? rec["stationName"], fallbackName),
  };
}

const BERTH_TYPES: BerthType[] = ["Lower", "Middle", "Upper", "Side Lower", "Side Upper"];

const BERTH_CODE_MAP: Record<string, BerthType> = {
  LB: "Lower",
  MB: "Middle",
  UB: "Upper",
  SL: "Side Lower",
  SU: "Side Upper",
  WS: "Window",
  AS: "Aisle",
};

function mapBerthType(raw: string, berth: number): BerthType {
  if ((BERTH_TYPES as string[]).includes(raw)) return raw as BerthType;
  const coded = BERTH_CODE_MAP[raw.toUpperCase()];
  if (coded) return coded;
  return BERTH_TYPES[berth % BERTH_TYPES.length]!;
}

function mapPassenger(raw: unknown, index: number): PnrStatus["passengers"][number] {
  const rec = asRecord(raw) ?? {};
  const coach = asString(rec["coach"], "S1");
  const berth = asNumber(rec["berth"] ?? rec["berthNo"] ?? rec["berthNumber"], index + 1);
  const berthType = mapBerthType(asString(rec["berthType"] ?? rec["berthCode"]), berth);
  const bookingStatus = asString(rec["bookingStatus"], `CNF/${coach}/${berth}`);
  return {
    number: asNumber(rec["number"] ?? rec["passengerNumber"], index + 1),
    bookingStatus,
    currentStatus: asString(rec["currentStatus"], bookingStatus),
    coach,
    berth,
    berthType,
  };
}

function readTrainNumber(data: Record<string, unknown>): string {
  const flat = asString(data["trainNumber"] ?? data["trainNo"]);
  if (flat) return flat;
  const train = asRecord(data["train"]);
  return train ? asString(train["number"] ?? train["trainNumber"] ?? train["trainNo"]) : "";
}

function formatJourneyDate(raw: string, fallback: string): string {
  if (!raw) return fallback;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (!iso) return raw;
  const stamp = Date.parse(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00+05:30`);
  if (!Number.isFinite(stamp)) return raw;
  return new Date(stamp).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function chartIsPrepared(data: Record<string, unknown>): boolean {
  const charting = asRecord(data["charting"]);
  if (charting) {
    if (typeof charting["isPrepared"] === "boolean") return charting["isPrepared"];
    const status = asString(charting["status"]).toLowerCase();
    return status.includes("prepared") && !status.includes("not");
  }
  return Boolean(data["chartPrepared"] ?? data["chartStatus"] === "CHART PREPARED");
}

function withSource(status: PnrStatus, source: PnrSource): PnrStatus {
  return { ...status, source };
}

/** Map a RailRadar (or RailRadar-shaped) PNR payload onto `PnrStatus`. */
export function mapRailradarPnr(pnr: string, body: unknown): PnrStatus | null {
  const root = asRecord(body);
  if (!root) return null;
  const data = asRecord(root["data"]) ?? root;
  const trainNumber = readTrainNumber(data);
  if (!trainNumber) return null;

  const nestedTrain = asRecord(data["train"]);
  const journey = asRecord(data["journey"]);
  const train = safeTrainByNumber(trainNumber);
  const origin = train?.halts[0];
  const dest = train?.halts[train.halts.length - 1];
  const now = new Date();
  const live = train ? computeLiveStatus(train, now) : null;
  const defaultDate = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const passengersRaw = data["passengers"];
  const passengers = Array.isArray(passengersRaw)
    ? passengersRaw.map((row, i) => mapPassenger(row, i))
    : [];

  return {
    pnr,
    trainNumber,
    trainName: asString(data["trainName"] ?? nestedTrain?.["name"], train?.name ?? trainNumber),
    fromStation: stationFrom(
      data["sourceStation"] ?? data["fromStation"] ?? nestedTrain?.["source"],
      origin?.code ?? "",
      origin?.name ?? "",
    ),
    toStation: stationFrom(
      data["destinationStation"] ?? data["toStation"] ?? nestedTrain?.["destination"],
      dest?.code ?? "",
      dest?.name ?? "",
    ),
    boardingStation: stationFrom(
      data["boardingStation"] ?? nestedTrain?.["boardingPoint"],
      origin?.code ?? "",
      origin?.name ?? "",
    ),
    journeyDate: formatJourneyDate(
      asString(data["dateOfJourney"] ?? data["journeyDate"] ?? journey?.["date"]),
      defaultDate,
    ),
    bookingClass: asString(data["class"] ?? data["bookingClass"] ?? journey?.["class"], "SL"),
    quota: asString(data["quota"] ?? journey?.["quota"], "GN"),
    chartStatus: chartIsPrepared(data) ? "CHART PREPARED" : "CHART NOT PREPARED",
    passengers,
    fare: asNumber(data["fare"] ?? journey?.["bookingFare"] ?? journey?.["fare"], 0),
    liveStatus: {
      speed: live?.speed ?? 0,
      delay: live?.forecast?.delayMin ?? live?.delay ?? 0,
      nextStation: live?.nextHalt?.name ?? "",
      eta: live?.etaNext ?? (origin ? fmtMinutes(train!.startsAt) : "--:--"),
    },
    source: "railradar",
  };
}

function safeTrainByNumber(number: string): TrainRoute | undefined {
  const featured = featuredRoutes.find((route) => route.number === number);
  if (featured) return featured;
  try {
    return getTrainByNumber(number);
  } catch {
    return undefined;
  }
}

function vendorErrorMessage(body: unknown, status: number): string {
  const root = asRecord(body);
  const error = root ? asRecord(root["error"]) : null;
  const message = error ? asString(error["message"]) : "";
  if (message) return message;
  if (status === 404) return "PNR record not found.";
  if (status === 401) return "PNR lookup is unauthorized. Check the RailRadar key.";
  if (status === 429) return "PNR lookup is rate-limited. Try again later.";
  return `PNR lookup failed (${status}).`;
}

export async function fetchRailradarPnr(
  pnr: string,
  opts: { apiKey: string; fetchImpl: typeof fetch },
): Promise<{ mapped: PnrStatus | null; status: number; message: string }> {
  const url = `${RAILRADAR_PNR}/${encodeURIComponent(pnr)}`;
  const response = await opts.fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      Accept: "application/json",
    },
  });
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!response.ok) {
    return { mapped: null, status: response.status, message: vendorErrorMessage(body, response.status) };
  }
  const mapped = mapRailradarPnr(pnr, body);
  if (!mapped) {
    return { mapped: null, status: 502, message: "PNR response could not be mapped." };
  }
  return { mapped, status: 200, message: "" };
}

export type ResolvePnrOptions = {
  apiKey?: string;
  demo?: boolean;
  fetchImpl?: typeof fetch;
  skipNetwork?: boolean;
};

function envAllowsDemoFallback(): boolean {
  const raw = (process.env["DEMO_MODE"] ?? "").trim().toLowerCase();
  // Unset defaults to on so a hosted RailRadar key cannot kill the sample chips.
  if (raw === "") return true;
  return raw === "1" || raw === "true";
}

function allowDemoFallback(cleaned: string, demoMode: boolean): boolean {
  return demoMode || isSamplePnr(cleaned);
}

export async function lookupPnr(
  pnr: string,
  opts: ResolvePnrOptions = {},
): Promise<PnrLookupResult> {
  const cleaned = pnr.replace(/\D/g, "");
  if (cleaned.length !== 10) {
    return {
      ok: false,
      status: 400,
      message: "Invalid PNR format. PNR must be a 10-digit numeric string.",
    };
  }

  const apiKey = (opts.apiKey ?? process.env["RAILRADAR_API_KEY"] ?? "").trim();
  const demoMode = opts.demo ?? (envAllowsDemoFallback() || apiKey.length === 0);
  const skipNetwork = opts.skipNetwork ?? process.env["VITEST"] === "true";
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;

  if (apiKey && !skipNetwork) {
    try {
      const live = await fetchRailradarPnr(cleaned, { apiKey, fetchImpl });
      if (live.mapped) return { ok: true, data: live.mapped };
      if (!allowDemoFallback(cleaned, demoMode)) {
        return { ok: false, status: 404, message: live.message };
      }
    } catch {
      if (!allowDemoFallback(cleaned, demoMode)) {
        return { ok: false, status: 404, message: "PNR lookup failed." };
      }
    }
  }

  let demo: PnrStatus | null = null;
  try {
    demo = syntheticPnrStatus(cleaned);
  } catch {
    demo = null;
  }
  if (!demo) {
    return { ok: false, status: 404, message: "PNR record not found." };
  }
  return { ok: true, data: withSource(demo, "demo") };
}

export async function resolvePnrStatus(
  pnr: string,
  opts: ResolvePnrOptions = {},
): Promise<PnrStatus | null> {
  const result = await lookupPnr(pnr, opts);
  return result.ok ? result.data : null;
}
