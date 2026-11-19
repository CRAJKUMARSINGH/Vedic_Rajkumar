# Current browser regression certification - 2026-11-16 to 2026-11-17

**Status: HOLD - landing regression resolved; complete E2E gate failed.** This entry supersedes historical certification below. No push, merge or deployment performed.

Branch: `feature/browser-regression-certification`. Base commit: `c9f7b43eb86bfc78e12748d9a1f2291a23e42c98`. Environment: Windows, Node v24.14.0, Playwright Chromium, localhost only.

## Route investigation and test corrections

`src/App.tsx` imports `routes` from `src/routes/index.tsx`. This active router serves `QuestionPage` at `/prashna` and `/question`. Homepage navigation consistently uses `/prashna`, making it the canonical user-facing route. `/question` is a supported alias that stays at `/question`; it does **not** redirect. `/prasna` redirects to `/prashna`. The conflicting `src/routes/appRoutes.tsx` is not imported by App.tsx and was not used as authority. `/privacy` serves the privacy page directly. Application routes were preserved.

The original landing test expected the old homepage's links and section IDs. The corrected serial suite covers all 10 unique current internal destinations, current in-page anchors, and ordinary clicks on all four module cards. It uses the cookie button's actual accessible name (`Decline optional cookies`), then performs footer clicks without forced actionability. The consent preferences link to `/privacy-settings` is tested while its banner is present. No overlay removal, navigation mocking, new skips, or assertion weakening was introduced to make an interaction pass.

The historical serial suite had 14 cases and stopped after its first failure (1 failed, 13 unexecuted). The current homepage has 10 unique route destinations rather than 11 old/current mixed destinations; the corrected suite has 13 cases, all executed. Old removed-homepage sections were not reinstated just to satisfy stale tests.

## Executed gates and exact counts

| Run                                                                         |       Passed | Failed | Skipped / unexecuted                                             | Flaky | Evidence                                           |
| --------------------------------------------------------------------------- | -----------: | -----: | ---------------------------------------------------------------- | ----: | -------------------------------------------------- |
| Initial routes + personas (production-only offline case excluded by filter) |          101 |      0 | 0 selected cases skipped; 1 excluded by filter                   |     0 | Initial Playwright console run                     |
| Corrected landing serial suite                                              |           13 |      0 | 0                                                                |     0 | `browser-regression-landing.log`                   |
| Production build                                                            | PASS, exit 0 |      — | —                                                                |     — | `browser-regression-build.log`                     |
| Complete production-preview gate                                            |           40 |      0 | 0                                                                |     0 | `browser-regression-preview.json`, `.log`          |
| First complete dev gate, 30s default                                        |          118 |      1 | 25 total: 3 production-only skips + 22 serial-blocked/unexecuted |     0 | `browser-regression-final-dev.json`, `.log`        |
| Complete dev gate, 90s budget                                               |          121 |      2 | 21 total: 3 production-only skips + 18 serial-blocked/unexecuted |     0 | `browser-regression-complete-dev.json`, `.log`     |
| Full production preview, 144 cases                                          |          121 |      1 | 22 serial-blocked/unexecuted; 0 explicit skips                   |     0 | `browser-regression-full-preview.json`, `.log`     |
| Single failing robustness case in isolation                                 |            1 |      0 | 0                                                                |     0 | `browser-regression-robustness-debug.json`, `.log` |
| Whole robustness file                                                       |            0 |      1 | 22 serial-blocked/unexecuted; 0 explicit skips                   |     0 | `browser-regression-robustness.json`, `.log`       |
| Added ordinary 100ms pointer-press regression                               |            1 |      0 | 0                                                                |     0 | `browser-submit-before.json`, `.log`               |
| Final unfiltered preview, one worker, 145 cases                             |          125 |      1 | 19 serial-blocked/unexecuted; 0 explicit skips                   |     0 | `browser-regression-release.json`, `.log`          |

The 30s dev failure occurred in `page.screenshot` in the first synthetic random-birth robustness case, after the result and no-crash assertions passed. Existing individual navigation/result waits allow 60s/45s, exceeding that default total budget. The entire dev suite was rerun with `--timeout=90000`, with all assertions preserved, no retry, no filter, and no concurrent build or preview test. This is a harness timing adjustment, not a performance certification. An obsolete intermediate full run was interrupted after test corrections; it is not counted as a passing gate (`browser-regression-dev.log`).

## Additional failures and investigation

