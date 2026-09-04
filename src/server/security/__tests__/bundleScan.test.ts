import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assertClientBundle, scanClientBundle } from "../bundleScan";

describe("bundleScan", () => {
  it("throws when the client output is missing", () => {
    expect(() => assertClientBundle(join(tmpdir(), "no-vercel-output"))).toThrow(/missing/i);
  });

  it("flags a leaked rr_live_ prefix and over-budget assets", () => {
    const root = mkdtempSync(join(tmpdir(), "bundle-scan-"));
    const assets = join(root, ".vercel", "output", "static", "assets");
    mkdirSync(assets, { recursive: true });
    writeFileSync(join(assets, "index-fake.js"), `const k = "rr_live_should_not_ship";`);
    const scan = scanClientBundle(root);
    expect(scan.available).toBe(true);
    expect(scan.leaks.some((row) => row.needle === "rr_live_")).toBe(true);
    expect(() => assertClientBundle(root)).toThrow(/Forbidden substring/);
  });
});
