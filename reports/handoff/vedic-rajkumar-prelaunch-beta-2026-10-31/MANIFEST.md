# Handoff — Pre-launch beta battery, 2026-10-31

Zip: `vedic-rajkumar-prelaunch-beta-2026-10-31.zip`
Repo: https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar
Branch: `feature/vedic-vijay-doses`
Produced by: robotic pre-launch battery (gate matrix G0–G6, see
`docs/launch/pre-launch-daily-test-prompt.md`).

This archive contains **only the files that changed as a result of the rigorous
robotic beta test**, plus the evidence the run produced. Nothing else in the repo
was touched by this session.

## Why a zip at all

The user's brief: *"Beta test the repo in manner prescribed robotically and give
updated files in zip if so debug required as a result of rigorous testing."*
Debugging **was** required — two genuine defects were found and fixed — so the
changed files are shipped here for review/hand-off.

## Files in this archive

### 1. Corrected source (defect fixes)

| File | Defect | Change |
|---|---|---|
| `src/components/EnhancedBirthInputForm.tsx` | **DEF-013** (High, FIXED) | Location-suggestion dropdown moved from `absolute z-50` overlay into normal flow; its outside-click handler now closes on `click` instead of `mousedown`. Previously the first submit click was silently swallowed (the list collapsed ~200px between mousedown and mouseup, so the browser attributed the gesture to the form ancestor and `onSubmit` never fired). |

### 2. Corrected tests (false-red / false-green elimination + new regression)

| File | Defect | Change |
|---|---|---|
| `tests/e2e/tier-matrix.spec.ts` | **DEF-014** (High, FIXED) | `beforeEach` now waits for the `tier-badge` app-mount anchor before asserting, and the banner check uses a retrying `toHaveCount`. Previously it read `count()` while the lazy `/app` route was still on the `Suspense` "Loading…" fallback — free grade read as a **false-red**, paid grades passed **vacuously** (false-green). |
| `tests/e2e/robustness-random-birth.spec.ts` | **DEF-013** regression | New deterministic test `location suggestions do not block the primary submit action`: fills a city but never picks a suggestion, asserts the suggestion list is visible, then asserts submit still produces a result. |

### 3. Documentation

| File | Purpose |
|---|---|
| `docs/launch/pre-launch-user-testing-playbook.md` | **The requested stepwise playbook.** Covers (a) tiering testers into Nascent/Intermediate/Advanced by prior astrological knowledge, experience and question depth; (b) per-tier test scripts + the robotic battery; (c) how to capture bugs; (d) how to remove bugs; (e) registration + server-authoritative 7-day trial. MEASURED facts are separated from PROPOSED policy; residual risks in §8. |
| `app-robustness-testing.md` | Mandatory append-only logbook. New §4 entry for this session, new §5 index row, and three new §6 defect rows (DEF-013, DEF-014, DEF-015). |

### 4. Evidence produced by the run

| File | What it is |
|---|---|
| `reports/robustness/report.json` | Full robustness robot report (24 tests: 6 seeded random births + 17 Prashna + 1 regression). Screenshots live in `reports/robustness/screenshots/` in the working tree (too large to include here). |
| `reports/tiers/{free,pro,enterprise}.json` | Per-grade tier-robot results (tier-badge, upgrade-banner, weekly-drive, page-errors). |
| `reports/tiers/report.json` | Aggregate tier report. |

## Gate results from this session (MEASURED)

> **Superseded 2026-10-31 19:30; re-pinned 2026-10-31 23:58 and again 2026-11-01 00:45.** The **G1**
> figure below (**2063**) is this archive's _build-time_ measurement and is kept verbatim — this is a
> frozen 12:30 snapshot, and its `.zip` is left byte-unchanged. The **current derived
> canonical is 2092 tests / 126 files** (`npm run test:run` → `.vitest-report.json`; see
> `docs/CLAIMS.md`). Read the G1 row as "2063 at build", not "2063 today".

| Gate | Command | Result |
|---|---|---|
| G0 typecheck | `npm run typecheck` | exit 0, **0 errors** |
| G0 lint | `npm run lint` | exit 0, **0 errors** / 1258 warnings (pre-existing) |
| G1 unit | `npm run test:run` | **2063 passed**; 1 suite fails for an **environmental** reason (missing generated fixture) |
| G2 accuracy | `npm run validate:accuracy` | **155 / 155** |
| G3 a11y | `npm run test:a11y` | **17 / 17** |
| G4 build | `npm run build` | exit 0 (`dist/` emitted) |
| G5 robustness | `npx playwright test -c playwright.robustness.config.ts` | **24 / 24 passed** |
| G5b tiers | `npx playwright test -c playwright.tiers.config.ts` | **15 passed / 0 failed / 9 fixme-skipped** |

## Known non-code blocker (carried, unchanged)

`src/tests/content/festivals.golden.test.ts` fails with `ENOENT … festivals.golden.json`
until that generated fixture is produced (`npm run content:golden:sync`, which needs
`SUPABASE_DB_URL` + `psql`). This is the **only** G1 failure and it is environmental,
not a defect in the diff.

## Fresh re-run log (second pass, 2026-10-31)

The two Playwright robots were re-executed against the current working tree so the
evidence in this zip is current, not from the first pass:

| Robot | Command | Fresh result |
|---|---|---|
| G5 robustness | `npx playwright test -c playwright.robustness.config.ts` | **24 passed (1.3 m)**; `reports/robustness/report.json` regenerated 2026-10-31T10:01:36Z |
| G5b tiers | `npx playwright test -c playwright.tiers.config.ts` | all grade checks **pass**; `reports/tiers/free.json` 10:03:34Z, `pro.json` 10:03:48Z, `enterprise.json` 10:04:02Z |

**Two honest notes about this environment:**
1. Both commands exit **1** even when all tests pass. The non-zero code comes from the
   sandbox refusing writes to Microsoft Edge profile / TokenBroker files at teardown
   (`TRAE Sandbox Error: hit restricted`), *after* the `24 passed` / per-grade results
   are already printed and written. It is not a test failure.
2. `reports/tiers/report.json` (the **aggregate**) still shows `2026-10-27` because its
   writer is a global teardown step that the sandbox killed. The **per-grade** files
   above are the authoritative fresh evidence and are all green.

## How to apply

1. Copy the three source/test files over their counterparts (paths preserved).
2. Re-run the two robot configs to confirm green:
   - `npx playwright test -c playwright.robustness.config.ts`
   - `npx playwright test -c playwright.tiers.config.ts`
3. Read `docs/launch/pre-launch-user-testing-playbook.md` end-to-end before recruiting testers.
4. Address **DEF-015** (no central bug inbox; `userFeedbackService.sendToBackend()` is a mock) before the first tester cohort — see playbook §3.
