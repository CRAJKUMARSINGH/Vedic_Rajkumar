# Week 07: Feature UI Scaffolding — Enhancement Spec

## Overview
- **Summary**: Polish and enhance the three Week 07 scaffolded features — Family Profiles, Transit Timeline, and Report UI Shells — so they feel usable, integrated, and provide a solid starting point for later hardening.
- **Purpose**: Speed up exploration and usefulness testing of the next approved features before full backend hardening; ensure other tools (engines, services) have a great UI surface to connect into.
- **Target Users**: End users of Vedic Rajkumar who want to save family birth data, visualize planetary movements, and view consistent report layouts.

## Goals
1. **Integration**: Make `FamilyProfileSelector` available on the four core user-facing pages where birth data entry is the main friction (Horoscope/Kundli, Prashna, Enhanced Matchmaking, Comprehensive Report).
2. **Bilingual polish**: Add Hindi copy to `FamilyProfileForm` and any hard-coded English strings in the three scaffold pages so the Hindi toggle experience is consistent with Weeks 5–6.
3. **Report shell reach**: Wire `ReportShell` into a real page (e.g., Comprehensive Report or Compatibility) as an opt-in layout, and add cross-links from the demo page to actual features.
4. **Transit timeline polish**: Improve the timeline's interaction model (today hint, zoom/scroll, hover summaries, better scaffold notice).
5. **Navigation coherence**: Ensure scaffold badges/links in feature registry are consistent; add a "New features" entry point on the dashboard or features page.

## Non-Goals
- No real ephemeris / engine hardening — Transit Timeline continues to use the mock generator (clearly labelled).
- No Supabase persistence layer for family profiles — localStorage-first remains.
- No PDF export engine changes (placeholders stay as placeholders).
- No engine correctness or accuracy changes (that is outside the Trae scope).
- No changes to authentication, payments, or legal pages.

## Background & Context
- The core scaffold files are already present:
  - [FamilyProfilesPage.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/FamilyProfilesPage.tsx), [FamilyProfileForm.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/components/FamilyProfileForm.tsx), [FamilyProfileSelector.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/components/FamilyProfileSelector.tsx), [useFamilyProfiles.ts](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/hooks/useFamilyProfiles.ts), [familyProfiles.ts](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/lib/familyProfiles.ts)
  - [TransitTimelinePage.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/TransitTimelinePage.tsx)
  - [ReportShell.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/components/ReportShell.tsx), [ReportPreviewPage.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/ReportPreviewPage.tsx)
- Routes are registered: `/family-profiles`, `/transit-timeline`, `/report-preview` in [appRoutes.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/routes/appRoutes.tsx) and feature catalogued in [featureRegistry.ts](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/routes/featureRegistry.ts).
- `FamilyProfileSelector` is already used on: BirthChartPage, DashaPage, DashaTransitCorrelationPage, MatchMaking, QuestionPage, TransitTimelinePage. Missing from: HoroscopePage (core Kundli), PrashnaEngine (core Prashna), EnhancedKundliMilan, ComprehensiveReportPage.

## Functional Requirements

### FR-1: FamilyProfileSelector on core pages
- **FR-1a**: HoroscopePage (`/horoscope`) shows a FamilyProfileSelector trigger near its birth input form; selecting a profile pre-fills every birth field (name, date, time, timezone, lat, lon, place) and clears any previous validation errors.
- **FR-1b**: PrashnaEngine (`/prashna-ai`) shows a FamilyProfileSelector near the birth/question input section; selecting a profile fills the native's birth fields.
- **FR-1c**: EnhancedKundliMilan shows **two** FamilyProfileSelector instances (male and female) that fill their respective sides independently.
- **FR-1d**: ComprehensiveReportPage shows a FamilyProfileSelector and fills the report subject's birth fields.

