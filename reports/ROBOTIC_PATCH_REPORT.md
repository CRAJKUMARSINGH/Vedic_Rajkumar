# ROBOTIC PATCH REPORT

**Repository:** `https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar`
**Branch:** `fix/robotic-failure-remediation`
**Base / verified main:** `e379bf51bfb9bc7e57ba3cfe1c0967f48310d6b8`
**Date:** 2026-11-15
**Playwright:** 1.62.1 · Chromium 151 · `playwright.preview.config.ts` (port 4173)

> Standing rules honoured: **no push, no deploy, no astrology algorithm modified**.
> All patches are UI/test fixes only.

---

## PHASE 0 — Confirm source version

```
$ git rev-parse HEAD
e379bf51bfb9bc7e57ba3cfe1c0967f48310d6b8

$ git rev-parse origin/main
e379bf51bfb9bc7e57ba3cfe1c0967f48310d6b8

$ git branch --show-current
fix/robotic-failure-remediation
```

HEAD == origin/main. Working tree has the patch changes on top.
AGENTS.md and test conventions read before editing.

---

## Screenshots audit (source)

The 15 WhatsApp screenshots in `CODE-JUNCTION/New folder/` show a robotic run from
2026-11-04 (21m 34s, 5.10 credits) that found:

- **Basic (20/20):** home → Kundli → calculate → Hindi toggle → Panchang — clean.
- **Intermediate (24/24):** Kundli detail, Prashna, Milan (after fixing case-sensitive
  selector for "Calculate compatibility"), Panchang, PDF download — clean.
- **Advanced (35/43):** 8 real bugs found, described in F1–F6 below.

---

## PATCH 1 — Privacy settings crash without Clerk (HIGH) ✅ FIXED

**Root cause (from screenshots):** `ExportSection` and `DeleteSection` called
`useSession()` unconditionally. `Providers.tsx` skips `<ClerkProvider>` when
`VITE_CLERK_PUBLISHABLE_KEY` is unset, so the hook threw and the page showed an
error boundary / blank screen.

**What was verified before patching:** `PrivacySettingsPage.tsx` lines ~158 and ~281
each called `useSession()` directly in the component body, not inside a
conditionally-mounted child. `ClerkGate.tsx` already exposed `isClerkConfigured`.

**Patch — not try/catch, not conditional hook call:**

- Split each cloud section into `*SectionAuthed` (mounts only when
  `isClerkConfigured === true`) and a `CloudUnavailableCard` shown otherwise.
- `useSession()` and `useAuthenticatedSupabase()` only ever run inside
  `*SectionAuthed`, which never mounts when Clerk is absent.
- `ConsentSection` is completely independent of Clerk — works in both modes.
- Demo mode shows an honest "Sign-in unavailable" card; nothing simulates a
  successful deletion.
- `src/routes/index.tsx` updated: removed the `<ClerkGate>` wrapper around
  `/privacy-settings` so consent is reachable in demo mode.

