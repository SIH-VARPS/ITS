import { describe, expect, it } from "vitest";
import { classifyDelay, DELAY_REASONS } from "../delayReasons";

describe("classifyDelay", () => {
  it("returns unknown for near-on-time running", () => {
    expect(
      classifyDelay({
        delayMin: 1,
        weatherActive: false,
        timeOfDayHours: 10,
        isHalted: false,
        haltedDurationMin: 0,
      }),
    ).toBe("unknown");
  });

  it("prefers weather when weather is active", () => {
    expect(
      classifyDelay({
        delayMin: 20,
        weatherActive: true,
        timeOfDayHours: 3,
        isHalted: false,
        haltedDurationMin: 0,
      }),
    ).toBe("weather");
  });

  it("flags peak-hour congestion", () => {
    expect(
      classifyDelay({
        delayMin: 15,
        weatherActive: false,
        timeOfDayHours: 18,
        isHalted: false,
        haltedDurationMin: 0,
      }),
    ).toBe("congestion");
  });

  it("flags long dwell as signal-failure", () => {
    expect(
      classifyDelay({
        delayMin: 18,
        weatherActive: false,
        timeOfDayHours: 2,
        isHalted: true,
        haltedDurationMin: 25,
      }),
    ).toBe("signal-failure");
  });

  it("classifies a large off-peak delay as track-work when technical is tied", () => {
    expect(
      classifyDelay({
        delayMin: 45,
        weatherActive: false,
        timeOfDayHours: 2,
        isHalted: false,
        haltedDurationMin: 0,
      }),
    ).toBe("track-work");
  });

  it("flags mid-size off-peak delays as track-work", () => {
    expect(
      classifyDelay({
        delayMin: 28,
        weatherActive: false,
        timeOfDayHours: 2,
        isHalted: false,
        haltedDurationMin: 0,
      }),
    ).toBe("track-work");
  });

  it("exposes a label for every reason", () => {
    for (const reason of Object.keys(DELAY_REASONS) as Array<keyof typeof DELAY_REASONS>) {
      expect(DELAY_REASONS[reason].label.length).toBeGreaterThan(0);
    }
  });
});
