# Week 6: Core Polish II — Matchmaking + Panchang Spec
Status: Implementation Complete
Last updated: 2026-09-04
Owner: Kiro (spec-driven)

---

## 1. Goals

Complete the core-flow UX standardization started in Week 5. Apply the same
loading/error/empty state patterns, accessibility improvements, and mobile
responsiveness fixes to Matchmaking and Panchang.

---

## 2. Gap Inventory (carried from Weeks 1–5 analysis)

### Matchmaking
- **No inline error state** — errors only via toast (disappears after 5s)
- **No loading skeleton** — result area blank during `calculateAshtakuta()`
- **No empty state** — form present but no descriptive prompt
- **No `aria-busy`** on submit button during calculation
- **No focus management** — after result appears, focus stays on Calculate button
- **`@ts-nocheck` adjacent** — `parseAndValidateJatakCoordinates` imported but unused (dead import)
- **Mobile**: inner categories grid `grid-cols-2` without responsive qualifier

### Panchang
- **No `role="status"`** on loaded data sections for screen readers
- **City picker limited** to 10 hardcoded cities — no search/geocoding
- **Time display** elements lack `aria-label` (inauspicious period times)
- **Keyboard nav**: Tab order inside PanchangCard panels not verified
- **No noindex** meta tag — placeholder Panchang data shouldn't be indexed

---

## 3. Requirements

### R1 — Matchmaking inline error state
- Replace toast-only error with persistent `<ChartErrorState>` above the form
- Toast remains as secondary notification
- Error clears when the user edits any field

### R2 — Matchmaking loading skeleton
- During `calculateAshtakuta()`, show `<LoadingSkeleton variant="card" rows={5} />`
  in the result area instead of blank
- Submit button shows `aria-busy="true"` while loading

### R3 — Matchmaking empty state
- Before any calculation, show `<ChartEmptyState>` in the result area
- Descriptive: "Enter both partners' details and click Calculate"

### R4 — Matchmaking focus management
- After result loads, `useEffect` moves focus to the result heading
- Result heading has `tabIndex={-1}` to receive programmatic focus

### R5 — Matchmaking dead import cleanup
- Remove unused `parseAndValidateJatakCoordinates` import
- Remove unused `Calculator` icon import

### R6 — Panchang `noindex` on stub data
- PanchangPage adds `<meta name="robots" content="noindex,nofollow">` until real
  ephemeris engine replaces the stubs

### R7 — Panchang `aria-label` on time elements
- All time spans (sunrise, sunset, inauspicious periods) inside PanchangCard
  should have machine-readable `datetime` or `aria-label`
- PanchangPage result sections get `role="region"` + `aria-label`
- ✅ **Applied**: Celestial times (sunrise/sunset/moonrise/moonset), Rahu Kaal,
  Abhijit Muhurat, auspicious and inauspicious period paragraphs all carry
  `aria-label` attributes in PanchangCard. Decorative icons marked `aria-hidden`.
  Test coverage added in R8.

### R8 — Week 6 tests
- `src/tests/week6/matchmakingPolish.test.tsx` — inline error, loading skeleton, empty state, aria-busy
- `src/tests/week6/panchangPolish.test.ts` — noindex meta, aria-live, structural checks

---

## 4. Tasks

| Task | File | Status |
|------|------|--------|
| T1: Matchmaking inline error | `src/pages/MatchMaking.tsx` | ✅ Done |
| T2: Matchmaking loading skeleton | `src/pages/MatchMaking.tsx` | ✅ Done |
| T3: Matchmaking empty state | `src/pages/MatchMaking.tsx` | ✅ Done |
| T4: Matchmaking focus management | `src/pages/MatchMaking.tsx` | ✅ Done |
| T5: Matchmaking dead import cleanup | `src/pages/MatchMaking.tsx` | ✅ Done |
| T6: Panchang noindex | `src/pages/PanchangPage.tsx` | ✅ Done |
| T7: Panchang aria region labels | `src/pages/PanchangPage.tsx`, `src/components/PanchangCard.tsx` | ✅ Done |
| T8: Week 6 tests | `src/tests/week6/` | ✅ Done |

---

## 5. Acceptance Criteria

- [x] Matchmaking shows ChartErrorState inline (not only toast) on failure
- [x] Matchmaking shows LoadingSkeleton during calculation
- [x] Matchmaking shows ChartEmptyState before first calculation
- [x] Matchmaking submit button has aria-busy="true" while loading
- [x] Focus moves to result heading after compatibility loads
- [x] PanchangPage has noindex meta until stub is replaced
- [x] PanchangCard time elements (sunrise/sunset/Rahu Kaal/inauspicious) have aria-label
- [x] All Week 6 tests pass (28 original + 6 R7 aria tests = 34 total)
- [x] Full test suite (576+) still passes
- [x] Build passes
