import { useEffect, useMemo, useState } from "react";
import { formatIstClock } from "@/lib/etaBand";
import { p80OverlapsBoard, risksFromSlip } from "@/lib/cascadeRisks";
import { SourceTierBadge } from "./SourceTierBadge";
import { EtaConfidenceBadge } from "./EtaConfidenceBadge";
import type { BoardEntry, BoardResponse } from "@/server/schemas/board";
import type { EtaResponse } from "@/server/schemas/eta";

export function CascadePanel({
  incomingTrainNo = "12951",
  stationCode = "NDLS",
  incoming,
  boardEntries,
}: {
  incomingTrainNo?: string;
  stationCode?: string;
  incoming?: EtaResponse | null;
  boardEntries?: BoardEntry[];
}) {
  const [fetchedIncoming, setFetchedIncoming] = useState<EtaResponse | null>(null);
  const [fetchedBoard, setFetchedBoard] = useState<BoardEntry[]>([]);

  useEffect(() => {
    if (incoming && boardEntries) return;
    let cancelled = false;
    async function load() {
      const [etaRes, boardRes] = await Promise.all([
        fetch(
          `/api/v2/eta?train=${encodeURIComponent(incomingTrainNo)}&station=${encodeURIComponent(stationCode)}`,
        ),
        fetch(`/api/v2/station/${encodeURIComponent(stationCode)}/board`),
      ]);
      if (cancelled) return;
      if (etaRes.ok) setFetchedIncoming((await etaRes.json()) as EtaResponse);
      if (boardRes.ok) {
        const body = (await boardRes.json()) as BoardResponse;
        setFetchedBoard(body.entries);
      }
    }
    void load();
    const id = window.setInterval(() => void load(), 8000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [incoming, boardEntries, incomingTrainNo, stationCode]);

  const eta = incoming ?? fetchedIncoming;
  const board = boardEntries ?? fetchedBoard;
  const risks = useMemo(() => (eta ? risksFromSlip(eta, board) : []), [eta, board]);

  if (!eta) {
    return (
      <section className="rounded-2xl border border-border bg-card p-4" aria-label="Cascade">
        <p className="text-sm text-muted-foreground">Loading cascade…</p>
      </section>
    );
  }

  const overlapping = p80OverlapsBoard(eta, board);

  return (
    <section className="rounded-2xl border border-border bg-card p-4" aria-label="Cascade">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide">Cascade</h2>
        <div className="flex items-center gap-2">
          <SourceTierBadge source={eta.source} />
          <EtaConfidenceBadge confidence={eta.confidence} />
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground" data-engine-eta={eta.eta}>
        {eta.trainNo} P50 {formatIstClock(eta.eta)} · P80 {formatIstClock(eta.p80)} · delay{" "}
        {eta.delayMin} min
      </p>

      <div
        className="mt-3 rounded-xl border border-border bg-secondary/30 px-3 py-2"
        data-testid="ops-actions"
      >
        <p className="text-xs font-semibold">Ops actions</p>
        <p className="mt-1 text-sm">
          {overlapping
            ? "Platform-hold suggested — P80 arrival overlaps the next occupancy."
            : "No platform-hold: P80 is clear of the next occupancy."}
        </p>
        <p className="mt-1 text-sm">
          Cleaning / crew ready by <strong>{formatIstClock(eta.p90)}</strong> (P90).
        </p>
      </div>

      {risks.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No downstream services currently at risk.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border" data-testid="cascade-list">
          {risks.map((row) => (
            <li key={`${row.kind}-${row.trainNo}`} className="py-2">
              <p className="text-sm font-semibold">
                {row.trainNo} {row.trainName}
              </p>
              <p className="text-xs text-muted-foreground">
                {row.kind === "platform-hold" ? "Platform slot" : "Downstream"} · {row.detail}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
