import type { Halt, TrainRoute } from "@/data/trainTypes";

function halt(code: string, km: number, arr: number, lat: number, lng: number): Halt {
  return {
    code,
    name: code,
    lat,
    lng,
    km,
    arr,
    dep: arr + 2,
    platform: "1",
    day: 1,
    dayOfJourney: 1,
    coordSource: "lookup",
    speedToNextStationKmph: 80,
  };
}

const TEMPLATE_HALTS: Halt[] = [
  halt("AAA", 0, 0, 28.6, 77.2),
  halt("BBB", 40, 40, 27.9, 76.8),
  halt("CCC", 90, 90, 27.2, 76.4),
  halt("DDD", 140, 150, 26.5, 76.0),
];

/** Compact synthetic fleet for batch scoring benches. Halts are shared. */
export function syntheticFleet(
  count: number,
  startNumber: number = 10_000,
  now: Date = new Date(),
): TrainRoute[] {
  const n = Math.max(0, Math.trunc(count));
  const minutesNow = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const startsAt = minutesNow - 60;
  const out: TrainRoute[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      number: String(startNumber + i).padStart(5, "0"),
      name: "Bench Express",
      type: "Express",
      startsAt,
      runsOn: ["Daily"],
      zone: "NR",
      halts: TEMPLATE_HALTS,
    });
  }
  return out;
}
