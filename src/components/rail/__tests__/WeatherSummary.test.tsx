import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WeatherSummary } from "../WeatherSummary";
import { EngineEtaBlock } from "../EtaBand";
import type { EtaResponse } from "@/server/schemas/eta";

const payload: EtaResponse = {
  trainNo: "12951",
  station: "NDLS",
  eta: "2026-03-16T08:47:00.000Z",
  p50: "2026-03-16T08:47:00.000Z",
  p80: "2026-03-16T09:05:00.000Z",
  p90: "2026-03-16T09:20:00.000Z",
  delayMin: 12,
  baselineEta: "2026-03-16T08:50:00.000Z",
  improvementMin: 3,
  confidence: 0.72,
  reason: "weather",
  features: [
    { name: "currentDelayMin", value: 12, unit: "min" },
    { name: "weatherCode", value: 0, unit: "wmo" },
    { name: "precipitationMm", value: 0, unit: "mm" },
    { name: "visibilityKm", value: 12, unit: "km" },
    { name: "windSpeedKmph", value: 6, unit: "km/h" },
  ],
  modelVersion: "1.0.0",
  source: "replay",
  updatedAt: 1,
};

describe("WeatherSummary", () => {
  afterEach(() => cleanup());

  it("shows sky clear in plain language", () => {
    render(<WeatherSummary features={payload.features} stationName="NDLS" />);
    expect(screen.getByTestId("weather-summary").getAttribute("data-weather-label")).toBe(
      "Sky clear",
    );
    expect(screen.getByText("Sky is clear")).toBeTruthy();
    expect(screen.getByText(/Weather at NDLS/)).toBeTruthy();
  });

  it("shows rain instead of a raw WMO code", () => {
    render(
      <WeatherSummary
        snapshot={{ weatherCode: 61, precipitationMm: 4.2, visibilityKm: 8, windSpeedKmph: 18 }}
      />,
    );
    expect(screen.getByTestId("weather-summary").getAttribute("data-weather-kind")).toBe("rain");
    expect(screen.getByText(/Light rain at the next halt/)).toBeTruthy();
    expect(screen.getByText(/4\.2 mm rain/)).toBeTruthy();
  });

  it("renders on the passenger ETA block", () => {
    render(<EngineEtaBlock payload={payload} stationName="NDLS" />);
    expect(screen.getByTestId("weather-summary")).toBeTruthy();
    expect(screen.getByText("Sky is clear")).toBeTruthy();
  });
});
