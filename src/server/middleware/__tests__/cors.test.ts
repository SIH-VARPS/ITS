// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import {
  corsHeadersFor,
  isOriginAllowed,
  mutatingCorsRejection,
  runWithCorsRequest,
} from "../cors";

describe("mutating CORS allowlist", () => {
  afterEach(() => {
    delete process.env["CORS_ALLOWED_ORIGINS"];
    delete process.env["APP_URL"];
  });

  it("allows GET from any origin and mutating calls with no Origin", () => {
    expect(isOriginAllowed("https://evil.example", "GET")).toBe(true);
    expect(isOriginAllowed(null, "POST")).toBe(true);
    const get = corsHeadersFor(new Request("http://localhost/api/v2/health"));
    expect(get["Access-Control-Allow-Origin"]).toBe("*");
  });

  it("allows APP_URL and CORS_ALLOWED_ORIGINS on POST", () => {
    process.env["APP_URL"] = "https://app.example";
    process.env["CORS_ALLOWED_ORIGINS"] = "https://partner.example";
    expect(isOriginAllowed("https://app.example", "POST")).toBe(true);
    expect(isOriginAllowed("https://partner.example", "DELETE")).toBe(true);
    expect(isOriginAllowed("https://evil.example", "POST")).toBe(false);
    const request = new Request("http://localhost/api/v2/observations", {
      method: "POST",
      headers: { Origin: "https://evil.example" },
    });
    const blocked = mutatingCorsRejection(request, "req-1");
    expect(blocked?.status).toBe(403);
    const allowed = new Request("http://localhost/api/v2/observations", {
      method: "POST",
      headers: { Origin: "https://app.example" },
    });
    expect(mutatingCorsRejection(allowed, "req-2")).toBeNull();
    const reflected = runWithCorsRequest(allowed, () => corsHeadersFor(allowed));
    expect(reflected["Access-Control-Allow-Origin"]).toBe("https://app.example");
  });
});
