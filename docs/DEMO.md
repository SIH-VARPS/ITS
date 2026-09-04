# Demo script (7 minutes)

Rehearse this talk three times before the slot. One of those three must be with the
uplink unplugged (or `LIVE_FEED_DISABLE_VENDOR=1`) so Tier C is the live feed.

Surfaces: `/` (scale), `/train/12951` (passenger), `/display/NDLS` (station),
`/control-room` (eval + cascade + retrain).

## Minute-by-minute

1. **Baseline (0:00–0:45).** Open `/control-room`. “IR estimates ETA as schedule + current
   delay − recovery. That is Baseline B — our official comparison, not the product.”
2. **Scale (0:45–1:15).** Home page: five-digit timetable count, multiple zones, multi-day
   journeys kept. “Eleven thousand coaching trains, not a 40-train demo set.”
3. **Live event (1:15–2:15).** From a second window, inject a crowd observation (or use
   the delay already on 12951). Passenger `/train/12951`, station `/display/NDLS`, and the
   control-room spotlight show the **same** `data-engine-eta`. One engine, three consumers.
4. **Explain (2:15–3:00).** On the passenger page, point at feature attributions
   (`data-testid="eta-attributions"`): sectional speed, congestion ahead, weather code.
5. **Cascade (3:00–4:00).** Control room cascade list: connection at risk, platform
   conflict, crew ready-by (`data-testid="ops-actions"`).
6. **Resilience (4:00–4:45).** Kill Wi-Fi or export `LIVE_FEED_DISABLE_VENDOR=1` and
   refresh. `data-source-tier` becomes `replay`. Forecasts continue. “The vendor is Tier
   A; the demo does not die with the hall network.”
7. **Prove (4:45–6:00).** Eval panel (`data-testid="eval-panel"`). Synthetic vs Real
   hold-outs are separate buttons — never blended. Next-halt MAE vs Baseline B; P80
   coverage; zone / class / hour slices.
8. **Refinement (6:00–6:30).** Retrain accuracy (`data-testid="retrain-accuracy"`): last
   MAE below first MAE. “Continuously refine” is a measured loop, not a slogan.
9. **Production path (6:30–7:00).** “Swap one adapter for CRIS Pravah. The engine, the
   API, and the three surfaces stay.”

## Offline rehearsal checklist

- [x] `GET /api/v2/health` → `status: ok`, `modelLoaded: true`
- [x] `GET /api/v2/live/12951` → `source: replay` when the vendor is disabled or down
- [x] `GET /api/v2/eta?train=12951&station=NDLS` → ISO `eta` present
- [x] Passenger, display, and control room still render `data-engine-eta`

```sh
LIVE_FEED_DISABLE_VENDOR=1 npm run preview
npm run demo:rehearse
```

PowerShell: `$env:LIVE_FEED_DISABLE_VENDOR='1'; npx vite preview --host 127.0.0.1 --port 4173`

## Rehearsal log

Recorded 2026-09-04 against local `vite preview` on 127.0.0.1:4173.

| Pass | Mode                                                        | Result                                                                                                                                             |
| ---- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Vendor allowed (Playwright preview, no disable flag)        | 7/7 E2E green: delay injection, display/control-room identity, cascade, consent, eval toggle                                                       |
| 2    | `LIVE_FEED_DISABLE_VENDOR=1`                                | `npm run demo:rehearse` → health ok, `liveSource: replay`, ISO eta; passenger / display / control-room same `data-engine-eta`; Real hold-out n=108 |
| 3    | Browser routes to `api.railradar.in` and Open-Meteo aborted | `e2e/submission.spec.ts` blocked-vendor test: engine ETA still renders                                                                             |
