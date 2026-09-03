# RailDristhi → SIH PS Compliance Plan

**Problem statement:** Real-time, data-driven ETA prediction for coaching trains that adapts to
actual running conditions, uses ML/statistical models, scales to thousands of trains, and exposes
APIs for mobile apps, station displays, and control room dashboards.

**Status today:** strong product shell, weak forecasting core. This plan converts the shell into an
actual answer to the PS.

**Resourcing:** time and manpower are not the binding constraint. Full scope, no cuts. The binding
constraint becomes **integration quality across parallel contributors** — §4 and §5 exist for that
reason and are not optional.

**Start here:** §4 (standards) → §5 (gates) → §11 (Phase 0 checklist).

---

## 0. Reality check (measured, not assumed)

### 0.1 Data audit

| File | Rows | Distinct trains | What it actually is |
|---|---|---|---|
| `public/Train_details_22122017.csv` | 186,124 | **11,113** (8,151 stations) | Static timetables. The scale backbone. |
| `public/Indian Railway Delay Dataset.csv` | 1,900 | 90 | Per-train **per-station average** delay + on-time %. Aggregates only — no timestamps. |
| `public/Indian Railways Train Delays Dataset 2025.csv` | 100 | **10** | Origin→destination delay, ~10 yearly samples per train (2016–2023). Not a training set. |

**Conclusion:** excellent *schedule* data, usable *delay priors*, and **no per-run, per-station
observation history** in the repo. Resolved by RailRadar harvesting (§1.1) plus a calibrated
simulator (W4).

### 0.2 Current code vs PS

| PS requirement | Current implementation | Gap |
|---|---|---|
| Live location feed | `computeLiveStatus()` interpolates the timetable against wall-clock | No feed at all |
| Dynamic ETA reacting to events | ETA is a pure function of `(train, now)` | Nothing to react to |
| ML / statistical model | `etaModel.ts`, `MODEL.method: "heuristic"` | No model, no training |
| **Continuous refinement over time** | none | **No retraining loop — explicit PS requirement** |
| Historical delay patterns | `historicalDelayAt()` reads real per-station averages | Real, but a single scalar prior |
| Weather / congestion | `hash(trainNumber + date)` in `buildFeatures()` | Fabricated |
| Signals / TSR / unscheduled stops | absent | Absent |
| Scale to thousands | 41 routes (ingest filters) | Filter artifact, not a hard limit |
| Multi-day journeys | `scripts/ingest.mjs` **drops** runs ≥ 1440 min | The PS's hardest case is excluded |
| Accuracy vs baseline | `computeModelEvaluation()` scores the heuristic against its own input, vs an "assume 0 delay" baseline, labelled "90-day rolling window" | Circular and mislabelled |
| APIs | `/api/v1/*`, 11 endpoints, CORS | Real and demoable |
| Station displays | none | Missing consumer named in the PS |
| Control room | exists | No cascade view, no ops actions |

---

## 1. Locked decisions

| ID | Decision | Choice |
|---|---|---|
| **D1** | Training data | Calibrated simulator for volume **+** RailRadar harvest for real training/validation. See **U1**. |
| **D2** | Model runtime | Python trains offline → tree ensemble exported to JSON → **TypeScript inference** |
| **D3** | Model family | Gradient-boosted trees, **quantile** objective (P10/P50/P80/P90) |
| **D4** | Live feed | **RailRadar API** (`https://api.railradar.in/v1`) |
| **D5** | Hosting | Vercel serverless + Vercel KV. See **U2** — reopened on quality grounds. |
| **D6** | Scale | **All ~11,113 trains**, lazy shard loading |
| **D7** | Extras | **Full scope restored** — weather, station display, cascade view, multi-day, complete honesty pass |

### 1.1 Vendor contract — RailRadar (verified from public docs)

- **Base URL:** `https://api.railradar.in/v1`
- **Auth:** `Authorization: Bearer rr_live_YOUR_API_KEY` (or `X-API-Key`)
- **Free sandbox:** 1,000 requests/month → see **U1**, upgrade this
- **Provider switch:** `?dataProvider=railradar|NTES` — RailRadar is the licensed intermediary, so
  NTES data arrives through a legitimate channel

| Endpoint | Use |
|---|---|
| `GET /v1/trains/{number}?haltsOnly=true` | Timetable, distance, `speedToNextStationKmph`, platform, `arrivalDay` |
| `GET /v1/trains/{number}/live` | Real-time position, delay, current halt, diversions |
| `GET /v1/legacy/trains/{number}?dataType=full` | **The important one** — schedule *and* actuals in one call |
| `GET /v1/pnr/{pnr}` | PNR status — lets you replace the synthetic PNR with real data |

```jsonc
"route": [{
  "stationCode": "UJN", "sequence": 2,
  "scheduledArrival": "00:55", "scheduledDeparture": "01:00",
  "actualArrival":    "01:07", "actualDeparture":    "01:12",
  "delayMinutes": 12, "isHalt": true, "platform": "1"
}],
"liveData": {
  "journeyDate": "…", "lastUpdatedAt": "…",
  "currentLocation": { "stationCode": "UJN", "status": "departed", "segmentProgress": 0.45 },
  "overallDelayMinutes": 12, "exceptionInfo": null
}
```

**This is the per-run, per-station observation data §0.1 said was missing.** Scheduled vs actual at
every halt is the training target (`Δdelay_section`). `segmentProgress` gives true inter-station
position, replacing the invented interpolation in `computeLiveStatus()`. One call yields 20–45
observations, so it is also the most quota-efficient endpoint.

