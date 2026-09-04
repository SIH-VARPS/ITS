/** IST offset from UTC, milliseconds. */
export const IST_OFFSET_MS = 330 * 60 * 1000;

export type IstParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  dayOfWeek: number;
};

/**
 * Calendar parts in Asia/Kolkata, derived from an absolute instant.
 * Uses a UTC shift so the result does not depend on the host timezone.
 */
export function istParts(at: Date): IstParts {
  const shifted = new Date(at.getTime() + IST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    dayOfWeek: shifted.getUTCDay(),
  };
}

/** Indian meteorological season: 1 winter, 2 pre-monsoon, 3 monsoon, 4 post-monsoon. */
export function indianSeason(month: number): 1 | 2 | 3 | 4 {
  if (month === 12 || month === 1 || month === 2) return 1;
  if (month >= 3 && month <= 5) return 2;
  if (month >= 6 && month <= 9) return 3;
  return 4;
}

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** UTC epoch ms of 00:00 IST on `runDate` (`YYYY-MM-DD`). */
export function istMidnightUtcMs(runDate: string): number {
  const [year, month, day] = runDate.split("-").map((part) => Number(part));
  return Date.UTC(year ?? 2026, (month ?? 1) - 1, day ?? 1, 0, 0, 0) - IST_OFFSET_MS;
}

/** Station-hour cache key, e.g. `NDLS:2026-03-15T10`. */
export function stationHourKey(stationCode: string, at: Date): string {
  const parts = istParts(at);
  return `${stationCode.toUpperCase()}:${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}T${pad2(parts.hour)}`;
}
