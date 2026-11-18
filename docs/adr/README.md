# Architecture Decision Records

**Owner:** Core Engineering · **Status:** living

An ADR records a decision **and its trade-off**, at the time it was made. The
value is not the conclusion — it is that a future reader can see what was
considered and rejected, and whether the constraint still holds.

## Index

| ADR                                                       | Decision                               | Status   |
| --------------------------------------------------------- | -------------------------------------- | -------- |
| [ADR-001](ADR-001-tier-taxonomy.md)                       | One canonical tier taxonomy            | Accepted |
| [ADR-002](ADR-002-payment-rail.md)                        | Stripe as the rail, no SDK             | Accepted |
| [ADR-003](ADR-003-api-surface.md)                         | Public API is `supabase/functions/v1`  | Accepted |
| [ADR-004](ADR-004-one-source-of-truth.md)                 | One source of truth per subsystem      | Accepted |
| [ADR-005](ADR-005-shared-rate-limit-store.md)             | Postgres is the rate-limit store       | Accepted |
| [ADR-006](ADR-006-slos-computed-server-side.md)           | SLOs computed server-side              | Accepted |
| [ADR-007](ADR-007-swiss-ephemeris-licensing.md)           | Swiss Ephemeris: AGPL + escape hatch   | Accepted |
| [ADR-008](ADR-008-governance-and-contributor-consent.md)  | DCO, CODEOWNERS, generated CHANGELOG   | Accepted |
| [ADR-009](ADR-009-performance-budgets-are-ci-enforced.md) | Performance budgets are CI gates       | Accepted |
| [ADR-010](ADR-010-single-region-and-measured-dr.md)       | Single region + measured restore drill | Accepted |
| [ADR-011](ADR-011-landing-copy-is-verified.md)            | Landing copy is verified               | Accepted |
| [ADR-012](ADR-012-deploy-skew-and-invisible-deploys.md)   | Deploy skew and invisible deploys      | Accepted |
| [ADR-013](ADR-013-enrichment-is-a-data-release.md)        | Enrichment is a data release           | Accepted |

## When to write one

A decision needs an ADR when **reversing it later would be expensive**, or when a
future reader would otherwise ask "why on earth is it like this?".

Does **not** need an ADR: a library choice with no lock-in, a file move, a bug fix.

## Process

1. Copy `template.md` to `ADR-00N-short-title.md`.
2. Fill it in. "Consequences" must include the bad ones.
3. Open a PR — `@vedic-rajkumar/core` review is required (CODEOWNERS).
4. Status starts `Proposed`; flips to `Accepted` on merge.
5. Superseding is a new ADR with `**Supersedes:** ADR-00N`. Never edit an accepted
   ADR's decision — append a `## Update` section instead. The history is the point.