### 1.2 Upgrades unlocked by lifting the resource constraint

**U1 — Buy RailRadar quota. This is the highest-leverage purchase available.**
On the free tier the model trains on *synthetic* data with a thin real hold-out. With paid quota the
ordering inverts: train on **real** observations, validate on real, and keep the simulator only for
augmentation and cold-start trains. That single change moves the W5 evaluation slide from
"defensible" to "unarguable", and it removes risk R4 entirely.

Rough sizing: 200 hot trains × 4 refreshes/day × 30 days ≈ 24,000 calls/month ≈ **600,000 section
observations**. That is a genuine dataset. Confirm their pricing tiers on Day 1.

**U2 — Reconsider D5 (serverless) on quality grounds.**
Vercel + KV was chosen under a solo/serverless constraint. With resources, a long-lived service is
strictly better for this workload:

| Capability | Vercel + KV | Long-lived Node + Postgres |
|---|---|---|
| Continuous polling loop | cron workaround | native |
| True SSE / WebSocket push | execution-limited | native |
| Observation history for ML | bounded lists | full time-series, indexed |
| Retraining loop (W9) | external job | in-process scheduler |
| Analytical eval queries | awkward | SQL |

Recommended: **keep Vercel for the frontend/SSR, add a small long-lived worker + Postgres** for
ingestion, history, and retraining. The `LiveFeedAdapter` boundary already makes this a swap, not a
rewrite. See §12.

**U3 — Replace the synthetic PNR with the real endpoint.** `GET /v1/pnr/{pnr}` exists. This deletes
an entire class of credibility risk rather than relabelling it.

### 1.3 Conflicts — read before building

**C1 — serverless statelessness. RESOLVED: Vercel KV** (or Postgres under U2). In-memory state does
not survive invocations; a `setInterval` poller cannot run; SSE is execution-limited.

**C2 — vendor procurement. RESOLVED:** RailRadar sandbox is self-serve. `ReplayAdapter` still ships
as Tier C so a network failure on stage becomes a resilience demo rather than a dead demo.

**C3 — D6 forces the multi-day fix.** Ingest drops journeys ≥ 1440 min. Reaching 11,113 trains while
keeping that filter silently discards long-distance coaching trains — the exact cascading case the
PS names. W1 keeps the fix.

**C4 — the `12,480` badge.** D6 yields a real ~11,113 count, so the fabricated number is now false
*and smaller than the truth*. One line in `src/routes/index.tsx`.

**C5 — W5 forces removal of the fake metric.** `computeModelEvaluation()` is circular: it scores the
heuristic against `historicalDelayAt()`, one of the heuristic's own inputs, then labels it a "90-day
rolling window". The real eval panel occupies that slot.

**C6 — quota shapes the architecture.** Even on a paid tier, adopt the two-population design: a
**hot set** on real observations, and the **long tail** on model + priors + weather with no vendor
call. Every call cached; an uncached duplicate is a bug, and W2 tests assert it.

**C7 — the marketing copy appears lifted from RailRadar.** `src/data/translations.ts` says *"dense
GeoJSON route geometry. Start on a free sandbox with 1,000 requests a month"*; RailRadar's site says
*"high-density GeoJSON route geometry"* and *"a free sandbox offering 1,000 requests per month"*.
This also explains the two claims flagged in §0.2 as unimplemented — they describe RailRadar's
product. Rewrite in your own words. At a judged event this is a needless, disproportionate risk.

---

## 2. Target architecture

```
   ┌─────────────── LiveFeedAdapter (tiered, automatic fallback) ───────────────┐
   │  Tier A: RailRadarAdapter   Tier B: CrowdGpsAdapter   Tier C: ReplayAdapter │
   └────────────────────────────────────┬───────────────────────────────────────┘
                                        │ TrainObservation[]
                          ┌─────────────┴─────────────┐
                          ▼                           ▼
                 ObservationStore              HarvestLog (append-only)
                 (hot state, KV/PG)            → training + validation corpus
                          │                           │
                          ▼                           ▼
              FeatureBuilder ◄── Open-Meteo      ml/train.py  (offline)
              (spatial+temporal+network)               │ exports
                          │                            ▼
                          ▼                     model.json (versioned artifact)
                     EtaEngine ◄─────────────── treeEnsemble.ts (TS inference)
                          │
        ┌─────────────────┼──────────────────┬────────────────────┐
        ▼                 ▼                  ▼                    ▼
  BaselineEngine   EvaluationHarness   DriftMonitor        RetrainingLoop (W9)
  (sched+delay      (walk-forward,     (PSI, rolling      (champion/challenger)
   +recovery)        calibration)       MAE alarm)
                          │
                          ▼
                    /api/v2/*  +  push channel
                          │
   ┌──────────────┬───────┴────────┬──────────────────┬─────────────────┐
   ▼              ▼                ▼                  ▼                 ▼
Passenger   Station display   Control room      Developer API      Ops actions
              /display/$code   + cascade                          (platform, crew)
```

**Key invariant:** `EtaEngine` is the only ETA source. Passenger UI, station board, control room and
the API all read it. Today the UI and the API compute status separately and can drift — the
integration test in §5 enforces that they never diverge again.

---

## 3. PS requirement → workstream traceability

Every PS clause maps to a workstream. Anything unmapped is out of scope by definition.

