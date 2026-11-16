# ROBOTIC FINDINGS RECONCILIATION

**Repository:** `https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar`
**Branch:** `fix/robotic-failure-remediation`
**LATEST COMMIT SHA:** `e379bf51bfb9bc7e57ba3cfe1c0967f48310d6b8`
**Date:** 2026-11-15

> Historical baseline (screenshots 2026-11-04): Basic 20/20 · Intermediate 24/24 · Advanced 35/43.
> These are **not** claimed as current results. Current results: 21/21 persona PASS.

---

## F1 — Privacy settings page crashes without Clerk

```
ORIGINAL FINDING:    /privacy-settings throws "useSession can only be used within
                     <ClerkProvider>" → error boundary / blank page (screenshot #9).
LATEST COMMIT SHA:   e379bf51bfb9bc7e57ba3cfe1c0967f48310d6b8
CURRENT STATUS:      FIXED — PASS (demo + authenticated modes)
SOURCE EVIDENCE:     src/pages/PrivacySettingsPage.tsx (ExportSection/DeleteSection
                     at lines 158, 281 in the original), src/Providers.tsx
ROOT CAUSE:          ExportSection and DeleteSection called useSession() /
                     useAuthenticatedSupabase() unconditionally. Providers.tsx
                     deliberately skips <ClerkProvider> when
                     VITE_CLERK_PUBLISHABLE_KEY is absent.
PATCH APPLIED:       Split each section: *SectionAuthed mounts only when
                     isClerkConfigured === true; CloudUnavailableCard shown
                     otherwise. ConsentSection is Clerk-independent. Demo mode
                     never simulates a successful deletion.
                     src/routes/index.tsx: removed <ClerkGate> wrapper from
                     /privacy-settings so consent is reachable without Clerk.
FILES MODIFIED:      src/pages/PrivacySettingsPage.tsx, src/routes/index.tsx
TEST ADDED:          persona advanced #18 "privacy settings without Clerk (demo mode)"
BEFORE RESULT:       Page threw on load; error boundary shown; consent inaccessible.
AFTER RESULT:        Page renders; consent buttons work; export/delete show honest
                     "Sign-in unavailable" card; 0 page errors.
REMAINING RISK:      Client-side gating is UX not authorization. Real enforcement
                     must stay in Supabase Edge Functions + RLS.
```

---

## F2 — Place autocomplete intercepts the submit button

```
ORIGINAL FINDING:    Suggestion dropdown (absolutely positioned, high z-index)
                     covered "Get Transit Reading"; robot had to use force=True to
                     bypass it (screenshots #10–#11). A human's first click could
                     land on a suggestion instead of submitting.
LATEST COMMIT SHA:   e379bf51bfb9bc7e57ba3cfe1c0967f48310d6b8
CURRENT STATUS:      FIXED — PASS (no force:true)
SOURCE EVIDENCE:     src/components/EnhancedBirthInputForm.tsx
ROOT CAUSE:          <ul> suggestions rendered absolutely inside a relative
                     container that also held the submit button. No keyboard
                     navigation, no stale-response guard.
PATCH APPLIED:       Suggestions moved to in-flow layout (normal document flow,
                     no absolute/z-index). combobox/listbox ARIA added. ArrowUp/
                     ArrowDown/Enter/Escape keyboard handlers. geocodeRequestIdRef
                     + suppressNextSearchRef prevent stale responses reopening
                     the list. Test helper fillBirthForm() waits for the listbox,
                     picks the first option, then waits for it to close — proving
                     normal (non-forced) submit works.
FILES MODIFIED:      src/components/EnhancedBirthInputForm.tsx,
                     tests/e2e/persona-users.spec.ts (fillBirthForm helper)
TEST ADDED:          persona advanced #15 (dropdown overlap), #16 (keyboard-only),
                     #17 (stale response), #20 (network failure graceful degradation)
BEFORE RESULT:       Submit required force:True; keyboard selection impossible.
AFTER RESULT:        Normal click and keyboard-only submission both work. Bounding
                     boxes confirm no overlap. 0 force:true in test suite.
REMAINING RISK:      None identified for the audited control.
```

