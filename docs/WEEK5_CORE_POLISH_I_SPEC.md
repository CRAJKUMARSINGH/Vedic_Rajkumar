# Week 5: Core Polish I — Kundli + Prashna Spec
Status: Implementation Complete
Last updated: 2026-09-04
Owner: Kiro (spec-driven)

---

## 1. Goals

Standardize the UX quality of the two primary core flows — Kundli (birth chart) and Prashna (horary). Reduce rough edges, improve mobile usability, and enforce accessibility.

---

## 2. Gap Fills (Weeks 1–4 Carry-over)

### G1 — Prashna stubs import wrong kundli engine
`src/features/prashna/stubs.ts` imports `calculateChart` from `@/features/kundli/stubs` (fixed positions) instead of `@/features/kundli/engine` (real ephemeris).

### G2 — BirthChartPage has @ts-nocheck + no loading/error/empty states
Complete rewrite with typed state, LoadingSkeleton during compute, Alert for errors, Empty state before submission, accessible labels, aria-live result region.

### G3 — PanchangPage uses ad-hoc spinner + no accessible labels
Replace Suspense fallback with `LoadingSkeleton`, add `aria-label` on date/city inputs, add `aria-live` on result container.

### G4 — MatchMaking missing aria-live on result reveal
Add `aria-live="polite"` wrapper around compatibility result.

---

## 3. Week 5 Requirements

### R1 — Shared `<ChartLoadingState>` component
Reusable `src/components/ChartLoadingState.tsx` — shows `PageLoadingOverlay` with configurable message. Used in BirthChartPage and QuestionPage.

### R2 — Shared `<ChartErrorState>` component
Reusable `src/components/ChartErrorState.tsx` — uses `Alert variant="destructive"` with retry callback. Used by all four core pages.

### R3 — Shared `<ChartEmptyState>` component
Reusable `src/components/ChartEmptyState.tsx` — uses `Empty`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription` primitives. Configurable icon, title, description.

### R4 — BirthChartPage complete rewrite
- Remove `@ts-nocheck`
- `useState<ChartResult | null>` typed
- `LoadingSkeleton variant="card"` during compute
- `ChartErrorState` for errors
- `ChartEmptyState` before first calculation
- All inputs use `<Label htmlFor>` + `<input id>`
- `aria-live="polite"` on result container
- `aria-busy` on submit button while loading
- Responsive grid: `grid-cols-1 sm:grid-cols-2`
- Background uses `bg-background`

### R5 — QuestionPage (Prashna) accessibility improvements
- Add `role="status"` + `aria-live="polite"` on result section
- Replace inline spinner in Suspense fallback with `LoadingSkeleton`
- Fix language flicker: read from localStorage instead of URL param

### R6 — Feature-level ErrorBoundaries on core pages
- Wrap `PanchangCard` in `<ErrorBoundary fallback={<ChartErrorState />}`
- Wrap the result section in `BirthChartPage` in `<ErrorBoundary>`

### R7 — Standardize PanchangPage
- Replace inline spinner with `<LoadingSkeleton variant="card" rows={5} />`
- Add `id` + `<Label>` or `aria-label` to date and city inputs
- Add `aria-live="polite"` on Panchang result section
- Add `role="status"` to loading indicator

### R8 — Week 5 tests
- `src/tests/week5/sharedStates.test.ts` — render tests for ChartLoadingState, ChartErrorState, ChartEmptyState
- `src/tests/week5/prashnaGapFix.test.ts` — verify prashna stubs use real engine

---

## 4. Tasks

| Task | File | Status |
|------|------|--------|
| T1: Fix prashna stubs import | `src/features/prashna/stubs.ts` | ✅ Done |
| T2: ChartLoadingState | `src/components/ChartLoadingState.tsx` | ✅ Done |
| T3: ChartErrorState | `src/components/ChartErrorState.tsx` | ✅ Done |
| T4: ChartEmptyState | `src/components/ChartEmptyState.tsx` | ✅ Done |
| T5: BirthChartPage rewrite | `src/pages/BirthChartPage.tsx` | ✅ Done |
| T6: PanchangPage polish | `src/pages/PanchangPage.tsx` | ✅ Done |
| T7: MatchMaking aria-live | `src/pages/MatchMaking.tsx` | ✅ Done |
| T8: QuestionPage a11y fixes | `src/pages/QuestionPage.tsx` | ✅ Done |
| T9: Week 5 tests | `src/tests/week5/` | ✅ Done |

---

## 5. Acceptance Criteria

- [x] Prashna stubs import from real engine (not kundli stubs)
- [x] BirthChartPage has no @ts-nocheck and uses typed ChartResult state
- [x] BirthChartPage shows LoadingSkeleton during compute (not blank)
- [x] BirthChartPage shows ChartEmptyState before first submission
- [x] BirthChartPage shows ChartErrorState with retry on failure
- [x] All BirthChartPage inputs have associated labels (htmlFor/id)
- [x] Result areas on BirthChartPage have aria-live="polite"
- [x] PanchangPage Suspense fallback uses LoadingSkeleton
- [x] PanchangPage inputs have accessible labels
- [x] MatchMaking result has aria-live="polite" wrapper
- [x] Week 5 tests pass
- [x] Core gate (test:core + build) passes