| PS clause | Workstream | Verified by |
|---|---|---|
| GPS-based location data | W2 (Tier A/B) | `railRadarAdapter.test.ts`, tier fallback test |
| Average sectional running times | W1 section graph, W4 sectional model | `ingest.test.ts`, `etaEngine.test.ts` |
| Weather conditions | W3 Open-Meteo | `weather.test.ts` cache assertion |
| Historical delay patterns | W3 priors, W4 training corpus | leakage test |
| Congestion on downstream tracks | W3 congestion feature | congestion insertion test |
| Signal halts / unscheduled stoppages | W3 dwell-overrun feature, W2 `exceptionInfo` | feature snapshot test |
| Delays in preceding trains | W3 congestion, W7 cascade view | cascade E2E |
| Temporary speed restrictions | W3 sectional speed deviation | feature snapshot test |
| Dynamic ETA at intermediate + destination | W4 `EtaEngine` | quantile + summation tests |
| **Continuously refine over time** | **W9 retraining loop** | champion/challenger promotion test |
| ML / statistical techniques | W4 | Python↔TS parity test |
| Scalable to thousands | W1, W8 | ≥10k routes, perf assertion |
| Diverse operational zones | W1 sharding, W5 per-zone breakdown | eval report by zone |
| Temporal + spatial variability | W3 features, W5 breakdowns | eval report |
| Multi-day cascading | W1 `dayOfJourney`, W5 breakdown | multi-day ingest test |
| APIs for mobile apps | W6 `/api/v2/train/:no/forecast` | schema tests |
| APIs for station displays | W6 board + W7 `/display/$code` | display E2E |
| APIs for control rooms | W6 congestion + W7 cascade | cascade E2E |

---

## 4. Engineering standards (mandatory for outsourced contributors)

With parallel contributors, quality is enforced by **contracts and gates**, not by review goodwill.

### 4.1 Contract-first

Before any parallel work starts, land the interfaces so tracks can develop against stable types:

1. `src/server/live/types.ts` — `TrainObservation`, `LiveFeedAdapter`
2. `src/server/schemas/*.ts` — zod schemas for every v2 request/response
3. `src/lib/features/schema.ts` — `FeatureVector` + `FEATURE_VERSION`
4. `src/lib/model/types.ts` — `ModelArtifact`, `DelayForecast`
5. Fixtures in `__fixtures__/` for every external dependency

**Nothing merges against a stub that has not been contract-frozen first.** A changed contract
requires a version bump and an update to every consumer in the same PR.

### 4.2 Definition of Done

A workstream is done only when **all** hold:

- [ ] Tests specified in its section exist and pass
- [ ] Coverage ≥ 80 % lines on `src/lib/**` and `src/server/**`
- [ ] No `any`, no `@ts-expect-error` without a linked issue
- [ ] All external I/O is fixture-backed in tests; no network in CI
- [ ] Public functions have TSDoc stating units (minutes vs ms, km vs m)
- [ ] An ADR exists if an architectural choice was made
- [ ] `npm run format -- --check && npm run lint && npm test && npm run build` all green

### 4.3 Code review rules

- No PR over ~400 changed lines except generated data
- Generated files (`src/data/generated/**`, `routeTree.gen.ts`) are never hand-edited
- Every bug fix lands with a regression test that fails without the fix
- Two areas require a second reviewer: `EtaEngine`/model code, and anything touching secrets

### 4.4 Units and naming (a real bug source in this codebase)

The repo mixes minutes-after-midnight, minutes-after-origin, and epoch ms. Standardise:

- `*Min` = minutes after midnight · `*Elapsed` = minutes after origin departure
- `*At` = epoch ms · `*Km` = kilometres
- Never a bare `time`, `delay`, or `dist`

---

## 5. Test infrastructure and quality gates

The repo has **zero tests**. This lands before any workstream.

**Steps**
1. `npm i -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom happy-dom`
2. `npm i -D @playwright/test` for E2E
3. `package.json`: `test`, `test:watch`, `test:cov`, `test:e2e`
4. `vitest.config.ts` reusing the `@/*` alias; coverage thresholds **80 %** on `src/lib`, `src/server`
5. Extend `.github/workflows/ci.yml`: format → lint → **typecheck** → test+coverage → build → E2E
6. Add `tsc --noEmit` as a distinct CI step (currently never runs — `noEmit` is set but nothing invokes it)
7. Enable `@typescript-eslint/no-explicit-any: error` and re-enable `no-unused-vars` (currently `off`)

**Cross-cutting integration test — `src/__tests__/consistency.test.ts`:**
for 100 sampled trains, the ETA from `EtaEngine` directly, from `/api/v2/eta`, and from the rendered
passenger page must be identical. This is the guard against the UI/API drift described in §2, and it
is the single most valuable test in the plan.

**Gate:** CI red blocks merge. No exceptions, including for outsourced contributors.

---

## 6. Workstreams

Each: goal → steps → files → test → done-when.

---

### W0 — Baseline + full honesty pass

**Goal:** implement the *official* IR baseline so every later claim is measured against it, and
remove every unbacked claim.

**Steps**
1. `src/lib/baseline.ts` — `baselineEta(train, haltIndex, currentDelayMin, recoveryMin)` implementing
   `ETA = scheduled_arrival + current_delay − recovery_allowance`, recovery derived from scheduled
   slack between consecutive halts. Also implement `scheduleOnlyEta()` as Baseline A.
