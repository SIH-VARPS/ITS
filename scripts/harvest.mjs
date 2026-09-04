#!/usr/bin/env node
/**
 * RailRadar harvest (Phase 0 / R11).
 *
 * Appends raw `GET /v1/legacy/trains/{n}?dataType=full` responses to
 * `data/harvest/YYYY-MM-DD/{trainNo}.jsonl` (append-only). The corpus is
 * gitignored and cannot be backfilled.
 *
 * Auth: `RAILRADAR_API_KEY` from `process.env` (or a local `.env`). Never
 * `import.meta.env`. A missing key fails loudly — harvest never silently
 * substitutes the fixture.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_HOT_SET = path.join(ROOT, "scripts", "hot-set.json");
const DEFAULT_OUT_DIR = path.join(ROOT, "data", "harvest");
const RAILRADAR_BASE = "https://api.railradar.in/v1";

const MISSING_KEY_MESSAGE =
  "RAILRADAR_API_KEY is not set. Add it to .env (gitignored) or the process environment. Harvest will not run without a live key.";

/**
 * Load `.env` into `process.env` without overriding values already set.
 * Keys are never logged.
 */
export function loadDotEnv(envPath = path.join(ROOT, ".env")) {
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

/**
 * @param {string} [configPath]
 * @returns {string[]}
 */
export function loadHotSet(configPath = DEFAULT_HOT_SET) {
  const parsed = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const trains = parsed?.trains;
  if (!Array.isArray(trains) || trains.length === 0) {
    throw new Error(`Hot-set config at ${configPath} must contain a non-empty "trains" array.`);
  }
  return trains.map((trainNo) => String(trainNo));
}

/**
 * @param {string} apiKey
 * @returns {string}
 */
export function requireApiKey(apiKey) {
  const trimmed = typeof apiKey === "string" ? apiKey.trim() : "";
  if (!trimmed) {
    throw new Error(MISSING_KEY_MESSAGE);
  }
  return trimmed;
}

/**
 * Fetch one legacy-full payload. Requires a non-empty API key.
 *
 * @param {string} trainNo
 * @param {{ apiKey: string, fetchImpl?: typeof fetch }} opts
 */
export async function fetchLegacyTrain(trainNo, opts) {
  const apiKey = requireApiKey(opts.apiKey);
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  const url = `${RAILRADAR_BASE}/legacy/trains/${encodeURIComponent(trainNo)}?dataType=full`;
  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  return {
    trainNo,
    ok: response.ok,
    source: "railradar",
    status: response.status,
    body,
  };
}

/**
 * Harvest the hot list (or an explicit train list) and append JSONL.
 *
 * @param {{
 *   apiKey?: string,
 *   trainNos?: string[],
 *   hotSetPath?: string,
 *   outDir?: string,
 *   now?: Date,
 *   fetchImpl?: typeof fetch,
 *   loadEnv?: boolean,
 * }} [opts]
 */
export async function harvest(opts = {}) {
  if (opts.loadEnv !== false) loadDotEnv();
  const apiKey = requireApiKey(
    opts.apiKey !== undefined ? opts.apiKey : (process.env.RAILRADAR_API_KEY ?? ""),
  );
  const trainNos = opts.trainNos ?? loadHotSet(opts.hotSetPath);
  const outRoot = opts.outDir ?? DEFAULT_OUT_DIR;
  const now = opts.now ?? new Date();
  const istMs = now.getTime() + 330 * 60 * 1000;
  const dayStamp = new Date(istMs).toISOString().slice(0, 10);
  const dayDir = path.join(outRoot, dayStamp);
  fs.mkdirSync(dayDir, { recursive: true });

  const records = [];
  for (const trainNo of trainNos) {
    const fetched = await fetchLegacyTrain(trainNo, { apiKey, fetchImpl: opts.fetchImpl });
    const record = {
      harvestedAt: now.getTime(),
      trainNo: fetched.trainNo,
      ok: fetched.ok,
      source: fetched.source,
      status: fetched.status,
      body: fetched.body,
    };
    const outFile = path.join(dayDir, `${trainNo}.jsonl`);
    fs.appendFileSync(outFile, `${JSON.stringify(record)}\n`, "utf8");
    records.push({ ...record, outFile });
  }

  return {
    outDir: dayDir,
    mode: "live",
    count: records.length,
    records,
  };
}

const invokedDirectly =
  Boolean(process.argv[1]) &&
  path.normalize(fileURLToPath(import.meta.url)) === path.normalize(path.resolve(process.argv[1]));

if (invokedDirectly) {
  harvest()
    .then((result) => {
      console.log(`[harvest] mode=${result.mode} trains=${result.count} dir=${result.outDir}`);
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[harvest] failed: ${message}`);
      process.exitCode = 1;
    });
}
