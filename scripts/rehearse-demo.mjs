#!/usr/bin/env node
/**
 * Stage rehearsal probe. Hits a running preview (default http://127.0.0.1:4173)
 * and prints the numbers you quote in the 7-minute talk.
 *
 *   LIVE_FEED_DISABLE_VENDOR=1 npx vite preview --host 127.0.0.1 --port 4173
 *   npm run demo:rehearse
 */
const base = (process.env["DEMO_BASE_URL"] ?? "http://127.0.0.1:4173").replace(/\/$/, "");

async function getJson(path) {
  const response = await fetch(`${base}${path}`);
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    throw new Error(`${path} → ${response.status} ${text.slice(0, 200)}`);
  }
  return body;
}

const health = await getJson("/api/v2/health");
const live = await getJson("/api/v2/live/12951");
const eta = await getJson("/api/v2/eta?train=12951&station=NDLS");

const report = {
  base,
  health: health.status,
  modelLoaded: health.modelLoaded,
  modelVersion: health.modelVersion,
  liveSource: live.source,
  eta: eta.eta,
  etaModelVersion: eta.modelVersion,
  delayMin: eta.delayMin,
};

console.log(JSON.stringify(report, null, 2));

if (health.status !== "ok" || !health.modelLoaded) {
  console.error("health gate failed");
  process.exit(1);
}
if (typeof eta.eta !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(eta.eta)) {
  console.error("eta gate failed");
  process.exit(1);
}
if (!["railradar", "crowd", "replay"].includes(live.source)) {
  console.error("live source gate failed");
  process.exit(1);
}
