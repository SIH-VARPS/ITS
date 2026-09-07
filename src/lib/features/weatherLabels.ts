import type { WeatherSnapshot } from "./weather";

export type WeatherKind = "clear" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "storm";

export type WeatherCopy = {
  kind: WeatherKind;
  /** Short chip text, e.g. "Sky clear". */
  label: string;
  /** Sentence for the card, e.g. "Sky is clear". */
  headline: string;
  details: string[];
};

const KIND_BY_CODE: Array<{ max: number; kind: WeatherKind; label: string; headline: string }> = [
  { max: 0, kind: "clear", label: "Sky clear", headline: "Sky is clear" },
  { max: 1, kind: "clear", label: "Mostly clear", headline: "Sky is mostly clear" },
  { max: 2, kind: "cloudy", label: "Partly cloudy", headline: "Sky is partly cloudy" },
  { max: 3, kind: "cloudy", label: "Overcast", headline: "Sky is overcast" },
  { max: 48, kind: "fog", label: "Fog", headline: "Foggy at the next halt" },
  { max: 57, kind: "drizzle", label: "Drizzle", headline: "Light drizzle ahead" },
  { max: 67, kind: "rain", label: "Rain", headline: "Rain at the next halt" },
  { max: 77, kind: "snow", label: "Snow", headline: "Snow at the next halt" },
  { max: 82, kind: "rain", label: "Rain showers", headline: "Rain showers ahead" },
  { max: 86, kind: "snow", label: "Snow showers", headline: "Snow showers ahead" },
  { max: 99, kind: "storm", label: "Thunderstorm", headline: "Thunderstorm ahead" },
];

function bucket(code: number): (typeof KIND_BY_CODE)[number] {
  const safe = Number.isFinite(code) ? Math.max(0, Math.round(code)) : 0;
  for (const row of KIND_BY_CODE) {
    if (safe <= row.max) return row;
  }
  return KIND_BY_CODE[KIND_BY_CODE.length - 1]!;
}

/** WMO 0–1 and 45+ rain/fog names used on passenger screens. */
export function describeWmoCode(code: number): Pick<WeatherCopy, "kind" | "label" | "headline"> {
  const row = bucket(code);
  if (code === 61 || code === 63 || code === 65) {
    const intensity = code === 61 ? "Light rain" : code === 63 ? "Moderate rain" : "Heavy rain";
    return { kind: "rain", label: intensity, headline: `${intensity} at the next halt` };
  }
  if (code === 45 || code === 48) {
    return { kind: "fog", label: "Fog", headline: "Foggy at the next halt" };
  }
  return { kind: row.kind, label: row.label, headline: row.headline };
}

export function describeWeather(
  snapshot: Pick<WeatherSnapshot, "weatherCode"> &
    Partial<Pick<WeatherSnapshot, "precipitationMm" | "visibilityKm" | "windSpeedKmph">>,
): WeatherCopy {
  const base = describeWmoCode(snapshot.weatherCode);
  const details: string[] = [];
  const rain = snapshot.precipitationMm ?? 0;
  const vis = snapshot.visibilityKm ?? 0;
  const wind = snapshot.windSpeedKmph ?? 0;
  if (rain > 0) details.push(`${trimNumber(rain)} mm rain`);
  if (vis > 0) details.push(`Visibility ${trimNumber(vis)} km`);
  if (wind > 0) details.push(`Wind ${Math.round(wind)} km/h`);
  return { ...base, details };
}

export function weatherFromFeatures(
  features: ReadonlyArray<{ name: string; value: number }>,
): WeatherSnapshot {
  const read = (name: string): number => {
    const hit = features.find((row) => row.name === name);
    return hit && Number.isFinite(hit.value) ? hit.value : 0;
  };
  return {
    weatherCode: Math.max(0, Math.round(read("weatherCode"))),
    precipitationMm: Math.max(0, read("precipitationMm")),
    visibilityKm: Math.max(0, read("visibilityKm")),
    windSpeedKmph: Math.max(0, read("windSpeedKmph")),
  };
}

export function humanWeatherFeature(name: string, value: number): { label: string; text: string } | null {
  if (name === "weatherCode") {
    return { label: "Sky", text: describeWmoCode(value).label };
  }
  if (name === "precipitationMm") {
    return { label: "Rain", text: value > 0 ? `${trimNumber(value)} mm` : "None" };
  }
  if (name === "visibilityKm") {
    return { label: "Visibility", text: value > 0 ? `${trimNumber(value)} km` : "—" };
  }
  if (name === "windSpeedKmph") {
    return { label: "Wind", text: `${Math.round(value)} km/h` };
  }
  return null;
}

function trimNumber(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