The 90s dev run failed the basic synthetic calculation (submit stayed disabled after the form values reset) and random-birth case 5 (no result). The dev trace shows two Vite connection sequences in one test, consistent with a reload; frequent HMR updates were observed during generated-artifact writes. This does not establish the root cause of the separate static-preview failure.

Full preview failed the first random-birth case waiting for the result; its whole-file rerun failed similarly, while the individual case passed. Retained failure screenshot shows a valid completed form still visible after the ordinary submit click. An outside-mousedown/layout-change hypothesis was investigated using a normal click with a 100ms mouse press while suggestions were open; that focused regression passed. The hypothesis is **not confirmed**. No application changes or suggestion-selection shortcuts were made to hide this behavior. Reported flaky counts are Playwright retry classifications; zero there does **not** mean manual reruns were consistent.

The final one-worker static-preview gate selected all 145 tests without filtering: 125 passed, 1 failed, and 19 were serial-blocked/unexecuted (Playwright JSON reports these as skipped). There were no explicit production-only skips on preview and no retry-classified flaky cases. It failed random-birth case 4 waiting for the horoscope result, despite other submissions passing. The 19 blocked cases are not counted as passes. This fails the full-suite acceptance criterion; the cause of intermittent submission/result failure remains unresolved.

The focused 100ms click regression passed in the final full run too. All 13 landing cases, all 80 route checks, all 22 persona cases, the 3 direct-navigation/refresh/alias cases, both production asset/offline cases, and the synthetic-home smoke passed. Three random-birth cases passed before case 4 failed; the remaining two birth cases and 17 question cases did not execute.

**Release assessment: HOLD on this verification.** The landing route/selector defect is fixed, but the complete browser gate is not green. No claim of zero genuine regressions or full launch readiness is made. Resolve the intermittent submission/result failure and rerun the complete gate before changing this status. No application routes or form behavior were changed during the investigation.

## Production-preview findings

- All 13 landing tests passed, including ordinary cookie dismissal, footer `/privacy` and `/terms` clicks, canonical `/prashna` navigation, all actual homepage destinations and anchors, and all four module cards.
- Direct navigation and browser refresh passed at `/prashna` and `/question`, with the expected heading, URL preservation and no uncaught page errors.
- `/prasna` redirected to `/prashna` and rendered the expected page.
- Synthetic persona tests passed, including keyboard-only submission, date validation, open dropdown interaction, geocoding failure and privacy settings.
- Production homepage asset probe passed; service-worker activation and offline Panchang checks passed.
- No broken homepage internal links were found. This is not a claim that every link in every authenticated page or the deployed Netlify site was crawled.

## Scope and compliance limits

Only tests, preview/full-preview test configurations, reports, generated synthetic test evidence, and the local continuity log changed. No working application routes or production behavior changed. No files were deleted; instruction documents and historical evidence were retained. See `MARKDOWN_INSTRUCTION_COMPLIANCE.md` for applicable requirement handling and unavailable historical instruction paths. No seed data was inspected/emitted/published; no `ship` or `answers:emit` command was run. Generated browser evidence is from synthetic fixtures.

This run does not renew historical unit/accuracy/security/Lighthouse claims. Normal click/keyboard checks do not substitute for a complete accessibility audit. The build retains warnings about bundle size and browser externalization of Node modules in the Swiss Ephemeris dependency. No deployed-site smoke test was performed. Auth/database environment variables are not configured, so this run covers demo/offline behavior, not authenticated backend integration.

---

# Historical certification retained for provenance (not results of this run)

# FINAL LAUNCH CERTIFICATION — Vedic Rajkumar

**Date:** 2026-11-16 · All results executed this session, not historical.

