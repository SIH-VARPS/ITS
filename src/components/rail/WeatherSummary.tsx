import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  describeWeather,
  weatherFromFeatures,
  type WeatherKind,
} from "@/lib/features/weatherLabels";
import type { WeatherSnapshot } from "@/lib/features/weather";

const KIND_ICON: Record<WeatherKind, LucideIcon> = {
  clear: Sun,
  cloudy: Cloud,
  fog: CloudFog,
  drizzle: CloudRain,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};

const KIND_TONE: Record<WeatherKind, string> = {
  clear: "border-amber-500/25 bg-amber-500/10 text-amber-950 dark:text-amber-100",
  cloudy: "border-slate-400/30 bg-slate-500/10 text-slate-900 dark:text-slate-100",
  fog: "border-slate-400/40 bg-slate-400/15 text-slate-900 dark:text-slate-100",
  drizzle: "border-sky-500/30 bg-sky-500/10 text-sky-950 dark:text-sky-100",
  rain: "border-sky-500/35 bg-sky-500/15 text-sky-950 dark:text-sky-50",
  snow: "border-cyan-500/30 bg-cyan-500/10 text-cyan-950 dark:text-cyan-50",
  storm: "border-violet-500/35 bg-violet-500/15 text-violet-950 dark:text-violet-50",
};

export function WeatherSummary({
  snapshot,
  features,
  stationName,
}: {
  snapshot?: WeatherSnapshot;
  features?: ReadonlyArray<{ name: string; value: number }>;
  stationName?: string;
}) {
  const weather = snapshot ?? (features ? weatherFromFeatures(features) : null);
  if (!weather) return null;
  const copy = describeWeather(weather);
  const Icon = KIND_ICON[copy.kind];
  const where = stationName ? ` at ${stationName}` : " at the next halt";
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3",
        KIND_TONE[copy.kind],
      )}
      data-testid="weather-summary"
      data-weather-kind={copy.kind}
      data-weather-label={copy.label}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-wide uppercase opacity-80">
          Weather{where}
        </p>
        <p className="mt-0.5 text-sm font-semibold">{copy.headline}</p>
        {copy.details.length > 0 ? (
          <p className="mt-0.5 text-xs opacity-80">{copy.details.join(" · ")}</p>
        ) : null}
      </div>
    </div>
  );
}
