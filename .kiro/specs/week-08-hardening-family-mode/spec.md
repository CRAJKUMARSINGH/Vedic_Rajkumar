# Week 08: Hardening Pass — Family Mode Depth & Transit Timeline Polish

## Overview

- **Decision**: Harden the Week 7 scaffold output rather than introduce new surface area.
- **Rationale**: The multi-profile family mode infrastructure was already Week-8-labelled in source (`familyProfiles.ts`, `useFamilyProfiles.ts`). The four core-page integrations (Horoscope, Prashna, EnhancedKundliMilan, ComprehensiveReport) were confirmed done in earlier work. The remaining gaps were in Transit Timeline UX polish and discoverability.
- **Target**: Deepen usability, increase repeat use, and maintain quality discipline per the Week 8 prompt.

## Goals

1. Confirm all four `FamilyProfileSelector` integrations are live and functional.
2. Complete Transit Timeline polish: today hint, quick-range zoom filter, enriched segment tooltips, accuracy link.
3. Add "Explore new features" discoverability card to `QuickWinsDashboard`.
4. Verify build and tests pass end-to-end.

## Non-Goals

- No new pages or routes.
- No Supabase persistence for family profiles (localStorage-first remains).
- No engine/ephemeris accuracy changes.
- No authentication or payment changes.

## Background

Week 7 scaffolded three features: Family Profiles, Transit Timeline, Report Shell. Most of the family profile infrastructure was already complete (CRUD, hook, bilingual form, selector, management page, registry). The four core-page FamilyProfileSelector integrations (HoroscopePage, PrashnaEngine, EnhancedKundliMilan, ComprehensiveReportForm) were confirmed live via source inspection. Transit Timeline had a today marker but lacked a quick-range filter, enriched tooltips, and the accuracy link.

## Functional Requirements

### FR-1: Transit Timeline today hint
- LegendPanel shows a text hint explaining the violet vertical line marks today's date.
- Bilingual: English and Hindi variants.

### FR-2: Transit Timeline quick-range view filter
- A `6m | 12m | 24m | All` toggle group appears between the timeline heading and the LegendPanel.
- Selecting a range filters the rendered `TimelineGrid` to only show that many days from `rangeStart`, without re-running the mock generator.
- Active range button is visually distinct (teal fill).
- Accessible: each button has `aria-pressed` state.

### FR-3: Transit Timeline segment enriched tooltips
- Each segment bar `title` attribute now includes: planet, sign, retrograde status, start date (YYYY-MM-DD), and end date (YYYY-MM-DD).
- Format: `{planet} in {sign}{Rx?} · {startDate} → {endDate}`
- `aria-label` also updated to include date range.

### FR-4: Transit Timeline accuracy link
- Scaffold footer disclaimer paragraph includes a link to `/accuracy` with text "Track engine progress →" (EN) / "इंजन प्रगति ट्रैक करें →" (HI).

### FR-5: QuickWinsDashboard discoverability card
- A teal-bordered card "Explore New Features" appears above the stats overview.
- Lists three scaffold pages: Family Profiles (`/family-profiles`), Transit Timeline (`/transit-timeline`), Report Shell Demo (`/report-preview`).
- Each entry shows icon, title, description, and correct `New`/`Scaffold` badge.
- Uses `react-router-dom` `<Link>` — no new dependencies.
- Bilingual labels.

## Non-Functional Requirements

### NFR-1: Zero new TypeScript errors in touched files
- `get_diagnostics` on `TransitTimelinePage.tsx` and `QuickWinsDashboard.tsx` must return no errors.

### NFR-2: Build passes
- `npm run build` exits 0.

### NFR-3: Week 8 tests pass
- `npm run test:run -- src/tests/week8` exits 0 (66 tests).

### NFR-4: Mobile responsiveness
- Quick-range buttons wrap cleanly on 360 px viewport (flex-wrap).
- Discoverability card uses a responsive `grid-cols-1 sm:grid-cols-3` layout.

## Constraints

- No new npm packages.
- Scaffold sections remain clearly labelled.
- All changes stay within existing file boundaries.

## Acceptance Criteria

### AC-1: Today hint visible in LegendPanel
- `LegendPanel` renders a `<p>` element containing `todayHint` text in both EN and HI, styled in violet.

### AC-2: Quick-range filter present and functional
- Four buttons (`6m`, `12m`, `24m`, `All`) are rendered with correct `aria-pressed` state.
- Selecting `6m` limits `TimelineGrid` to 180 days; `12m` → 365; `24m` → 730; `All` → full range.

### AC-3: Segment tooltips include dates
- Every segment bar `title` attribute contains a `→` separating start and end ISO dates.

### AC-4: Accuracy link in footer
- Scaffold disclaimer paragraph contains an `<a>` with `href="/accuracy"`.

### AC-5: Discoverability card in QuickWinsDashboard
- Card renders links to all three scaffold pages with correct badges.

### AC-6: Build and tests pass
- `npm run build` → exit 0.
- `npm run test:run -- src/tests/week8` → 66 tests, exit 0.
