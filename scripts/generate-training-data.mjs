import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "ml", "data");
const RHO = 0.65;

export function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function gauss(rng) {
  const u = Math.max(1e-12, rng());
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function loadDelayPriors(csvPath) {
  const text = readFileSync(csvPath, "utf8");
  const lines = text.split(/\r?\n/).filter(Boolean);
  /** @type {Record<string, Record<string, number>>} */
  const priors = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const trainNo = String(cols[0] ?? "").trim();
    const station = String(cols[2] ?? "")
      .trim()
      .toUpperCase();
    const mean = Number(cols[4]);
    if (!trainNo || !station || !Number.isFinite(mean)) continue;
    priors[trainNo] ??= {};
    priors[trainNo][station] = mean;
  }
  return priors;
}

/**
 * AR(1) around the per-station mean path so E[delay_i] ≈ mean_i.
 * delay_i = mean_i + ρ (delay_{i-1} − mean_{i-1}) + noise
 */
export function simulateAr1Delays(halts, stationMeans, rng, rho = RHO) {
  /** @type {number[]} */
  const delays = [];
  for (let i = 0; i < halts.length; i++) {
    const mean = stationMeans[halts[i].code] ?? (i === 0 ? 0 : (delays[i - 1] ?? 0));
    const prevMean = i === 0 ? 0 : (stationMeans[halts[i - 1].code] ?? delays[i - 1] ?? 0);
    const sd = Math.max(3, Math.abs(mean) * 0.25);
    const noise = gauss(rng) * sd;
    const persist = i === 0 ? 0 : rho * (delays[i - 1] - prevMean);
    delays.push(Math.max(0, mean + persist + noise));
  }
  return delays;
}

function sectionStats(from, to, graph) {
  const scheduled = Math.max(1, to.arr - from.dep);
  const hit = graph.get(`${from.code}|${to.code}`);
  return {
    meanRunMin: hit?.p50RunMin ?? scheduled,
    p80RunMin: hit?.p80RunMin ?? Math.max(scheduled, scheduled * 1.2),
  };
}

function loadGraph() {
  const sections = JSON.parse(readFileSync(join(ROOT, "src/data/generated/sections.json"), "utf8"));
  /** @type {Map<string, { p50RunMin: number, p80RunMin: number }>} */
  const graph = new Map();
  for (const row of sections) {
    graph.set(`${row.fromCode}|${row.toCode}`, {
      p50RunMin: row.p50RunMin,
      p80RunMin: row.p80RunMin,
    });
  }
  return graph;
}

function toRawRun(train, runDate, delays, graph, occupancyBySection, weatherByHalt) {
  return {
    trainNo: train.number,
    trainClass: train.type || "Unknown",
    runDate,
    startsAt: train.startsAt,
    occupancyBySection,
    weatherByHalt,
    halts: train.halts.map((halt, i) => {
      const next = train.halts[i + 1];
      const stats = next ? sectionStats(halt, next, graph) : { meanRunMin: 1, p80RunMin: 1 };
      const published =
        typeof halt.speedToNextStationKmph === "number" && halt.speedToNextStationKmph > 0
          ? halt.speedToNextStationKmph
          : next
            ? Math.max(0, next.km - halt.km) / Math.max(1 / 60, (next.arr - halt.dep) / 60)
            : 0;
      return {
        code: halt.code,
        lat: halt.lat,
        lng: halt.lng,
        km: halt.km,
        arr: halt.arr,
        dep: halt.dep,
        dayOfJourney: halt.dayOfJourney || halt.day || 1,
        speedToNextStationKmph: published,
        delayMin: delays[i] ?? 0,
        meanRunMin: stats.meanRunMin,
        p80RunMin: stats.p80RunMin,
      };
    }),
  };
}

