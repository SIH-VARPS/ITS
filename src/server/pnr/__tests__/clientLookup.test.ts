import { describe, expect, it } from "vitest";
import { fetchPnrClient } from "../clientLookup";
import { syntheticPnrStatus } from "../syntheticPnr";

describe("fetchPnrClient", () => {
  it("rejects a non-10-digit PNR without calling the network", async () => {
    const result = await fetchPnrClient("12", async () => {
      throw new Error("should not fetch");
    });
    expect(result).toEqual({ ok: false, reason: "invalid" });
  });

  it("returns a live payload when the API succeeds", async () => {
    const live = {
      ...syntheticPnrStatus("1234567890")!,
      source: "railradar" as const,
      trainName: "Live Train",
    };
    const result = await fetchPnrClient("1234567890", async () =>
      new Response(JSON.stringify({ success: true, data: live }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(result).toEqual({ ok: true, data: live });
  });

  it("falls back to a bundled demo ticket when the hosted API errors", async () => {
    const result = await fetchPnrClient("8421950247", async () =>
      new Response(
        JSON.stringify({
          error: true,
          status: 400,
          message: "Invalid PNR format. PNR must be a 10-digit numeric string.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.pnr).toBe("8421950247");
      expect(result.data.source).toBe("demo");
      expect(result.data.passengers.length).toBeGreaterThan(0);
    }
  });

  it("falls back when the hosted API returns HTML", async () => {
    const result = await fetchPnrClient("8421950247", async () =>
      new Response("<html>not found</html>", {
        status: 404,
        headers: { "Content-Type": "text/html" },
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.source).toBe("demo");
    }
  });
});
