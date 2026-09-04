import { describe, expect, it } from "vitest";
import { getTrain } from "@/data/trains";
import {
  buildFeatures,
  forecastEtaAtHalt,
  historicalDelayAt,
  predictDelay,
  reasonLabel,
} from "../etaModel";

const train = getTrain("12001")!;

describe("etaModel", () => {
  it("returns 0 historical delay at the origin", () => {
    expect(historicalDelayAt(train, 0)).toBe(0);
    expect(historicalDelayAt(train, 999)).toBe(0);
  });

  it("builds a finite feature vector", () => {
    const features = buildFeatures(train, {
      elapsedMin: 120,
      currentDelayMin: 10,
      currentKm: 80,
      lastHaltIndex: 2,
      haltedDurationMin: 0,
      isHalted: false,
      date: new Date("2026-03-15T10:00:00+05:30"),
    });
    expect(features.trainNumber).toBe("12001");
    expect(features.corridorCongestion).toBe(0);
    expect(features.weather).toBe("clear");
    expect(features.priorHaltDelays.length).toBeGreaterThan(0);
  });

  it("honours explicit weather and congestion overrides", () => {
    const features = buildFeatures(
      train,
      {
        elapsedMin: 30,
        currentDelayMin: 0,
        currentKm: 10,
        lastHaltIndex: 0,
        haltedDurationMin: 5,
        isHalted: true,
        date: new Date("2026-03-15T08:00:00+05:30"),
      },
      "fog",
      0.9,
    );
    expect(features.weather).toBe("fog");
    expect(features.corridorCongestion).toBe(0.9);
  });

  it("predicts a non-negative delay with a classified reason", () => {
    const features = buildFeatures(train, {
      elapsedMin: 200,
      currentDelayMin: 18,
      currentKm: 250,
      lastHaltIndex: 3,
      haltedDurationMin: 0,
      isHalted: false,
      date: new Date("2026-03-15T12:00:00+05:30"),
    });
    const forecast = predictDelay(features, 6);
    expect(forecast.delayMin).toBeGreaterThanOrEqual(0);
    expect(forecast.confidence).toBeGreaterThan(0);
    expect(reasonLabel(forecast.reason).length).toBeGreaterThan(0);
  });

  it("forecasts an ETA clock string at a halt", () => {
    const forecast = forecastEtaAtHalt(
      train,
      2,
      {
        elapsedMin: 40,
        currentDelayMin: 5,
        currentKm: 20,
        lastHaltIndex: 1,
        haltedDurationMin: 0,
        isHalted: false,
      },
      new Date("2026-03-15T16:00:00+05:30"),
    );
    expect(forecast.eta).toMatch(/^\d{2}:\d{2}$/);
    expect(forecast.lowerEta).toMatch(/^\d{2}:\d{2}$/);
  });
});
