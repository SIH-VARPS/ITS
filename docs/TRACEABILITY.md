# PS requirement → test

This is the submission copy of SIH_PLAN.md §3. `src/__tests__/traceability.test.ts`
fails CI if a linked file disappears or loses its distinctive assertion.

| PS clause                                 | Workstream    | Verified by                                                               |
| ----------------------------------------- | ------------- | ------------------------------------------------------------------------- |
| GPS-based location data                   | W2 (Tier A/B) | `src/server/live/__tests__/adapter.test.ts`, `pipeline.test.ts`           |
| Average sectional running times           | W1, W4        | `scripts/__tests__/ingest.test.ts`, `src/lib/__tests__/etaEngine.test.ts` |
| Weather conditions                        | W3            | `src/lib/features/__tests__/weather.test.ts`                              |
| Historical delay patterns                 | W3, W4        | `sectionFeatures.test.ts` leakage test                                    |
| Congestion on downstream tracks           | W3            | `sectionFeatures.test.ts` occupancy test                                  |
| Signal halts / unscheduled stoppages      | W3, W2        | dwell overrun + `parseLegacy.test.ts` `exceptionInfo`                     |
| Delays in preceding trains                | W3, W7        | `CascadePanel.test.tsx`, cascade E2E                                      |
| Temporary speed restrictions              | W3            | `speedDeviationKmph` in `sectionFeatures.test.ts`                         |
| Dynamic ETA at intermediate + destination | W4            | `etaEngine.test.ts` quantile + summation                                  |
| Continuously refine over time             | W9            | `src/lib/refine/__tests__/registry.test.ts`                               |
| ML / statistical techniques               | W4            | `treeEnsemble.test.ts` Python↔TS parity                                   |
| Scalable to thousands                     | W1, W8        | ingest ≥10k, `perf.test.ts` 5k under 500 ms                               |
| Diverse operational zones                 | W1, W5        | eval report by zone (`harness.test.ts`)                                   |
| Temporal + spatial variability            | W3, W5        | eval report breakdowns                                                    |
| Multi-day cascading                       | W1, W5        | ingest `dayOfJourney` test                                                |
| APIs for mobile apps                      | W6            | `src/server/__tests__/apiV2.test.ts` forecast schema                      |
| APIs for station displays                 | W6, W7        | `/display/$code` E2E                                                      |
| APIs for control rooms                    | W6, W7        | cascade + spotlight E2E                                                   |
| Engine / API / UI identity                | §5            | `src/__tests__/consistency.test.tsx` (100 trains)                         |
