import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * §3 PS clause → workstream → verifying test. A missing file or missing
 * distinctive assertion string means the clause is no longer gated.
 */
const CLAUSES: Array<{ clause: string; files: Array<{ path: string; needle: string }> }> = [
  {
    clause: "GPS-based location data",
    files: [
      { path: "src/server/live/__tests__/adapter.test.ts", needle: "maps the checked-in fixture" },
      {
        path: "src/server/live/__tests__/pipeline.test.ts",
        needle: "trips the breaker after 3 vendor failures",
      },
    ],
  },
  {
    clause: "Average sectional running times",
    files: [
      { path: "scripts/__tests__/ingest.test.ts", needle: "unique section graph" },
      { path: "src/lib/__tests__/etaEngine.test.ts", needle: "sums origin→destination" },
    ],
  },
  {
    clause: "Weather conditions",
    files: [
      {
        path: "src/lib/features/__tests__/weather.test.ts",
        needle: "caches a station-hour",
      },
    ],
  },
  {
    clause: "Historical delay patterns",
    files: [
      {
        path: "src/lib/features/__tests__/sectionFeatures.test.ts",
        needle: "ignores future-stuffed observations",
      },
    ],
  },
  {
    clause: "Congestion on downstream tracks",
    files: [
      {
        path: "src/lib/features/__tests__/sectionFeatures.test.ts",
        needle: "raises downstream occupancy",
      },
    ],
  },
  {
    clause: "Signal halts / unscheduled stoppages",
    files: [
      {
        path: "src/lib/features/__tests__/sectionFeatures.test.ts",
        needle: "dwellOverrunMin",
      },
      {
        path: "src/server/live/__tests__/parseLegacy.test.ts",
        needle: "treats exceptionInfo as a diversion flag",
      },
    ],
  },
  {
    clause: "Delays in preceding trains",
    files: [
      { path: "src/components/rail/__tests__/CascadePanel.test.tsx", needle: "downstream train" },
      { path: "e2e/surfaces.spec.ts", needle: "cascade-list" },
    ],
  },
  {
    clause: "Temporary speed restrictions",
    files: [
      {
        path: "src/lib/features/__tests__/sectionFeatures.test.ts",
        needle: "speedDeviationKmph",
      },
    ],
  },
  {
    clause: "Dynamic ETA at intermediate + destination",
    files: [
      {
        path: "src/lib/__tests__/etaEngine.test.ts",
        needle: "widens the destination interval",
      },
    ],
  },
  {
    clause: "Continuously refine over time",
    files: [
      {
        path: "src/lib/refine/__tests__/registry.test.ts",
        needle: "does not promote a challenger worse than the champion",
      },
    ],
  },
  {
    clause: "ML / statistical techniques",
    files: [
      {
        path: "src/lib/model/__tests__/treeEnsemble.test.ts",
        needle: "matches Python scores on 100 fixed vectors",
      },
    ],
  },
  {
    clause: "Scalable to thousands",
    files: [
      { path: "scripts/__tests__/ingest.test.ts", needle: "at least 10,000 routes" },
      { path: "src/lib/__tests__/perf.test.ts", needle: "scores 5,000 trains under 500 ms" },
    ],
  },
  {
    clause: "Diverse operational zones",
    files: [
      {
        path: "src/lib/eval/__tests__/harness.test.ts",
        needle: "reports synthetic and real hold-outs separately",
      },
    ],
  },
  {
    clause: "Temporal + spatial variability",
    files: [
      {
        path: "src/lib/eval/__tests__/harness.test.ts",
        needle: "reports synthetic and real hold-outs separately",
      },
    ],
  },
  {
    clause: "Multi-day cascading",
    files: [
      {
        path: "scripts/__tests__/ingest.test.ts",
        needle: "multi-day route with dayOfJourney",
      },
    ],
  },
  {
    clause: "APIs for mobile apps",
    files: [
      {
        path: "src/server/__tests__/apiV2.test.ts",
        needle: "validates health, eta, forecast, board",
      },
    ],
  },
  {
    clause: "APIs for station displays",
    files: [
      { path: "e2e/surfaces.spec.ts", needle: "station-display" },
      {
        path: "src/components/rail/__tests__/StationDisplayBoard.test.tsx",
        needle: "high-contrast arrivals",
      },
    ],
  },
  {
    clause: "APIs for control rooms",
    files: [
      { path: "e2e/surfaces.spec.ts", needle: "engine-spotlight" },
      { path: "src/components/rail/__tests__/CascadePanel.test.tsx", needle: "downstream train" },
    ],
  },
  {
    clause: "Engine / API / passenger ETA identity",
    files: [
      {
        path: "src/__tests__/consistency.test.tsx",
        needle: "keeps EtaEngine, /api/v2/eta, /api/v2/events",
      },
    ],
  },
];

describe("PS §3 traceability", () => {
  it("links every problem-statement clause to a passing test file", () => {
    const root = process.cwd();
    const missing: string[] = [];
    for (const row of CLAUSES) {
      for (const file of row.files) {
        const abs = join(root, file.path);
        if (!existsSync(abs)) {
          missing.push(`${row.clause}: missing ${file.path}`);
          continue;
        }
        const text = readFileSync(abs, "utf8");
        if (!text.includes(file.needle)) {
          missing.push(`${row.clause}: ${file.path} lost assertion "${file.needle}"`);
        }
      }
    }
    expect(missing, missing.join("\n")).toEqual([]);
  });
});
