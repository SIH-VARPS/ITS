# ADR 0001: Keep recharts v2 through SIH submission

- Status: Accepted
- Date: 2026-09-04

## Context

`npm` flags `recharts@^2.15.4` as deprecated. Recharts 3 is a major rewrite of the chart primitive
API. Control-room and ops dashboards already render on v2.

## Decision

Keep recharts 2.15.x for the SIH submission window. Do not block the W11 audit on a chart migration.

## Consequences

- `npm audit --omit=dev` must still report no **high** or **critical** issues; the deprecation is
  informational.
- Revisit a v3 (or replacement) upgrade after submission, with visual regression on `/control-room`
  and `/ops`.
