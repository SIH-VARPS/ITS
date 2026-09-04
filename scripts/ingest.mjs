#!/usr/bin/env node
/**
 * Timetable ingest (SIH_PLAN W1).
 *
 * Reads public/*.csv plus scripts/data/stations.json and emits sharded
 * route data under src/data/generated/. Incremental: a content hash per
 * train means unchanged zone shards are not rewritten. Output is
 * deterministic (sorted keys / train numbers) so consecutive runs are
 * byte-identical when enrichment is off.
 *
 * Run: npm run ingest
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MONTH = 1440;
const INDIA_CENTROID = [21.1466, 79.0882];

const PREMIUM_NETWORKS = [
  "Vande Bharat",
  "Rajdhani",
  "Shatabdi",
  "Jan Shatabdi",
  "Duronto",
  "Garib Rath",
];

const LOCAL_CITIES = [
  {
    city: "Mumbai",
    codes: ["CSMT", "CST", "BCT", "MMCT", "LTT", "DR", "TNA", "PNVL", "ADH", "BA", "KYN"],
  },
  { city: "Kolkata", codes: ["HWH", "SDAH", "KOAA", "SHM", "SRC"] },
  { city: "Chennai", codes: ["MAS", "MS", "TBM", "BBQ"] },
  { city: "Hyderabad", codes: ["HYB", "SC", "KCG", "BMT"] },
];

/** Minimal RFC4180 CSV parser that handles quoted fields, escaped quotes and CRLF. */
export function parseCsv(text, hasHeader = true) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((x) => x !== "")) rows.push(row);
      field = "";
      row = [];
    } else {
      field += c;
    }
  }
  row.push(field);
  if (row.some((x) => x !== "")) rows.push(row);

  if (!hasHeader) return rows.map((r) => r.map(trim));

  const header = rows[0].map(trim);
  return rows.slice(1).map((r) => {
    const obj = {};
    header.forEach((h, i) => (obj[h] = (r[i] ?? "").trim()));
    return obj;
  });
}

function trim(s) {
  return s == null ? "" : String(s).trim();
}

function num(v, dflt = 0) {
  const n = Number.parseFloat(String(v ?? "").replace(",", ""));
  return Number.isFinite(n) ? n : dflt;
}

/** "22:10:00" or "22:10" -> minutes after midnight (0..1439). */
export function clockToMin(clock) {
  const m = String(clock ?? "").match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  return (+m[1] * 60 + +m[2] + Math.round(+(m[3] ?? 0) / 60)) % MONTH;
}

export function classifyType(trainNo) {
  const n = String(trainNo);
  if (/^(22|226)\d{3}$/.test(n) || /^22\d{4}$/.test(n)) return "Superfast";
  if (/^12\d{4}$/.test(n)) return "Superfast";
  if (/^24\d{3,4}$/.test(n)) return "Superfast";
  if (/^1\d{4}$/.test(n)) return "Express";
  if (/^2\d{4}$/.test(n)) return "Express";
  if (/^3\d{4}$/.test(n)) return "Mail/Express";
  if (/^(5|6)\d{4}$/.test(n)) return "Passenger";
  return "Express";
}

