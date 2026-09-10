# Week 10: Accuracy Dashboard Spec
Status: Implementation Complete
Last updated: 2026-09-04
Owner: Kiro (spec-driven)

---

## 1. Context

The Week 2 spec explicitly called for "an early internal accuracy dashboard or status
summary." This was documented but never built. Week 10 closes this gap.

The 15-chart validation suite (Week 1) runs in ~21ms and achieves 99.5% field accuracy.
The dashboard makes that quality visible — to the team, for QA, and for internal trust.

---

## 2. Goals

Build a live Accuracy Dashboard page that:
- Runs the 15-chart validation suite in-browser using the live engine
- Shows pass/warn/fail counts and overall field accuracy %
- Shows a per-chart status table (PASS/WARN/FAIL)
- Shows the last-calculated timestamp
- Supports re-running the suite on demand ("Recalculate")
- Marks as noindex (internal tool)
- Has complete test coverage

---

## 3. Requirements

### R1 — accuracyDashboardService.ts
- `src/services/accuracyDashboardService.ts`
- `runAccuracyCheck()` — pure function; runs all 15 reference charts against the engine
  - Uses existing `referenceCharts` data from `src/tests/validation/referenceCharts.ts`
  - Uses `calculatePreciseChart` from `precisionEphemerisService` (same as the test suite)
  - Returns `AccuracyDashboardResult` with per-chart breakdown
- `AccuracyDashboardResult` interface: `{ charts, totalCharts, passCount, warnCount, failCount, fieldAccuracyPercent, runDurationMs, runAt }`
- `ChartAccuracyResult` interface: `{ name, date, status, passFields, failFields, warnFields }`

### R2 — AccuracyDashboardPage
- `src/pages/AccuracyDashboardPage.tsx`
- Route: `/accuracy`
- Shows: overall score bar, counts (Pass/Warn/Fail), field accuracy %, per-chart table
- "Recalculate" button re-runs the suite
- Loading state during calculation
- noindex SEO
- Accessible: aria-live on result section

### R3 — Route registration
- `/accuracy` in `appRoutes.tsx`
- In `featureRegistry.ts` under `platform` category

### R4 — Week 10 tests
- `src/tests/week10/accuracyDashboard.test.ts` — service unit tests
- `src/tests/week10/accuracyDashboardPage.test.tsx` — page render tests

---

## 4. Acceptance Criteria

- [x] runAccuracyCheck() returns valid AccuracyDashboardResult
- [x] totalCharts = 15
- [x] passCount + warnCount + failCount = 15
- [x] fieldAccuracyPercent is 0–100
- [x] AccuracyDashboardPage renders without error
- [x] Shows pass/warn/fail counts
- [x] Shows per-chart table with 15 rows
- [x] "Recalculate" button triggers re-run
- [x] Route /accuracy registered
- [x] Week 10 tests pass
- [x] Full test suite (788+) still passes
- [x] Build passes
