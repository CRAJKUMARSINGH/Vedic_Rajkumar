# Release process

Releases are driven by **semantic-release** off `main`. There is no manual
version bump; the version is derived from Conventional Commits.

## Cadence

Monthly, plus out-of-band patch releases. No long-lived branches except
`release/*`.

## Procedure

1. Work lands on a feature branch and merges to `main` **only via a pull request**
   with a green CI gate (`.github/workflows/ci.yml`) and `Signed-off-by` (DCO) on
   every commit.
2. On push to `main`, `.github/workflows/release.yml` re-runs the CI gate and then
   `npx semantic-release`, which derives the next version from the commit history,
   updates `CHANGELOG.md`, tags `vX.Y.Z`, and creates the GitHub release.
3. `npm run ship` publishes the accuracy snapshot, emits the answer cards and
   prerendered HTML, then builds. Run it before a deploy — not as part of the tag.
4. `npm run docs:verify` must be green before merge: a release note is only as
   trustworthy as the claims it repeats.

## Verification

- `.github/workflows/release.yml` — `gate` → `release` → `evidence`.
- `CHANGELOG.md` — generated; never hand-edited.
- `docs/audit/RELEASE_LOG.md` — append-only release evidence (tag + commit SHA).

## Rollback

`.github/workflows/deploy.yml` + `npm run deploy:rollback`. See the release
runbooks under `docs/runbooks/`.