### FR-2: Bilingual (Hindi) support in FamilyProfileForm
- `FamilyProfileForm` accepts an optional `lang` prop (default `'en'`).
- All visible labels, placeholders, validation messages, and button text switch between English and Hindi based on `lang` (mirroring the pattern used in TransitTimelinePage/ReportPreviewPage).
- FamilyProfilesPage passes its `lang` state into the form, and uses the existing multi-language service toggle if present; otherwise uses a simple inline toggle matching the page's design.

### FR-3: ReportShell practical adoption
- `ReportPreviewPage` Footer `links` array includes links to actual live pages that will later adopt the shell (Comprehensive Report, Compatibility, Dasha+Transit).
- `ComprehensiveReportPage` renders a conditional "Beta Report Layout" toggle (hidden by default, user can opt in) that renders using `ReportShell` for the header/metadata/sections/footer scaffold instead of the legacy layout. Content inside uses the page's existing engine output.
- `ReportShell.Section` `collapsible` prop (if absent) is added and used by Comprehensive sections to support expand/collapse.

### FR-4: Transit timeline UX polish
- TransitTimelinePage adds the following, all remaining clearly marked as scaffold:
  - A "Today is highlighted" hint tooltip/inline note near the legend.
  - A `view: '6m' | '12m' | '24m' | 'all'` quick-range filter near the horizon picker that adjusts the rendered zoom (filtering the timeline view without re-running the mock generator if the range allows).
  - Hovering a segment shows a floating tooltip with planet, sign, start date, end date, and retrograde status.
  - The scaffold disclaimer banner at the bottom of the page includes a direct link to `/accuracy` so curious users can track engine progress.

### FR-5: Navigation and feature discoverability
- Feature registry entries for `/family-profiles`, `/transit-timeline`, `/report-preview` all have correct `badge`, `isNew`, and `showInDesktop/showInMobileSheet` such that:
  - Family Profiles shows as "New" in platform nav on desktop + mobile sheet.
  - Transit Timeline shows as "Scaffold" in timing category on desktop + mobile sheet.
  - Report Shell Demo shows as "Scaffold" in foundation category on desktop.
- If the `DashboardPage` or `QuickWinsDashboard` exist, add a "Explore new features" card linking to each scaffold page (feature availability check only; do not add if neither page exists).

## Non-Functional Requirements

### NFR-1: Mobile performance and responsiveness
- Every touched page must remain fully scrollable and usable at 360×640 viewport without horizontal overflow.
- No heavy synchronous work > 50ms on the main thread from new UI code.

### NFR-2: Accessibility
- Every newly added `<input>` has a matching `<label>`.
- Every selector trigger has `aria-haspopup`, `aria-expanded`, and an accessible name.
- Status/result regions use `aria-live` where content asynchronously changes.
- Keyboard navigation (Tab, Escape, Enter, Arrow) still works in the same patterns as existing pages.

### NFR-3: Code simplicity / "easy to replace"
- Changes stay within existing file boundaries; new components are minimal, small, and documented with JSDoc headers.
- No new dependencies. Uses existing `@/components/ui/*` and `lucide-react` only.
- Scaffold/mock sections remain clearly labelled (`Scaffold` badge, inline disclaimers) so future hardening is unambiguous.

### NFR-4: Build stability
- TypeScript strict mode: zero new `any` types.
- `npm run typecheck`, `npm run lint`, and `npm run build` must pass.

## Constraints
- **Technical**: React 18 + Vite, Radix UI primitives via `@/components/ui/*`, Tailwind via `cn`, no new npm packages.
- **Business**: Scaffold content must not pretend to be real engine output; all mock sections carry explicit scaffold disclaimers.
- **Dependencies**: Family profile CRUD goes through `useFamilyProfiles` / `familyProfiles.ts` (localStorage-first); no Supabase calls.

## Assumptions
- Pages we touch (HoroscopePage, PrashnaEngine, EnhancedKundliMilan, ComprehensiveReportPage) already expose controlled form state for birth data that can be set programmatically — if not, we introduce a minimal state hook without changing engine behaviour.
- Bilingual copy for Hindi uses the same keys/UX pattern as TransitTimelinePage (local dictionary objects, `font-hindi` class applied for Devanagari).

