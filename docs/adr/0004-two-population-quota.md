# ADR 0004: Two-population quota architecture

- Status: Accepted
- Date: 2026-09-04

## Context

Decision D6 is all ~11,113 coaching trains. RailRadar quota, even paid, cannot refresh
every train every minute. Calling the vendor for an uncached duplicate is both a cost
bug and a latency bug. The long tail still needs a defensible ETA.

## Options considered

- **Hot-set only.** Drops the scale claim.
- **Vendor for everyone, cache forever.** Stale live data on the trains judges will look
  up, and a surprise bill.
- **Two populations.** A hot set on real observations; everyone else on model + priors +
  weather + replay, with pull-through cache on the hot set.

## Decision

- **Hot set** (`scripts/hot-set.json`, cron `/api/v2/internal/refresh`): RailRadar
  `legacy/full` when quota remains. Harvest appends the raw body for training.
- **Long tail:** no vendor call. `ReplayAdapter` + sectional model + delay priors +
  Open-Meteo (offline in CI). Crowd GPS can promote a tail train into the store without
  spending quota.
- Monthly cap (`RAILRADAR_MONTHLY_QUOTA`) refuses Tier A and logs. Tests assert the spy
  is not called at the cap.

## Consequences

- Client never loads `generated/routes.ts` wholesale; shards load per train (W1).
- Eval reports synthetic and railradar hold-outs separately so a thin real corpus cannot
  hide inside a large synthetic n (`eval/report.json`, `ModelEvalPanel`).
- Expanding the hot set is a data decision, not a code fork.
