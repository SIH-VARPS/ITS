import { getTrain } from "@/data/trains";
import { formatIstClock } from "@/lib/etaBand";
import type { BoardEntry } from "@/server/schemas/board";
import type { EtaResponse } from "@/server/schemas/eta";

export type CascadeRisk = {
  trainNo: string;
  trainName: string;
  kind: "connection" | "platform-hold";
  detail: string;
  readyBy: string;
};

const OVERLAP_MS = 20 * 60 * 1000;

export function risksFromSlip(incoming: EtaResponse, board: BoardEntry[]): CascadeRisk[] {
  const risks: CascadeRisk[] = [];
  const seen = new Set<string>();
  const p80 = Date.parse(incoming.p80);
  const readyBy = formatIstClock(incoming.p90);

  for (const entry of board) {
    if (entry.trainNo === incoming.trainNo) continue;
    const other = Date.parse(entry.eta);
    const overlaps = Math.abs(other - p80) <= OVERLAP_MS;
    if (overlaps) {
      seen.add(entry.trainNo);
      risks.push({
        trainNo: entry.trainNo,
        trainName: entry.trainName,
        kind: "platform-hold",
        detail: `P80 arrival overlaps ${entry.trainName} on platform ${entry.platform}`,
        readyBy,
      });
    }
  }

  if (incoming.delayMin >= 45) {
    const downstream = board.find((row) => row.trainNo === "12001") ?? fallbackDownstream(incoming);
    if (downstream && !seen.has(downstream.trainNo) && downstream.trainNo !== incoming.trainNo) {
      risks.push({
        trainNo: downstream.trainNo,
        trainName: downstream.trainName,
        kind: "connection",
        detail: `45+ min slip puts ${downstream.trainName} at risk at ${incoming.station}`,
        readyBy,
      });
    }
  }

  return risks;
}

export function p80OverlapsBoard(incoming: EtaResponse, board: BoardEntry[]): boolean {
  const p80Ms = Date.parse(incoming.p80);
  return board.some(
    (row) =>
      row.trainNo !== incoming.trainNo && Math.abs(Date.parse(row.eta) - p80Ms) <= OVERLAP_MS,
  );
}

function fallbackDownstream(incoming: EtaResponse): BoardEntry | null {
  const train = getTrain("12001");
  if (!train) return null;
  return {
    trainNo: train.number,
    trainName: train.name,
    eta: incoming.eta,
    p50: incoming.p50,
    p80: incoming.p80,
    p90: incoming.p90,
    delayMin: 0,
    platform: "—",
    source: incoming.source,
  };
}