---

## F3 — Invalid calendar dates silently accepted or dropped

```
ORIGINAL FINDING:    29/02/2000, 29/02/1900, 01/01/1900, 31/12/2099, and 00:00
                     midnight all submitted with no result and no validation
                     message. Out-of-range input silently ignored (screenshot #12).
LATEST COMMIT SHA:   e379bf51bfb9bc7e57ba3cfe1c0967f48310d6b8
CURRENT STATUS:      FIXED — PASS
SOURCE EVIDENCE:     src/lib/dateValidation.ts (new), src/tests/dateValidation.test.ts
ROOT CAUSE:          Date parsing used JavaScript Date constructor without strict
                     round-trip validation. Impossible dates normalised (e.g.
                     Feb 29 1900 → Mar 1 1900). The form also cleared its ISO
                     state on invalid input, dropping the user's text before an
                     error could be shown.
PATCH APPLIED:       Shared strict utility: parseDdMmYyyy / isCalendarValidDate /
                     isLeapYear / daysInMonth / SUPPORTED_DATE_RANGE / compareIso /
                     isFutureDate / parseHhMm. No Date constructor used. Invalid
                     text preserved in dateDisplay. Supported range 1800–2100
                     documented and enforced separately from "future birth" policy.
FILES MODIFIED:      src/lib/dateValidation.ts (new),
                     src/tests/dateValidation.test.ts (new, 17 tests),
                     src/components/EnhancedBirthInputForm.tsx (wired in)
TEST ADDED:          src/tests/dateValidation.test.ts — all mandatory cases;
                     persona advanced #11, #12, #13
BEFORE RESULT:       29/02/1900 and 31/04/2020 produced no visible error.
AFTER RESULT:        All 9 mandatory matrix rows pass. Invalid input shows a
                     visible, accessible error and disables the submit button.
REMAINING RISK:      Supported-range boundaries are policy; adjust intentionally
                     if product requirements change.
```

---

## F4 — Inconsistent date-entry formats across pages

```
ORIGINAL FINDING:    /horoscope takes DD/MM/YYYY free-text while /matchmaking uses
                     native type="date" (YYYY-MM-DD). Same user gets a browser
                     rejection when typing DD/MM/YYYY into Milan (screenshot #12).
LATEST COMMIT SHA:   e379bf51bfb9bc7e57ba3cfe1c0967f48310d6b8
CURRENT STATUS:      FIXED (all audited surfaces)
SOURCE EVIDENCE:     src/lib/dateValidation.ts (DATE_INPUT_FORMAT_HINT)
ROOT CAUSE:          Multiple ad-hoc date inputs with no shared parser or format
                     contract.
PATCH APPLIED:       All audited surfaces import DATE_INPUT_FORMAT_HINT and add
                     aria-describedby format hints. MatchMaking.validateInputs()
                     replaced ad-hoc regex with parseDdMmYyyy + parseHhMm.
FILES MODIFIED:      src/pages/MatchMaking.tsx, src/pages/PanchangPage.tsx,
                     src/pages/QuestionPage.tsx, src/components/ComprehensiveReportForm.tsx,
                     src/components/FamilyProfileForm.tsx, src/pages/BirthChartPage.tsx
TEST ADDED:          Covered by persona basic/intermediate navigation tests.
BEFORE RESULT:       Formats implicit; no shared validation.
AFTER RESULT:        Six surfaces share the same hint + parser.
REMAINING RISK:      Other long-tail native date inputs (transit tools, elections)
                     intentionally left out of scope.
```

---

## F5 — Panchang blank offline

