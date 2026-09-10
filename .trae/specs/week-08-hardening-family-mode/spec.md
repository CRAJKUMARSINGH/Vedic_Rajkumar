# Week 08: Hardening Pass — Family Mode Depth & Transit Timeline Polish

## Decision
Harden the Week 7 scaffold output rather than introduce new surface area.

## Rationale
- Multi-profile family mode infrastructure was already Week-8-labelled in source (familyProfiles.ts, useFamilyProfiles.ts).
- Four core-page FamilyProfileSelector integrations confirmed live: HoroscopePage, PrashnaEngine, EnhancedKundliMilan, ComprehensiveReportForm.
- Remaining gaps were Transit Timeline UX polish and discoverability.

## Goals
1. Confirm all four FamilyProfileSelector integrations are live and functional.
2. Complete Transit Timeline polish: today hint, quick-range zoom filter, enriched segment tooltips, accuracy link.
3. Add "Explore new features" discoverability card to QuickWinsDashboard.
4. Verify build and tests pass end-to-end.

## Non-Goals
- No new pages or routes.
- No Supabase persistence for family profiles (localStorage-first remains).
- No engine/ephemeris accuracy changes.
- No authentication or payment changes.

## What Was Already Done (pre-Week-8)
- familyProfiles.ts — full CRUD, max-10, XSS sanitization, validation
- useFamilyProfiles.ts — React hook, cross-tab sync
- FamilyProfileForm.tsx — bilingual (EN/HI), accessible, all labels/placeholders
- FamilyProfileSelector.tsx — accessible popover, keyboard nav, avatar colours
- FamilyProfilesPage.tsx — management page with lang toggle, confirm-delete, empty state
- ReportShell.tsx — collapsible Section prop already implemented
- Feature registry entries — correct badges/flags for all three scaffold pages
- FamilyProfileSelector on HoroscopePage, PrashnaEngine, EnhancedKundliMilan, ComprehensiveReportForm
- ComprehensiveReportForm — uses ReportShell, FamilyProfileSelector wired
- ReportPreviewPage — footer links include /comprehensive, /matchmaking, /dasha-transit

## Week 8 Changes Implemented

### 1. TransitTimelinePage.tsx
- Added todayHint and trackEngineProgress keys to LABELS (EN + HI)
- Added ViewRange type: '6m' | '12m' | '24m' | 'all'
- LegendPanel: added violet hint text "Today is marked with the violet vertical line"
- TimelineGrid: accepts optional viewDays param; clamps segments to viewDays window; ticks/percentages computed against viewDays
- Segment bars: title now includes start date → end date (YYYY-MM-DD → YYYY-MM-DD)
- aria-label on segments includes date range
- Main component: added viewRange state; viewDays memo; quick-range filter buttons (6m/12m/24m/All) with aria-pressed
- Scaffold footer: added <a href="/accuracy"> link "Track engine progress →"

### 2. QuickWinsDashboard.tsx
- Added react-router-dom Link import
- Added "Explore New Features" teal card above overview stats
- Three entries: Family Profiles (/family-profiles, New badge), Transit Timeline (/transit-timeline, Scaffold), Report Shell Demo (/report-preview, Scaffold)
- Bilingual labels, responsive grid-cols-1 sm:grid-cols-3

## Acceptance Criteria Met

| AC | Description | Status |
|----|-------------|--------|
| AC-1 | Today hint visible in LegendPanel | ✅ VERIFIED |
| AC-2 | Quick-range filter present and functional (aria-pressed) | ✅ VERIFIED |
| AC-3 | Segment tooltips include start → end dates | ✅ VERIFIED |
| AC-4 | Accuracy link in scaffold footer | ✅ VERIFIED |
| AC-5 | Discoverability card in QuickWinsDashboard | ✅ VERIFIED |
| AC-6 | npm run build exits 0 | ✅ VERIFIED (built in 24.82s) |
| AC-7 | npx vitest run src/tests/week8 → 66 tests pass (2 files) | ✅ VERIFIED |
| AC-8 | FamilyProfileSelector on all 4 core pages | ✅ VERIFIED (HoroscopePage, PrashnaEngine, EnhancedKundliMilan, ComprehensiveReportForm) |

## Kiro Verification — September 8, 2026
- Build: exit 0, 24.82s
- Tests: 66/66 pass, 2 test files, 0 failures
- FamilyProfileSelector integrations confirmed in source: HoroscopePage.tsx, prashna/PrashnaEngine.tsx, EnhancedKundliMilan.tsx, ComprehensiveReportForm.tsx
- TransitTimelinePage.tsx: ViewRange type, viewRange state, todayHint, quick-range buttons (aria-pressed), TimelineGrid viewDays prop, enriched segment tooltips, accuracy link — all present
- QuickWinsDashboard.tsx: Link import, Explore New Features card with /family-profiles (New), /transit-timeline (Scaffold), /report-preview (Scaffold) — all present

## Week 8 Review Checklist
- [x] Did the work reduce risk in one of the priority areas? Yes — deepens usability of family mode + transit timeline
- [x] Is there a written spec or clear design artifact? Yes (this file)
- [x] Are acceptance criteria explicit? Yes (table above)
- [x] Did tests improve or at least remain credible? 66 passing, no regressions
- [x] Did the week add depth rather than surface area? Yes — polish on existing scaffold
- [x] Is the result something you would trust more than the prior week? Yes
