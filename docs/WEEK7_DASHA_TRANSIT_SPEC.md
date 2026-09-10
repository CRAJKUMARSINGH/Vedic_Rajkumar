# Week 7: Dasha + Transit Correlation View Spec
Status: Implementation Complete
Last updated: 2026-09-04
Owner: Kiro (spec-driven)

---

## 1. Feature Evaluation

### Option A: Dasha + Transit Correlation View
**Complexity**: Medium — service already built, components exist, new page glues them
**User Value**: High — unique to Vedic astrology, answers "when will things happen?"
**Architecture fit**: Excellent — `dashaGocharaCorrelationService`, `DashaGochaCard`, `DashaTransitPanel` all exist
**Chosen**: ✅ YES

### Option B: Improved PDF Reports
**Complexity**: High — jsPDF, layout, fonts, charts
**User Value**: Medium — nice to have, but PDF exists already
**Architecture fit**: Good — pdfExportService exists
**Chosen**: ❌ Deferred to Week 8

---

## 2. Goals

Deliver a standalone, production-quality Dasha + Transit Correlation page that:
- Accepts birth data and a target date
- Computes the active Mahadasha + Antardasha for the target date
- Shows all 9 planet transit positions from Moon (Chandra Rashi)
- Displays the Dasha–Gochar correlation score + activation level
- Provides a 12-month monthly outlook (each month's activation level)
- Supports English + Hindi bilingual display
- Is accessible (ARIA, keyboard, focus management)
- Has complete test coverage

---

## 3. Requirements

### R1 — DashaTransitCorrelationService (enhanced)
- `src/services/dashaTransitCorrelationService.ts`
- `computeCorrelation(params)` — single entry point:
  - Input: birth date/time/timezone/lat/lon, target date
  - Output: `DashaTransitCorrelationResult` with:
    - `activeMahadasha`, `activeAntardasha`, `dashaBalance`
    - `transitPositions` — 9 planets with sign, house from Moon, degrees
    - `correlationResult` — from existing `dashaGocharaCorrelationService`
    - `monthlyOutlook` — 12 months × {month, activationLevel, score, label}
- `computeMonthlyOutlook(birthData, fromDate)` — 12-month forecast

### R2 — DashaTransitCorrelationPage
- `src/pages/DashaTransitCorrelationPage.tsx`
- Route: `/dasha-transit`
- Birth input form using existing `EnhancedBirthInputForm` or inline form
- Target date picker (default: today)
- Displays:
  - Active Dasha banner (Maha + Antar + balance days)
  - Correlation score card with gauge (0–100)
  - Transit positions table (9 planets: sign, house, nakshatra)
  - 12-month outlook grid
- Loading/error/empty states using Week 5 shared components
- `aria-live` on result section
- SEO title + canonical

### R3 — 12-Month Outlook Component
- `src/components/DashaTransitOutlook.tsx`
- Shows 12 months as a grid of cards (month name, level badge, score bar)
- Color-coded: High=green, Medium=amber, Low=red/orange
- Responsive: 3 cols on mobile, 4 on tablet, 6 on desktop

### R4 — Route registration
- Add `/dasha-transit` to `src/routes/appRoutes.tsx`
- Add to `featureRegistry.ts` under `timing` category

### R5 — Week 7 tests
- `src/tests/week7/dashaTransitCorrelation.test.ts` — service unit tests
- `src/tests/week7/dashaTransitPage.test.tsx` — page render tests

---

## 4. Design

### Data flow
```
User inputs birth date/time/lat/lon/timezone + target date
  → dashaTransitCorrelationService.computeCorrelation()
    → kundli engine.calculateChart() → Moon sign, Moon house
    → dashaService.calculateVimshottariDasha() → active Maha/Antar
    → ephemeris → 9 planet positions → house from Moon
    → dashaGocharaCorrelationService.calculateDashaGochaCorrelation()
    → monthlyOutlook: 12 iterations of above for each month start
  → DashaTransitCorrelationPage renders result
```

### Activation level colour mapping
- High (score ≥ 70): green
- Medium (score 45–69): amber
- Low (score < 45): red/orange

---

## 5. Acceptance Criteria

- [x] computeCorrelation() returns typed result with all required fields
- [x] computeMonthlyOutlook() returns 12 months of scores
- [x] DashaTransitCorrelationPage renders without error for valid birth data
- [x] Active dasha banner shows Mahadasha + Antardasha + balance
- [x] Transit table shows all 9 planets with house-from-Moon
- [x] 12-month outlook grid displays with colour-coded levels
- [x] Loading state shown during calculation
- [x] Error state shown on invalid data
- [x] Empty state shown before first calculation
- [x] Route /dasha-transit is registered and accessible
- [x] Week 7 tests pass
- [x] Full test suite (604+) passes
- [x] Build passes