2. Delete `computeModelEvaluation()` from `ControlRoomDashboard.tsx` (**C5**).
3. Replace the `12,480` literal in `src/routes/index.tsx` with the real count (**C4**).
4. Rewrite the RailRadar-derived copy in `src/data/rail.ts` and `src/data/translations.ts` (**C7**).
5. Replace synthetic PNR with `GET /v1/pnr/{pnr}` (**U3**), or gate behind `DEMO_MODE`.
6. Implement the advertised rate limit (W6) — the claim becomes true instead of removed.
7. Serve real GeoJSON route geometry (W6) — likewise.
8. Remove the dead `liveTrains` export in `src/data/rail.ts` and the unused `DEFAULT_AVG_DELAY`.

**Files:** `src/lib/baseline.ts` (new), `src/components/rail/ControlRoomDashboard.tsx`,
`src/routes/index.tsx`, `src/routes/pnr.tsx`, `src/data/rail.ts`, `src/data/translations.ts`

**Test:** `src/lib/__tests__/baseline.test.ts`
- 20 min late with 5 min slack before the next halt → baseline predicts 15 min late
- zero delay → baseline equals the published schedule exactly
- recovery can never push arrival earlier than scheduled
- **claim audit test:** no UI string asserts a numeric capability that is not computed at runtime —
  implemented as a grep-style assertion over a maintained allowlist

**Done when:** every user-visible claim is either computed or deleted.

---

### W1 — Scale to ~11,113 trains (D6)

**Goal:** "scalable to thousands of trains", multi-day journeys retained (**C3**).

**Steps**
1. `scripts/ingest.mjs`: remove `if (!delayStats[tn]) continue` (~line 158).
2. Remove the `maxElapsed >= MONTH - 1` skip (~line 215); keep `dayOffset`, emit `dayOfJourney`.
3. Interpolate coordinates for halts missing from `stations.json` rather than dropping the route.
4. Emit `src/data/generated/sections.ts`:
   `{ fromCode, toCode, distanceKm, scheduledRunMin, trainCount, p50RunMin, p80RunMin }`.
5. **Shard by zone.** Server loads shards on demand; the client fetches per-train. Mandatory —
   `routes.ts` is already ~6.5k lines at 41 trains.
6. Enrich from RailRadar `GET /v1/trains/{number}` for hot trains: real platforms and
   `speedToNextStationKmph`, replacing the hardcoded `"-"` platform.
7. Make ingest **incremental and idempotent** — a content hash per train so re-runs only rewrite
   changed shards.

**Files:** `scripts/ingest.mjs`, `src/data/generated/*`, `src/data/trainTypes.ts`

**Test:** `scripts/__tests__/ingest.test.ts`
- emits ≥ 10,000 routes
- ≥ 1 route with `maxElapsed > 1440` and correct `dayOfJourney` increments
- every halt has finite lat/lng; interpolated ones flagged `coordSource: "interpolated"`
- section graph: no duplicate `fromCode→toCode`, all `scheduledRunMin > 0`
- **idempotence:** two consecutive runs produce byte-identical output
- **bundle guard:** the client entry chunk does not import `generated/routes.ts` wholesale

**Done when:** a real 5-digit tracked-train count renders and a multi-day train works end to end.

---

### W2 — RailRadar adapter + store (D4/D5, resolves C1/C6)

**Goal:** real-time feeds on an architecture that survives serverless and respects quota.

**Steps**
1. `src/server/live/types.ts` —
   `TrainObservation = { trainNo, runDate, stationCode, sequence, eventType: "ARR"|"DEP"|"GPS", scheduledMin, actualMin, delayMin, segmentProgress?, lat?, lng?, source: "railradar"|"crowd"|"replay", receivedAt }`
2. `src/server/live/adapter.ts` — `LiveFeedAdapter { fetchTrain(trainNo): Promise<TrainObservation[]> }`
3. **`RailRadarAdapter`** (Tier A):
   - `GET /v1/legacy/trains/{number}?dataType=full` — one call, whole route with actuals
   - normalise `route[]` → `TrainObservation[]`; map `segmentProgress` to inter-station position;
     surface `exceptionInfo` as a diversion flag
   - `RAILRADAR_API_KEY` from env, **server-side only** (see R8)
   - timeout, retry with backoff, circuit breaker demoting to Tier C after 3 failures
   - **quota guard:** monthly call counter in the store; refuse Tier A and log at the cap
4. **`CrowdGpsAdapter`** (Tier B) — `POST /api/v2/observations` from `useOnBoardGps`, snapped to the
   nearest section.
5. **`ReplayAdapter`** (Tier C) — simulator on an accelerated clock; demo safety net and long-tail
   source.
6. **`ObservationStore`** — latest state per `(trainNo, runDate)` + history. KV now, Postgres under U2.
7. **Pull-through cache** with stale-while-revalidate.
8. **Cron warmer** → `/api/v2/internal/refresh` (shared-secret header) for the hot list.
9. **`HarvestLog`** — append every Tier A response to the durable training corpus (W4.2).

**Files:** `src/server/live/{types,adapter,railRadarAdapter,crowdGpsAdapter,replayAdapter,store,cache,quota,harvest}.ts`,
`src/hooks/useOnBoardGps.ts`, `.github/workflows/refresh.yml`, `.gitignore`

