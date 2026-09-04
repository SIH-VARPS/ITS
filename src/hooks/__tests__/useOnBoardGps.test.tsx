import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getTrain } from "@/data/trains";
import { useOnBoardGps } from "../useOnBoardGps";

function Probe({ consent }: { consent: boolean }) {
  const train = getTrain("12951")!;
  const gps = useOnBoardGps(train, { consent });
  return (
    <button type="button" onClick={gps.toggleGps}>
      toggle-gps
    </button>
  );
}

describe("useOnBoardGps consent", () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

  beforeEach(() => {
    fetchMock.mockClear();
    vi.stubGlobal("fetch", fetchMock);
    const origin = getTrain("12951")!.halts[0]!;
    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: (ok: PositionCallback) => {
          ok({
            coords: {
              latitude: origin.lat,
              longitude: origin.lng,
              speed: 10,
              accuracy: 8,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
            },
            timestamp: Date.now(),
          } as GeolocationPosition);
        },
        watchPosition: () => 1,
        clearWatch: () => undefined,
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("does not upload observations before consent is granted", () => {
    render(<Probe consent={false} />);
    screen.getByRole("button", { name: "toggle-gps" }).click();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uploads after consent is granted", () => {
    render(<Probe consent={true} />);
    screen.getByRole("button", { name: "toggle-gps" }).click();
    expect(fetchMock).toHaveBeenCalled();
    const init = fetchMock.mock.calls[0]?.[1] as { body?: string };
    expect(String(init.body)).toContain('"consent":true');
  });
});
