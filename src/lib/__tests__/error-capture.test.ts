import { afterEach, describe, expect, it } from "vitest";
import { consumeLastCapturedError, describeError } from "../error-capture";

describe("error-capture", () => {
  afterEach(() => {
    consumeLastCapturedError();
  });

  it("describes an Error with stack and cause chain", () => {
    const inner = new Error("root cause");
    const outer = new Error("wrapper", { cause: inner });
    const text = describeError(outer);
    expect(text).toContain("wrapper");
    expect(text).toContain("caused by:");
    expect(text).toContain("root cause");
  });

  it("stringifies non-error values", () => {
    expect(describeError("plain")).toBe("plain");
    expect(describeError({ unhandled: true })).toContain("unhandled");
    const circular: { self?: unknown } = {};
    circular.self = circular;
    expect(describeError(circular)).toContain("[object Object]");
  });

  it("records console.error Error arguments for later recovery", () => {
    const boom = new Error("ssr boom");
    console.error(boom);
    expect(consumeLastCapturedError()).toBe(boom);
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("includes HTTP status when present", () => {
    const err = new Error("nope") as Error & { status: number; statusCode?: number };
    err.status = 503;
    expect(describeError(err)).toContain("status 503");
    const coded = new Error("coded") as Error & { statusCode: number };
    coded.statusCode = 429;
    expect(describeError(coded)).toContain("status 429");
  });
});