**Test:** `src/server/live/__tests__/*.test.ts`
- **fixture-driven normalisation** from the checked-in `legacy-train-full.json`; no network in CI
- `null` `actualArrival` yields no observation, never a `NaN` delay
- **timezone correctness:** `+05:30` timestamps parse to the correct absolute instant; a fixture
  crossing midnight IST does not shift a day
- **tier fallback:** 3 vendor failures trip the breaker; next call served by Tier C with
  `source: "replay"`
- **quota guard:** at the cap, no fetch is issued (assert the spy)
- pull-through: two calls inside TTL → exactly one vendor call
- crowd GPS > 25 km from the route is rejected
- store round-trip; history respects its bound
- **harvest durability:** an appended observation is retrievable after a simulated cold start

**Done when:** a real response moves a train on `/network`; revoking the key falls back to replay
with the tier visible in the payload.

---

### W3 — Feature engineering

**Goal:** replace hashed weather/congestion with genuine spatial-temporal features.

**Steps**
1. `src/lib/features/sectionFeatures.ts`, per (train, section):
   - current delay; delay trend over the last 3 halts
   - section historical mean / p80 run time (W1 section graph + priors)
   - hour, day of week, season, `dayOfJourney`
   - train class; distance and halts remaining
   - **downstream congestion** — tracked trains occupying the next N sections, from the store
   - **weather** — Open-Meteo at the next halt's lat/lng, cached per station-hour
   - **dwell overrun** — proxy for unscheduled stoppage
   - **sectional speed deviation** — observed vs `speedToNextStationKmph`, proxy for a TSR
2. `src/lib/features/weather.ts` — cached Open-Meteo client with an offline fixture mode.
3. `FEATURE_VERSION` so a model artifact refuses mismatched input.
4. Delete the hash block in `src/lib/etaModel.ts` (~218–224).

**Files:** `src/lib/features/*`, `src/lib/etaModel.ts`

**Test:** `src/lib/features/__tests__/sectionFeatures.test.ts`
- no `NaN`/`undefined` across a 200-train sample
- **leakage test:** the vector for halt *i* contains nothing derived from halts *> i* — feed a
  future-stuffed store and assert byte-identical output
- congestion rises when synthetic trains occupy the next section
- weather client hits the network at most once per station-hour
- `FEATURE_VERSION` mismatch throws
- **determinism:** identical inputs → identical vectors across processes

**Done when:** `grep -r "hash(" src/lib/etaModel.ts` returns nothing for weather/congestion.

---

### W4 — Sectional quantile model (D1/D2/D3)

**Goal:** the ML deliverable. Predict incremental delay **per section**, then sum — matching the
PS's "average sectional running times" and modelling cascade directly.

**Steps**
1. **Calibrated simulator:** `scripts/generate-training-data.mjs` samples runs from the real
   per-station statistics with AR(1) correlation along the route so delays persist and cascade.
   Target: `Δdelay_section = delay_out − delay_in`.
2. **Real corpus (primary under U1):** the W2 harvest. `route[]` gives scheduled vs actual at every
   halt. With paid quota this becomes the **training** set and the simulator becomes augmentation
   for cold-start trains. **Begin harvesting in Phase 0** — this corpus only grows with wall-clock
   time and cannot be backfilled.
3. **Train:** `ml/train.py`, gradient-boosted quantile regressors at q = 0.1/0.5/0.8/0.9.
   Grouped walk-forward CV split **by train and by date** — never a random split, which would leak
   the same run across folds.
4. **Export:** `src/data/generated/model.json` — trees, feature order, `FEATURE_VERSION`, training
   date, row count, data provenance, metrics.
5. **Inference:** `src/lib/model/treeEnsemble.ts` — pure-TS traversal, zero dependencies.
6. **Engine:** `src/lib/etaEngine.ts` —
   `ETA(halt_k) = now + Σ_{s=current..k} (scheduledRunMin[s] + Δ̂[s])`, propagating quantiles so
   destination uncertainty widens with distance.
7. **Model card:** `ml/MODEL_CARD.md` — data sources, synthetic vs real split, features, metrics,
   known failure modes, intended use. Judges ask; have it written.
8. Keep `predictDelay()` as a registered fallback, surfacing which path served the request.

**Files:** `ml/{train.py,requirements.txt,MODEL_CARD.md}`, `scripts/generate-training-data.mjs`,
`src/lib/model/treeEnsemble.ts`, `src/lib/etaEngine.ts`, `src/data/generated/model.json`

**Test:** `src/lib/model/__tests__/treeEnsemble.test.ts`, `src/lib/__tests__/etaEngine.test.ts`
- **parity test (merge blocker):** 100 fixed vectors scored in Python and TS agree within 1e-6.
  A broken export fails silently with plausible numbers — this is the only thing that catches it.
- quantile monotonicity `p10 ≤ p50 ≤ p80 ≤ p90` on every prediction
- section summation origin→destination equals a direct destination prediction within tolerance
- destination interval strictly wider than next-halt interval
- corrupt/missing artifact → heuristic fallback, `modelVersion: "fallback"`
- simulator reproduces source per-station means within 10 %
- **train/serve skew:** features built in the Python pipeline and in TS match on shared fixtures

**Done when:** `/api/v2/eta` returns trained-artifact quantiles, not the heuristic.

---

### W5 — Evaluation harness

**Goal:** prove the model beats the official method. Replaces the circular metric (**C5**).

