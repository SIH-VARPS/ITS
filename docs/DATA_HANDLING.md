# Data handling (crowd GPS)

Passenger location is personal data. RailDristhi only stores it when the rider opts in.

## Consent

- The train page checkbox (`data-testid="gps-consent"`) must be checked before the browser posts.
- `POST /api/v2/observations` requires `"consent": true`. Missing or `false` returns 400 and writes
  nothing.

## What is stored

- Train number, run date, snapped station/section, delay minutes, and **coarsened** coordinates.
- Coordinates are rounded to 3 decimal places (~111 m) at rest. Full-precision GPS is used only to
  snap to the published route, then discarded.
- Source is tagged `crowd`. No name, device id, or account is stored.

## Retention

- In-memory `MemoryObservationStore` only. Nothing is written to disk for crowd GPS.
- History is capped at 256 observations per `(trainNo, runDate)` (`DEFAULT_HISTORY_BOUND`).
- Process restart clears the store.

## Delete

`DELETE /api/v2/observations?train={number}` (optional `runDate=YYYY-MM-DD`) drops latest + history
for that train-run and bumps the store revision. The train page exposes the same action as
“Delete stored location data for this train”.
