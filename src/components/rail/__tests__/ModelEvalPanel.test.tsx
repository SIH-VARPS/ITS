import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import report from "../../../../eval/report.json";
import { ModelEvalPanel } from "../ModelEvalPanel";

describe("ModelEvalPanel", () => {
  it("renders synthetic and real hold-outs separately from eval/report.json", async () => {
    render(<ModelEvalPanel />);
    expect(screen.getByTestId("eval-panel")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId("eval-panel")).toHaveAttribute("data-eval-hydrated", "true"),
    );
    expect(screen.getByTestId("eval-cohort-synthetic")).toHaveTextContent(
      String(report.synthetic.n),
    );
    expect(screen.getByTestId("eval-cohort-real")).toHaveTextContent(String(report.real.n));
    expect(screen.getByTestId("eval-holdout-n")).toHaveTextContent(String(report.synthetic.n));
    expect(report.synthetic.n).not.toBe(report.real.n);

    fireEvent.click(screen.getByTestId("eval-cohort-real"));
    expect(screen.getByTestId("eval-holdout-n")).toHaveTextContent(String(report.real.n));
    expect(screen.getByTestId("eval-cohort-real")).toHaveAttribute("data-eval-active", "true");
  });
});
