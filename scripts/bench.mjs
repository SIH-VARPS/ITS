#!/usr/bin/env node
import { createServer } from "vite";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SIZES = [1_000, 5_000, 11_000];
const RUNS = 5;

function percentile(samples, p) {
  const sorted = [...samples].sort((a, b) => a - b);
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index] ?? 0;
}

const server = await createServer({
  configFile: false,
  root,
  resolve: {
    alias: { "@": join(root, "src") },
  },
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "error",
});

try {
  const engine = await server.ssrLoadModule("/src/lib/etaEngine.ts");
  const fleetMod = await server.ssrLoadModule("/src/lib/perf/fleet.ts");
  const stubMod = await server.ssrLoadModule("/src/lib/refine/stubArtifact.ts");
  const now = new Date("2026-03-15T16:00:00+05:30");
  const artifact = stubMod.stubArtifact("bench-stub", {
    maeMin: 0,
    medaeMin: 0,
    rmseMin: 0,
    p80Coverage: 1,
  });

  console.log("RailDristhi ETA scoring bench");
  console.log(
    "method: stub leaf-only GBT, 4-halt synthetic trains (shared halt array), next-halt score, occupancy=[]",
  );
  console.log("gate: 5,000 trains < 500 ms on CI (src/lib/__tests__/perf.test.ts)");
  console.log("");

  for (const n of SIZES) {
    const trains = fleetMod.syntheticFleet(n, 10_000, now);
    engine.resetEtaEngineForTests();
    engine.scoreFleet(trains.slice(0, 8), now, { artifact });

    const cold = [];
    const warm = [];
    for (let i = 0; i < RUNS; i++) {
      engine.resetEtaEngineForTests();
      const t0 = performance.now();
      engine.scoreFleet(trains, now, { artifact });
      cold.push(performance.now() - t0);

      const t1 = performance.now();
      engine.scoreFleet(trains, now, { artifact });
      warm.push(performance.now() - t1);
    }

    const fmt = (samples) =>
      `p50=${percentile(samples, 50).toFixed(1)}ms p95=${percentile(samples, 95).toFixed(1)}ms`;
    console.log(`n=${String(n).padStart(5, " ")}  cold ${fmt(cold)}  warm ${fmt(warm)}`);
  }
} finally {
  await server.close();
}