**Steps**
1. `src/lib/eval/harness.ts` — **walk-forward, multi-fold**. Train before *T*, evaluate after.
2. Horizons: next halt / +3 h / destination. Metrics: MAE, MedAE, RMSE, plus:
   - **Baseline A:** schedule only
   - **Baseline B:** schedule + current delay + recovery — the real IR method
   - **Baseline C:** persistence (current delay carries forward unchanged)
3. **Calibration:** reliability diagram plus P80 coverage. A well-calibrated 80 % band contains
   ~80 %; stating this earns more trust than a low MAE.
4. Breakdowns by zone, train class, hour, `dayOfJourney`, and delay magnitude — the PS's "temporal
   and spatial variability", answered with evidence.
5. **Report synthetic and real hold-outs separately.** Never blend them.
6. Error analysis: worst-100 predictions with feature dumps.
7. Emit `eval/report.json`; render in the control room.

**Files:** `src/lib/eval/harness.ts`, `scripts/run-eval.mjs`, `src/components/rail/ModelEvalPanel.tsx`

**Test:** `src/lib/eval/__tests__/harness.test.ts`
- **anti-leakage:** shuffling the target collapses improvement to ~0 %. If not, the harness leaks
  and the test must fail.
- perfect oracle → MAE 0, 100 % coverage
- constant-zero predictor → exactly Baseline A
- fixed seed → byte-identical report
- **fold independence:** no train-run appears in both train and test of any fold

**Done when:** the control room shows measured improvement over **Baseline B** with calibration,
from `eval/report.json`.

---

### W6 — APIs

**Goal:** serve all three PS consumers from one contract.

**Steps**
1. `GET /api/v2/eta?train=&station=` →
   `{ trainNo, station, eta, p50, p80, p90, delayMin, baselineEta, improvementMin, confidence, reason, features[], modelVersion, source, updatedAt }`
2. `GET /api/v2/train/:no/forecast` — all remaining halts with quantiles (mobile timeline)
3. `GET /api/v2/station/:code/board` — sorted by predicted arrival, with bands
4. `GET /api/v2/network/congestion` — per-section occupancy and mean delay
5. `GET /api/v2/train/:no/geojson` — **real** route geometry, making the C7 claim true
6. `POST /api/v2/observations` — crowd GPS, zod-validated (`zod` is a dependency, currently unused)
7. **Push channel:** SSE on a long-lived worker (U2), else 30 s polling with `ETag`
8. **Rate limiting** — implement the advertised limit; token bucket in the store
9. OpenAPI 3.0 at `/api/v2/openapi.json`, **generated from the zod schemas**
10. Versioning policy: v1 frozen, v2 additive-only

**Files:** `src/server/routes/v2/*.ts`, `src/server/schemas/*.ts`, `src/server/middleware/*.ts`

**Test:** `src/server/__tests__/apiV2.test.ts`
- every response validates against its published schema
- unknown train → 404 with the documented envelope
- `p50 ≤ p80 ≤ p90` in every payload
- rate limiter returns 429 at the threshold and resets correctly
- `ETag` stable inside TTL, changes after a new observation
- malformed `POST /observations` → 400, nothing written
- OpenAPI parses and lists every registered route
- **contract snapshot:** response shapes diffed against committed snapshots; a breaking change fails CI

**Done when:** the sandbox exercises v2 and OpenAPI is generated, not hand-written.

---

### W7 — Consumer surfaces (full scope restored)

**Goal:** show one ETA reaching passenger, platform, and control room.

**Steps**
1. **Station display** — `/display/$code`, full-screen, auto-updating, high contrast, no chrome.
   The PS names station displays explicitly and almost no team builds one.
2. **Control room cascade** — when train X slips, list downstream services and platform slots at
   risk. Extends the existing connecting-impact logic.
3. **Passenger** — show the band ("reaches NDLS 14:05, likely 13:58–14:20") plus top-3 feature
   attributions.
4. **Ops actions** — platform hold when P80 arrival overlaps the next occupancy; cleaning/crew
   "ready by" = P90.
5. **Tier badge** — vendor / crowd / replay always visible.
6. `useOnBoardGps` contributes observations upstream behind explicit consent.
7. **Accessibility** — WCAG AA on display and passenger routes; the display board will be read at
   distance, so contrast and type scale are functional requirements, not polish.

**Files:** `src/routes/display.$code.tsx` (new), `src/components/rail/{ControlRoomDashboard,EtaConfidenceBadge,CascadePanel}.tsx`,
`src/routes/train.$number.tsx`, `src/hooks/useOnBoardGps.ts`

**Test:** component tests + Playwright E2E
- display renders with zero console errors and updates on a pushed event
- cascade lists a downstream train after a synthetic 45-minute delay
- band renders `lowerEta ≤ eta ≤ upperEta`
- consent required before any upload
- **a11y:** axe reports zero violations on `/display/$code` and `/train/$number`
- **E2E:** inject a delay → passenger page, display, and control room all update

**Done when:** one injected delay visibly changes all three surfaces at once.

---

### W8 — Scale and performance (restored)

**Goal:** back "thousands of trains" with a measured number.

**Steps**
1. Batch-score: one feature-matrix pass per tick, not per-train recomputation.
2. Cache per `(train, halt, featureHash)`, invalidated on new observations.
3. **Lazy halt forecasting** — `computeLiveStatus()` calls `forecastEtaAtHalt` for *every* halt on
   *every* call (`src/lib/liveStatus.ts` ~122–126). Next 3 eagerly, rest lazily. At 11k trains this
   is the difference between working and not.
