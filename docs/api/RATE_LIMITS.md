# Rate Limits & Metering

**Owner:** Platform · **Enforcement:** `supabase/functions/_shared/mod.ts` → `enforceRateLimit()` · **Store:** Postgres

## 1. The bug this fixes

Both limiters were per-instance memory:

| File                                      | Scope       | Problem                                 |
| ----------------------------------------- | ----------- | --------------------------------------- |
| `src/lib/rateLimiter.ts`                  | browser     | resets on refresh; UX only              |
| `supabase/functions/_shared/rateLimit.ts` | one isolate | N isolates = N counters = N x the limit |

And metering (`src/api/metering/usage.ts`) was client-reported, so a user could
exceed their plan without ever touching the counter.

## 2. Design

One algorithm (`src/api/rateLimit/algorithm.ts`), one store (Postgres), one key
derivation. The browser keeps a local copy purely for instant UI feedback.

    request -> enforceRateLimit(req, ctx, { scope, tier, cost })
                 -> resolveIdentity  (apiKey > user > sha256(ip)[:16])
                 -> admit_request()  (ONE round trip: quota + token bucket)
                 -> allowed | 429 + Retry-After

**Why Postgres, not Redis:** Postgres is already a dependency and a single
`FOR UPDATE` row lock is cross-isolate atomic. Redis/Upstash is a latency
optimisation behind the same interface — not a correctness prerequisite. If you
add it, the SQL stays the reference implementation.

## 3. Key derivation

`rl:<scope>:<identity>` — the scope is in the key so a chart burst cannot starve
panchang. Identity precedence: API key id, then user id, then `sha256(ip)[:16]`.
IP is hashed because it is weak PII and NAT collapses thousands of users onto one.

## 4. Tiers (`src/api/v1/scopes.ts`)

| Tier       | rpm   | burst | daily quota |
| ---------- | ----- | ----- | ----------- |
| free       | 20    | 40    | 1,000       |
| developer  | 120   | 240   | 50,000      |
| business   | 600   | 1,200 | 500,000     |
| enterprise | 3,000 | 6,000 | 5,000,000   |

`quota < 0` means unlimited. Expensive endpoints pass `cost > 1`
(e.g. `?ephemeris=swiss` costs 5) so a weighted call cannot be used to dodge the limit.

## 5. Response contract

Always: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`,
`X-RateLimit-Policy`. On 429 only: `Retry-After`.

    429 { "error": "rate_limited" | "quota_exceeded", "retryAfter": <seconds> }

## 6. Fail-open, never silent

A store failure allows the request (`reason: "store_error"`) — availability beats
exactness for a public API — but it is `console.error`-logged with the scope so a
broken store shows up as a metric instead of a mystery.

## 7. Housekeeping

`public.prune_rate_limit_buckets(60)` deletes buckets idle for an hour. Wire it to
the existing `.github/workflows/backup.yml` schedule. Stale buckets are garbage
after minutes of silence.

## 8. Testing

| Layer                         | File                                            |
| ----------------------------- | ----------------------------------------------- |
| algorithm                     | `src/tests/api/rateLimit.test.ts`               |
| SQL atomicity + quota + prune | `supabase/tests/rate_limit_rls.test.sql`        |
| live headers + 429            | `tests/e2e/rate-limit.spec.ts` (`EDGE_URL=...`) |

## 9. STOP-THE-LAUNCH conditions

1. Two sequential identical requests both allowed when burst is 1.
2. A 429 without `Retry-After`.
3. `quota_exceeded` not reachable while the bucket still has tokens.
4. `store_error` appearing without a log line.
5. Any endpoint enforcing a limit without calling `enforceRateLimit`.

## Change log

- **2026-10-30** — Shared store, server metering, one algorithm.
