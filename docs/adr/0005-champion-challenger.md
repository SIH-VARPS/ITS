# ADR 0005: Champion / challenger promotion policy

- Status: Accepted
- Date: 2026-09-04

## Context

The problem statement requires the system to continuously refine over time. Blindly
replacing `model.json` on every retrain can regress MAE or destroy P80 coverage. There
is no human in the loop on the GitHub `retrain.yml` cron.

## Options considered

- **Always replace.** Simple, unsafe. A bad harvest day ships to passengers.
- **Human approve every challenger.** Safe, not continuous, easy to skip under deadline.
- **Gated automatic promotion.** Promote only when MAE improves by a margin and
  calibration does not regress; keep the previous artifact for rollback.

## Decision

`ModelRegistry.consider` (W9):

- First artifact becomes champion.
- A challenger promotes only if MAE improves by the configured margin **and** P80
  coverage stays within the calibration band.
- Worse MAE, or better MAE with worse calibration, is rejected and the champion stays.
- `rollback` restores the previous artifact and its metrics (`model:rollback`).

Accuracy across retrains is visible in the control room (`data-testid="retrain-accuracy"`).

## Consequences

- Serving always reads the champion pointer, never a half-written challenger file.
- Promotion tests are the PS "continuously refine" gate — not a dashboard screenshot.
- Residual bias (`setSectionBiasMin`) can still apply between retrains without a full
  promote.
