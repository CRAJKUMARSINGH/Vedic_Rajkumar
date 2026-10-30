# ADR-001 — One canonical tier taxonomy

**Date:** 2026-10-27 · **Status:** Accepted · **Supersedes:** —

## Context

Three taxonomies coexist and disagree:

| Source                                | Values                                                  |
| ------------------------------------- | ------------------------------------------------------- |
| `src/features/tier/config.ts`         | `anonymous` · `registered` · `premium` · `practitioner` |
| `src/api/v1/scopes.ts`                | `free` · `developer` · `business` · `enterprise`        |
| `src/services/subscriptionService.ts` | `free` · `pro`                                          |

Consequences observed: the pricing page says ₹499/month "Pro"; the API says
`developer`; the feature-gate says `premium`. Nothing reconciles them, so every
gate is a coin flip and the tier robot cannot assert a single truth.

## Decision

One canonical enum: `Tier = 'free' | 'pro' | 'enterprise'` in `src/features/tier/tiers.ts`.
Legacy enums are **mapped, not deleted**, via `toTier()`. Unrecognised input
resolves to `'free'` (deny by default). The server mirror lives in
`supabase/functions/_shared/entitlements.ts`; the DB is the authority
(`user_entitlements` + `resolve_entitlement`).

## Consequences

- Every new gate reads `ENTITLEMENTS[tier]` — one table, one review surface.
- `docs/testing/TIER_MATRIX.md` becomes assertable by the tier robot.
- Deleting the legacy enums is now a mechanical follow-up, not a redesign.
- `api/v1/scopes.ts` `business` and `developer` both collapse to `pro`; if a
  future plan needs to distinguish them, add a tier rather than a parallel enum.
