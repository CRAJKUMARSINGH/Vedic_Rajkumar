# ADR-008 — DCO, CODEOWNERS, and a generated CHANGELOG

**Date:** 2026-11-02 · **Status:** Accepted

## Context

Three separate findings converged: no CODEOWNERS, no Dependabot, no CHANGELOG, and
a `0.1.0` version that had never moved. Plus a legal one that only exists because
of ADR-007: exercising the Swiss Ephemeris commercial licence — or relicensing the
repo — requires consent from every copyright holder, and nothing was collecting it.

## Decision

1. **DCO** on every commit, enforced in CI. Not a CLA: a DCO is a commit trailer,
   needs no signing service, and produces the same consent record. A CLA remains an
   upgrade path for corporate contributors.
2. **CODEOWNERS** on the paths where a bad merge is expensive and silent:
   migrations, RLS helpers, CI workflows, compliance docs, the licence allowlist.
3. **semantic-release** generates `CHANGELOG.md` and the version. commitlint already
   constrained the format; it previously fed nothing.
4. **Branch protection as code** — the rule set is a file, applied by a script.
5. **GOVERNANCE.md** names the roles and the decision classes, so "who decides" is
   not a person's memory.

## Consequences

**Good:** consent is on record before it is needed; releases are traceable; a
loosened CI gate shows up as a diff.

**Bad / accepted:** CODEOWNERS is vacuous if one person holds every role — the
resolution is `docs/ops/ACCESS_INVENTORY.md`, not a weaker rule. DCO adds a step to
every contribution. semantic-release needs a real commit history to be useful, so
the first release is mostly backfill.

## Revisit when

A corporate contributor cannot sign the DCO (→ CLA), or a role reaches 3+ people
(→ the single-owner table in GOVERNANCE.md becomes a real RACI).
