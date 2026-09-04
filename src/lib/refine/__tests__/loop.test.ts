import { describe, expect, it } from "vitest";
import { buildRetrainHistory, promotedMaeSeries, RETRAIN_HISTORY } from "../loop";

describe("retrain accuracy loop", () => {
  it("demonstrates hold-out MAE falling across successive promoted retrains", () => {
    const history = buildRetrainHistory();
    expect(history).toEqual(RETRAIN_HISTORY);
    const promoted = promotedMaeSeries(history);
    expect(promoted.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < promoted.length; i++) {
      expect(promoted[i]!).toBeLessThan(promoted[i - 1]!);
    }
    expect(history.at(-1)!.maeMin).toBeLessThan(history[0]!.maeMin);
    expect(history.some((point) => point.source === "residual")).toBe(true);
    expect(
      history.filter((point) => point.promoted).every((point) => point.source !== "residual"),
    ).toBe(true);
  });
});
