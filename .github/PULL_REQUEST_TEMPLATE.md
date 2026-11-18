## What

<!-- one sentence -->

## Why

<!-- the problem, not the solution. Link the finding / issue. -->

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
