# INDEPENDENT VERIFICATION RERUN — 2026-11-16

Second-pass verification of the PATCH 1–7 corrective work. Every gate below was
re-executed in this session; nothing was taken on trust from the earlier reports.

**Repository:** `https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar`
**Branch:** `fix/robotic-failure-remediation`
**HEAD SHA:** `e379bf51bfb9bc7e57ba3cfe1c0967f48310d6b8`
**origin/main SHA:** `e379bf51bfb9bc7e57ba3cfe1c0967f48310d6b8` (fetched; identical)
**Environment:** Windows (MSYS), Node v24.14.0, npm 11.9.0, Vitest 4.1.11,
Playwright (chromium-preview project), `vite preview` on 127.0.0.1:4173.

All pre-existing modified and untracked files were preserved; no source file was
changed during this verification. New evidence files added by this run are listed
at the bottom.

---

## 1. Unit test suite + production build

| Command                                 | Exit  | Result                                                                                                                                                                                                                                                                                             |
| --------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test:run` (default forks pool) | **1** | 100 files / 1589 tests passed; **7 files failed to start** — `Timeout waiting for worker to respond` (ascendantProof, familyProfilesPage, dashaTransitPage, accuracyDashboardPage, birthChartPage, useChartCalculation, matchmakingPolish). Infrastructure/resource contention, not test failures. |
| `npx vitest run <those 7 files>`        | 0     | 7/7 files, 128/128 tests passed — confirms worker-start timeouts only.                                                                                                                                                                                                                             |
| `npx vitest run --maxWorkers=4`         | **0** | **107 files / 1717 tests — ALL PASS** (193.8s). Evidence: `vitest-verify-out2.txt`.                                                                                                                                                                                                                |
| `npm run typecheck` (`tsc --noEmit`)    | 0     | PASS.                                                                                                                                                                                                                                                                                              |
| `npm run lint`                          | 0     | 0 errors, 1273 warnings. Evidence: `lint-verify.txt`.                                                                                                                                                                                                                                              |
| `npm run test:core`                     | 0     | 3 files / 48 tests PASS. Evidence: `tc-core.txt`.                                                                                                                                                                                                                                                  |
| `npm run test:accuracy:fast`            | 0     | 5 files / 42 tests PASS. Evidence: `acc-fast.txt`.                                                                                                                                                                                                                                                 |
| `npm run build`                         | **0** | built in 1m39s; PWA generateSW; **223 precache entries**; `dist/sw.js` emitted. Evidence: `build-verify.txt`.                                                                                                                                                                                      |

**Note:** the earlier report's "`npm run test:run` exit 0, 1717/1717" is accurate
for the test outcomes but not reproducible with default worker count on this
machine — the default run intermittently fails to _start_ 7 fork workers under
memory pressure. `--maxWorkers=4` produces a clean exit 0. This is an
environment limitation, documented in ROBOTIC_PATCH_REPORT "Remaining risk #3".

## 2. PATCH 1–4 review vs original findings — defects, not test-gaming

Reviewed every hunk of `git diff` for the 9 modified source files:

- **PATCH 1 (PrivacySettingsPage + routes):** `ExportSectionAuthed` /
  `DeleteSectionAuthed` hold the Clerk hooks; thin wrappers choose between them
  and `CloudUnavailableCard` via the build-time `isClerkConfigured` constant.
  This is a real conditional-_mount_ fix (hooks rules preserved), not a
  try/catch or suppressed error. `/privacy-settings` and both aliases no longer
  sit behind `<ClerkGate>`, so consent is reachable in demo mode. Genuine fix.
- **PATCH 2 (EnhancedBirthInputForm):** suggestion `<ul>` moved from
  `absolute z-50` overlay to in-flow layout — the physical overlap defect is
  removed, not masked. combobox/listbox ARIA, ArrowUp/Down/Enter/Escape, a
  monotonic `geocodeRequestIdRef` stale-response guard, and
  `suppressNextSearchRef` all address real defects (stale geocode reopening the
  list was an actual race). Genuine fix.
- **PATCH 3 (dateValidation.ts + wiring):** strict `DD/MM/YYYY` parser with no
  `Date` constructor; impossible dates (`29/02/1900`, `31/04`) rejected with a
  visible localised message; raw `dateDisplay` preserved on invalid input so the
  error is not wiped; supported range 1800–2100 enforced separately from the
  future-birth policy. Wired into the primary form's validation effect and
  submit gating. Genuine fix.
- **PATCH 4 (six surfaces):** shared `DATE_INPUT_FORMAT_HINT` + `aria-describedby`
  hints; `MatchMaking.validateInputs()` now uses `parseDdMmYyyy(allowIso)` +
  `parseHhMm` instead of a shape-only regex that accepted `2020-02-31`. Genuine
  fix — Milan now rejects impossible ISO dates it previously waved through.

## 3. Playwright persona tiers — production preview

Command: `npx playwright test --config playwright.preview.config.ts`
(config auto-starts `vite preview` on :4173 against the fresh `dist/`).

**Result: 23 passed / 0 failed, exit 0, 2.7 min.** Evidence: `pw-verify.txt`.

- Basic tier: 5/5 — home, labelled fields, calculation, en/hi toggle, panchang nav.
- Intermediate tier: 5/5 — kundli detail, prashna verdict, matchmaking,
  panchang result, PDF/print control.
- Advanced tier: 11/11 — leap years, invalid date, midnight/24:00, rapid submits,
  dropdown overlap, keyboard-only, stale geocode, privacy w/o Clerk,
  deep-link refresh, network-failure degradation, offline shell.
- Production offline spec: 2/2 (see gates 7–8).

Per-test JSON diagnostics: `reports/persona/results/*.json`; screenshots:
`reports/persona/screenshots/`.

## 4. `/privacy-settings` — without and with Clerk

- **Without Clerk** (preview build, no `VITE_CLERK_PUBLISHABLE_KEY`): persona
  advanced test #18 PASS — heading renders, consent Accept works, "Sign-in
  unavailable" card shown for export/delete, no page errors.
- **With Clerk configured**: dev server started with a well-formed dummy
  `VITE_CLERK_PUBLISHABLE_KEY=pk_test_<base64>`. Result: page renders fully, no
  error boundary, consent section intact, `Export Your Data` / `Delete Your Data`
  authed sections mount (the "Sign-in unavailable" card is correctly absent),
  sign-in prompts shown. The only console/page errors are Clerk's own
  `failed_to_load_clerk_js` because the dummy key points at a non-existent host —
  an environment artefact of the fake key, not an app defect; a real key loads
  clerk.js normally. Evidence:
  `reports/evidence/privacy-settings-clerk-configured.png`.

## 5. Autocomplete + submission — ordinary input only

`grep` confirms **zero `force:` usages** in both e2e specs (only comments).
Persona tests prove both paths against the production build:

- Click path (#15): type "Udaipur" → listbox visible → bounding-box assertion
  proves it ends above the submit button → normal `.click()` on first option →
  listbox hidden → normal `.click()` on submit → horoscope renders.
- Keyboard path (#16): `keyboard.type('15091963')` auto-formats to `15/09/1963`,
  ArrowDown+Enter selects the location, Enter submits → result renders.

Both PASS. No concealed defects.

## 6. Date edge cases

Unit (`src/tests/dateValidation.test.ts`, 17/17 within the 1717) plus e2e:

- `29/02/2000`, `29/02/2024` accepted; `29/02/1900` rejected (`impossible`);
  `31/04/2020` rejected with visible message + disabled submit;
  `01/01/1900` valid in-range; `31/12/2099` calendar-valid but flagged future;
  `00:00` accepted, `24:00` rejected (unit-level `parseHhMm`; the native time
  control additionally cannot hold `24:00` — asserted in-page);
  range bounds `1800-01-01` / `2100-12-31` enforced, `01/01/1700` → `out-of-range`.
- All persona advanced date tests PASS (11, 12, 13 above).

## 7. Offline Panchang on production preview

`production-offline.spec.ts` PATCH 5 test PASS (14.3s): service worker activates,
`workbox-precache-v2` holds the app shell, `/panchang` reloads offline with a
usable body (1848 chars, no error boundary). Screenshot:
`reports/evidence/panchang-offline.png`; log:
`reports/evidence/production-panchang-offline.txt`.

## 8. Home-page 404

**NOT REPRODUCED — cause not established.** Live production-preview probe captured
all HTTP ≥400, `requestfailed`, and `console.error` on `/`: all empty
(`pw-verify.txt` §PATCH 6, `reports/evidence/production-home-assets.txt`). The
original robotic-run 404 cannot be reproduced in dev or production; no masking
or catch-all was added. If the exact failing URL resurfaces, fix that asset
directly.

## 9. ESLint warnings — 1,273 total, 0 errors (actual counts)

| Rule                                 | Count  | Risk assessment                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@typescript-eslint/no-unused-vars`  | 853    | None — dead imports/vars only.                                                                                                                                                                                                                                                                                                                                                        |
| `@typescript-eslint/no-explicit-any` | 387    | Low — pre-existing utils/services; none in patched files.                                                                                                                                                                                                                                                                                                                             |
| `react-hooks/exhaustive-deps`        | **17** | **Medium** — potential stale closures. One is in a patched file (`EnhancedBirthInputForm.tsx:243`, missing `handleAutoSave` dep) but the effect is **pre-existing** (identical in HEAD); the patch did not introduce it. Others: DynamicTransitCalculator, KeyboardShortcuts, VimshottariDashaDashboard, useChartCalculation, YogaInsightsPanel, etc. Audit before next feature work. |
| `unused eslint-disable directive`    | 16     | Cosmetic.                                                                                                                                                                                                                                                                                                                                                                             |

**Correction to earlier report:** it stated 11 hooks warnings and "none in patched
files"; actual count is 17, and one sits in a patched file (pre-existing). No
`no-unsafe-*` _warnings_ exist — earlier grep hits were rule names inside
unused-disable messages. No eval/injection/auth-bypass warnings.

## 10. Report reconciliation

| Claim in ROBOTIC_PATCH_REPORT / RECONCILIATION   | This run                                          | Verdict                               |
| ------------------------------------------------ | ------------------------------------------------- | ------------------------------------- |
| 1717/1717 unit tests                             | 1717/1717 (needs `--maxWorkers=4` for clean exit) | CONFIRMED (with caveat)               |
| typecheck / lint / build exit 0                  | 0 / 0 / 0                                         | CONFIRMED                             |
| test:core 48/48, accuracy:fast 42/42             | 48/48, 42/42                                      | CONFIRMED                             |
| Persona 21/21 + offline 2/2                      | 23/23                                             | CONFIRMED                             |
| `/privacy-settings` without Clerk                | PASS                                              | CONFIRMED                             |
| `/privacy-settings` with Clerk                   | not previously tested                             | NOW VERIFIED (dummy-key caveat above) |
| ESLint: 11 hooks warnings, none in patched files | 17 hooks warnings; 1 pre-existing in patched file | **CORRECTED**                         |
| Home 404 not reproduced                          | not reproduced                                    | CONFIRMED                             |

## Regression spot-check

Kundli (calc + detail), Prashna (verdict), Milan/matchmaking (compatibility),
Panchang (result + offline), PDF/print export control, and en/hi navigation are
all exercised by the passing persona tiers — no regression observed.

## Final gate status

| Gate                                      | Status                                                               |
| ----------------------------------------- | -------------------------------------------------------------------- |
| Unit tests (full suite)                   | **PASS** (1717/1717; default-pool worker timeouts are environmental) |
| Typecheck                                 | **PASS**                                                             |
| Lint                                      | **PASS** (0 errors; warnings categorised)                            |
| Production build + PWA                    | **PASS**                                                             |
| Persona e2e (basic/intermediate/advanced) | **PASS** 21/21                                                       |
| Offline Panchang (SW, production preview) | **PASS**                                                             |
| Home-page 404                             | **NOT REPRODUCED** (no defect found; monitoring only)                |
| Privacy-settings w/o Clerk                | **PASS**                                                             |
| Privacy-settings with Clerk               | **PASS** (structure verified; real key required for full auth flow)  |
| PATCH 1–4 defect-level review             | **PASS** — genuine fixes                                             |

**Unresolved issues:** (a) 17 `exhaustive-deps` warnings incl. 1 pre-existing in
`EnhancedBirthInputForm.tsx` — audit recommended; (b) home-page 404 root cause
unknown but not reproducible; (c) real-Clerk end-to-end auth flow untested (no
credentials in this environment).

## Evidence files (this run)

`vitest-verify-out2.txt` (clean run), `lint-verify.txt`,
`build-verify.txt`, `pw-verify.txt`, `tc-core.txt`, `acc-fast.txt`,
`reports/evidence/privacy-settings-clerk-configured.png`,
`reports/persona/results/*.json`, `reports/persona/screenshots/*.png`.
