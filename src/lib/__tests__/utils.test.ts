import { describe, expect, it } from "vitest";
import { cn } from "../utils";

describe("cn", () => {
  it("merges tailwind class names", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", "font-bold")).toContain("font-bold");
  });
});
