import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CascadePanel } from "../CascadePanel";
import { risksFromSlip } from "@/lib/cascadeRisks";
import type { EtaResponse } from "@/server/schemas/eta";
import type { BoardEntry } from "@/server/schemas/board";

const incoming: EtaResponse = {
  trainNo: "12951",
  station: "NDLS",
  eta: "2026-03-16T08:47:00.000Z",
  p50: "2026-03-16T08:47:00.000Z",
  p80: "2026-03-16T09:05:00.000Z",
  p90: "2026-03-16T09:20:00.000Z",
  delayMin: 45,
  baselineEta: "2026-03-16T08:50:00.000Z",
  improvementMin: 3,
  confidence: 0.72,
  reason: "congestion",
  features: [],
  modelVersion: "1.0.0",
  source: "replay",
  updatedAt: 1,
};

const board: BoardEntry[] = [
  {
    trainNo: "12951",
    trainName: "Mumbai Rajdhani",
    eta: incoming.eta,
    p50: incoming.p50,
    p80: incoming.p80,
    p90: incoming.p90,
    delayMin: 45,
    platform: "1",
    source: "replay",
  },
  {
    trainNo: "12001",
    trainName: "Bhopal Shatabdi",
    eta: "2026-03-16T09:10:00.000Z",
    p50: "2026-03-16T09:10:00.000Z",
    p80: "2026-03-16T09:18:00.000Z",
    p90: "2026-03-16T09:25:00.000Z",
    delayMin: 8,
    platform: "2",
    source: "replay",
  },
];

describe("CascadePanel", () => {
  it("lists a downstream train after a 45-minute delay", () => {
    const risks = risksFromSlip(incoming, board);
    expect(risks.some((row) => row.trainNo === "12001")).toBe(true);
    render(<CascadePanel incoming={incoming} boardEntries={board} />);
    expect(screen.getByTestId("cascade-list").textContent).toContain("12001");
    expect(screen.getByTestId("ops-actions").textContent).toMatch(/ready by/i);
  });
});