export function sanitizeZone(zone) {
  const z = String(zone ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return z || "UNZ";
}

/**
 * Fill missing halt coordinates by interpolating along route kilometres
 * between the nearest neighbours that already have a lookup.
 *
 * @returns {{ coords: [number, number][], sources: string[] }}
 */
export function interpolateHaltCoords(stops, lookup) {
  const coords = stops.map((s) => {
    const ll = lookup.get(s.code);
    return ll ? [ll[0], ll[1]] : null;
  });
  const sources = coords.map((c, i) => {
    if (!c) return "interpolated";
    return lookup.get(`${stops[i].code}__src`) === "override" ? "override" : "lookup";
  });

  for (let i = 0; i < stops.length; i++) {
    if (coords[i]) continue;
    let prev = i - 1;
    while (prev >= 0 && !coords[prev]) prev--;
    let next = i + 1;
    while (next < stops.length && !coords[next]) next++;
    if (prev >= 0 && next < stops.length) {
      const kmP = stops[prev].km;
      const kmN = stops[next].km;
      const km = stops[i].km;
      const t = kmN === kmP ? 0.5 : (km - kmP) / (kmN - kmP);
      const u = Math.min(1, Math.max(0, t));
      coords[i] = [
        coords[prev][0] + u * (coords[next][0] - coords[prev][0]),
        coords[prev][1] + u * (coords[next][1] - coords[prev][1]),
      ];
    } else if (prev >= 0) {
      coords[i] = [...coords[prev]];
    } else if (next < stops.length) {
      coords[i] = [...coords[next]];
    } else {
      coords[i] = [...INDIA_CENTROID];
    }
    sources[i] = "interpolated";
  }
  return { coords, sources };
}

function percentileSorted(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

function median(sorted) {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  return sorted[mid];
}

export function buildSections(routes) {
  /** @type {Map<string, { runs: number[], distances: number[], trains: Set<string> }>} */
  const map = new Map();
  for (const route of routes) {
    for (let i = 0; i < route.halts.length - 1; i++) {
      const from = route.halts[i];
      const to = route.halts[i + 1];
      const run = to.arr - from.dep;
      if (run <= 0) continue;
      const key = `${from.code}>${to.code}`;
      let bucket = map.get(key);
      if (!bucket) {
        bucket = { runs: [], distances: [], trains: new Set() };
        map.set(key, bucket);
      }
      bucket.runs.push(run);
      bucket.distances.push(Math.max(0, to.km - from.km));
      bucket.trains.add(route.number);
    }
  }
  const sections = [];
  for (const [key, bucket] of map) {
    const [fromCode, toCode] = key.split(">");
    const runs = [...bucket.runs].sort((a, b) => a - b);
    const distances = [...bucket.distances].sort((a, b) => a - b);
    const scheduledRunMin = Math.max(1, median(runs));
    sections.push({
      fromCode,
      toCode,
      distanceKm: median(distances),
      scheduledRunMin,
      trainCount: bucket.trains.size,
      p50RunMin: Math.max(1, percentileSorted(runs, 50)),
      p80RunMin: Math.max(1, percentileSorted(runs, 80)),
    });
  }
  sections.sort((a, b) => a.fromCode.localeCompare(b.fromCode) || a.toCode.localeCompare(b.toCode));
  return sections;
}

function parseDelay(dealyMin, _sc, _act) {
  const mm = Number(dealyMin);
  if (dealyMin && /:/.test(String(dealyMin))) return clockToMin(dealyMin);
  if (Number.isFinite(mm) && mm !== 0) return mm;
  return null;
}

function runsOnFor(freq) {
  const f = (freq || "").toLowerCase();
  if (f.includes("week")) return ["Mon"];
  if (f.includes("alternate") || f.includes("tri")) return ["Mon", "Wed", "Fri"];
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
}

function jsonLit(obj) {
  return JSON.stringify(obj);
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function writeIfChanged(path, content) {
  if (existsSync(path) && readFileSync(path, "utf8") === content) return false;
  writeFileSync(path, content);
  return true;
}

function loadStationLookup(stationPath, overridesPath) {
  const lookup = new Map();
  const zoneByCode = new Map();
  const nameLookup = new Map();
  if (!existsSync(stationPath)) {
    throw new Error(
      `[ingest] Missing ${stationPath}. Download the datameet stations.json into scripts/data/ and re-run.`,
    );
  }
  const lookupFeats = JSON.parse(readFileSync(stationPath, "utf8")).features ?? [];
  for (const f of lookupFeats) {
    const g = f.geometry;
    const code = f.properties?.code;
    if (!code) continue;
    nameLookup.set(code, f.properties.name);
    if (f.properties.zone) zoneByCode.set(code, sanitizeZone(f.properties.zone));
    if (g && Array.isArray(g.coordinates)) {
      lookup.set(code, [g.coordinates[1], g.coordinates[0]]);
    }
  }
  const overrides = JSON.parse(
    existsSync(overridesPath) ? readFileSync(overridesPath, "utf8") : "{}",
  );
  for (const [code, latlng] of Object.entries(overrides)) {
    lookup.set(code, latlng);
    lookup.set(`${code}__src`, "override");
  }
  return { lookup, zoneByCode, nameLookup };
}

function applyEnrichment(route, body) {
  const data = body?.data ?? body;
  const routeHalts = data?.route ?? data?.train?.route ?? data?.liveData?.route ?? [];
  if (!Array.isArray(routeHalts)) return;
  const byCode = new Map();
  for (const halt of routeHalts) {
    const code = halt.stationCode || halt.code || halt.station_code;
    if (code) byCode.set(String(code).toUpperCase(), halt);
  }
  for (const halt of route.halts) {
    const live = byCode.get(halt.code.toUpperCase());
    if (!live) continue;
    const platform = live.platformNumber ?? live.platform ?? live.pf;
    if (platform != null && String(platform).trim() && String(platform) !== "-") {
      halt.platform = String(platform);
    }
    const speed = live.speedToNextStationKmph ?? live.avgSpeed ?? live.speed;
    const speedNum = Number(speed);
    if (Number.isFinite(speedNum) && speedNum > 0) {
      halt.speedToNextStationKmph = speedNum;
    }
  }
}

async function enrichHotTrains(routes, { apiKey, hotSet, fetchImpl }) {
  if (!apiKey || hotSet.length === 0) return { attempted: 0, ok: 0 };
  const wanted = new Set(hotSet.map(String));
  let attempted = 0;
  let ok = 0;
  for (const route of routes) {
    if (!wanted.has(route.number)) continue;
    attempted += 1;
    try {
      const url = `https://api.railradar.in/v1/trains/${encodeURIComponent(route.number)}`;
      const response = await fetchImpl(url, {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      });
      if (!response.ok) continue;
      const body = await response.json();
      applyEnrichment(route, body);
      ok += 1;
    } catch {
      // optional enrichment — never fail ingest
    }
  }
  return { attempted, ok };
}

/**
 * @param {{
 *   root?: string,
 *   publicDir?: string,
 *   outDir?: string,
 *   stationPath?: string,
 *   overridesPath?: string,
 *   hotSetPath?: string,
 *   enrich?: boolean,
 *   apiKey?: string,
 *   fetchImpl?: typeof fetch,
 *   loadEnv?: boolean,
 * }} [opts]
 */
export async function ingest(opts = {}) {
  const root = opts.root ?? ROOT;
  const publicDir = opts.publicDir ?? join(root, "public");
  const outDir = opts.outDir ?? join(root, "src", "data", "generated");
  const stationPath = opts.stationPath ?? join(root, "scripts", "data", "stations.json");
  const overridesPath = opts.overridesPath ?? join(root, "scripts", "manual-overrides.json");
  const shardsDir = join(outDir, "shards");

  mkdirSync(outDir, { recursive: true });
  mkdirSync(shardsDir, { recursive: true });

  const { lookup, zoneByCode, nameLookup } = loadStationLookup(stationPath, overridesPath);

  const readPublic = (name) => readFileSync(join(publicDir, name), "utf8");

  const delayRows = parseCsv(readPublic("Indian Railway Delay Dataset.csv"));
  const delayStats = {};
  const delayTrainNames = {};
  for (const r of delayRows) {
    if (!r.train_number) continue;
    delayTrainNames[r.train_number] = r.train_name || delayTrainNames[r.train_number];
    const code = r.station_code;
    if (!code) continue;
    delayStats[r.train_number] ||= {};
    delayStats[r.train_number][code] = {
      avgDelayMin: num(r.average_delay_minutes),
      pctRight: num(r.pct_right_time),
      pctSlight: num(r.pct_slight_delay),
      pctSignificant: num(r.pct_significant_delay),
    };
  }

  const ttRows = parseCsv(readPublic("Train_details_22122017.csv"));
  const routesByTrain = {};
  const ttName = {};
  for (const r of ttRows) {
    const tn = r["Train No"];
    if (!tn) continue;
    const clockA = clockToMin(r["Arrival time"]);
    const clockD = clockToMin(r["Departure Time"]);
    routesByTrain[tn] ||= [];
    routesByTrain[tn].push({
      code: r["Station Code"],
      name: r["Station Name"],
      seq: +r.SEQ,
      clockA,
      clockD,
      km: num(r.Distance),
    });
    ttName[tn] = r["Train Name"] || ttName[tn];
  }

  const runRows = parseCsv(readPublic("Indian Railways Train Delays Dataset 2025.csv"));
  const runHistory = {};
  const runFreq = {};
  for (const r of runRows) {
    const tn = r.Train_no;
    if (!tn) continue;
    runHistory[tn] ||= [];
    const dl = parseDelay(r.Dealy_min, r.Sc_arr__time, r.Act_arr_time);
    if (dl != null) runHistory[tn].push(dl);
    runFreq[tn] = r.Run_frequency || runFreq[tn];
  }

  const stationMap = {};
  const routes = [];
  let interpolatedHaltCount = 0;

  const trainNumbers = Object.keys(routesByTrain).sort();
  for (const tn of trainNumbers) {
    const stops = (routesByTrain[tn] || []).sort((a, b) => a.seq - b.seq);
    if (stops.length < 2) continue;

    const startClock = stops[0].clockD ?? stops[0].clockA;
    if (startClock == null) continue;
    const startsAt = startClock;

    const dayByIdx = [];
    let dayOffset = 0;
    let prevDepClock = null;
    for (const s of stops) {
      if (prevDepClock != null && s.clockD != null && s.clockD < prevDepClock) dayOffset += MONTH;
      dayByIdx.push(dayOffset);
      if (s.clockD != null) prevDepClock = s.clockD;
    }
    const elapsedFor = (idx) =>
      (stops[idx].clockA ?? stops[idx].clockD ?? 0) + dayByIdx[idx] - startsAt;

    const { coords, sources } = interpolateHaltCoords(stops, lookup);

    const halts = stops.map((s, i) => {
      const arr = i === 0 ? 0 : elapsedFor(i);
      const depClock = stops[i].clockD ?? stops[i].clockA ?? arr;
      const dep = i === stops.length - 1 ? arr : Math.max(depClock + dayByIdx[i] - startsAt, arr);
      const dayOfJourney = Math.floor(arr / MONTH) + 1;
      const ll = coords[i];
      if (sources[i] === "interpolated") interpolatedHaltCount += 1;
      return {
        code: s.code,
        name: s.name || nameLookup.get(s.code) || s.code,
        lat: +Number(ll[0]).toFixed(4),
        lng: +Number(ll[1]).toFixed(4),
        km: Math.round(s.km),
        arr,
        dep,
        platform: "-",
        day: dayOfJourney,
        dayOfJourney,
        coordSource: sources[i],
      };
    });

    const originCode = halts[0].code;
    let zone = zoneByCode.get(originCode);
    if (!zone) {
      for (const h of halts) {
        zone = zoneByCode.get(h.code);
        if (zone) break;
      }
    }
    zone = sanitizeZone(zone);

    routes.push({
      number: tn,
      name: ttName[tn] || delayTrainNames[tn] || tn,
      type: classifyType(tn),
      startsAt,
      runsOn: runsOnFor(runFreq[tn]),
      zone,
      halts,
    });
  }

  let enrichResult = { attempted: 0, ok: 0 };
  const shouldEnrich = opts.enrich === true;
  if (shouldEnrich) {
    let apiKey = opts.apiKey ?? "";
    if (!apiKey && opts.loadEnv !== false) {
      try {
        const harvest = await import("./harvest.mjs");
        harvest.loadDotEnv();
        apiKey = process.env.RAILRADAR_API_KEY ?? "";
      } catch {
        apiKey = process.env.RAILRADAR_API_KEY ?? "";
      }
    }
    let hotSet = [];
    const hotSetPath = opts.hotSetPath ?? join(root, "scripts", "hot-set.json");
    if (existsSync(hotSetPath)) {
      try {
        const parsed = JSON.parse(readFileSync(hotSetPath, "utf8"));
        hotSet = Array.isArray(parsed?.trains) ? parsed.trains.map(String) : [];
      } catch {
        hotSet = [];
      }
    }
    enrichResult = await enrichHotTrains(routes, {
      apiKey: apiKey.trim(),
      hotSet,
      fetchImpl: opts.fetchImpl ?? globalThis.fetch,
    });
  }

  for (const r of routes) {
    for (const h of r.halts) {
      stationMap[h.code] ||= { name: h.name, lat: h.lat, lng: h.lng };
    }
  }

  const sections = buildSections(routes);

  const trainIndex = {};
  const shards = new Map();
  for (const route of routes) {
    trainIndex[route.number] = route.zone;
    if (!shards.has(route.zone)) shards.set(route.zone, []);
    shards.get(route.zone).push(route);
  }
  for (const list of shards.values()) list.sort((a, b) => a.number.localeCompare(b.number));

  const hashManifest = {};
  for (const route of routes) {
    hashManifest[route.number] = sha256(jsonLit(route));
  }

  const prevHashPath = join(outDir, ".ingest-hash.json");
  const prevHashes = existsSync(prevHashPath) ? JSON.parse(readFileSync(prevHashPath, "utf8")) : {};

  const written = [];
  const zoneNames = [...shards.keys()].sort();
  for (const zone of zoneNames) {
    const list = shards.get(zone);
    const shardUnchanged = list.every((r) => prevHashes[r.number] === hashManifest[r.number]);
    const shardPath = join(shardsDir, `${zone}.json`);
    const content = `${jsonLit(list)}\n`;
    if (shardUnchanged && existsSync(shardPath) && readFileSync(shardPath, "utf8") === content) {
      continue;
    }
    if (writeIfChanged(shardPath, content)) written.push(shardPath);
  }

  for (const file of readdirSync(shardsDir)) {
    if (!file.endsWith(".json")) continue;
    const zone = file.slice(0, -".json".length);
    if (!shards.has(zone)) rmSync(join(shardsDir, file));
  }

  const summaries = routes.map((r) => ({
    number: r.number,
    name: r.name,
    type: r.type,
    zone: r.zone,
    origin: r.halts[0].code,
    originName: r.halts[0].name,
    destination: r.halts[r.halts.length - 1].code,
    destinationName: r.halts[r.halts.length - 1].name,
  }));

  const networkCounts = PREMIUM_NETWORKS.map((name) => ({
    name,
    active: routes.filter((r) => r.name.toLowerCase().includes(name.toLowerCase())).length,
  }));

  const localCounts = LOCAL_CITIES.map(({ city, codes }) => {
    const set = new Set(codes);
    return {
      city,
      active: routes.filter((r) => r.halts.some((h) => set.has(h.code))).length,
    };
  });

  const catalog = {
    routeCount: routes.length,
    zones: zoneNames,
    networkCounts,
    localCounts,
    trains: summaries,
  };

  const hotSetPath = opts.hotSetPath ?? join(root, "scripts", "hot-set.json");
  const hotSet = existsSync(hotSetPath)
    ? (JSON.parse(readFileSync(hotSetPath, "utf8")).trains ?? []).map(String)
    : [];
  const featuredNumbers = new Set([...hotSet, ...Object.keys(delayStats)]);
  const multiDay = routes.filter((r) => r.halts[r.halts.length - 1].arr > MONTH);
  for (const r of multiDay.slice(0, 5)) featuredNumbers.add(r.number);
  const featured = routes.filter((r) => featuredNumbers.has(r.number));

  const stationIndex = {};
  for (const r of routes) {
    for (const h of r.halts) {
      stationIndex[h.code] ||= [];
      stationIndex[h.code].push(r.number);
    }
  }
  for (const code of Object.keys(stationIndex)) {
    stationIndex[code] = [...new Set(stationIndex[code])].sort();
  }

  const files = {
    catalog: join(outDir, "catalog.json"),
    featured: join(outDir, "featured.json"),
    sections: join(outDir, "sections.json"),
    stations: join(outDir, "stations.json"),
    trainIndex: join(outDir, "trainIndex.json"),
    stationIndex: join(outDir, "stationIndex.json"),
    hashes: join(outDir, ".ingest-hash.json"),
  };

  writeIfChanged(files.catalog, `${jsonLit(catalog)}\n`);
  writeIfChanged(files.featured, `${jsonLit(featured)}\n`);
  writeIfChanged(files.sections, `${jsonLit(sections)}\n`);
  writeIfChanged(files.stations, `${jsonLit(stationMap)}\n`);
  writeIfChanged(files.trainIndex, `${jsonLit(trainIndex)}\n`);
  writeIfChanged(files.stationIndex, `${jsonLit(stationIndex)}\n`);
  writeIfChanged(files.hashes, `${jsonLit(hashManifest)}\n`);

  writeIfChanged(
    join(outDir, "catalog.ts"),
    `// generated by npm run ingest
import type { TrainSummary } from "../trainTypes";
import catalogJson from "./catalog.json";

export const ROUTE_COUNT: number = catalogJson.routeCount;
export const CATALOG_ZONES: string[] = catalogJson.zones;
export const networkCounts: { name: string; active: number }[] = catalogJson.networkCounts;
export const localCounts: { city: string; active: number }[] = catalogJson.localCounts;
export const catalogTrains: TrainSummary[] = catalogJson.trains as TrainSummary[];
`,
  );

  writeIfChanged(
    join(outDir, "featured.ts"),
    `// generated by npm run ingest
import type { TrainRoute } from "../trainTypes";
import featuredJson from "./featured.json";

export const featuredRoutes: TrainRoute[] = featuredJson as TrainRoute[];
`,
  );

  writeIfChanged(
    join(outDir, "sections.ts"),
    `// generated by npm run ingest
import type { Section } from "../trainTypes";
import sectionsJson from "./sections.json";

export const sections: Section[] = sectionsJson as Section[];
`,
  );

  writeIfChanged(
    join(outDir, "stations.ts"),
    `// generated by npm run ingest
import stationsJson from "./stations.json";

export type Station = { name: string; lat: number; lng: number };

export const stationMap: Record<string, Station> = stationsJson as Record<string, Station>;

export function stationFor(code: string): Station | undefined {
  return stationMap[code];
}
`,
  );

  writeIfChanged(
    join(outDir, "delayStats.ts"),
    `// generated by npm run ingest

export type StationDelayStats = {
  avgDelayMin: number;
  pctRight: number;
  pctSlight: number;
  pctSignificant: number;
};

export type TrainDelayTable = Record<string, StationDelayStats>;

export const trainDelayStats: Record<string, TrainDelayTable> = ${jsonLit(delayStats)};
`,
  );

  writeIfChanged(
    join(outDir, "runHistory.ts"),
    `// generated by npm run ingest

export const trainRunHistory: Record<string, number[]> = ${jsonLit(runHistory)};
`,
  );

  const staleRoutes = join(outDir, "routes.ts");
  if (existsSync(staleRoutes)) rmSync(staleRoutes);

  const haltCount = routes.reduce((a, r) => a + r.halts.length, 0);
  const maxElapsed = routes.reduce((m, r) => Math.max(m, r.halts[r.halts.length - 1].arr), 0);

  console.log(`[ingest] stations: ${Object.keys(stationMap).length}`);
  console.log(`[ingest] routes: ${routes.length} trains`);
  console.log(`[ingest] halts: ${haltCount}`);
  console.log(`[ingest] interpolated halts: ${interpolatedHaltCount}`);
  console.log(`[ingest] sections: ${sections.length}`);
  console.log(`[ingest] zones: ${zoneNames.join(", ")}`);
  console.log(`[ingest] featured: ${featured.length}`);
  console.log(`[ingest] maxElapsed: ${maxElapsed} min`);
  console.log(`[ingest] trains with delay stats: ${Object.keys(delayStats).length}`);
  console.log(`[ingest] trains with run history: ${Object.keys(runHistory).length}`);
  if (enrichResult.attempted) {
    console.log(`[ingest] enrichment: ${enrichResult.ok}/${enrichResult.attempted} hot trains`);
  }

  return {
    outDir,
    routes,
    sections,
    catalog,
    featured,
    zoneNames,
    interpolatedHaltCount,
    maxElapsed,
    written,
  };
}

const isDirect =
  Boolean(process.argv[1]) && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  ingest({ enrich: process.env.ENRICH_HOT_TRAINS === "1" }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
