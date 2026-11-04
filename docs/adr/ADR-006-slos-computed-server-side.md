# ADR-006 — SLOs are computed server-side from real traffic

**Date:** 2026-10-31 · **Status:** Accepted

## Context

`src/observability/slo.ts` defined availability and latency SLOs in client code.
A browser can only measure its own experience, from users who successfully loaded
the page — so a total outage in which nobody loads anything registers as healthy.
Nothing computed the advertised 99.9%.

Separately, `observability/alerts/alerts.yml` was Prometheus-style YAML with no
Prometheus, no Alertmanager and no exporter.

## Decision

1. The server computes SLIs, from `edge_request_samples`, on a pg_cron schedule.
2. `evaluate_slos()` is the state machine: it opens an alert on breach and resolves
   it on recovery, and notifies only on state change.
3. `alerts.yml` becomes a **generated artifact** of the SLO table.
4. Prometheus remains supported via the existing `/metrics` endpoint but is not
   required.
5. The browser keeps a copy of the math purely for a badge, sharing one pure module.

## Consequences

- Outages are visible from outside the browser, which was the whole point.
- pg_cron and pg_net become load-bearing. Both are Supabase-managed.
- Alert noise is bounded by design: one notification per state transition.
- If traffic grows past what Postgres comfortably aggregates, the fix is to move
  the SLI query to a rollup table, not to replace the architecture.
- `VITE_SENTRY_DSN`, `VITE_POSTHOG_KEY` and `VITE_FLAGSMITH_ENV_KEY` are now part
  of the env contract, so error monitoring, analytics and remote flags stop
  silently no-op-ing in production.
