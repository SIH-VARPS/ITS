import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { ingest } from "../ingest.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = join(ROOT, "src");

function listFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) listFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

function hashTree(dir: string): string {
  const files = listFiles(dir).sort();
  const hash = createHash("sha256");
  for (const full of files) {
    hash.update(full.slice(dir.length).replaceAll("\\", "/"));
    hash.update("\0");
    hash.update(readFileSync(full));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function clientEntryFiles(): string[] {
  const roots = [
    join(SRC, "routes"),
    join(SRC, "components"),
    join(SRC, "hooks"),
    join(SRC, "data", "trains.ts"),
    join(SRC, "data", "rail.ts"),
    join(SRC, "router.tsx"),
  ];
  const files: string[] = [];
  for (const root of roots) {
    if (statSync(root).isDirectory()) files.push(...listFiles(root));
    else files.push(root);
  }
  return files.filter((f) => !f.includes(`${join("data", "generated")}`));
}

const outDir = mkdtempSync(join(tmpdir(), "raildristhi-ingest-"));

describe("ingest (W1)", { timeout: 180_000 }, () => {
  let result: Awaited<ReturnType<typeof ingest>>;

  it("emits at least 10,000 routes from the real CSVs", async () => {
    result = await ingest({
      root: ROOT,
      outDir,
      enrich: false,
      loadEnv: false,
    });
    expect(result.routes.length).toBeGreaterThanOrEqual(10_000);
    expect(result.catalog.routeCount).toBe(result.routes.length);
  });

  it("keeps a multi-day route with dayOfJourney increments", () => {
    const multi = result.routes.filter((r) => r.halts[r.halts.length - 1]!.arr > 1440);
    expect(multi.length).toBeGreaterThanOrEqual(1);
    const sample = multi[0]!;
    expect(result.maxElapsed).toBeGreaterThan(1440);
    for (let i = 1; i < sample.halts.length; i++) {
      expect(sample.halts[i]!.dayOfJourney).toBeGreaterThanOrEqual(
        sample.halts[i - 1]!.dayOfJourney,
      );
    }
    expect(sample.halts[sample.halts.length - 1]!.dayOfJourney).toBeGreaterThan(1);
  });

  it("gives every halt finite coordinates and flags interpolated ones", () => {
    let interpolated = 0;
    for (const route of result.routes) {
      for (const halt of route.halts) {
        expect(Number.isFinite(halt.lat)).toBe(true);
        expect(Number.isFinite(halt.lng)).toBe(true);
        if (halt.coordSource === "interpolated") interpolated += 1;
      }
    }
    expect(interpolated).toBe(result.interpolatedHaltCount);
  });

  it("emits a unique section graph with positive scheduled run times", () => {
    const keys = new Set<string>();
    for (const section of result.sections) {
      const key = `${section.fromCode}>${section.toCode}`;
      expect(keys.has(key)).toBe(false);
      keys.add(key);
      expect(section.scheduledRunMin).toBeGreaterThan(0);
      expect(section.p50RunMin).toBeGreaterThan(0);
      expect(section.p80RunMin).toBeGreaterThan(0);
    }
    expect(keys.size).toBe(result.sections.length);
  });

  it("is idempotent: two consecutive runs produce byte-identical output", async () => {
    const secondDir = mkdtempSync(join(tmpdir(), "raildristhi-ingest-b-"));
    try {
      await ingest({
        root: ROOT,
        outDir: secondDir,
        enrich: false,
        loadEnv: false,
      });
      expect(hashTree(secondDir)).toBe(hashTree(outDir));
    } finally {
      rmSync(secondDir, { recursive: true, force: true });
    }
  });

  it("bundle guard: client entry does not import generated/routes wholesale", () => {
    const hits: string[] = [];
    for (const file of clientEntryFiles()) {
      if (!/\.(ts|tsx)$/.test(file)) continue;
      const text = readFileSync(file, "utf8");
      if (text.includes("generated/routes") || text.includes("generated\\routes")) {
        hits.push(file.slice(SRC.length));
      }
    }
    expect(hits).toEqual([]);
  });
});

afterAll(() => {
  rmSync(outDir, { recursive: true, force: true });
});
