import { SourceTierBadge } from "./SourceTierBadge";
import { etaBandBounds, formatIstClock } from "@/lib/etaBand";
import type { EtaResponse } from "@/server/schemas/eta";

export function EtaBand({ payload, stationName }: { payload: EtaResponse; stationName?: string }) {
  const band = etaBandBounds(payload);
  const station = stationName ?? payload.station;
  return (
    <p
      className="text-sm text-foreground"
      data-engine-eta={payload.eta}
      data-lower-eta={band.lowerEta}
      data-eta={payload.eta}
      data-upper-eta={band.upperEta}
    >
      reaches {station} {formatIstClock(payload.eta)}, likely {formatIstClock(band.lowerEta)}–
      {formatIstClock(band.upperEta)}
    </p>
  );
}

export function FeatureAttributions({ features }: { features: EtaResponse["features"] }) {
  const top = [...features].sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 3);
  if (top.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1 text-xs text-muted-foreground" data-testid="eta-attributions">
      {top.map((row) => (
        <li key={row.name}>
          {row.name}: {row.value} {row.unit}
        </li>
      ))}
    </ul>
  );
}

export function EngineEtaBlock({
  payload,
  stationName,
}: {
  payload: EtaResponse;
  stationName?: string;
}) {
  return (
    <div className="space-y-2" data-testid="engine-eta-block">
      <div className="flex flex-wrap items-center gap-2">
        <SourceTierBadge source={payload.source} />
      </div>
      {stationName ? (
        <EtaBand payload={payload} stationName={stationName} />
      ) : (
        <EtaBand payload={payload} />
      )}
      <FeatureAttributions features={payload.features} />
    </div>
  );
}