4. Server-side shard loading (W1); client fetches only what it displays.
5. `scripts/bench.mjs` — p50/p95 at 1k / 5k / 11k trains.
6. Bundle budget in CI; fail on regression.

**Files:** `src/lib/liveStatus.ts`, `src/lib/etaEngine.ts`, `src/server/live/store.ts`, `scripts/bench.mjs`

**Test:** `src/lib/__tests__/perf.test.ts`
- 5,000 trains scored under 500 ms on CI hardware (assert, don't log)
- cache hit ratio > 90 % in steady state
- memory bounded after 10,000 observations
- **regression guard:** batch and per-train scoring produce identical ETAs
- bundle size within budget

**Done when:** `npm run bench` prints a defensible number.

---

### W9 — Continuous refinement loop (NEW — explicit PS requirement)

**Goal:** *"continuously refine its predictions"*. Without this the PS is not fully answered, and
nothing in the original plan covered it.

**Steps**
1. **Outcome capture** — when a train actually arrives, join the realised arrival to every earlier
   prediction. This produces the residual stream everything else consumes.
2. **Drift monitoring** — PSI on feature distributions; rolling MAE per zone/class with alarms.
3. **Scheduled retraining** — nightly/weekly on the accumulated corpus.
4. **Champion/challenger** — a new artifact is promoted only if it beats the champion on the
   hold-out by a preset margin **and** calibration does not regress. Automatic rollback otherwise.
5. **Online residual correction** — a lightweight per-section bias term updated between retrains, so
   the system adapts within a day rather than only at retrain boundaries.
6. **Model registry** — versioned artifacts with metrics; one-command rollback.

**Files:** `src/lib/refine/{outcomes,drift,registry,residual}.ts`, `ml/retrain.py`,
`.github/workflows/retrain.yml`

**Test:** `src/lib/refine/__tests__/*.test.ts`
- outcome join pairs a realised arrival with every prior prediction for that halt
- injecting a distribution shift raises the PSI alarm
- a challenger worse than champion is **not** promoted
- a challenger better on MAE but worse on calibration is **not** promoted
- residual correction reduces error on a synthetically biased section
- rollback restores the previous artifact and its metrics

**Done when:** the control room shows accuracy improving over successive retrains — the literal PS
sentence, demonstrated rather than asserted.

---

### W10 — Observability

**Goal:** a control-room product must be operable. Also makes the demo debuggable under pressure.

**Steps**
1. Structured JSON logging with request ids; replace the `console.error` monkey-patch in
   `src/lib/error-capture.ts` with a real logger (keep the h3 stack-recovery behaviour).
2. Metrics: vendor call count and quota burn, cache hit ratio, ETA latency p50/p95, tier mix,
   model version served, prediction volume.
3. `/api/v2/health` — store reachability, model artifact loaded, last successful harvest, quota
   remaining.
4. Error tracking (Sentry or equivalent) on client and server.
5. `/ops` dashboard rendering the above.

**Files:** `src/lib/{logger,metrics}.ts`, `src/server/routes/v2/health.ts`, `src/routes/ops.tsx`

**Test:** `src/lib/__tests__/observability.test.ts`
- every log line is valid JSON with a request id
- health reports degraded when the artifact is missing
- quota metric matches the actual counter
- no secret value ever appears in any log line (assert against a seeded fake key)

**Done when:** you can answer "why is this ETA wrong?" from logs alone.

---

### W11 — Security and compliance review

**Goal:** it handles user location and a paid API key. Both deserve care, and judges do ask.

**Steps**
1. `.env` → `.gitignore` (**currently absent**); scan git history for committed secrets.
2. Key server-side only; assert it never reaches the client bundle.
3. Rate limiting + input validation on all v2 routes (W6).
4. Tighten CORS from `*` to an allowlist for mutating routes.
5. **GPS privacy** — explicit consent, documented retention, coarse rounding at rest, a delete path.
   This is personal location data.
6. Dependency audit; `recharts` v2 is flagged deprecated in the lockfile.
7. `SECURITY.md` + a short data-handling note for the submission.

**Files:** `.gitignore`, `src/server/middleware/*.ts`, `SECURITY.md`, `docs/adr/*`

**Test:** `src/server/__tests__/security.test.ts`
- **bundle scan:** the built client contains no `rr_live_` prefix (regex over `.vercel/output`)
- `POST /observations` without consent flag → 400
- CORS rejects a disallowed origin on mutating routes
- rate limiter enforced on every v2 route
- `npm audit --production` reports no high/critical

**Done when:** the bundle scan is a CI gate.

---

## 7. Parallelization map

Tracks that can run simultaneously **once §4.1 contracts are frozen**. Ownership boundaries chosen
so two contributors rarely touch the same file.

| Track | Workstreams | Owns | Depends on |
|---|---|---|---|
| **Data** | W1 | `scripts/`, `src/data/` | — |
| **Platform** | W2, W10, W11 | `src/server/live/`, middleware | contracts |
| **ML** | W3, W4, W5, W9 | `src/lib/features/`, `src/lib/model/`, `ml/` | contracts, W1 sections |
| **API** | W6 | `src/server/routes/v2/` | contracts (stub engine) |
| **Frontend** | W7 | `src/routes/`, `src/components/rail/` | API contracts (mock) |
| **Perf/QA** | W8, §5 | `scripts/bench.mjs`, E2E | everything, last |

**Integration checkpoints** — all tracks converge, run the full suite, and fix drift:
after contracts freeze; after W4 parity; after W6 wiring; before submission.

**The failure mode to watch:** outsourced tracks quietly diverging on units and null-handling. §4.4
and the §5 consistency test are the countermeasures. Enforce them from the first PR, not at
integration.

---

## 8. Risk register

| # | Risk | Mitigation |
|---|---|---|
| R1 | ~~Vendor procurement~~ resolved (self-serve) | `ReplayAdapter` remains Tier C |
| R2 | ~~Serverless statelessness~~ resolved (KV / U2) | Decided up front |
| R3 | Python→JSON export corrupts predictions silently | Parity test is a merge blocker |
| R4 | Judge challenges synthetic training data | **U1 removes this** — train on real; report hold-outs separately; model card |
| R5 | 11k trains blow up the client bundle | Bundle guard fails CI |
| R6 | Quota exhausted mid-demo | Quota counter, TTL, hot-set cap, Tier C long tail |
| R7 | ~~Solo/time~~ resolved | Replaced by R10 |
| R8 | API key leaked into the client bundle | Server-only; CI bundle scan (W11). Note `VITE_GOOGLE_MAPS_API_KEY` **already** inlines into client JS today |
| R9 | Vendor copy in marketing text (C7) | Rewrite in W0 |
| **R10** | **Outsourced contributors diverge / uneven quality** | Contract-first (§4.1), Definition of Done (§4.2), CI gates (§5), consistency test, integration checkpoints |
| **R11** | **Real-data corpus started too late** | Harvest begins in **Phase 0**, before any modelling. Cannot be backfilled. |
| **R12** | **Model overfits the ~10-train hot set** | U1 widens the hot set; group CV by train; report per-train error spread |
| **R13** | **RailRadar changes response shape** | Fixture-driven adapter tests; a contract-drift canary hitting the live API nightly |

---

## 9. Phased schedule

Time is not the constraint, so this is ordered by dependency, not by day.

| Phase | Content | Exit criteria |
|---|---|---|
| **0 — Foundation** | §11 checklist, **harvest running**, test infra, §4.1 contracts frozen | CI green with gates; corpus growing |
| **1 — Data & baseline** | W0, W1 | ≥10k routes, multi-day works, baselines implemented |
| **2 — Live** | W2, W10 | Real train moves; tier fallback proven; health endpoint live |
| **3 — Intelligence** | W3, W4 | **Parity test green**; quantile ETA from the artifact |
| **4 — Proof** | W5 | Measured beat over Baseline B with calibration, real and synthetic separated |
| **5 — Surfaces** | W6, W7 | Three consumers on one ETA; a11y clean |
| **6 — Refinement** | W9 | Accuracy improves across retrains, visible in the UI |
| **7 — Hardening** | W8, W11, E2E | Perf asserted, bundle scan green, full suite passing |
| **8 — Submission** | Model card, ADRs, demo rehearsal ×3 | Rehearsed with the network **off** |

**Phase 0 and Phase 3 are the two that decide the outcome.** Phase 0 because the real corpus only
accrues with wall-clock time; Phase 3 because parity failure silently corrupts everything downstream.

---

## 10. Demo script (7 minutes)

1. **Frame the baseline.** "IR estimates ETA as schedule + current delay + recovery. That's our
   baseline, not our product."
2. **Scale.** ~11,000 trains, multiple zones, multi-day services included.
3. **Live event.** A real RailRadar observation lands; ETAs shift on the passenger page, the station
   display, and the control room simultaneously.
4. **Explain.** Feature attribution: sectional speed deviation, congestion ahead, fog at the next halt.
5. **Cascade.** Connection at risk, platform conflict, crew ready-by time.
6. **Resilience.** Kill the network on stage — tier flips to replay, forecasting continues.
7. **Prove.** MAE vs Baseline B by horizon; P80 calibration; real vs synthetic reported separately.
8. **Refinement.** Accuracy improving across retrains — the PS sentence, demonstrated.
9. **Production path.** "Swap one adapter for CRIS Pravah."

---

## 11. Phase 0 checklist

1. Sign up at `railradar.in`; generate a key; **confirm paid tier pricing (U1)**.
2. `echo ".env" >> .gitignore` — currently **not** ignored, and you are about to add a secret.
3. `RAILRADAR_API_KEY` in `.env` and in deployment settings. Server-side only — never
   `import.meta.env`, which inlines into client JS (**R8**).
4. `curl -H "Authorization: Bearer $RAILRADAR_API_KEY" \
   "https://api.railradar.in/v1/legacy/trains/12951?dataType=full"` → save verbatim as
   `src/server/live/__fixtures__/legacy-train-full.json`.
5. Choose the hot set — long-distance, multi-halt, historically delayed trains yield the most
   observations per call and demo best. 10 on free tier, 100–200 on paid.
6. Provision the store (KV now, Postgres under U2).
7. **Start the harvest cron (W4.2).** Highest priority in Phase 0 (**R11**).
8. Freeze the §4.1 contracts and land the test infra before onboarding contributors.

---

## 12. Open questions

- **U1 — paid RailRadar tier?** The single highest-leverage decision left. It converts the model
  from synthetic-trained to real-trained and eliminates R4.
- **U2 — add a long-lived worker + Postgres?** Recommended on quality grounds: native polling, true
  SSE, full time-series history for ML, in-process retraining. Vercel stays the frontend.
- **Hot-train list** — send the numbers and the cron warmer gets wired to them.
- **Error tracking vendor** for W10 (Sentry or alternative).
