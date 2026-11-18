# ADR-004 — One source of truth per subsystem

**Date:** 2026-10-29 · **Status:** Accepted

## Context

The repo carried at least eight duplicated subsystems, each with one dead copy:
two ESLint configs, two env modules, two test trees, two service-worker
registration paths, two data-export edge functions, two OpenAPI sources, four
ephemeris engines, and two analytics providers.

The pattern is not accidental duplication — each pair was created deliberately and
then one half was superseded without being removed. The cost is that a reader cannot
tell which half is live, and edits to the dead half silently do nothing.

## Decision

1. Every concern gets exactly one owner. Retired paths are deleted, not deprecated.
2. The register is machine-readable: `scripts/duplicates.manifest.json`.
3. Enforcement is two-layered: a CI step (`npm run duplicates:check`) and a test
   inside the normal suite (`src/tests/architecture/duplicates.test.ts`). A
   reintroduced duplicate fails both.
4. Generated artifacts carry a `# @generated` header and are never hand-edited.

## Consequences

- Deleting is now the default; "keep it around just in case" needs a manifest entry.
- The guard is cheap (~40 lines, no dependency) and runs in milliseconds.
- Numeric-risk deletions are deliberately deferred: the four ephemeris engines stay
  until each merge keeps the accuracy corpus green. Guessing there would break the
  one thing the product is actually trusted for.
