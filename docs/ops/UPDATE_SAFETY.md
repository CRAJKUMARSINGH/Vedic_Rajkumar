# Continuous uninterrupted service

**Owner:** Platform · **Enforced by:** `scripts/deploy-safety.mjs` · **See also:** ADR-012

## 1. The one rule

**A deploy must be invisible.** If a user can tell that a deploy happened, either
the deploy was unsafe or the UX was wrong. There is no third option.

Corollary: **deploy and release are different events.** Code ships on every merge;
a _feature_ turns on via a flag. This is what makes a rollback a flag flip instead
of a redeploy.

## 2. Migrations: expand → backfill → switch → contract

A single-step migration breaks the _old_ client, which is still live. Always four
steps, across four deploys:

1. **Expand** — add the new column/table. Nullable, no default, or a default that
   is cheap. Old and new code both work.
2. **Backfill** — populate in batches, off-peak, resumable. Never in a transaction
   that locks the table.
3. **Switch** — new code reads/writes the new shape. Old code is now the stale one.
4. **Contract** — drop the old column/table. Only now, and only after the old
   client is below the support floor.

`deploy-safety.mjs` blocks a `DROP`/`ALTER TYPE`/`SET NOT NULL` in a single
migration with no expand marker.

## 3. Deploy skew

The client and the API are deployed separately. Both directions break:

| Skew                 | Symptom                            | Guard                                    |
| -------------------- | ---------------------------------- | ---------------------------------------- |
| old client → new API | missing field, 500s for one cohort | additive-only responses; `checkClient()` |
| new client → old API | missing endpoint during a canary   | client tolerates 404 on new paths        |
| old SW → new assets  | stale UI, mismatched API calls     | `CACHE_VERSION` bump, enforced           |

Response fields are **never renamed or removed in place.** Add `field_v2`, switch,
then remove after 7 days.

## 4. Client floor

`MIN_CLIENT_VERSION` is the only hard lever. Raising it is a promise that
everyone below it can update. Raise it when:

- a breaking change has shipped, **and**
- the matching client has been deployed for **7 days**, **and**
- the update flow (PWA prompt) works on a real device.

`deploy-safety.mjs` blocks a floor raise inside the 7-day window.

## 5. Service worker

A SW is a deployed client you cannot un-deploy. Policy (`src/pwa/update.ts`):

1. Background update, **no blind `skipWaiting()`**.
2. Apply on the next navigation or on idle — never mid-form.
3. `beforeunload`-style guard: unsaved chart input survives an update.
4. Hard prompt only when the server floor is above the client.

`public/sw.js` is `stale-while-revalidate` for static assets and
`network-first` for `/functions/v1/*` — an API response must never come from
cache.

## 6. Deploy sequence

    1. npm run deploy:safety            # blocks on the 6 checks
    2. deploy edge functions, concurrency 1
    3. canary: 10% traffic for 5 min, watch error rate + p95
    4. promote to 100%
    5. deploy frontend (SW cache version already bumped)
    6. smoke: one real chart, one real checkout open
    7. capture .deploy/rollback.json (edge version + commit)

## 7. Rollback

Rollback is the **first** action, not the last resort. Targets, in order:

| Change            | Rollback                                                   |
| ----------------- | ---------------------------------------------------------- |
| feature bug       | flip the flag off (seconds)                                |
| frontend bug      | redeploy previous build (minutes)                          |
| edge function bug | redeploy previous version (minutes)                        |
| bad data write    | forward-fix, or restore (1 h)                              |
| bad migration     | contract step is separate, so usually nothing to roll back |

## 8. Maintenance windows

Only for: a destructive migration that cannot be expand/contract, a major version
upgrade, or a region move. Everything else is zero-downtime.

Announce 24h ahead in-app, put a banner up, and **measure the window** — a planned
window that ran 3x long is a defect.

## 9. Connection saturation

A deploy replaces edge instances; old ones drain while new ones open pools. Guard:
transaction-mode pooler, `MAX_CONNECTIONS` per instance, and **deploy concurrency
1**. Two simultaneous edge deploys is how you exhaust the pool and take down the
DB with a code change.

## 10. STOP-THE-LAUNCH

1. A destructive migration in one step.
2. `MIN_CLIENT_VERSION` raised without a 7-day-old client.
3. `CACHE_VERSION` not bumped while `src/` changed.
4. No `.deploy/rollback.json` on a production deploy.
5. A new surface with no flag.
6. Concurrent edge deploys.

## Change log

- **2026-11-18** — First version. Deploy-skew guard, SW policy, expand/contract.
