# Performance budgets — enforced, not aspirational

**Owner:** Frontend Lead · **Enforced by:** `.github/workflows/perf.yml`, `budgets.json`

## 1. The rule

A budget that is not enforced is a wish. Every number below fails a build.

| Budget                              | Value  | Gate                 |
| ----------------------------------- | ------ | -------------------- |
| Entry bundle (gzip)                 | 190 KB | `budget:check`       |
| Largest lazy chunk                  | 160 KB | `budget:check`       |
| Lighthouse perf (mobile, throttled) | 80     | `lhci autorun`       |
| LCP                                 | 2.5 s  | Lighthouse assertion |
| INP                                 | 200 ms | `test:perf:mobile`   |
| Kundli compute main-thread block    | 250 ms | `test:perf:mobile`   |
| k6 p95                              | 800 ms | nightly `load.yml`   |

Baselines live beside the budgets so a failure says "**you added 14 KB**", not
"178 > 190". A budget with a diff is actionable; without one it is a number.

## 2. The architectural fix, not the tuning

The biggest win was not minification. `computeChart` ran on the main thread and
costs 80–400 ms of pure CPU — a frozen UI on the low-end Android that is our
primary market.

`src/workers/ephemeris.worker.ts` moves it off-thread and calls the **same pure
functions**, so accuracy is untouched. `client.ts` falls back to the main thread
if `Worker` is unavailable — the worker is an optimisation, never a correctness
dependency.

## 3. Route discipline

`scripts/audit-routes.mjs` fails on an eager page import (it must be `lazy()`),
flags barrel imports near heavy code, and requires every page to have a default
export so `lazy()` cannot silently break.

## 4. IndexedDB

Schema changes go through an append-only migration list (`src/storage/idb.ts`).
A failed upgrade degrades to read-only rather than throwing — losing writes beats
losing reads. A blocked upgrade (another tab on an old version) is logged, not
hung on.

## 5. i18n

Typed keys (`src/i18n/index.ts`) turn a missing Hindi string into a compile error
instead of a silent English fallback. `check-i18n.mjs` fails on key or
interpolation-token drift between locales.

## 6. STOP-THE-LAUNCH conditions

1. `budget:check` or `lhci autorun` failing on `main`.
2. Any long task over 250 ms on the chart interaction path.
3. A page that is not lazy-loaded.
4. A k6 threshold breached two nights running.
5. An i18n key present in `en` and absent in `hi`.

## 7. What is deliberately not done

- No CDN image transform audit yet (needs a real asset inventory).
- No server-side render — the app is a SPA and SSR is a separate decision.
- Throttled Chromium is not a real device. It is directionally right, not exact.

## Change log

- **2026-11-03** — Budgets, worker, route audit, IDB versioning, i18n parity.
