# ADR 0002: Python trains, JSON artifact, TypeScript serves (D2)

- Status: Accepted
- Date: 2026-09-04

## Context

The problem statement requires an ML/statistical ETA. Python is the practical training
stack (scikit-learn quantile GBTs). The product is a TypeScript TanStack Start app on
Vercel. Running Python at request time would add a second runtime, cold starts, and a
train/serve skew that is hard to test in CI.

## Options considered

- **Python sidecar at request time.** Strongest training/serving parity, weakest ops story
  on serverless, and a network hop on every ETA.
- **ONNX / WASM in the browser.** Possible, but the passenger page must not be the source
  of truth; station boards and the API would still need a server copy.
- **Python trains → JSON trees → TypeScript walk.** One artifact, one serving path,
  fixture-backed Python↔TS parity.

## Decision

Train offline in `ml/train.py`. Export gradient-boosted quantile trees to
`src/data/generated/model.json`. Serve only through `treeEnsemble.ts` inside `EtaEngine`.

`predictDelay()` in `etaModel.ts` is a registered heuristic fallback when the artifact is
missing or corrupt (`modelVersion: "fallback"`).

## Consequences

- A feature change requires bumping `FEATURE_VERSION` and retraining. CI asserts 100
  fixed vectors match Python within `1e-6` (`treeEnsemble.test.ts`).
- Quantile models are independent; serving enforces `p10 ≤ p50 ≤ p80 ≤ p90`.
- Retraining is a batch job (`ml/retrain.py` + champion/challenger registry), not an
  in-request fit.
