import { featuredRoutes } from "@/data/generated/featured";
import type { TrainRoute } from "@/data/trainTypes";
import { computeLiveStatus } from "../../lib/liveStatus";
import type { PnrStatus } from "./types";

const BERTH_TYPES: PnrStatus["passengers"][number]["berthType"][] = [
  "Lower",
  "Middle",
  "Upper",
  "Side Lower",
  "Side Upper",
];

/** Last resort when featured routes fail to bundle (should not happen on Vercel). */
const FALLBACK_DEMO_TRAIN: TrainRoute = {
  number: "12951",
  name: "Mumbai Rajdhani",
  type: "Rajdhani",
  startsAt: 16 * 60 + 35,
  runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  zone: "NR",
  halts: [
    {
      code: "NDLS",
      name: "New Delhi",
      lat: 28.642,
      lng: 77.22,
      km: 0,
      arr: 0,
      dep: 0,
      platform: "1",
      day: 1,
      dayOfJourney: 1,
      coordSource: "lookup",
    },
    {
      code: "MMCT",
      name: "Mumbai Central",
      lat: 18.969,
      lng: 72.819,
      km: 1384,
      arr: 960,
      dep: 960,
      platform: "1",
      day: 2,
      dayOfJourney: 2,
      coordSource: "lookup",
    },
  ],
};

function trainsForDemo(): TrainRoute[] {
  return featuredRoutes.length > 0 ? featuredRoutes : [FALLBACK_DEMO_TRAIN];
}

function liveOrEmpty(train: TrainRoute, now: Date): PnrStatus["liveStatus"] {
  try {
    const live = computeLiveStatus(train, now);
    return {
      speed: live.speed,
      delay: live.forecast?.delayMin ?? live.delay,
      nextStation: live.nextHalt?.name ?? train.halts[train.halts.length - 1]!.name,
      eta: live.etaNext,
    };
  } catch {
    return { speed: 0, delay: 0, nextStation: "", eta: "--:--" };
  }
}

/** Deterministic demo ticket from bundled featured trains — no shard filesystem. */
export function syntheticPnrStatus(pnr: string): PnrStatus | null {
  const cleaned = pnr.replace(/\D/g, "");
  if (cleaned.length !== 10) return null;

  let seed = 0;
  for (let i = 0; i < cleaned.length; i++) {
    seed = (seed * 31 + cleaned.charCodeAt(i)) % 100000;
  }

  const trains = trainsForDemo();
  const train = trains[seed % trains.length]!;
  const origin = train.halts[0]!;
  const dest = train.halts[train.halts.length - 1]!;
  const now = new Date();

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
    liveStatus: liveOrEmpty(train, now),
    source: "demo",
  };
}
