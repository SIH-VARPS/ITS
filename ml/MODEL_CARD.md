# Sectional quantile delay model

## Intended use

Predict **incremental delay** on each timetable section
(`Δdelay = delayOutMin − delayInMin`) for Indian coaching trains, then sum
along the remaining path to produce P10 / P50 / P80 / P90 ETAs.

The TypeScript `EtaEngine` is the only serving path. `predictDelay()` in
`src/lib/etaModel.ts` is a registered **heuristic fallback** used when the
artifact is missing or corrupt (`modelVersion: "fallback"`).

Not for safety-critical dispatch. Not a substitute for NTES/control-office
running orders.

## Data sources

| Source                                           | Role                                                |
| ------------------------------------------------ | --------------------------------------------------- |
| `public/Train_details_22122017.csv` (via ingest) | Published timetable, section graph                  |
| `public/Indian Railway Delay Dataset.csv`        | Per-station average delay priors for the simulator  |
| `scripts/generate-training-data.mjs`             | Calibrated AR(1) synthetic runs (cold-start volume) |
| `data/harvest/*.jsonl`                           | Real RailRadar `legacy/full` actuals when present   |

## Synthetic / real split

Reported on the artifact as `provenance` (`synthetic` \| `railradar` \| `mixed`)
and `rowCount`. Harvest rows are included when the corpus exists locally;
CI does not retrain. Retrain with:

```
node scripts/generate-training-data.mjs
python ml/train.py
```

## Features

`FEATURE_VERSION` (frozen in `src/lib/features/schema.ts`) must match the
artifact. Vectors are per (train, section) at halt _i_ and **must not** use
actuals from halts _> i_.

Numeric columns (`FEATURE_ORDER`): current delay, 3-halt delay trend, section
mean / p80 run time, IST hour / weekday / season / day-of-journey, remaining
km and halts, downstream occupancy, Open-Meteo WMO code, dwell overrun, speed
deviation vs `speedToNextStationKmph`.

## Model

Gradient-boosted quantile regressors (`sklearn.ensemble.GradientBoostingRegressor`,
quantile loss) at **q = 0.1 / 0.5 / 0.8 / 0.9**. Cross-validation is grouped
walk-forward **by date** (an entire `(trainNo, runDate)` run stays on one side
of the cut). Trees are exported to JSON; TypeScript inference walks the same
nodes (`x[feature] <= threshold` → left; missing → right).

Metrics on the held-out time fold (walk-forward by date, last ~30% of dates):
MAE / MedAE / RMSE and P80 coverage are stored on the artifact (`model.json`).
The current checked-in fit is mixed synthetic+harvest, P50 MAE ≈ 14 min on the
sectional Δdelay target, P80 coverage ≈ 0.80.

## Known failure modes

- Independent quantile models can disagree; serving enforces
  `p10 ≤ p50 ≤ p80 ≤ p90`.
- Summing section quantiles overstates joint uncertainty; intervals widen with
  distance by design.
- Diversions / cancelled trains are out of scope of the section graph.
- Weather is Open-Meteo (not IMD station METAR) and is 0 in offline/CI mode.
- Sparse real harvest: until quota accrues, most mass is synthetic. Priors are
  station _averages_, not per-run traces.
- Train/serve skew is tested on shared raw-run fixtures; a feature change
  requires bumping `FEATURE_VERSION` and retraining.

## Serving

`GET /api/v2/eta?train=&station=` returns artifact quantiles and `modelVersion`.
Logs `eta_predict` with request id, station, quantiles, and current delay so a
wrong ETA can be diagnosed from logs alone.

Walk-forward hold-outs in `eval/report.json` (seed 20260315, 3 folds) are scored
separately: synthetic n = 3360 (next-halt P50 MAE ≈ 11.2 min, beats Baseline B by
≈ 3.7%); real/railradar n = 108 (thin harvest — MAE vs B is reported honestly,
including when the model trails). The control room renders those two buttons and
never blends them.

Architecture notes: [ADR 0002](../docs/adr/0002-python-json-ts.md) (train/serve),
[ADR 0003](../docs/adr/0003-tiered-live-feed.md),
[ADR 0004](../docs/adr/0004-two-population-quota.md),
[ADR 0005](../docs/adr/0005-champion-challenger.md).
