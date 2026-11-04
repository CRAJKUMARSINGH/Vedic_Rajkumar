## What

<!-- one sentence -->

## Why

<!-- the problem, not the solution. Link the finding / issue. -->

## Tier

<!-- Which environment does this change reach? A production (gated) change must
     pass every required CI check before merge. A preview (ungated) change is
     labelled `preview` and must not touch main. -->

- [ ] **production** — reaches `main`; all required checks are green
- [ ] **preview** — labelled `preview`; does not merge to `main`

## Gate

<!-- The gate-first rule: name the check that fails without this change. If no
     existing gate covers it, a new gate is part of this PR, not a follow-up. -->

**Which test fails without this change?** <!-- test file / CI job -->

## Definition of Done

<!-- Tick only what this PR's blast radius actually exercises. The full list and
     rationale live in docs/DEFINITION-OF-DONE.md. -->

- [ ] Correctness — the change is covered by a test that fails without it
- [ ] Claims — any number in README/docs is re-derived by `npm run docs:verify`
- [ ] Data — no seed-bank birth data leaves its owner scope (see `AGENTS.md`)
- [ ] Quality — `npm run typecheck` , `npm run lint` and `npm run test:run` pass
- [ ] Hygiene — no orphaned files, no commented-out code, no stale TODOs

## Claims touched

<!-- Any README/docs number changed? Name the docs:verify rule that covers it so
     the reviewer can confirm the pin was re-derived, not hand-edited. -->

<!-- e.g. "README test-count badge -> derived from the Vitest JSON report" -->

## Blast radius

- [ ] Touches a migration (forward-only; state the rollback)
- [ ] Touches RLS or an auth path
- [ ] Touches CI (a loosened gate must be called out)
- [ ] Touches a claim in `docs/CLAIMS.md`
- [ ] Touches licensing (`package-lock.json`, `license-allowlist.json`)

## Evidence

<!-- test output, a screenshot, a query result. "It works" is not evidence. -->

## Checklist

- [ ] Commits are signed off (`git commit -s`)
- [ ] Docs updated in the same commit as the code they describe
- [ ] `npm run docs:verify` passes
- [ ] New gates have a STOP-THE-LAUNCH entry, not just a green test

## Rollback

<!-- how to undo this in under 5 minutes, without a forward fix -->
