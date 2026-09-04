import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getTrain } from "@/data/trains";
import { StationDisplayBoard } from "@/components/rail/StationDisplayBoard";
import { useEngineEta } from "@/hooks/useEngineEta";
import type { BoardEntry, BoardResponse } from "@/server/schemas/board";

export const Route = createFileRoute("/display/$code")({
  component: StationDisplayPage,
  head: ({ params }) => ({
    meta: [
      { title: `${params.code.toUpperCase()} station display — ITS Indian Train System` },
      {
        name: "description",
        content: `High-contrast station display for ${params.code.toUpperCase()} with EtaEngine arrival bands.`,
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function StationDisplayPage() {
  const { code } = Route.useParams();
  const stationCode = code.toUpperCase();
  const { payload: spotlight } = useEngineEta("12951", stationCode);
  const [board, setBoard] = useState<BoardResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    let etag: string | null = null;
    async function tick() {
      const headers: Record<string, string> = {};
      if (etag) headers["If-None-Match"] = etag;
      const response = await fetch(`/api/v2/station/${encodeURIComponent(stationCode)}/board`, {
        headers,
      });
      if (cancelled) return;
      const next = response.headers.get("etag");
      if (next) etag = next;
      if (response.status === 304) return;
      if (!response.ok) return;
      setBoard((await response.json()) as BoardResponse);
    }
    void tick();
    const id = window.setInterval(() => void tick(), 8000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [stationCode]);

  const entries = useMemo(() => {
    const current = board?.entries ?? [];
    if (!spotlight) return current;
    if (current.some((row) => row.trainNo === spotlight.trainNo)) return current;
    const train = getTrain(spotlight.trainNo);
    const extra: BoardEntry = {
      trainNo: spotlight.trainNo,
      trainName: train?.name || spotlight.trainNo,
      eta: spotlight.eta,
      p50: spotlight.p50,
      p80: spotlight.p80,
      p90: spotlight.p90,
      delayMin: spotlight.delayMin,
      platform: "—",
      source: spotlight.source,
    };
    return [extra, ...current];
  }, [board, spotlight]);

  return (
    <StationDisplayBoard
      stationCode={stationCode}
      entries={entries}
      updatedAt={board?.updatedAt ?? 0}
      spotlight={spotlight}
    />
  );
}
