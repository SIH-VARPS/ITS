import { describe, expect, it } from "vitest";
import { mulberry32, simulateAr1Delays } from "../../scripts/generate-training-data.mjs";

describe("calibrated delay simulator", () => {
  it("reproduces per-station means within 10%", () => {
    const rng = mulberry32(42);
    const halts = [{ code: "AAA" }, { code: "BBB" }, { code: "CCC" }, { code: "DDD" }];
    const means: Record<string, number> = { AAA: 0, BBB: 20, CCC: 40, DDD: 35 };
    const sums = [0, 0, 0, 0];
    const n = 800;
    for (let i = 0; i < n; i++) {
      const delays = simulateAr1Delays(halts, means, rng);
      for (let h = 0; h < halts.length; h++) sums[h]! += delays[h]!;
    }
    for (let h = 0; h < halts.length; h++) {
      const actual = sums[h]! / n;
      const expected = means[halts[h]!.code]!;
      const tol = Math.max(2, Math.abs(expected) * 0.1);
      expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tol);
    }
  });
});
