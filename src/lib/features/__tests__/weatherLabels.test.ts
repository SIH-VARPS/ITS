import { describe, expect, it } from "vitest";
import {
  describeWmoCode,
  describeWeather,
  humanWeatherFeature,
  weatherFromFeatures,
} from "../weatherLabels";

describe("weatherLabels", () => {
  it("turns WMO codes into plain-language sky conditions", () => {
    expect(describeWmoCode(0).label).toBe("Sky clear");
    expect(describeWmoCode(0).headline).toBe("Sky is clear");
    expect(describeWmoCode(1).label).toBe("Mostly clear");
    expect(describeWmoCode(3).kind).toBe("cloudy");
    expect(describeWmoCode(45).label).toBe("Fog");
    expect(describeWmoCode(61).label).toBe("Light rain");
    expect(describeWmoCode(63).label).toBe("Moderate rain");
    expect(describeWmoCode(65).label).toBe("Heavy rain");
    expect(describeWmoCode(95).kind).toBe("storm");
  });

  it("adds rain, visibility, and wind details people can read", () => {
    const rain = describeWeather({
      weatherCode: 61,
      precipitationMm: 4.2,
      visibilityKm: 8,
      windSpeedKmph: 18,
    });
    expect(rain.headline).toContain("Light rain");
    expect(rain.details.join(" ")).toMatch(/4\.2 mm rain/);
    expect(rain.details.join(" ")).toMatch(/Visibility 8 km/);
    expect(rain.details.join(" ")).toMatch(/Wind 18 km\/h/);
  });

  it("reads a feature vector and humanizes weather rows", () => {
    const snap = weatherFromFeatures([
      { name: "weatherCode", value: 45 },
      { name: "visibilityKm", value: 0.4 },
      { name: "precipitationMm", value: 0 },
      { name: "windSpeedKmph", value: 3 },
    ]);
    expect(snap.weatherCode).toBe(45);
    expect(humanWeatherFeature("weatherCode", 0)?.text).toBe("Sky clear");
    expect(humanWeatherFeature("precipitationMm", 0)?.text).toBe("None");
    expect(humanWeatherFeature("currentDelayMin", 12)).toBeNull();
  });
});
