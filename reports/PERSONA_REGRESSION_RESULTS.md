# PERSONA REGRESSION RESULTS

**Repository:** `https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar`
**Branch:** `fix/robotic-failure-remediation`
**Base SHA:** `e379bf51bfb9bc7e57ba3cfe1c0967f48310d6b8`
**Date:** 2026-11-15
**Playwright version:** 1.62.1 · Chromium 151.0.7922.34
**Config used:** `playwright.preview.config.ts` (production preview, port 4173)

---

## Summary

| Tier                         | Tests  | Result            |
| ---------------------------- | ------ | ----------------- |
| Basic                        | 5      | ✅ 5/5 PASS       |
| Intermediate                 | 6      | ✅ 6/6 PASS       |
| Advanced                     | 10     | ✅ 10/10 PASS     |
| **Total persona**            | **21** | ✅ **21/21 PASS** |
| Production offline (PATCH 5) | 1      | ✅ PASS           |
| Home-page 4xx (PATCH 6)      | 1      | ✅ PASS           |
| **Grand total**              | **23** | ✅ **23/23 PASS** |

---

## Key fix: geocoder dropdown dismissed before submit

The two calculation tests (basic #3 and intermediate #6) initially failed because the
geocoder listbox was open and in-flow when `submit.click()` fired, intercepting the
pointer event in headless Chromium. Root cause confirmed with a direct Node.js
Playwright script: when the listbox is absent (network isolated), submission works
immediately. Fix applied in `fillBirthForm()`:

```typescript
// Wait for listbox → pick first option → wait for listbox to close
// THEN proceed to click the submit button
await listbox.waitFor({ state: "visible", timeout: 6_000 });
await listbox.locator('[role="option"]').first().click();
await listbox.waitFor({ state: "hidden", timeout: 5_000 });
```

This is correct UX interaction (what a human does), not a workaround. `force:true`
was never used.

---

## Basic tier — 5/5 PASS

| #   | Test                                        | Duration | Notes                                 |
| --- | ------------------------------------------- | -------- | ------------------------------------- |
| 1   | home renders for a synthetic visitor        | 4.4s     | ✅ 0 page errors                      |
| 2   | kundli input exposes labelled fields        | 3.0s     | ✅ #dob #tob #pob all visible         |
| 3   | calculation renders without forced clicks   | 5.2s     | ✅ Overall Score visible after submit |
| 4   | English/Hindi switching changes UI language | 12.1s    | ✅ राशिफल heading visible             |
| 5   | panchang navigation from home page          | 5.5s     | ✅ /panchang URL + heading            |

Screenshots: `reports/persona/screenshots/basic-*.png`

---

## Intermediate tier — 6/6 PASS

| #   | Test                                          | Duration | Notes                           |
| --- | --------------------------------------------- | -------- | ------------------------------- |
| 6   | kundli detail view renders for computed chart | 5.1s     | ✅ Print + Copy buttons visible |
| 7   | prashna returns a verdict                     | 8.2s     | ✅ result region + Score text   |
| 8   | matchmaking computes compatibility            | 4.8s     | ✅ #mm-result-heading visible   |
| 9   | panchang renders result for a chosen date     | 3.4s     | ✅ result region visible        |
| 10  | PDF/print export control is wired up          | 4.1s     | ✅ window.print() called once   |

Screenshots: `reports/persona/screenshots/intermediate-*.png`

---

## Advanced tier — 10/10 PASS

| #   | Test                                              | Duration | Notes                                                           |
| --- | ------------------------------------------------- | -------- | --------------------------------------------------------------- |
| 11  | leap-year dates accepted, impossible rejected     | 3.6s     | ✅ 29/02/2000 ✓; 29/02/1900 error; 29/02/2024 ✓                 |
| 12  | 31/04/2020 shows error and blocks submit          | 3.2s     | ✅ "Not a real calendar date" visible; button disabled          |
| 13  | midnight 00:00 valid, 24:00 rejected by browser   | 3.1s     | ✅ browser rejects 24:00 natively                               |
| 14  | rapid repeated submissions no crash/duplicate     | 4.6s     | ✅ exactly 1 result heading                                     |
| 15  | dropdown cannot overlap submit button             | 5.0s     | ✅ bounding boxes prove no overlap; normal click works          |
| 16  | keyboard-only selection and submission            | 5.0s     | ✅ ArrowDown + Enter selects; form submits                      |
| 17  | stale geocoding response does not reopen dropdown | 5.1s     | ✅ listbox stays hidden after 2s                                |
| 18  | privacy settings without Clerk (demo mode)        | 3.3s     | ✅ consent works; "Sign-in unavailable" shown; no fake deletion |
| 19  | deep-link refresh keeps page functional           | 3.0s     | ✅ /panchang reloads correctly                                  |
| 20  | geocoding network failure degrades gracefully     | 5.0s     | ✅ form submits with typed city; result visible                 |
| 21  | offline production preview serves usable shell    | 8.4s     | ✅ body length > 50; no error boundary                          |

Screenshots: `reports/persona/screenshots/advanced-*.png`
Per-test JSON results: `reports/persona/results/*.json`

---

## Production offline (PATCH 5 + 6) — 2/2 PASS

```
PATCH 6 — home page loads with no unexplained 4xx/5xx
  HTTP >=400: (none)
  requestfailed: (none)
  console.error: (none)
  PASS in 6.0s

PATCH 5 — /panchang works offline after service worker activation
  serviceWorker.ready → activating
  cache keys → ["workbox-precache-v2-http://127.0.0.1:4173/"]
  app shell cached → true
  offline reload error → none
  offline body length → 1848
  PASS in 11.3s
```

Evidence files: `reports/evidence/production-panchang-offline.txt`,
`reports/evidence/production-home-assets.txt`, `reports/evidence/panchang-offline.png`

---

## Unit and accuracy suites (run cold, after Playwright session closed)

| Suite           | Command                                           | Exit code | Files   | Tests     |
| --------------- | ------------------------------------------------- | --------- | ------- | --------- |
| Full vitest     | `npm run test:run`                                | 0         | 107/107 | 1717/1717 |
| Core            | `npm run test:core`                               | 0         | 3/3     | 48/48     |
| Accuracy fast   | `npm run test:accuracy:fast`                      | 0         | 5/5     | 42/42     |
| Date validation | `npx vitest run src/tests/dateValidation.test.ts` | 0         | 1/1     | 17/17     |

> **Note on intermittent failure:** A run of `npm run test:run` immediately after a
> 2-hour Playwright session (which loads the WASM ephemeris into memory) produced
> 65–86 file failures. The same command on a cold machine (Playwright server stopped,
> GC collected) produces 107/107. Root cause: the Node.js WASM heap is exhausted when
> both Playwright workers and vitest workers compete for memory. This is a **machine
> resource constraint**, not a code regression — confirmed by running `git stash`
> (which removes all working-tree changes) and observing the same intermittent pattern.
> The build and unit gates must be run on a cold machine or in CI.

---

## Quality gate summary

| Gate                  | Command                                                                                          | Exit code | Status                                           |
| --------------------- | ------------------------------------------------------------------------------------------------ | --------- | ------------------------------------------------ |
| Typecheck             | `npm run typecheck`                                                                              | 0         | ✅ PASS                                          |
| Lint                  | `npm run lint`                                                                                   | 0         | ✅ PASS (0 errors, 1273 warnings — pre-existing) |
| Unit tests (cold)     | `npm run test:run`                                                                               | 0         | ✅ PASS 1717/1717                                |
| Core tests            | `npm run test:core`                                                                              | 0         | ✅ PASS 48/48                                    |
| Accuracy fast         | `npm run test:accuracy:fast`                                                                     | 0         | ✅ PASS 42/42                                    |
| Build                 | `npm run build`                                                                                  | 0         | ✅ PASS (223 precache entries)                   |
| Persona e2e (preview) | `npx playwright test --config playwright.preview.config.ts tests/e2e/persona-users.spec.ts`      | 0         | ✅ PASS 21/21                                    |
| Offline e2e (preview) | `npx playwright test --config playwright.preview.config.ts tests/e2e/production-offline.spec.ts` | 0         | ✅ PASS 2/2                                      |
