#!/usr/bin/env node
import { createServer } from "vite";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

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
  const mod = await server.ssrLoadModule("/src/lib/eval/writeReport.ts");
  const report = mod.writeEvalReport();
  const synth = report.synthetic?.horizons?.destination;
  const real = report.real?.horizons?.destination;
  console.log(
    `wrote eval/report.json  synthetic_n=${report.synthetic?.n ?? 0} real_n=${report.real?.n ?? 0}` +
      ` dest_improvement_vs_B=${synth?.improvementVsBPct ?? "n/a"}%` +
      ` real_dest_improvement_vs_B=${real?.improvementVsBPct ?? "n/a"}%`,
  );
} finally {
  await server.close();
}