function addDays(isoDate, days) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function harvestRuns(graph, trainsByNumber) {
  const harvestRoot = join(ROOT, "data/harvest");
  if (!existsSync(harvestRoot)) return [];
  /** @type {object[]} */
  const runs = [];
  const files = [];
  for (const name of readdirSync(harvestRoot)) {
    const full = join(harvestRoot, name);
    if (name.endsWith(".jsonl")) files.push(full);
    else {
      try {
        for (const nested of readdirSync(full)) {
          if (nested.endsWith(".jsonl")) files.push(join(full, nested));
        }
      } catch {
        /* not a directory */
      }
    }
  }
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const line of text.split(/\r?\n/).filter(Boolean)) {
      try {
        const record = JSON.parse(line);
        const liveRoute = record?.body?.data?.liveData?.route;
        const trainNo = String(record?.trainNo ?? "");
        const train = trainsByNumber.get(trainNo);
        if (!train || !Array.isArray(liveRoute) || liveRoute.length < 2) continue;
        const delayByCode = new Map();
        for (const halt of liveRoute) {
          const code = String(halt.stationCode ?? "").toUpperCase();
          const delay = Number(
            halt.delayDepartureMinutes ?? halt.delayArrivalMinutes ?? halt.delayMinutes,
          );
          if (code && Number.isFinite(delay)) delayByCode.set(code, delay);
        }
        if (delayByCode.size < 2) continue;
        const delays = train.halts.map((halt) => delayByCode.get(halt.code.toUpperCase()) ?? 0);
        const runDate = String(record?.body?.data?.liveData?.journeyDate ?? "2026-09-03").slice(
          0,
          10,
        );
        runs.push(
          toRawRun(
            train,
            /^\d{4}-\d{2}-\d{2}$/.test(runDate) ? runDate : "2026-09-03",
            delays,
            graph,
            train.halts.map(() => 0),
            train.halts.map(() => 0),
          ),
        );
      } catch {
        /* skip bad line */
      }
    }
  }
  return runs.map((run) => ({ ...run, provenance: "railradar" }));
}

export function generateRawRuns(options = {}) {
  const seed = options.seed ?? 20260315;
  const runsPerTrain = options.runsPerTrain ?? 36;
  const rng = mulberry32(seed);
  const priors = loadDelayPriors(join(ROOT, "public/Indian Railway Delay Dataset.csv"));
  const featured = JSON.parse(readFileSync(join(ROOT, "src/data/generated/featured.json"), "utf8"));
  const graph = loadGraph();
  const trainsByNumber = new Map(featured.map((train) => [train.number, train]));
  const originDate = "2026-01-05";
  /** @type {object[]} */
  const runs = [];

  for (const train of featured) {
    if (!train.halts || train.halts.length < 3) continue;
    const stationMeans = priors[train.number] ?? {};
    for (let r = 0; r < runsPerTrain; r++) {
      const delays = simulateAr1Delays(train.halts, stationMeans, rng);
      const occupancyBySection = train.halts.map(() =>
        rng() < 0.15 ? 1 + Math.floor(rng() * 3) : 0,
      );
      const weatherByHalt = train.halts.map((_, i) => {
        const month = ((r + i) % 12) + 1;
        if (month >= 6 && month <= 9) return rng() < 0.45 ? 61 : 0;
        if (month === 12 || month <= 2) return rng() < 0.2 ? 45 : 0;
        return rng() < 0.08 ? 61 : 0;
      });
      const runDate = addDays(originDate, r % 90);
      runs.push({
        ...toRawRun(train, runDate, delays, graph, occupancyBySection, weatherByHalt),
        provenance: "synthetic",
      });
    }
  }

  runs.push(...harvestRuns(graph, trainsByNumber));
  return { runs, priors, featured };
}

export function writeTrainingCorpus() {
  mkdirSync(OUT_DIR, { recursive: true });
  const { runs } = generateRawRuns();
  const outPath = join(OUT_DIR, "raw-runs.jsonl");
  writeFileSync(outPath, runs.map((run) => JSON.stringify(run)).join("\n") + "\n", "utf8");
  const skew = runs.filter((run) => run.trainNo === "12951" || run.trainNo === "12001").slice(0, 4);
  mkdirSync(join(ROOT, "src/lib/features/__fixtures__"), { recursive: true });
  writeFileSync(
    join(ROOT, "src/lib/features/__fixtures__/skew-raw.json"),
    JSON.stringify(skew, null, 2),
    "utf8",
  );
  return {
    outPath,
    count: runs.length,
    real: runs.filter((r) => r.provenance === "railradar").length,
  };
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.normalize(thisFile) === path.normalize(path.resolve(process.argv[1]))) {
  const result = writeTrainingCorpus();
  console.log(`wrote ${result.count} runs (${result.real} real) → ${result.outPath}`);
}
