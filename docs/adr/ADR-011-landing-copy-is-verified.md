# ADR-011 — Landing copy is verified against CLAIMS.md, not hand-maintained

**Date:** 2026-11-11 · **Status:** Accepted

## Context

The product's differentiator is that the numbers are real (Swiss Ephemeris, pinned
corpus, enforced budgets). But marketing copy lives in JSX and rots independently.
The first thing a stranger judges is the landing page, and the first thing that
drifts is the claim on it.

## Decision

1. Landing copy is `content/landing.yaml`, not JSX.
2. Every proof point carries a `claim:` id that must exist in `docs/CLAIMS.md`.
3. `gtm-audit.mjs` fails the build on: an unsourced claim reference, a price that
   disagrees with Stripe, a "coming soon" that has shipped, a dead CTA.
4. The funnel has a fixed event enum in both the DB and the edge function, and
   analytics can never break the UI (fire-and-forget, always 202).

## Consequences

**Good:** the landing page cannot promise something the product does not do. Price
drift is a build failure. Copy changes are reviewable as a diff, not buried in JSX.

**Bad / accepted:** copy iteration needs a deploy (accepted — it is one file). The
claim registry must be kept honest, otherwise the guard checks nothing. Marketing
speed is slightly lower than editing JSX directly.

## Revisit when

Copy needs to change faster than a deploy (→ a CMS, and then this audit runs
against the CMS export), or more than one person writes copy (→ voice guide).
