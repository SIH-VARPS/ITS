import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StationDisplayBoard } from "../StationDisplayBoard";
import type { BoardEntry } from "@/server/schemas/board";
import type { EtaResponse } from "@/server/schemas/eta";

const entry: BoardEntry = {
  trainNo: "12951",
  trainName: "Mumbai Rajdhani",
  eta: "2026-03-16T08:47:00.000Z",
  p50: "2026-03-16T08:47:00.000Z",
  p80: "2026-03-16T09:05:00.000Z",
  p90: "2026-03-16T09:20:00.000Z",
  delayMin: 12,
  platform: "1",
  source: "replay",
};

const spotlight: EtaResponse = {
  ...entry,
  station: "NDLS",
  baselineEta: entry.eta,
  improvementMin: 1,
  confidence: 0.8,
  reason: "congestion",
  features: [
    { name: "weatherCode", value: 0, unit: "wmo" },
    { name: "precipitationMm", value: 0, unit: "mm" },
    { name: "visibilityKm", value: 10, unit: "km" },
    { name: "windSpeedKmph", value: 5, unit: "km/h" },
  ],
  modelVersion: "1.0.0",
  updatedAt: 1,
};

describe("StationDisplayBoard", () => {
  it("renders high-contrast arrivals and updates the spotlight eta", () => {
    const { rerender } = render(
      <StationDisplayBoard
        stationCode="NDLS"
        entries={[entry]}
        updatedAt={1}
        spotlight={spotlight}
      />,
    );
    expect(screen.getByTestId("station-display").textContent).toContain("12951");
    expect(screen.getByTestId("station-display").textContent).toContain("SKY CLEAR");
    expect(
      screen
        .getByTestId("station-display")
        .querySelector("[data-engine-eta]")
        ?.getAttribute("data-engine-eta"),
    ).toBe(spotlight.eta);
    const next = { ...spotlight, eta: "2026-03-16T09:30:00.000Z" };
    rerender(
      <StationDisplayBoard
        stationCode="NDLS"
        entries={[{ ...entry, eta: next.eta }]}
        updatedAt={2}
        spotlight={next}
      />,
    );
    expect(
      screen
        .getByTestId("station-display")
        .querySelector("[data-engine-eta]")
        ?.getAttribute("data-engine-eta"),
    ).toBe(next.eta);
  });
});
