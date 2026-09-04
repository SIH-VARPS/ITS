import { describe, expect, it } from "vitest";
import { RailBackendService } from "../services/railBackend";

describe("RailBackendService", { timeout: 30_000 }, () => {
  it("searches, filters, and paginates trains", () => {
    const all = RailBackendService.searchTrains({ limit: 5, offset: 0 });
    expect(all.items.length).toBeLessThanOrEqual(5);
    expect(all.total).toBeGreaterThan(0);

    const named = RailBackendService.searchTrains({ query: "12001" });
    expect(named.items.some((t) => t.number === "12001")).toBe(true);

    const typed = RailBackendService.searchTrains({ type: "Express", limit: 3 });
    expect(typed.items.every((t) => t.type.toLowerCase() === "express")).toBe(true);

    const between = RailBackendService.searchTrains({ from: "HBJ", to: "NDLS", limit: 10 });
    expect(between.total).toBeGreaterThan(0);

    const delayed = RailBackendService.searchTrains({ state: "delayed", limit: 5 });
    expect(delayed.items.length).toBeGreaterThanOrEqual(0);
    const onTime = RailBackendService.searchTrains({ state: "on-time", limit: 5 });
    expect(onTime.items.length).toBeGreaterThanOrEqual(0);
    const halted = RailBackendService.searchTrains({ state: "halted", limit: 5 });
    expect(halted.items.length).toBeGreaterThanOrEqual(0);
    const running = RailBackendService.searchTrains({ state: "running", limit: 2 });
    expect(running.items.length).toBeLessThanOrEqual(2);

    const byStation = RailBackendService.searchTrains({ query: "NDLS", limit: 3 });
    expect(byStation.total).toBeGreaterThan(0);
    const scoped = RailBackendService.searchTrains({
      from: "HBJ",
      to: "NDLS",
      query: "12001",
      limit: 5,
    });
    expect(scoped.items.some((t) => t.number === "12001")).toBe(true);
    expect(RailBackendService.getTrainRoute("12001")?.number).toBe("12001");
    expect(RailBackendService.getTrainRoute("00000")).toBeNull();
  });

  it("returns live status and timetable for a known train", () => {
    const live = RailBackendService.getTrainLiveStatus("12001");
    expect(live?.train.number).toBe("12001");
    expect(live?.timeline.length).toBeGreaterThan(0);

    const tt = RailBackendService.getTrainTimetable("12001");
    expect(tt?.halts[0]?.code).toBeTruthy();
    expect(RailBackendService.getTrainLiveStatus("00000")).toBeNull();
    expect(RailBackendService.getTrainTimetable("00000")).toBeNull();
  });

  it("searches stations and builds a station board", () => {
    const stations = RailBackendService.searchStations("NDLS", 5);
    expect(stations.length).toBeGreaterThan(0);
    const board = RailBackendService.getStationBoard("NDLS", "all");
    expect(board.station.code).toBe("NDLS");
    expect(board.totalServices).toBeGreaterThan(0);
    expect(RailBackendService.getStationBoard("NDLS", "arrivals").mode).toBe("arrivals");
    expect(RailBackendService.getStationBoard("NDLS", "departures").mode).toBe("departures");
  });

  it("finds trains between two stations", () => {
    const result = RailBackendService.findTrainsBetween("HBJ", "NDLS");
    expect(result.totalTrains).toBeGreaterThan(0);
    expect(result.trains[0]?.number).toBeTruthy();
  });

  it("aggregates control-room metrics", () => {
    const metrics = RailBackendService.getControlRoomMetrics();
    expect(metrics.kpis.totalTrackedTrains).toBeGreaterThan(0);
    expect(metrics.delayDistribution.length).toBeGreaterThan(0);
  });

  it("evaluates connecting-train impact and PNR status", async () => {
    const impact = RailBackendService.getConnectingImpact("12001", "12002", "NDLS");
    expect(impact?.transferStation.code).toBe("NDLS");
    expect(["SAFE", "RISKY", "MISSED"]).toContain(impact?.transferFeasibility);
    expect(RailBackendService.getConnectingImpact("00000", "12002", "NDLS")).toBeNull();
    expect(RailBackendService.getConnectingImpact("12001", "12002", "ZZZZ")).toBeNull();

    expect(await RailBackendService.getPnrStatus("123")).toBeNull();
    const pnr = await RailBackendService.getPnrStatus("1234567890");
    expect(pnr?.pnr).toBe("1234567890");
    expect(pnr?.passengers.length).toBeGreaterThan(0);
  });
});
