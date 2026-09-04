import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { etaBandBounds } from "@/lib/etaBand";
import { EtaBand } from "../EtaBand";
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
  reason: "congestion",
  features: [
    { name: "currentDelayMin", value: 12, unit: "min" },
    { name: "remainingKm", value: 80, unit: "km" },
    { name: "weatherCode", value: 0, unit: "wmo" },
  ],
  modelVersion: "1.0.0",
  source: "replay",
  updatedAt: 1,
};

describe("EtaBand", () => {
  it("renders lowerEta ≤ eta ≤ upperEta", () => {
    const band = etaBandBounds(payload);
    expect(Date.parse(band.lowerEta)).toBeLessThanOrEqual(Date.parse(band.eta));
    expect(Date.parse(band.eta)).toBeLessThanOrEqual(Date.parse(band.upperEta));
    render(<EtaBand payload={payload} />);
    const node = screen.getByText(/reaches NDLS/);
    expect(node.getAttribute("data-lower-eta")).toBe(band.lowerEta);
    expect(node.getAttribute("data-eta")).toBe(band.eta);
    expect(node.getAttribute("data-upper-eta")).toBe(band.upperEta);
  });
});
