import { useEffect, useRef, useState } from "react";
import type { EtaResponse } from "@/server/schemas/eta";

export function useEngineEta(trainNo: string, station: string, intervalMs: number = 3000) {
  const [payload, setPayload] = useState<EtaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const etagRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = `/api/v2/events?train=${encodeURIComponent(trainNo)}&station=${encodeURIComponent(station)}`;

    async function tick() {
      try {
        const headers: Record<string, string> = {};
        if (etagRef.current) headers["If-None-Match"] = etagRef.current;
        const response = await fetch(url, { headers });
        if (cancelled) return;
        const nextTag = response.headers.get("etag");
        if (nextTag) etagRef.current = nextTag;
        if (response.status === 304) return;
        if (!response.ok) {
          setError(`ETA ${response.status}`);
          return;
        }
        const body = (await response.json()) as EtaResponse;
        setPayload(body);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "ETA fetch failed");
      }
    }

    void tick();
    const id = window.setInterval(() => void tick(), intervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [trainNo, station, intervalMs]);

  return { payload, error };
}
