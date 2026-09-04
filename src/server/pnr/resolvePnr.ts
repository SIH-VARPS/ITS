import { computeLiveStatus, fmtMinutes } from "../../lib/liveStatus";
import { getAllTrains, getTrainByNumber } from "../trains/store.server";
import type { PnrStatus } from "./types";

const RAILRADAR_PNR = "https://api.railradar.in/v1/pnr";

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
  const rec = asRecord(value);
  if (!rec) return { code: fallbackCode, name: fallbackName };
  return {
    code: asString(rec["code"] ?? rec["stationCode"], fallbackCode),
    name: asString(rec["name"] ?? rec["stationName"], fallbackName),
  };
}

const BERTH_TYPES: PnrStatus["passengers"][number]["berthType"][] = [
  "Lower",
  "Middle",
  "Upper",
  "Side Lower",
  "Side Upper",
];

function mapPassenger(raw: unknown, index: number): PnrStatus["passengers"][number] {
  const rec = asRecord(raw) ?? {};
  const coach = asString(rec["coach"], "S1");
  const berth = asNumber(rec["berth"] ?? rec["berthNo"], index + 1);
  const berthTypeRaw = asString(rec["berthType"]);
  const berthType = (BERTH_TYPES as string[]).includes(berthTypeRaw)
    ? (berthTypeRaw as PnrStatus["passengers"][number]["berthType"])
    : BERTH_TYPES[berth % BERTH_TYPES.length]!;
  const bookingStatus = asString(rec["bookingStatus"], `CNF/${coach}/${berth}`);
  return {
    number: asNumber(rec["number"], index + 1),
    bookingStatus,
    currentStatus: asString(rec["currentStatus"], bookingStatus),
    coach,
    berth,
    berthType,
  };
}

/** Map a RailRadar (or RailRadar-shaped) PNR payload onto `PnrStatus`. */
export function mapRailradarPnr(pnr: string, body: unknown): PnrStatus | null {
  const root = asRecord(body);
  if (!root) return null;
  const data = asRecord(root["data"]) ?? root;
  const trainNumber = asString(data["trainNumber"] ?? data["trainNo"]);
  if (!trainNumber) return null;

  const train = getTrainByNumber(trainNumber);
  const origin = train?.halts[0];
  const dest = train?.halts[train.halts.length - 1];
  const now = new Date();
  const live = train ? computeLiveStatus(train, now) : null;

  const passengersRaw = data["passengers"];
  const passengers = Array.isArray(passengersRaw)
    ? passengersRaw.map((row, i) => mapPassenger(row, i))
    : [];

  const chartPrepared = Boolean(data["chartPrepared"] ?? data["chartStatus"] === "CHART PREPARED");

  return {
    pnr,
    trainNumber,
    trainName: asString(data["trainName"], train?.name ?? trainNumber),
    fromStation: stationFrom(
      data["sourceStation"] ?? data["fromStation"],
      origin?.code ?? "",
      origin?.name ?? "",
    ),
    toStation: stationFrom(
      data["destinationStation"] ?? data["toStation"],
      dest?.code ?? "",
      dest?.name ?? "",
    ),
    boardingStation: stationFrom(data["boardingStation"], origin?.code ?? "", origin?.name ?? ""),
    journeyDate: asString(
      data["dateOfJourney"] ?? data["journeyDate"],
      now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    ),
    bookingClass: asString(data["class"] ?? data["bookingClass"], "SL"),
    quota: asString(data["quota"], "GN"),
    chartStatus: chartPrepared ? "CHART PREPARED" : "CHART NOT PREPARED",
    passengers,
    fare: asNumber(data["fare"], 0),
    liveStatus: {
      speed: live?.speed ?? 0,
      delay: live?.forecast?.delayMin ?? live?.delay ?? 0,
      nextStation: live?.nextHalt?.name ?? "",
      eta: live?.etaNext ?? (origin ? fmtMinutes(train!.startsAt) : "--:--"),
    },
  };
}

