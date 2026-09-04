import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RetrainAccuracyPanel } from "../RetrainAccuracyPanel";
import { promotedMaeSeries, RETRAIN_HISTORY } from "@/lib/refine/loop";

describe("RetrainAccuracyPanel", () => {
  it("renders a falling promoted MAE series from the live retrain loop", () => {
    render(<RetrainAccuracyPanel />);
    const panel = screen.getByTestId("retrain-accuracy");
    const first = Number(panel.getAttribute("data-mae-first"));
    const last = Number(panel.getAttribute("data-mae-last"));
    const promoted = promotedMaeSeries(RETRAIN_HISTORY);
    expect(first).toBe(promoted[0]);
    expect(last).toBe(promoted[promoted.length - 1]);
    expect(last).toBeLessThan(first);
    expect(screen.getByText("Accuracy over retrains")).toBeInTheDocument();
  });
});
