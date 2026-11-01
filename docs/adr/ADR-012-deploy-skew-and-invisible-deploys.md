# ADR-012 — Deploys are invisible; deploy and release are separate

**Date:** 2026-11-18 · **Status:** Accepted

## Context

Dose 9 made the client a PWA with a service worker and dose 3 made a Stripe
webhook the source of entitlement truth. Both created a new class of failure:
**skew.** A client from three weeks ago calling today's API, a cached SW serving
last month's assets, a webhook delivered during a deploy.

None of these break in CI, and all of them look like random bugs in production.

## Decision

1. Deploy ≠ release. Features ship behind flags; releasing is a flag flip.
2. Additive-only API response changes. Removal only after the client floor rises.
3. `MIN_CLIENT_VERSION` is the single hard lever, raised with a 7-day delay.
4. Migrations are expand/backfill/switch/contract across separate deploys.
5. The service worker updates in the background and never reloads under the user.
6. `deploy-safety.mjs` blocks the six known ways a deploy breaks production.

## Consequences

**Good:** a deploy is a non-event. Rollback is a flag flip for most bugs. Skew is
visible via response headers rather than discovered by a user.

**Bad / accepted:** migrations take four deploys instead of one — slower, and it
needs discipline. Flags accumulate and need pruning. A 7-day floor delay means
occasionally supporting a client you would rather drop.

## Revisit when

Flag count exceeds ~20 live (→ a flag registry with owners and expiry), or a
single migration genuinely cannot be split (→ a measured maintenance window).
