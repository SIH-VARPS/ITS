import { describe, expect, it } from "vitest";
import { renderErrorPage } from "../error-page";

describe("renderErrorPage", () => {
  it("returns a standalone HTML document", () => {
    const html = renderErrorPage();
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Try again");
    expect(html).toContain("Go home");
  });
});
