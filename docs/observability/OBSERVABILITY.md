# Observability — live, not decorative

**Owner:** Platform · **Status:** active · **Clock:** pg_cron (every minute)

## 1. What was inert

| Signal           | Before                               | Now                                                      |
| ---------------- | ------------------------------------ | -------------------------------------------------------- |
| SLO              | computed in the browser              | `public.evaluate_slos()`, every minute                   |
| Alerts           | `alerts.yml` with no engine          | generated from `slo_definitions`; fired by the evaluator |
| Status page      | hand-edited `ops/status/status.json` | generated from `/functions/v1/status`                    |
| Tracing          | spans created, never exported        | OTLP/HTTP exporter, batched                              |
| Web Vitals       | measured, never shipped              | `/functions/v1/ingest-rum`                               |
| Error monitoring | DSN absent from the env contract     | `VITE_SENTRY_DSN` required in prod                       |

## 2. Data flow

    request -> withTelemetry -> structured log + edge_request_samples row
                                       |
                          pg_cron (1m) -> slo-evaluator -> evaluate_slos()
                                       |
                    slo_snapshots + alert_events (state CHANGE only)
                                       |
                              webhook + /status (public)

    browser -> reportVital -> /ingest-rum -> rum_samples

## 3. Why no Prometheus

`alerts.yml` was Prometheus-shaped with nothing to run it. Postgres is already a
dependency and `pg_cron` is a clock. That is sufficient to compute an SLI, hold a
state machine, and notify. `/functions/v1/metrics` still exposes Prometheus text,
so a real Prometheus can be attached later without changing the tables — the
generated `alerts.yml` is already in the right shape for it.

## 4. Burn rate, not thresholds

`burn_rate = (1 - sli) / (1 - target)`. `burn >= 1` means the window spent its
entire error budget. This is standard SRE practice: a 99.9% SLO tolerates a much
higher instantaneous error rate over a short window than over a long one, and a
bare threshold cannot express that.

## 5. PII

`edge_request_samples` carries route + status + duration + tier. No user id, no
IP. Routes are normalised (`/chart/:id`, not `/chart/8f3a-...`) so cardinality is
bounded. `rum_samples` carries metric + value + normalised route.

## 6. Retention

`public.prune_observability(14, 90)` — 14 days of samples, 90 days of snapshots.
Scheduled hourly. Snapshots are cheap and are the audit trail; samples are bulk.

## 7. Adding an SLO

1. Insert a row in `public.slo_definitions` (or `supabase/slo_definitions.json`).
2. `npm run alerts:emit`.
3. Add the runbook anchor.
4. `npm run alerts:check` must pass.

## 8. STOP-THE-LAUNCH conditions

1. `evaluate_slos()` returning no rows while traffic is flowing.
2. An alert firing every minute — state changes only, so a repeat means the
   resolve branch is broken.
3. `store_error`-class silence: telemetry throwing and being swallowed invisibly.
4. `alerts.yml` differing from `slo_definitions` (drift).
5. Sentry receiving nothing while the app runs in prod.

## 9. CI secrets required

    SENTRY_AUTH_TOKEN        # source-map upload (NOT VITE_-prefixed)
    ALERT_WEBHOOK_URL        # edge secret
    CRON_TOKEN               # shared token for the cron-triggered evaluator

## Change log

- **2026-10-31** — Server-side SLOs, alert state machine, generated status, OTLP, RUM.
