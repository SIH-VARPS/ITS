import { describe, expect, it } from "vitest";
import { getTrain } from "@/data/trains";
import {
  computeLiveStatus,
  confidenceTier,
  delayLabel,
  delayTone,
  EAGER_AHEAD_HALTS,
  fmtMinutes,
  materializeHaltForecast,
} from "../liveStatus";

const train = getTrain("12001")!;

function atHours(hours: number, minutes = 0): Date {
  return new Date(2026, 2, 15, hours, minutes, 0);
}

describe("liveStatus", () => {
  it("formats minutes after midnight as HH:MM", () => {
    expect(fmtMinutes(0)).toBe("00:00");
    expect(fmtMinutes(900)).toBe("15:00");
    expect(fmtMinutes(-1)).toBe("23:59");
  });

  it("computes a coherent status snapshot", () => {
    const status = computeLiveStatus(train, atHours(16, 30));
    expect(["not-started", "running", "halted", "completed"]).toContain(status.state);
    expect(Number.isFinite(status.delay)).toBe(true);
    expect(status.haltStatus).toHaveLength(train.halts.length);
    expect(delayLabel(status).length).toBeGreaterThan(0);
    expect(delayTone(status).startsWith("text-")).toBe(true);
  });

  it("covers not-started, running, and completed windows", () => {
    const early = computeLiveStatus(train, atHours(0, 5));
    const late = computeLiveStatus(train, atHours(23, 50));
    expect(["not-started", "running", "halted", "completed"]).toContain(early.state);
    expect(["not-started", "running", "halted", "completed"]).toContain(late.state);
    expect(typeof delayLabel(early)).toBe("string");
    expect(typeof delayLabel(late)).toBe("string");
  });

  it("maps confidence to high/medium/low tiers", () => {
    expect(confidenceTier(0.9).label).toBe("High");
    expect(confidenceTier(0.5).label).toBe("Medium");
    expect(confidenceTier(0.2).label).toBe("Low");
  });

  it("eagerly forecasts only the next three future halts", () => {
    const status = computeLiveStatus(train, atHours(16, 30));
    if (status.state === "not-started" || status.state === "completed") return;
    const lastIdx = train.halts.findIndex((h) => h.code === status.lastHalt.code);
    const future = status.haltStatus
      .map((row, i) => ({ i, row }))
      .filter(({ i, row }) => !row.done && i > lastIdx);
    const eager = future.filter(({ row }) => row.forecast !== null);
    const lazy = future.filter(({ row }) => row.forecast === null);
    expect(eager.length).toBeLessThanOrEqual(EAGER_AHEAD_HALTS);
    if (future.length > EAGER_AHEAD_HALTS) {
      expect(lazy.length).toBeGreaterThan(0);
    }
    const far = future[future.length - 1];
    if (far && far.row.forecast === null) {
      const filled = materializeHaltForecast(train, status, far.i, atHours(16, 30));
      expect(filled).not.toBeNull();
    }
    expect(materializeHaltForecast(train, status, -1, atHours(16, 30))).toBeNull();
    const early = computeLiveStatus(train, atHours(0, 5));
    if (early.state === "not-started") {
      expect(materializeHaltForecast(train, early, 1, atHours(0, 5))).toBeNull();
    }
  });
});
