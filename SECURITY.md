# Security

RailDristhi handles a paid RailRadar API key and optional passenger GPS. This note is the
submission-facing summary of how those are kept off the client and off disk longer than needed.

## Secrets

- `.env` is gitignored (see `.gitignore`). `.env.example` lists names only.
- `RAILRADAR_API_KEY` is read on the server (`src/server/live/railRadarAdapter.ts`,
  `src/server/pnr/resolvePnr.ts`). It is never prefixed with `VITE_`.
- CI `npm run check:bundle` scans `.vercel/output/static/assets` for the `rr_live_` key prefix.
- Structured logs redact `RAILRADAR_API_KEY` (`src/lib/logger.ts`).

### Git history

Checked on 2026-09-04:

- `git log --all -- .env` — `.env` has never been committed.
- `git log -S "rr_live_" --all` — the prefix appears in `SIH_PLAN.md` (plan text) and in
  unit-test fixtures, not as a committed live credential.

## Client-inlined Maps key

`VITE_GOOGLE_MAPS_API_KEY` **is** inlined into client JavaScript by Vite (see `RouteMap.tsx` and
`NetworkMap.tsx`). Treat it as a public browser key: restrict it by HTTP referrer in Google Cloud.
It is not a substitute for the RailRadar secret.

## HTTP

- Every `/api/v2` route is rate-limited (`applyV2RateLimit` runs before handlers).
- Request bodies and query strings are parsed with Zod (`src/server/schemas/`).
- GET responses may send `Access-Control-Allow-Origin: *`.
- POST / PUT / PATCH / DELETE (and their CORS preflight) require an Origin on the allowlist:
  `CORS_ALLOWED_ORIGINS`, `APP_URL`, plus localhost/127.0.0.1 on ports 3000 and 4173. Disallowed
  origins receive 403 without a wildcard ACAO header.

## Location data

See [docs/DATA_HANDLING.md](docs/DATA_HANDLING.md). Consent is `z.literal(true)` on
`POST /api/v2/observations`. Stored coordinates are rounded to 3 decimal places. `DELETE
/api/v2/observations?train=` removes the in-memory latest and history for that train-run.

## Dependencies

`npm audit --omit=dev --audit-level=high` is a CI gate. Recharts v2 is deprecated in the lockfile;
we keep it for the SIH window — [docs/adr/0001-keep-recharts-v2.md](docs/adr/0001-keep-recharts-v2.md).
