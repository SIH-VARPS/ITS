import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { IST_OFFSET_MIN } from "./parseLegacy";

export type HarvestRecord = {
  harvestedAt: number;
  trainNo: string;
  ok: boolean;
  source: "railradar";
  status: number;
  body: unknown;
};

export type HarvestLogOptions = {
  rootDir?: string;
  now?: () => number;
};

const DEFAULT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../data/harvest");

function istDayStamp(epochMs: number): string {
  return new Date(epochMs + IST_OFFSET_MIN * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * Append-only JSONL harvest corpus. Survives process restart when `rootDir`
 * is on a durable filesystem.
 */
export class HarvestLog {
  private readonly rootDir: string;
  private readonly now: () => number;

  constructor(options: HarvestLogOptions = {}) {
    this.rootDir = options.rootDir ?? DEFAULT_ROOT;
    this.now = options.now ?? (() => Date.now());
  }

  append(record: HarvestRecord): string {
    const day = istDayStamp(record.harvestedAt);
    const dayDir = join(this.rootDir, day);
    mkdirSync(dayDir, { recursive: true });
    const outFile = join(dayDir, `${record.trainNo}.jsonl`);
    appendFileSync(outFile, `${JSON.stringify(record)}\n`, "utf8");
    this.writeMeta(record.harvestedAt);
    return outFile;
  }

  readTrain(trainNo: string, dayStamp?: string): HarvestRecord[] {
    const day = dayStamp ?? istDayStamp(this.now());
    const outFile = join(this.rootDir, day, `${trainNo}.jsonl`);
    if (!existsSync(outFile)) return [];
    return readFileSync(outFile, "utf8")
      .split(/\r?\n/)
      .filter((line) => line.trim() !== "")
      .map((line) => JSON.parse(line) as HarvestRecord);
  }

  lastHarvestAt(): number | null {
    const metaPath = join(this.rootDir, "meta.json");
    if (existsSync(metaPath)) {
      try {
        const parsed = JSON.parse(readFileSync(metaPath, "utf8")) as { lastHarvestAt?: unknown };
        if (typeof parsed.lastHarvestAt === "number" && Number.isFinite(parsed.lastHarvestAt)) {
          return parsed.lastHarvestAt;
        }
      } catch {
        /* fall through to scan */
      }
    }
    return this.scanLastHarvestAt();
  }

  private writeMeta(harvestedAt: number): void {
    mkdirSync(this.rootDir, { recursive: true });
    writeFileSync(
      join(this.rootDir, "meta.json"),
      JSON.stringify({ lastHarvestAt: harvestedAt }),
      "utf8",
    );
  }

  private scanLastHarvestAt(): number | null {
    if (!existsSync(this.rootDir)) return null;
    let latest: number | null = null;
    for (const day of readdirSync(this.rootDir)) {
      const dayDir = join(this.rootDir, day);
      try {
        for (const file of readdirSync(dayDir)) {
          if (!file.endsWith(".jsonl")) continue;
          const rows = this.readTrain(file.replace(/\.jsonl$/, ""), day);
          for (const row of rows) {
            if (latest === null || row.harvestedAt > latest) latest = row.harvestedAt;
          }
        }
      } catch {
        continue;
      }
    }
    return latest;
  }
}

let sharedHarvest: HarvestLog | null = null;

export function getHarvestLog(): HarvestLog {
  if (!sharedHarvest) sharedHarvest = new HarvestLog();
  return sharedHarvest;
}

export function setHarvestLogForTests(log: HarvestLog | null): void {
  sharedHarvest = log;
}