**Verification (persona test #18):**

```
advanced: privacy settings work without Clerk (demo mode)   ✅ PASS 3.3s
  - heading "Privacy Settings" visible
  - Accept optional button click → "Consent given" badge visible
  - body contains "Sign-in unavailable" (no fake deletion text)
  - 0 page errors
```

---

## PATCH 2 — Place-autocomplete intercepts the submit button (HIGH) ✅ FIXED

**Root cause (from screenshots):** "The suggestion dropdown stays open after typing
and intercepts pointer events over 'Get Transit Reading' — Playwright couldn't land
a click for 30s." The dropdown was absolutely positioned at a high z-index with no
layout reservation for the submit button.

**What was verified before patching:** Reviewed `EnhancedBirthInputForm.tsx`. The
`<ul>` suggestions list had `absolute` positioning and was inside a `relative`
container that also contained the submit button — so a tall suggestion list
physically covered the button.

**Patch — moved suggestions to in-flow layout:**

- Suggestions `<ul>` removed from absolute/z-index context; now renders in normal
  document flow as a sibling below the input.
- Added combobox/listbox ARIA: `role="combobox"`, `aria-expanded`, `aria-controls`,
  `aria-autocomplete`, `aria-activedescendant` on the input; `role="listbox"` and
  `role="option"` on the list/items.
- `handleLocationKeyDown`: ArrowUp/ArrowDown move `activeIndex`, Enter selects,
  Escape dismisses.
- `geocodeRequestIdRef` + `suppressNextSearchRef` prevent stale async responses from
  reopening the dropdown after selection.
- `onMouseDown={(e) => e.preventDefault()}` on each `<li>` preserves focus on input.

**Additional fix in `fillBirthForm()` test helper:**
Waiting for and selecting a geocoder option before clicking submit — matches real user
behaviour and proves no `force:true` is needed:

```typescript
await listbox.waitFor({ state: "visible", timeout: 6_000 });
await listbox.locator('[role="option"]').first().click();
await listbox.waitFor({ state: "hidden", timeout: 5_000 });
```

**Verification (persona tests #15 + #16):**

```
advanced: location dropdown cannot overlap the submit button  ✅ PASS 5.0s
  - bounding box of listbox ends above bounding box of submit button
  - normal (non-forced) submit click succeeds

advanced: keyboard-only selection and submission              ✅ PASS 5.0s
  - ArrowDown + Enter selects option; listbox hidden; form submits
```

---

## PATCH 3 — Strict date validation (HIGH) ✅ FIXED

**Root cause (from screenshots):** "Silent no-op on edge dates: 29/02/2000 (valid
leap), 29/02/1900, 01/01/1900, 31/12/2099, and 00:00 midnight submit with no result
and no validation message." The form used JavaScript `Date` constructor which
silently normalises impossible dates instead of rejecting them.

**New file: `src/lib/dateValidation.ts`** — single source of truth:

- `parseDdMmYyyy(input)` — strict regex `^(\d{2})\/(\d{2})\/(\d{4})$`, no `Date`
  constructor, no normalisation.
- `isCalendarValidDate(iso)` — month/day bounds check using `daysInMonth()` /
  `isLeapYear()` (Gregorian century rule: divisible by 400).
- `SUPPORTED_DATE_RANGE = { min: '1800-01-01', max: '2100-12-31' }`.
- `compareIso()` — lexicographic, timezone-independent.
- `isFutureDate()` — separate from calendar validity.
- `parseHhMm()` — strict `^([01]\d|2[0-3]):[0-5]\d$` (rejects `24:00`).
- Form keeps raw `dateDisplay` text; only clears the ISO `date` state on
  invalid input, so the error message remains visible.

**Mandatory test matrix — all 17 unit tests pass:**

| Input        | Expected                      | Result                         |
| ------------ | ----------------------------- | ------------------------------ |
| `29/02/2000` | Valid leap date               | ✅ `2000-02-29`                |
| `29/02/1900` | Invalid (century year)        | ✅ `impossible`                |
| `29/02/2024` | Valid leap date               | ✅ `2024-02-29`                |
| `31/04/2020` | Invalid (April=30 days)       | ✅ `impossible`                |
| `01/01/1900` | Valid calendar date           | ✅ valid, in range             |
| `31/12/2099` | Valid calendar + future birth | ✅ valid + `isFutureDate=true` |
| `00:00`      | Valid time                    | ✅                             |
| `23:59`      | Valid time                    | ✅                             |
| `24:00`      | Invalid time                  | ✅ rejected                    |

**Verification (persona tests #11 + #12 + #13):**

```
advanced: leap-year dates accepted, impossible dates rejected  ✅ PASS 3.6s
advanced: 31/04/2020 shows error and blocks submit             ✅ PASS 3.2s
advanced: midnight 00:00 valid, 24:00 rejected                 ✅ PASS 3.1s
```

---

## PATCH 4 — Standardise date-entry across pages (MEDIUM) ✅ FIXED

**Root cause (from screenshots):** `/horoscope` takes free-text `DD/MM/YYYY` while
`/matchmaking` uses native `type="date"` (YYYY-MM-DD). Same user typing DD/MM/YYYY
into Milan gets a browser rejection. No shared parser or format hint existed.

**Changes:**

- `src/pages/MatchMaking.tsx` — `validateInputs()` switched from ad-hoc regex to
  `parseDdMmYyyy(input, { allowIso: true })` + `parseHhMm()`; label hint derives
  from `DATE_INPUT_FORMAT_HINT`.
- `src/pages/PanchangPage.tsx` — `aria-describedby="panchang-date-format"` hint
  paragraph added to native date input.
- `src/pages/QuestionPage.tsx` — `id="prashna-custom-date"`, `aria-describedby`,
  hint paragraph.
- `src/components/ComprehensiveReportForm.tsx` — `aria-describedby`, hint.
- `src/components/FamilyProfileForm.tsx` — existing helper text extended with format.
- `src/pages/BirthChartPage.tsx` — existing ISO format hint now references
  `DATE_INPUT_FORMAT_HINT` constant.

Covered indirectly by persona basic/intermediate navigation tests all passing.

---

## PATCH 5 — Panchang offline behaviour (CONDITIONAL) ✅ VERIFIED

The robotic screenshot flagged `/panchang` as blank offline — but the run was on a
**dev server** (no service worker). Verified against a real production build:

```
npm run build  → ✅ built in 1m 17s; PWA generateSW; 223 precache entries
npx vite preview --host 127.0.0.1 --port 4173
playwright test --config playwright.preview.config.ts tests/e2e/production-offline.spec.ts
  PATCH 5 — /panchang works offline after service worker activation  ✅ PASS 11.3s
    serviceWorker.ready → activating
    cache keys → ["workbox-precache-v2-http://127.0.0.1:4173/"]
    app shell cached → true
    offline body length → 1848 (usable, not blank)
```

No app change required. Dev-server observation was a testing artefact.

---

## PATCH 6 — Missing home-page resource (LOW) ✅ NOT REPRODUCED

```
PATCH 6 — home page loads with no unexplained 4xx/5xx in production  ✅ PASS 6.0s
  HTTP >=400: (none)
  requestfailed: (none)
  console.error: (none)
```

No 404 was reproduced in either dev or production preview. No fix applied.
No masking or catch-all added. Status: **NOT REPRODUCED**.

---

## PATCH 7 — Permanent robotic persona tests ✅ ADDED

`tests/e2e/persona-users.spec.ts` — 3 tiers, 21 tests.
Final run: **21/21 PASS in 1.8 minutes** (production preview).

Key design principles honoured:

- Deterministic PRNG (`mulberry32(20261115)`) — reproducible personas.
- Pre-cached Indian cities only — offline-safe.
- **No real personal birth data** — synthetic names + a safe 1963 date.
- `diag` fixture captures `pageerror`, `console.error`, `requestfailed` per test.
- Accessible role/label selectors throughout.
- **`force:true` never used.**
- Per-test JSON in `reports/persona/results/`; screenshots in
  `reports/persona/screenshots/`.

---

## PHASE 8 — Regression gate results

All commands run on a cold machine (preview server stopped, Playwright finished).

| Gate            | Command                                                                                          | Exit | Tests     | Status  |
| --------------- | ------------------------------------------------------------------------------------------------ | ---- | --------- | ------- |
| Typecheck       | `npm run typecheck`                                                                              | 0    | —         | ✅ PASS |
| Lint            | `npm run lint`                                                                                   | 0    | 0 errors  | ✅ PASS |
| Unit tests      | `npm run test:run`                                                                               | 0    | 1717/1717 | ✅ PASS |
| Core tests      | `npm run test:core`                                                                              | 0    | 48/48     | ✅ PASS |
| Accuracy fast   | `npm run test:accuracy:fast`                                                                     | 0    | 42/42     | ✅ PASS |
| Date validation | `npx vitest run src/tests/dateValidation.test.ts`                                                | 0    | 17/17     | ✅ PASS |
| Build           | `npm run build`                                                                                  | 0    | —         | ✅ PASS |
| Persona e2e     | `npx playwright test --config playwright.preview.config.ts tests/e2e/persona-users.spec.ts`      | 0    | 21/21     | ✅ PASS |
| Offline e2e     | `npx playwright test --config playwright.preview.config.ts tests/e2e/production-offline.spec.ts` | 0    | 2/2       | ✅ PASS |

---

## Files modified / added

```
Modified (working tree, not yet committed):
  src/components/ComprehensiveReportForm.tsx   — PATCH 4: format hint + aria-describedby
  src/components/EnhancedBirthInputForm.tsx    — PATCH 2 + 3: in-flow dropdown, ARIA,
                                                 keyboard nav, strict date parser wired in
  src/components/FamilyProfileForm.tsx         — PATCH 4: format hint
  src/pages/BirthChartPage.tsx                 — PATCH 4: DATE_INPUT_FORMAT_HINT constant
  src/pages/MatchMaking.tsx                    — PATCH 4: shared strict parser in validateInputs
  src/pages/PanchangPage.tsx                   — PATCH 4: aria-describedby + format hint
  src/pages/PrivacySettingsPage.tsx            — PATCH 1: Clerk-safe split (ExportSectionAuthed,
                                                 DeleteSectionAuthed, CloudUnavailableCard)
  src/pages/QuestionPage.tsx                   — PATCH 4: aria-describedby + format hint
  src/routes/index.tsx                         — PATCH 1: removed ClerkGate wrapper from
                                                 /privacy-settings so consent works in demo mode

New untracked files:
  src/lib/dateValidation.ts                    — PATCH 3: shared strict date/time validation
  src/tests/dateValidation.test.ts             — PATCH 3: 17 unit tests (all mandatory cases)
  tests/e2e/persona-users.spec.ts              — PATCH 7: 21-test persona regression suite
  tests/e2e/production-offline.spec.ts         — PATCH 5 + 6: production preview verification
  playwright.preview.config.ts                 — PATCH 5: preview-server Playwright config
  reports/ROBOTIC_PATCH_REPORT.md             — this file
  reports/ROBOTIC_FINDINGS_RECONCILIATION.md  — per-finding schema
  reports/PERSONA_REGRESSION_RESULTS.md       — full e2e results
  reports/PRODUCTION_PREVIEW_OFFLINE_TEST.md  — offline test evidence
  reports/evidence/*                           — raw evidence files
  reports/persona/results/*.json               — per-test diagnostics
  reports/persona/screenshots/*.png            — per-test screenshots
```

---

## Remaining risk

1. **Not a security boundary.** The Clerk gate in `PrivacySettingsPage` is UX.
   Real enforcement must stay in Supabase Edge Functions + RLS (already the
   documented stance in AGENTS.md).

2. **PATCH 6 not reproduced.** A real failed URL/initiator would be needed to
   close this definitively. No 404 masking has been added.

3. **Resource-constrained vitest runs.** Running `npm run test:run` immediately
   after a 2-hour Playwright session that loaded the WASM ephemeris can cause
   65–86 file failures due to Node.js heap exhaustion. Always run on a cold
   machine or in CI with dedicated workers.

4. **ESLint warnings.** 1273 warnings, 0 errors. Categorised in
   `ROBOTIC_FINDINGS_RECONCILIATION.md` — none represent correctness or security
   risks except the 3 React Hooks exhaustive-deps warnings, which should be
   audited before the next feature addition.
