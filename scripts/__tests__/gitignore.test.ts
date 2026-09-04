import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe(".gitignore", () => {
  it("ignores .env", () => {
    const result = execFileSync("git", ["check-ignore", "-v", ".env"], { encoding: "utf8" });
    expect(result).toMatch(/\.env/);
  });
});
