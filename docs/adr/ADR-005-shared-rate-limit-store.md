# ADR-005 — Postgres is the rate-limit store; Redis is optional

**Date:** 2026-10-30 · **Status:** Accepted

## Context

Rate limiting was per-instance memory in two places, so the advertised limit was
multiplied by the number of live isolates. Candidates: Upstash Redis, Postgres,
or Cloudflare/Netlify edge KV.

## Decision

Postgres, via a single `admit_request()` function using a `FOR UPDATE` row lock.
Upstash stays an optional swap behind the same interface.

## Rationale

- Postgres is already a dependency and already has connection pooling. Adding Redis
  for correctness is a new vendor, a new secret, a new outage mode, and a new bill.
- One `FOR UPDATE` row lock is genuinely atomic across isolates. The limit becomes
  correct rather than approximately correct.
- One round trip decides both the rate limit and the daily quota, so the hot path
  does not pay two network hops.
- If p99 latency becomes the problem, the fix is localised: swap the store, keep
  the algorithm and the SQL as the reference.

## Consequences

- Under extreme RPS the buckets table becomes a hot spot. Mitigated by scope-scoped
  keys (no global lock) and hourly pruning.
- A Postgres outage degrades to fail-open. Accepted: a public API should not go
  down because its limiter is unhappy. It is logged and counted.
- Metering became server-authoritative as a side effect — the same call that limits
  also counts, so the browser can no longer under-report.
