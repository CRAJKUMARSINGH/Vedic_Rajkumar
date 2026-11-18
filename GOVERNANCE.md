# Governance

**Owner:** Core Engineering · **Last updated:** 2026-11-02

Written down because "we'll figure it out" stops working the moment a second
person, a customer, or an auditor appears.

## Roles

| Role     | Owns                               | Can merge into                      |
| -------- | ---------------------------------- | ----------------------------------- |
| Core     | architecture, ADRs, release        | `main` (all paths)                  |
| Data     | migrations, RLS, retention         | `supabase/**`                       |
| Security | CI gates, secrets, compliance docs | `docs/legal/**`, `docs/policies/**` |
| Accuracy | ephemeris, corpus, golden tests    | `src/features/ephemeris/**`         |
| Growth   | pricing, conversion surfaces       | `src/features/tier/**` (with Core)  |

Roles are GitHub teams. CODEOWNERS maps paths to roles; membership is the
authority. Today each role may be one person — that is fine, but **two roles must
never be the same person on a compliance-critical path**, otherwise the review
requirement is vacuous.

## Decision classes

| Class         | Process                     | Reversible by         |
| ------------- | --------------------------- | --------------------- |
| Routine       | one Core review             | revert                |
| Cross-cutting | ADR + Core review           | new ADR               |
| Breaking API  | ADR + 7-day comment window  | new ADR + deprecation |
| Compliance    | ADR + Security review       | ADR + re-audit        |
| Licensing     | ADR + Security + legal note | new ADR               |

## Release authority

Only `main` releases. `beta` is prerelease. A release requires: green CI, DCO on
every commit, an updated `CHANGELOG.md` (generated), and no open `critical` alert.

## Branch protection as code

`.github/branch-protection.json` is the desired state; `npm run protection:apply`
applies it. Config drifted silently before — a rule removed in the UI is invisible
in review.

## Bus factor

The target is **2**, not 1, on: `main` push, Supabase dashboard, Stripe dashboard,
domain registrar, and the Sentry/PostHog projects. `docs/ops/ACCESS_INVENTORY.md`
lists who holds what and how to recover it.

## Amending this file

PR + Core review. A governance change that nobody notices is worse than no rule.
