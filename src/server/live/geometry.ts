import type { Halt, TrainRoute } from "@/data/trainTypes";

const EARTH_RADIUS_KM = 6371;
const MAX_SNAP_KM = 25;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Great-circle distance in kilometres.
 * @returns kilometres
 */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type Xy = { x: number; y: number };

function project(lat: number, lng: number, originLat: number): Xy {
  return {
    x: toRad(lng) * Math.cos(toRad(originLat)) * EARTH_RADIUS_KM,
    y: toRad(lat) * EARTH_RADIUS_KM,
  };
}

function unproject(point: Xy, originLat: number): { lat: number; lng: number } {
  return {
    lat: (point.y / EARTH_RADIUS_KM) * (180 / Math.PI),
    lng: (point.x / (Math.cos(toRad(originLat)) * EARTH_RADIUS_KM)) * (180 / Math.PI),
  };
}

function closestPointOnSegment(
  lat: number,
  lng: number,
  a: Halt,
  b: Halt,
): { lat: number; lng: number; t: number; distanceKm: number } {
  const originLat = (a.lat + b.lat) / 2;
  const p = project(lat, lng, originLat);
  const pa = project(a.lat, a.lng, originLat);
  const pb = project(b.lat, b.lng, originLat);
  const abx = pb.x - pa.x;
  const aby = pb.y - pa.y;
  const denom = abx * abx + aby * aby;
  const t =
    denom === 0 ? 0 : Math.min(1, Math.max(0, ((p.x - pa.x) * abx + (p.y - pa.y) * aby) / denom));
  const snapped = { x: pa.x + abx * t, y: pa.y + aby * t };
  const geo = unproject(snapped, originLat);
  return { ...geo, t, distanceKm: haversineKm(lat, lng, geo.lat, geo.lng) };
}

export type RouteSnap = {
  stationCode: string;
  sequence: number;
  segmentProgress: number;
  lat: number;
  lng: number;
  /** Distance from the raw fix to the snapped point, kilometres. */
  distanceKm: number;
};

/**
 * Snap a lat/lng to the nearest timetable section. Returns null when every
 * section is further than `maxKm` (default 25 km).
 */
export function snapToNearestSection(
  lat: number,
  lng: number,
  route: TrainRoute,
  maxKm: number = MAX_SNAP_KM,
): RouteSnap | null {
  const halts = route.halts;
  if (halts.length === 0) return null;
  let best: RouteSnap | null = null;
  for (let i = 0; i < halts.length; i++) {
    const from = halts[i]!;
    const to = halts[i + 1];
    if (!to) {
      const distanceKm = haversineKm(lat, lng, from.lat, from.lng);
      if (distanceKm <= maxKm && (!best || distanceKm < best.distanceKm)) {
        best = {
          stationCode: from.code,
          sequence: i + 1,
          segmentProgress: 1,
          lat: from.lat,
          lng: from.lng,
          distanceKm,
        };
      }
      continue;
    }
    const closest = closestPointOnSegment(lat, lng, from, to);
    if (closest.distanceKm > maxKm) continue;
    if (!best || closest.distanceKm < best.distanceKm) {
      best = {
        stationCode: from.code,
        sequence: i + 1,
        segmentProgress: closest.t,
        lat: closest.lat,
        lng: closest.lng,
        distanceKm: closest.distanceKm,
      };
    }
  }
  return best;
}

export type RoutePosition = {
  lat: number;
  lng: number;
  km: number;
  stationCode: string;
  sequence: number;
  segmentProgress: number;
};

/**
 * Interpolate a position along the published route.
 * @param elapsedMin minutes after origin departure
 */
export function positionAtElapsed(route: TrainRoute, elapsedMin: number): RoutePosition {
  const halts = route.halts;
  const dest = halts[halts.length - 1]!;
  const clamped = Math.min(Math.max(elapsedMin, 0), dest.arr);
  let lastIdx = 0;
  for (let i = 0; i < halts.length; i++) {
    if (halts[i]!.arr <= clamped) lastIdx = i;
  }
  const last = halts[lastIdx]!;
  const next = halts[lastIdx + 1];
  if (!next || clamped <= last.dep) {
    return {
      lat: last.lat,
      lng: last.lng,
      km: last.km,
      stationCode: last.code,
      sequence: lastIdx + 1,
      segmentProgress: 0,
    };
  }
  const span = next.arr - last.dep || 1;
  const t = Math.min(1, Math.max(0, (clamped - last.dep) / span));
  return {
    lat: last.lat + (next.lat - last.lat) * t,
    lng: last.lng + (next.lng - last.lng) * t,
    km: last.km + (next.km - last.km) * t,
    stationCode: last.code,
    sequence: lastIdx + 1,
    segmentProgress: t,
  };
}

/**
 * Map `segmentProgress` onto the section starting at `stationCode`.
 */
export function interpolateSegment(
  route: TrainRoute,
  stationCode: string,
  segmentProgress: number,
): { lat: number; lng: number } | null {
  const index = route.halts.findIndex((halt) => halt.code === stationCode);
  if (index < 0) return null;
  const from = route.halts[index]!;
  const to = route.halts[index + 1];
  const t = Math.min(1, Math.max(0, segmentProgress));
  if (!to) return { lat: from.lat, lng: from.lng };
  return {
    lat: from.lat + (to.lat - from.lat) * t,
    lng: from.lng + (to.lng - from.lng) * t,
  };
}
