export type CoordSource = "lookup" | "interpolated" | "override";

export type Halt = {
  code: string;
  name: string;
  /** WGS84 latitude, decimal degrees */
  lat: number;
  /** WGS84 longitude, decimal degrees */
  lng: number;
  /** route distance from origin, kilometres */
  km: number;
  /** scheduled arrival, minutes after origin departure */
  arr: number;
  /** scheduled departure, minutes after origin departure */
  dep: number;
  platform: string;
  /**
   * 1-based journey day derived from elapsed minutes (`floor(arr / 1440) + 1`).
   * Day 1 is the origin-departure calendar day.
   */
  day: number;
  /** Alias of `day` — explicit name for multi-day journeys. */
  dayOfJourney: number;
  coordSource: CoordSource;
  /** published or enriched speed to the next halt, km/h */
  speedToNextStationKmph?: number;
};

export type TrainRoute = {
  number: string;
  name: string;
  type: string;
  /** origin departure time, minutes after midnight */
  startsAt: number;
  runsOn: string[];
  zone: string;
  halts: Halt[];
};

export type TrainSummary = {
  number: string;
  name: string;
  type: string;
  zone: string;
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
};

export type Section = {
  fromCode: string;
  toCode: string;
  /** kilometres along the timetable (median across trains on this pair) */
  distanceKm: number;
  /** median scheduled run, minutes */
  scheduledRunMin: number;
  trainCount: number;
  /** 50th percentile scheduled run, minutes */
  p50RunMin: number;
  /** 80th percentile scheduled run, minutes */
  p80RunMin: number;
};
