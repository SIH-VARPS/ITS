import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { TrainRoute } from "@/data/trainTypes";
import allowlist from "@/data/claim-allowlist.json";
import {
  baselineEta,
  haltSlackMin,
  persistenceDelayMin,
  persistenceEta,
  recoveredDelayMin,
  recoveryAllowanceMin,
  scheduleOnlyEta,
} from "../baseline";

const fixtureTrain: TrainRoute = {
  number: "00001",
  name: "Baseline Fixture",
  type: "Express",
  startsAt: 600,
  runsOn: ["Mon"],
  zone: "NR",
  halts: [
    {
      code: "AAA",
      name: "Alpha",
      lat: 28.6,
      lng: 77.2,
      km: 0,
      arr: 0,
      dep: 0,
      platform: "1",
      day: 1,
      dayOfJourney: 1,
      coordSource: "lookup",
    },
    {
      code: "BBB",
      name: "Beta",
      lat: 27.0,
      lng: 76.0,
      km: 80,
      arr: 90,
      dep: 95,
      platform: "2",
      day: 1,
      dayOfJourney: 1,
      coordSource: "lookup",
    },
  ],
};

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function listFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) listFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

function collectScanFiles(glob: string): string[] {
  const trimmed = glob.replace(/^\.\//, "");
  const star = trimmed.indexOf("**");
  if (star === -1) {
    const file = join(ROOT, trimmed);
    return existsSync(file) && statSync(file).isFile() ? [file] : [];
  }
  const base = join(ROOT, trimmed.slice(0, star).replace(/[/\\]$/, ""));
  const ext = trimmed.slice(trimmed.lastIndexOf("."));
  return listFiles(base).filter((file) => !ext || file.endsWith(ext));
}

describe("IR schedule baseline", () => {
  it("predicts 15 min late when 20 min late with 5 min slack before the next halt", () => {
    const result = baselineEta(fixtureTrain, 1, 20, 5);
    expect(result.delayMin).toBe(15);
    expect(result.etaMin).toBe(fixtureTrain.startsAt + fixtureTrain.halts[1]!.arr + 15);
    expect(result.recoveryAppliedMin).toBe(5);
  });

  it("carries current delay forward unchanged (Baseline C) and shares recoveredDelayMin with B", () => {
    expect(recoveredDelayMin(20, 5)).toBe(15);
    expect(recoveredDelayMin(-3, 5)).toBe(0);
    expect(recoveredDelayMin(Number.NaN, 4)).toBe(0);
    expect(persistenceDelayMin(20)).toBe(20);
    expect(persistenceDelayMin(Number.NaN)).toBe(0);
    const carried = persistenceEta(fixtureTrain, 1, 20);
    expect(carried.delayMin).toBe(20);
    expect(carried.recoveryAppliedMin).toBe(0);
    expect(carried.etaMin).toBe(fixtureTrain.startsAt + fixtureTrain.halts[1]!.arr + 20);
  });

  it("equals the published schedule exactly when delay is zero", () => {
    const result = scheduleOnlyEta(fixtureTrain, 1);
    const scheduled = fixtureTrain.startsAt + fixtureTrain.halts[1]!.arr;
    expect(result.delayMin).toBe(0);
    expect(result.etaMin).toBe(scheduled);
    expect(result.scheduledArrivalMin).toBe(scheduled);
    expect(baselineEta(fixtureTrain, 1, 0, 5).etaMin).toBe(scheduled);
  });

  it("never produces an arrival earlier than scheduled", () => {
    const scheduled = fixtureTrain.startsAt + fixtureTrain.halts[1]!.arr;
    const recovered = baselineEta(fixtureTrain, 1, 4, 12);
    expect(recovered.delayMin).toBe(0);
    expect(recovered.etaMin).toBe(scheduled);
    expect(recovered.recoveryAppliedMin).toBe(4);
    expect(baselineEta(fixtureTrain, 1, -3, 5).etaMin).toBeGreaterThanOrEqual(scheduled);
  });

  it("derives dwell slack and treats missing/invalid inputs as zero", () => {
    expect(haltSlackMin(fixtureTrain, 1)).toBe(5);
    expect(haltSlackMin(fixtureTrain, 0)).toBe(0);
    expect(haltSlackMin(fixtureTrain, 99)).toBe(0);
    expect(recoveryAllowanceMin(fixtureTrain, 0, 1)).toBe(0);
    expect(recoveryAllowanceMin(fixtureTrain, 1, 1)).toBe(0);
    const inverted: TrainRoute = {
      ...fixtureTrain,
      halts: [{ ...fixtureTrain.halts[0]!, arr: 10, dep: 4 }, fixtureTrain.halts[1]!],
    };
    expect(haltSlackMin(inverted, 0)).toBe(0);
    expect(baselineEta(fixtureTrain, 1, Number.NaN, Number.NaN).delayMin).toBe(0);
    expect(baselineEta(fixtureTrain, 99, 8, 2).scheduledArrivalMin).toBe(fixtureTrain.startsAt);
  });

  it("claim-audit: no UI string asserts a numeric capability that is not computed at runtime", () => {
    const files: string[] = [];
    for (const glob of allowlist.scanGlobs) {
      files.push(...collectScanFiles(glob));
    }
    expect(files.length).toBeGreaterThan(0);
    const hits: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const needle of allowlist.forbiddenSubstrings) {
        if (text.includes(needle)) {
          hits.push(`${relative(ROOT, file)}: "${needle}"`);
        }
      }
    }
    expect(hits).toEqual([]);
  });
});
