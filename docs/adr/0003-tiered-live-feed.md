# ADR 0003: Tiered live-feed adapters

- Status: Accepted
- Date: 2026-09-04

## Context

ETA is only as live as the observation feed. RailRadar is the licensed live source (Tier
A) but it has a monthly quota, timeouts, and will fail on stage if the hall Wi-Fi dies.
Crowd GPS (Tier B) is opt-in personal location data. A demo that hard-depends on the
vendor is a single point of failure.

## Options considered

- **Vendor-only.** Simplest code, dead demo when the key, quota, or network fails.
- **Vendor with a cached last-known.** Helps for seconds, not for a 7-minute talk with
  the uplink unplugged.
- **Automatic A → B → C fallback.** RailRadar, then in-store crowd GPS, then an
  accelerated-clock `ReplayAdapter` over the published timetable.

## Decision

`TieredLiveFeed` is the only `LiveFeedAdapter` the API talks to:

1. **Tier A — `RailRadarAdapter`.** `GET /v1/legacy/trains/{number}?dataType=full`.
   Circuit opens after 3 failures. Quota cap refuses the vendor without calling it.
2. **Tier B — `CrowdGpsAdapter`.** Consent-gated `POST /api/v2/observations`, snapped to
   the route, coordinates rounded at rest.
3. **Tier C — `ReplayAdapter`.** Simulator on an accelerated clock. Also the long-tail
   source when a train is not in the hot set.

`LIVE_FEED_DISABLE_VENDOR=1` (and Vitest) skip Tier A so CI and the air-gapped rehearsal
hit replay on purpose. Killing the network on stage trips the breaker the same way.

## Consequences

- Every observation carries `source: "railradar" | "crowd" | "replay"`. Surfaces show it
  (`SourceTierBadge`, `data-testid="live-feed-tier"`).
- Duplicate vendor calls inside TTL are a bug (`pipeline.test.ts` pull-through).
- Replay must resolve shard trains, not only the featured client set, or the long tail
  silently has no feed.