```
REPOSITORY:            https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar
RELEASE SHA:           ae65ff3872bc64f6c36cb5b44d22fe6c8f3e2a38
BRANCH:                chore/safe-redundancy-cleanup (contains a39c27e +
                       3f4188b + 994fd67 + ae65ff3 on top of e379bf5)
WORKING TREE:          clean (git status --porcelain empty; git diff --check clean)
PATCHES VERIFIED:      YES — Clerk-safe privacy, in-flow autocomplete + keyboard nav,
                       strict Gregorian date validation, shared format hints,
                       offline Panchang, persona suite — all re-verified by execution
REDUNDANCY CLEANUP:    VERIFIED — 7 superseded audit logs removed, unused pino dep
                       removed; manifest at reports/REDUNDANCY_DELETION_MANIFEST.md
UNIT TESTS:            PASS — 107 files / 1717 tests, exit 0 (npm run test:run)
CORE TESTS:            PASS — 48/48, exit 0 (npm run test:core)
ACCURACY TESTS:        PASS — 42/42, exit 0 (npm run test:accuracy:fast)
PERSONA TESTS:         PASS — 22/22 incl. dropdown-open direct submit, keyboard-only,
                       leap/invalid/midnight dates, privacy w/o Clerk
FULL E2E TESTS:        PASS — 24/24 on production preview (incl. offline SW +
                       home 404 probe: 0 ≥400, 0 requestfailed, 0 console errors)
TYPECHECK:             PASS — tsc --noEmit exit 0
LINT:                  PASS — 0 errors / 1273 warnings (categorised; no security
                       or correctness-critical warnings in patched code)
BUILD:                 PASS — exit 0, 223 SW precache entries, dist/sw.js emitted
SECURITY:              PASS — no critical/high findings (reports/SECURITY_REVIEW.md)
PRIVACY:               PASS — owner-scoped data, demo-mode honesty, no seed data
                       in public/, Clerk verified in both configured modes
ACCESSIBILITY:         PASS with noted gaps — keyboard-only journey + combobox
                       ARIA verified; axe-core sweep recommended post-launch
PRODUCTION SMOKE TEST: PASS on production-preview build (vite preview :4173).
                       NOTE: live Netlify deploy is the OLD build — branch is not
                       merged/deployed; smoke of the actual deployment requires
                       merge + deploy authorization.
CRITICAL BUGS:         0
HIGH-SEVERITY BUGS:    0
NON-BLOCKING BACKLOG:  1273 lint warnings (17 exhaustive-deps pre-existing);
                       full validate:accuracy + Lighthouse CI not run this cycle;
                       mobile Playwright project + axe-core sweep recommended;
                       Tex21 infra items (CI deploy split, pino→moved, turbo dead
                       config, swisseph-wasm AGPL license decision, 4 parallel
                       engines consolidation BLOCKED pending equivalence proof);
                       npm audit: 39 vulnerabilities (5 low/24 mod/10 high)
ROLLBACK PLAN:         branch is additive on e379bf5; revert = reset branch or
                       do not merge. ops/deploy/rollback.md + canary.md exist.
                       No deploy performed — nothing to roll back yet.
FINAL DECISION:        GO (for merge → deploy pipeline), conditional on:
                       (a) authorizing push/merge of chore/safe-redundancy-cleanup,
                       (b) post-deploy smoke of the live Netlify site,
                       (c) scheduling validate:accuracy + Lighthouse in CI.
```

## Evidence files

`cert-test2.txt` (1717 pass), `cert-tsc.txt`, `cert-core.txt`, `cert-acc.txt`,
`cert-build.txt`, `cert-e2e.txt`, `reports/evidence/landing-{360,390,768,1024,1440}.png`.

## Caveats

- First `test:run` attempt this session failed with vitest fork-worker ENOENT
  crashes while dev/preview servers held memory; after freeing ~5 GB it passed
  clean. Environmental flake, mitigated by `maxWorkers:4` + `testTimeout:60s`.
- `npm ci` not re-run (node_modules current; `npm uninstall pino` refreshed lock).
- `npm run test:e2e` dev-server config not run — preview config is the
  authoritative production gate by design.

## Addendum — landing-page E2E verification (post-merge, 2026-11-16)

- `landing-page-links.spec.ts` rewritten to assert the actual LandingPageV3
  route set (`/`, `/pricing`, `/prashna`, `/horoscope`, `/features`,
  `/matchmaking`, `/panchang`, `/privacy`, `/terms`, `/privacy-settings`)
  and canonical `/prashna` + `/privacy` routes — test-harness fixes only,
  no app routes changed, no `force: true`.
- Landing serial suite: **13/13 PASS** (incl. all 13 previously-skipped
  tests) — `landing-run.txt`.
- Full E2E (`playwright.full-preview.config.ts`, all specs vs prod preview):
  first attempt aborted mid-run when the `vite preview` server died
  (ERR_CONNECTION_REFUSED on all remaining tests — infra flake, not app
  assertions); rerun in progress — see `e2e-full-run2.txt`.

## Addendum 2 — full E2E rerun results (final)