```
ORIGINAL FINDING:    Navigating to /panchang offline gave an essentially blank page.
                     Noted as dev-server caveat in the screenshot report (screenshot #13).
LATEST COMMIT SHA:   e379bf51bfb9bc7e57ba3cfe1c0967f48310d6b8
CURRENT STATUS:      VERIFIED — PASS against production build
SOURCE EVIDENCE:     reports/evidence/production-panchang-offline.txt,
                     reports/evidence/panchang-offline.png
ROOT CAUSE:          Dev server does not install a service worker. The offline
                     observation was a testing artefact, not a production defect.
PATCH APPLIED:       No app change. Verification procedure:
                       npm run build → 223 precache entries
                       npx vite preview --host 127.0.0.1 --port 4173
                       playwright test (production-offline.spec.ts)
FILES MODIFIED:      tests/e2e/production-offline.spec.ts (new),
                     playwright.preview.config.ts (new)
TEST ADDED:          "PATCH 5 — /panchang works offline after service worker activation"
BEFORE RESULT:       Unknown (dev-server only, no SW).
AFTER RESULT:        SW activates; workbox precache holds shell; offline reload
                     renders usable page (body length 1848, no error boundary).
REMAINING RISK:      Cache freshness after deploys governed by workbox; unchanged.
```

---

## F6 — Missing home-page resource / 404

```
ORIGINAL FINDING:    "One 404 resource fires on the home page" (screenshot #13).
LATEST COMMIT SHA:   e379bf51bfb9bc7e57ba3cfe1c0967f48310d6b8
CURRENT STATUS:      NOT REPRODUCED
SOURCE EVIDENCE:     reports/evidence/production-home-assets.txt
ROOT CAUSE:          Not established. No failing request observed in dev or
                     production preview.
PATCH APPLIED:       None (deliberately). No 404 masking. No catch-all.
FILES MODIFIED:      tests/e2e/production-offline.spec.ts captures all >=400
                     responses and failed requests for future reference.
TEST ADDED:          "PATCH 6 — home page loads with no unexplained 4xx/5xx"
BEFORE RESULT:       Purported 404 from robotic run.
AFTER RESULT:        HTTP >=400: (none); requestfailed: (none); console.error: (none)
                     in both dev and production preview.
REMAINING RISK:      If a real failed URL + initiator is supplied, fix the exact
                     asset at that point.
```

---

## F7 — No permanent robotic persona regression suite

```
ORIGINAL FINDING:    Failures captured as one-off screenshots only (20/20, 24/24,
                     35/43). No reproducible test.
LATEST COMMIT SHA:   e379bf51bfb9bc7e57ba3cfe1c0967f48310d6b8
CURRENT STATUS:      FIXED — 21/21 PASS
SOURCE EVIDENCE:     tests/e2e/persona-users.spec.ts
ROOT CAUSE:          No persistent, reproducible persona coverage.
PATCH APPLIED:       Three-tier persona suite. Seeded PRNG. No real birth data.
                     Accessible selectors. No force:true. Per-test diagnostics and
                     screenshots. Offline test self-skips on dev server by design.
FILES MODIFIED:      tests/e2e/persona-users.spec.ts (new)
TEST ADDED:          The suite itself — 21 tests across basic/intermediate/advanced.
BEFORE RESULT:       Ad-hoc one-off screenshots only.
AFTER RESULT:        21/21 reproducible PASS. See PERSONA_REGRESSION_RESULTS.md.
REMAINING RISK:      Offline persona test requires the preview config; it self-skips
                     on the dev server by design.
```

---

## ESLint warning categorisation (1,273 warnings, 0 errors)

| Category                 | Rule                                                           | Count | Risk                                                                              |
| ------------------------ | -------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------- |
| Unused imports           | `@typescript-eslint/no-unused-vars` (lucide icons, components) | ~880  | None — dead imports only                                                          |
| Explicit `any`           | `@typescript-eslint/no-explicit-any`                           | ~387  | Low — existing code; not in patched files                                         |
| React Hooks deps         | `react-hooks/exhaustive-deps`                                  | 11    | **Medium** — missing deps in `useEffect`/`useCallback` could cause stale closures |
| Unused ESLint directives | `unused-disable-directive`                                     | ~6    | None — cosmetic                                                                   |

**Security/correctness risks:**

- The 11 `react-hooks/exhaustive-deps` warnings are the only ones with potential
  for stale-closure bugs. None are in the patched files. They should be audited
  before the next feature addition but do not affect the correctness of the
  current patches.
- No `no-eval`, no injection-related, no auth-bypass warnings.
- All 387 `no-explicit-any` are in pre-existing utility/service files, not in
  any patched component.