## Acceptance Criteria

### AC-1: FamilyProfileSelector available on 4 core pages
- **Type**: `rule`
- **Given**: The app is built and routes are registered.
- **When**: A user opens `/horoscope`, `/prashna-ai`, `/enhanced-matchmaking`, or `/comprehensive`.
- **Then**: A `FamilyProfileSelector` trigger button is visible near the birth input area on each page.
- **Pass Condition**: Each of the four pages imports and renders `FamilyProfileSelector`; selecting a profile fills the form fields.
- **Evidence**: Source inspection of all four page files, plus manual DOM render checks in a test or build.

### AC-2: FamilyProfileForm bilingual
- **Type**: `rule`
- **Given**: FamilyProfilesPage renders with a language toggle.
- **When**: The user switches language to Hindi.
- **Then**: All form labels, placeholders, validation messages, and Save/Cancel buttons inside `FamilyProfileForm` appear in Hindi with the `font-hindi` class applied where appropriate.
- **Pass Condition**: Form component accepts `lang` prop; all visible strings are keyed through a labels dictionary.
- **Evidence**: Source diff of FamilyProfileForm and test coverage for Hindi label rendering.

### AC-3: ReportShell integrated into ComprehensiveReportPage (beta toggle)
- **Type**: `rule`
- **Given**: User opens `/comprehensive` report page.
- **When**: User enables the "Beta report layout" toggle.
- **Then**: The page renders via `ReportShell` (Header, Metadata, Sections, Actions, Footer) while preserving the same report content.
- **Pass Condition**: ComprehensiveReportPage conditionally imports/uses ReportShell compound components for the opt-in layout.
- **Evidence**: Source inspection + successful DOM render check for presence of ReportShell header class names.

### AC-4: Transit Timeline new UX features present
- **Type**: `rule`
- **Given**: User opens `/transit-timeline` and clicks Generate Timeline.
- **When**: User inspects the result area.
- **Then**: 1) today callout or inline legend note exists, 2) quick-range view filter (6m/12m/24m/all) is present, 3) hovering a segment shows a tooltip with planet/sign/date-range/Rx status, 4) scaffold disclaimer links to `/accuracy`.
- **Pass Condition**: All four sub-items present in the rendered DOM / JSX source.
- **Evidence**: Source diff of TransitTimelinePage.tsx.

### AC-5: Mobile responsiveness (rubric)
- **Type**: `rubric`
- **Dimension**: Visual consistency and lack of layout breakage on mobile viewport (≤390 px wide).
- **Scale**: 1–5
- **Anchors**:
  - 1 = horizontal overflow, broken layout, inputs wrap poorly;
  - 3 = usable but some labels truncate awkwardly or spacing is inconsistent;
  - 5 = no horizontal scroll; inputs/buttons stacked cleanly; readable; touch targets ≥40 px.
- **Pass Threshold**: ≥ 4
- **Evidence**: Lighthouse mobile layout snapshot or build-time 390px render review.

### AC-6: Build and lint pass (rule)
- **Type**: `rule`
- **Given**: The current working tree with all Week-07 enhancement edits applied.
- **When**: `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test:run` execute.
- **Then**: All four commands exit with code 0.
- **Pass Condition**: Exit code 0 for each.
- **Evidence**: Command capture output attached.

### AC-7: No new runtime `any` types
- **Type**: `rule`
- **Given**: Source diff of touched files.
- **When**: Reviewer searches for `: any` in the diff (excluding comments and test fixtures).
- **Then**: Zero occurrences.
- **Pass Condition**: Zero hits.
- **Evidence**: Grep result.

## Open Questions
- [ ] Should Comprehensive Report beta-toggle default to on for scaffold users, or stay off per spec? (Assumption: OFF by default, user opt-in.)
- [ ] Is there a pre-existing language hook (`use-lang`) we should reuse on FamilyProfilesPage instead of an inline toggle? (Assumption: reuse if present; otherwise inline.)
