# Tier Parity — server is the authority

**Owner:** Quality / Pre-Launch · **Closes:** `PARITY-001` · **Status:** active

## 1. The problem this closes

Dose 1's tier robot validates the **UI contract** while all enforcement is
client-side. A user can open devtools, set `localStorage.vr_tier = 'practitioner'`,
and see enterprise UI. The robot passes. The product is lying.

## 2. The rule

> A client-side check is UX. Authorisation exists only on the server.

So: the client may _render_ from a cached entitlement, but the server must
**re-derive** it on every privileged call and reject when they disagree.

## 3. Architecture

| Layer  | File                                             | Authority                   |
| ------ | ------------------------------------------------ | --------------------------- |
| DB     | `user_entitlements` + `resolve_entitlement()`    | ✅ authoritative            |
| edge   | `_shared/entitlements.ts`, `_shared/tierGate.ts` | ✅ enforces                 |
| edge   | `functions/tier-entitlement`                     | exposes truth to the client |
| client | `src/features/tier/resolveTier.ts`               | renders only                |
| client | `localStorage['vr_tier']`                        | dev/harness fallback only   |

Resolution order on the client: server → seeded key → `'free'`.

## 4. Tamper matrix (what `tier-parity.spec.ts` asserts)

| Seed says      | Server says  | Expected UI    | Expected API         |
| -------------- | ------------ | -------------- | -------------------- |
| `premium`      | `pro`        | pro            | 200                  |
| `practitioner` | `free`       | **free**       | 402 on `white_label` |
| `registered`   | `enterprise` | **enterprise** | 200                  |
| `anonymous`    | `free`       | free           | 200                  |

The middle two rows are the point: the seed must lose.

## 5. Running

    npm run dev -- --host 127.0.0.1
    npm run test:parity
    npm run test:db            # pgTAP: RLS + RPC invariants

## 6. STOP-THE-LAUNCH conditions

1. Any `@parity` test fails.
2. A tampered seed changes rendered entitlements.
3. `white_label` reachable on a `free` server entitlement.
4. `resolve_entitlement` returns anything other than `free` for an unknown user.
5. `npm run test:db` fails — an untested RLS policy guards user birth data.

## 7. Residual risk

`user_entitlements` is populated by hand today. Until a payment rail writes to
it, a paying user stays `free` until an operator flips the row. That is a
billing problem, not a parity problem — tracked separately.

## Change log

- **2026-10-27** — Initial. Closes `PARITY-001`.
