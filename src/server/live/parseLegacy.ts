import type { ObservationSource, TrainObservation } from "./types";

/** IST offset from UTC, minutes. */
export const IST_OFFSET_MIN = 330;

const CLOCK_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
const RUN_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type LegacyHalt = {
  stationCode: string;
  sequence: number;
  scheduledArrival: unknown;
  scheduledDeparture: unknown;
  actualArrival: unknown;
  actualDeparture: unknown;
  delayMinutes: number | null;
  lat: number | null;
  lng: number | null;
};

type LegacyLiveLocation = {
  stationCode: string;
  segmentProgress: number | null;
  lat: number | null;
  lng: number | null;
  status: string | null;
};

type LegacyPayload = {
  trainNumber: string;
  route: LegacyHalt[];
  liveData: {
    journeyDate: string | null;
    lastUpdatedAt: string | null;
    overallDelayMinutes: number | null;
    currentLocation: LegacyLiveLocation | null;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Parse a RailRadar clock to minutes after midnight IST.
 * Accepts `HH:MM` / `HH:MM:SS`, ISO-8601 with offset, or a numeric minute-of-day.
 * @returns minutes after midnight IST, or `null` when the clock is missing/invalid
 */
export function clockToMin(clock: unknown): number | null {
  if (typeof clock === "number" && Number.isFinite(clock)) {
    const minutes = Math.trunc(clock);
    if (minutes < 0) return null;
    return ((minutes % 1440) + 1440) % 1440;
  }
  const raw = asString(clock);
  if (!raw) return null;
  const isoEpochMs = isoToEpochMs(raw);
  if (isoEpochMs !== null) return epochMsToMinAfterMidnightIst(isoEpochMs);
  const match = CLOCK_RE.exec(raw);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Parse an ISO-8601 timestamp with an explicit offset (e.g. `+05:30`) to epoch ms.
 * @returns epoch milliseconds, or `null` when the stamp cannot be parsed
 */
export function isoToEpochMs(iso: unknown): number | null {
  const raw = asString(iso);
  if (!raw) return null;
  const epochMs = Date.parse(raw);
  return Number.isFinite(epochMs) ? epochMs : null;
}

/**
 * Convert epoch milliseconds to minutes after midnight in IST.
 * @param epochMs wall-clock instant, epoch milliseconds
 */
export function epochMsToMinAfterMidnightIst(epochMs: number): number {
  const istAsUtc = new Date(epochMs + IST_OFFSET_MIN * 60 * 1000);
  return istAsUtc.getUTCHours() * 60 + istAsUtc.getUTCMinutes();
}

/**
 * Calendar date in IST for an absolute instant.
 * @param epochMs wall-clock instant, epoch milliseconds
 * @returns `YYYY-MM-DD` in IST
 */
export function istRunDate(epochMs: number): string {
  return new Date(epochMs + IST_OFFSET_MIN * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * Signed delay in minutes, wrapping across midnight. Returns `null` rather
 * than `NaN` when either clock is missing.
 * @param scheduledMin minutes after midnight IST
 * @param actualMin minutes after midnight IST
 */
export function delayMinFromPair(
  scheduledMin: number | null,
  actualMin: number | null,
): number | null {
  if (scheduledMin === null || actualMin === null) return null;
  if (!Number.isFinite(scheduledMin) || !Number.isFinite(actualMin)) return null;
  let delayMin = actualMin - scheduledMin;
  if (delayMin < -720) delayMin += 1440;
  if (delayMin > 720) delayMin -= 1440;
  return delayMin;
}

function unwrapPayload(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  if (isRecord(value["data"])) return value["data"];
  return value;
}

function parseHalt(value: unknown): LegacyHalt | null {
  if (!isRecord(value)) return null;
  const stationCode = asString(value["stationCode"]);
  const sequence = asFiniteNumber(value["sequence"]);
  if (!stationCode || sequence === null || sequence < 1) return null;
  return {
    stationCode,
    sequence: Math.trunc(sequence),
    scheduledArrival: value["scheduledArrival"] ?? null,
    scheduledDeparture: value["scheduledDeparture"] ?? null,
    actualArrival: value["actualArrival"] ?? null,
    actualDeparture: value["actualDeparture"] ?? null,
    delayMinutes:
      asFiniteNumber(value["delayMinutes"]) ??
      asFiniteNumber(value["delayArrivalMinutes"]) ??
      asFiniteNumber(value["delayDepartureMinutes"]),
    lat: asFiniteNumber(value["lat"]),
    lng: asFiniteNumber(value["lng"]),
  };
}

function parseLiveLocation(value: unknown): LegacyLiveLocation | null {
  if (!isRecord(value)) return null;
  const stationCode = asString(value["stationCode"]);
  if (!stationCode) return null;
  return {
    stationCode,
    segmentProgress: asFiniteNumber(value["segmentProgress"]),
    lat: asFiniteNumber(value["lat"]),
    lng: asFiniteNumber(value["lng"]),
    status: asString(value["status"]),
  };
}

/**
 * True when the vendor payload reports a diversion / reroute.
 * Encoded here rather than on {@link TrainObservation} (frozen contract).
 */
export function parseLegacyDiversion(payload: unknown): boolean {
  const root = unwrapPayload(payload);
  if (!root) return false;
  const liveRaw = isRecord(root["liveData"]) ? root["liveData"] : root;
  return isDivertedFlag(liveRaw["exceptionInfo"] ?? root["exceptionInfo"]);
}

function isDivertedFlag(value: unknown): boolean {
  if (value == null || value === false) return false;
  if (value === true) return true;
  if (typeof value === "string") return /divert|diversion/i.test(value);
  if (Array.isArray(value)) return value.some(isDivertedFlag);
  if (!isRecord(value)) return false;
  if (value["diverted"] === true || value["isDiverted"] === true) return true;
  const type =
    asString(value["type"]) ?? asString(value["code"]) ?? asString(value["exceptionType"]);
  return type !== null && /divert|diversion/i.test(type);
}

function parsePayload(value: unknown): LegacyPayload | null {
  const root = unwrapPayload(value);
  if (!root) return null;
  const trainObj = isRecord(root["train"]) ? root["train"] : null;
  const trainNumber =
    asString(root["trainNumber"]) ??
    asString(root["trainNo"]) ??
    (trainObj ? (asString(trainObj["trainNumber"]) ?? asString(trainObj["number"])) : null);
  if (!trainNumber) return null;
  const liveRaw = isRecord(root["liveData"]) ? root["liveData"] : {};
  const liveRoute = liveRaw["route"];
  const timetableRoute = root["route"];
  const routeRaw =
    Array.isArray(liveRoute) && liveRoute.length > 0
      ? liveRoute
      : Array.isArray(timetableRoute)
        ? timetableRoute
        : [];
  const route = routeRaw.map(parseHalt).filter((halt): halt is LegacyHalt => halt !== null);
  const journeyDate = asString(liveRaw["journeyDate"]);
  return {
    trainNumber,
    route,
    liveData: {
      journeyDate: journeyDate && RUN_DATE_RE.test(journeyDate) ? journeyDate : null,
      lastUpdatedAt: asString(liveRaw["lastUpdatedAt"]),
      overallDelayMinutes: asFiniteNumber(liveRaw["overallDelayMinutes"]),
      currentLocation: parseLiveLocation(liveRaw["currentLocation"]),
    },
  };
}

function optionalCoord(
  lat: number | null,
  lng: number | null,
): Pick<TrainObservation, "lat" | "lng"> {
  return {
    ...(lat !== null ? { lat } : {}),
    ...(lng !== null ? { lng } : {}),
  };
}

function pushEvent(
  out: TrainObservation[],
  base: Omit<TrainObservation, "eventType" | "scheduledMin" | "actualMin" | "delayMin">,
  eventType: TrainObservation["eventType"],
  scheduledClock: unknown,
  actualClock: unknown,
): void {
  const scheduledMin = clockToMin(scheduledClock);
  const actualMin = clockToMin(actualClock);
  const delayMin = delayMinFromPair(scheduledMin, actualMin);
  if (scheduledMin === null || actualMin === null || delayMin === null) return;
  out.push({
    ...base,
    eventType,
    scheduledMin,
    actualMin,
    delayMin,
  });
}

/**
 * Normalise a RailRadar `GET /v1/legacy/trains/{n}?dataType=full` payload
 * into {@link TrainObservation} rows. Null actuals are skipped (never `NaN`).
 *
 * @param payload raw vendor JSON (or the checked-in fixture)
 * @param receivedAt epoch milliseconds the payload was received
 * @param source which adapter produced this payload
 */
export function parseLegacyTrainToObservations(
  payload: unknown,
  receivedAt: number = Date.now(),
  source: ObservationSource = "railradar",
): TrainObservation[] {
  const parsed = parsePayload(payload);
  if (!parsed) return [];

  const lastUpdatedAt = isoToEpochMs(parsed.liveData.lastUpdatedAt);
  const runDate = parsed.liveData.journeyDate ?? istRunDate(lastUpdatedAt ?? receivedAt);

  const observations: TrainObservation[] = [];

  for (const halt of parsed.route) {
    const base = {
      trainNo: parsed.trainNumber,
      runDate,
      stationCode: halt.stationCode,
      sequence: halt.sequence,
      source,
      receivedAt,
      ...optionalCoord(halt.lat, halt.lng),
    };
    pushEvent(observations, base, "ARR", halt.scheduledArrival, halt.actualArrival);
    pushEvent(observations, base, "DEP", halt.scheduledDeparture, halt.actualDeparture);
  }

  const gps = parsed.liveData.currentLocation;
  if (gps) {
    const gpsEpoch = lastUpdatedAt ?? receivedAt;
    const actualMin = epochMsToMinAfterMidnightIst(gpsEpoch);
    const delayMin = parsed.liveData.overallDelayMinutes ?? 0;
    const matchingHalt = parsed.route.find((halt) => halt.stationCode === gps.stationCode);
    const scheduledMin =
      clockToMin(matchingHalt?.scheduledDeparture) ??
      clockToMin(matchingHalt?.scheduledArrival) ??
      actualMin - delayMin;
    const wrappedScheduled = ((scheduledMin % 1440) + 1440) % 1440;
    const gpsDelay = delayMinFromPair(wrappedScheduled, actualMin) ?? delayMin;
    const status = gps.status?.toLowerCase() ?? "";
    const inferredProgress =
      gps.segmentProgress !== null
        ? gps.segmentProgress
        : status === "departed" || status === "running"
          ? 0
          : status === "arrived" || status === "at_station" || status === "halted"
            ? 1
            : null;
    const clampedProgress =
      inferredProgress !== null ? Math.min(1, Math.max(0, inferredProgress)) : null;
    if (Number.isFinite(gpsDelay)) {
      observations.push({
        trainNo: parsed.trainNumber,
        runDate,
        stationCode: gps.stationCode,
        sequence: matchingHalt?.sequence ?? Math.max(1, parsed.route.length),
        eventType: "GPS",
        scheduledMin: wrappedScheduled,
        actualMin,
        delayMin: gpsDelay,
        source,
        receivedAt,
        ...(clampedProgress !== null ? { segmentProgress: clampedProgress } : {}),
        ...optionalCoord(gps.lat, gps.lng),
      });
    }
  }

  return observations;
}