- Landing serial suite: **13/13 PASS** — all previously-skipped tests now run;
  consent dismissed via accessible-name click; `/prashna` + `/privacy` canonical.
- Full suite (`playwright.full-preview.config.ts`, 144 tests, prod preview):
  attempt 1 aborted — `vite preview` server died mid-run (infra flake).
  attempt 2: **122 passed / 1 failed / 22 did not run** (serial skip after
  failure) — `e2e-full-run2.txt`.
- The 1 failure: `robustness-random-birth` horoscope birth-1 — "Overall Score"
  not visible in 45s. **Manual probe of identical steps PASSED in ~5s** —
  classified TEST-HARNESS timing issue, NOT an app defect. Secondary finding:
  the cookie-consent banner CAN overlay the submit CTA for undismissed users
  (observed intercepting pointer events) — documented UX backlog item.
- Net: no genuine application regression found; harness needs a settle-wait
  or longer timeout for that spec.

## Addendum 3 — horoscope submission stability patch (2026-11-17)

ROOT CAUSE: Lost click during async layout insertion. The geocoding cycle
(500ms debounce → Nominatim fetch → "Searching…" indicator + in-flow
suggestions listbox) inserts elements ABOVE the submit button while a
pointer gesture is in flight. A click dispatched before the cycle settles
lands on the suggestion/indicator region instead of submit — the form
never submits and "Overall Score" never renders. Reproduced 4/5 immediate-
click trials; deterministic once Nominatim throttles mid-suite.
Not an application defect: probe of identical steps renders the score in
~5s; the app correctly treats a click on a suggestion as a selection.

REPRODUCTION: fill #dob/#tob/#pob then click submit before the geocode
cycle settles → submission silently lost (robustness-random-birth.spec.ts).

FILES CHANGED: tests/e2e/robustness-random-birth.spec.ts only — added a
two-phase settle wait (Searching indicator visible→hidden, then listbox
visible) before submit. No app code, routes, or calculations touched;
no timeouts inflated as a substitute (waits target deterministic UI
states, not arbitrary delays); no force:true.

REGRESSION TEST: tests/e2e/production-submit.spec.ts (pointer-press while
suggestions open) already covers the app-side contract — passes.

REPEATED TEST RESULTS: robustness spec 23/23 PASS (all 6 births incl.
previously failing cases + all 17 Prashna dimensions).
FULL E2E RESULTS: pending final gate run — see e2e-final-gate.txt.
REMAINING FAILURES: none known.
RELEASE DECISION: pending final gate.

## Addendum 4 — final gate result (2026-11-17)

- Same lost-click root cause also affected persona-users.spec.ts
  ("submit click succeeds even if dropdown is open") and
  production-submit.spec.ts — both now wait for geocode-cycle settle and
  assert submit-button layout stability (bounding-box y unchanged over
  300ms) before clicking. No timeouts inflated, no force:true.
- robustness-random-birth.spec.ts: 23/23 PASS.
- FULL PRODUCTION-PREVIEW E2E: **145/145 PASS, 0 failed, 0 skipped,
  0 flaky** (12.1m) — e2e-final-gate3.txt.
- RELEASE DECISION: **GO** — all required gates green; the horoscope
  submission issue was a test-harness race, not an application defect.

## Addendum 5 — AARUDH-LAGNA / Lovable Arudha patch (2026-11-19)

```
LOVABLE SOURCE ACCESS: BLOCKED (no export; independent impl per spec)
LOVABLE TYPECHECK/TESTS/BUILD: NOT RUN (source unavailable)
ARUDHA RULE CONVENTION: jaiminiService.calculateArudhaPada — inclusive
  counting, single-lord map, +10 self/7th exception (unreachable — OPEN)
ARUDHA REFERENCE MATRIX: 148/148 PASS (src/tests/arudha.test.ts)
TARGET ENGINE PARITY: PASS (existing engine reused, no duplicate)
TARGET E2E: 145/145 PASS (pre-patch); robustness spec refined further
PROVENANCE BOUNDARY: PARTIAL — N9 Raksha gate wired into HoroscopeCard;
  trace-level fields documented gap
PRIVACY REVIEW: PASS — synthetic fixtures only
NAVRATRI N4–N9: 32/32 tests PASS; useRaksha in production path
TYPECHECK: exit 0
RELEASE STATUS: HOLD — awaiting AGPL decision + owner review of OPEN
  exception-convention finding; no push/merge/deploy performed
```