export function syntheticPnrStatus(pnr: string): PnrStatus | null {
  const cleaned = pnr.replace(/\D/g, "");
  if (cleaned.length !== 10) return null;

  let seed = 0;
  for (let i = 0; i < cleaned.length; i++) {
    seed = (seed * 31 + cleaned.charCodeAt(i)) % 100000;
  }

  const trains = getAllTrains();
  if (trains.length === 0) return null;
  const train = trains[seed % trains.length]!;
  const origin = train.halts[0]!;
  const dest = train.halts[train.halts.length - 1]!;
  const now = new Date();
  const live = computeLiveStatus(train, now);

  const classes = ["1A", "2A", "3A", "SL", "CC", "EC"];
  const bookingClass = classes[seed % classes.length]!;
  const passengerCount = (seed % 3) + 1;
  const coachPrefix =
    bookingClass === "SL" ? "S" : bookingClass === "3A" ? "B" : bookingClass === "2A" ? "A" : "H";
  const coachNum = (seed % 6) + 1;
  const coach = `${coachPrefix}${coachNum}`;

  const passengers: PnrStatus["passengers"] = [];
  for (let i = 1; i <= passengerCount; i++) {
    const berthNo = ((seed + i * 7) % 72) + 1;
    const bType = BERTH_TYPES[berthNo % BERTH_TYPES.length]!;
    passengers.push({
      number: i,
      bookingStatus: `CNF/${coach}/${berthNo}`,
      currentStatus: `CNF/${coach}/${berthNo}`,
      coach,
      berth: berthNo,
      berthType: bType,
    });
  }

  return {
    pnr: cleaned,
    trainNumber: train.number,
    trainName: train.name,
    fromStation: { code: origin.code, name: origin.name },
    toStation: { code: dest.code, name: dest.name },
    boardingStation: { code: origin.code, name: origin.name },
    journeyDate: now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    bookingClass,
    quota: "GN",
    chartStatus: seed % 3 === 0 ? "CHART NOT PREPARED" : "CHART PREPARED",
    passengers,
    fare: 500 + (seed % 40) * 50,
    liveStatus: {
      speed: live.speed,
      delay: live.forecast?.delayMin ?? live.delay,
      nextStation: live.nextHalt?.name ?? dest.name,
      eta: live.etaNext,
    },
  };
}

export async function fetchRailradarPnr(
  pnr: string,
  opts: { apiKey: string; fetchImpl: typeof fetch },
): Promise<PnrStatus | null> {
  const url = `${RAILRADAR_PNR}/${encodeURIComponent(pnr)}`;
  const response = await opts.fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) return null;
  const body: unknown = await response.json();
  return mapRailradarPnr(pnr, body);
}

export async function resolvePnrStatus(
  pnr: string,
  opts: {
    apiKey?: string;
    demo?: boolean;
    fetchImpl?: typeof fetch;
    skipNetwork?: boolean;
  } = {},
): Promise<PnrStatus | null> {
  const cleaned = pnr.replace(/\D/g, "");
  if (cleaned.length !== 10) return null;

  const apiKey = (opts.apiKey ?? process.env["RAILRADAR_API_KEY"] ?? "").trim();
  const envDemo = process.env["DEMO_MODE"] === "1" || process.env["DEMO_MODE"] === "true";
  const demoMode = opts.demo ?? (envDemo || apiKey.length === 0);
  const skipNetwork = opts.skipNetwork ?? process.env["VITEST"] === "true";
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;

  if (apiKey && !skipNetwork) {
    try {
      const live = await fetchRailradarPnr(cleaned, { apiKey, fetchImpl });
      if (live) return live;
    } catch {
      // fall through to demo when allowed
    }
    if (!demoMode) return null;
  }

  return syntheticPnrStatus(cleaned);
}
