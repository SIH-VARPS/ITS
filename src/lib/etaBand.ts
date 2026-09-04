import type { EtaResponse } from "@/server/schemas/eta";

export function formatIstClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Symmetric lower band around p50 using the p80 width; always lower ≤ eta ≤ upper. */
export function etaBandBounds(payload: Pick<EtaResponse, "eta" | "p50" | "p80" | "p90">): {
  lowerEta: string;
  eta: string;
  upperEta: string;
} {
  const etaMs = Date.parse(payload.eta);
  const p50 = Date.parse(payload.p50);
  const p80 = Date.parse(payload.p80);
  const p90 = Date.parse(payload.p90);
  const width = Math.max(0, p80 - p50);
  let lowerMs = p50 - width;
  const upperMs = p90;
  if (lowerMs > etaMs) lowerMs = Math.min(etaMs, p50);
  if (lowerMs > etaMs) lowerMs = etaMs;
  return {
    lowerEta: new Date(lowerMs).toISOString(),
    eta: payload.eta,
    upperEta: new Date(upperMs).toISOString(),
  };
}
