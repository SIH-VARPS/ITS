import { EtaConfidenceBadge } from "./EtaConfidenceBadge";
import { SourceTierBadge } from "./SourceTierBadge";
import { formatIstClock } from "@/lib/etaBand";
import { describeWeather, weatherFromFeatures } from "@/lib/features/weatherLabels";
import type { BoardEntry } from "@/server/schemas/board";
import type { EtaResponse } from "@/server/schemas/eta";

export function StationDisplayBoard({
  stationCode,
  entries,
  updatedAt,
  spotlight,
}: {
  stationCode: string;
  entries: BoardEntry[];
  updatedAt: number;
  spotlight?: EtaResponse | null;
}) {
  return (
    <main
      className="min-h-screen bg-black px-6 py-8 text-white"
      data-testid="station-display"
      aria-label={`${stationCode} station display`}
    >
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-4 border-white pb-4">
        <div>
          <p className="text-lg font-semibold tracking-[0.3em] uppercase text-white">Station</p>
          <h1 className="mt-1 font-mono text-6xl font-black tracking-tight text-white sm:text-7xl">
            {stationCode}
          </h1>
        </div>
        <p className="text-xl font-semibold text-white">
          {updatedAt > 0
            ? new Date(updatedAt).toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })
            : "LIVE"}
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="text-3xl font-semibold text-white">No predicted arrivals.</p>
      ) : (
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Predicted arrivals at {stationCode}</caption>
          <thead>
            <tr className="text-lg font-bold tracking-widest uppercase text-white">
              <th scope="col" className="pb-4 pr-4">
                Train
              </th>
              <th scope="col" className="pb-4 pr-4">
                ETA
              </th>
              <th scope="col" className="pb-4 pr-4">
                Band
              </th>
              <th scope="col" className="pb-4 pr-4">
                Plat
              </th>
              <th scope="col" className="pb-4">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((row) => {
              const isSpotlight = Boolean(spotlight && row.trainNo === spotlight.trainNo);
              const etaIso = isSpotlight && spotlight ? spotlight.eta : row.eta;
              const p50 = isSpotlight && spotlight ? spotlight.p50 : row.p50;
              const p90 = isSpotlight && spotlight ? spotlight.p90 : row.p90;
              const delayMin = isSpotlight && spotlight ? spotlight.delayMin : row.delayMin;
              const source = isSpotlight && spotlight ? spotlight.source : row.source;
              return (
                <tr
                  key={row.trainNo}
                  className="border-t border-white/40"
                  data-train-no={row.trainNo}
                  {...(isSpotlight && spotlight ? { "data-engine-eta": spotlight.eta } : {})}
                >
                  <th scope="row" className="py-5 pr-4 text-3xl font-black text-white sm:text-4xl">
                    {row.trainNo}
                    <span className="mt-1 block text-xl font-semibold text-white">
                      {row.trainName}
                    </span>
                    {isSpotlight && spotlight && spotlight.features.length > 0 ? (
                      <span className="mt-1 block text-lg font-bold tracking-wide text-white">
                        {describeWeather(weatherFromFeatures(spotlight.features)).label.toUpperCase()}
                      </span>
                    ) : null}
                  </th>
                  <td className="py-5 pr-4 font-mono text-4xl font-black text-white sm:text-5xl">
                    {formatIstClock(etaIso)}
                  </td>
                  <td className="py-5 pr-4 text-2xl font-semibold text-white">
                    {formatIstClock(p50)}–{formatIstClock(p90)}
                    <span className="mt-1 block text-base font-medium">
                      {delayMin >= 1 ? `+${delayMin} min` : "On time"}
                    </span>
                  </td>
                  <td className="py-5 pr-4 text-3xl font-black text-white">{row.platform}</td>
                  <td className="py-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <SourceTierBadge
                        source={source}
                        className="border-white bg-white text-xs text-black"
                      />
                      {isSpotlight && spotlight ? (
                        <EtaConfidenceBadge
                          confidence={spotlight.confidence}
                          className="border-white bg-white text-black"
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
