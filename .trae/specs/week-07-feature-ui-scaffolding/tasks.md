# Week 07: Feature UI Scaffolding — Implementation Tasks

## Task 1: Add FamilyProfileSelector to HoroscopePage
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Read [HoroscopePage.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/HoroscopePage.tsx) form state structure.
  - Import `FamilyProfileSelector` and render it near the birth input area.
  - Wire `onSelect` to update the birth form fields (name, date, time, timezone, lat, lon, place).
  - Ensure previously shown validation errors are cleared when a valid profile is selected.
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `rule` TR-1.1: HoroscopePage imports and renders at least one `FamilyProfileSelector` JSX element with `onSelect` prop; selecting a profile calls state setter(s) for each required birth field.
  - `rule` TR-1.2: Selecting a profile resets any non-null error state on the page.
  - `rubric` TR-1.3: Dimension = selector placement usability; scale 1–5; 1 = selector buried far from form, 3 = selector at top of form, 5 = selector immediately adjacent to Name/DOB inputs with clear label; threshold ≥ 4.
- **Notes**: Match existing placement style used in [BirthChartPage.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/BirthChartPage.tsx) lines 245–255.

## Task 2: Add FamilyProfileSelector to PrashnaEngine
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Read [PrashnaEngine.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/prashna/PrashnaEngine.tsx) birth/question form.
  - Add one `FamilyProfileSelector` near the native's birth inputs.
  - Wire `onSelect` to fill the native's birth data; leave the question input untouched.
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `rule` TR-2.1: PrashnaEngine.tsx imports and renders a `FamilyProfileSelector`; `onSelect` updates at minimum `birthDate/birthTime/birthTimezone/birthLat/birthLon`.
  - `rule` TR-2.2: Selecting a profile does NOT modify the question text field.
- **Notes**: Reuse the QuestionPage pattern from [QuestionPage.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/QuestionPage.tsx) lines 548–560 as a reference if structure is similar.

## Task 3: Add dual FamilyProfileSelector to EnhancedKundliMilan
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Read [EnhancedKundliMilan.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/EnhancedKundliMilan.tsx) form structure for both male/female (or bride/groom) sides.
  - Add one `FamilyProfileSelector` per side; label them appropriately (Male / Female or Bride / Groom matching the page's convention).
  - Wire each selector to its side's form state independently so selecting a profile on side A does not touch side B.
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `rule` TR-3.1: Page renders exactly two `FamilyProfileSelector` instances, each with a distinct `triggerLabel`.
  - `rule` TR-3.2: Firing the `onSelect` of selector A only updates form fields for side A and not side B (checked by trace of called state setters).
- **Notes**: Mirror the [MatchMaking.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/MatchMaking.tsx) two-selector pattern (lines 432–460).

## Task 4: Add FamilyProfileSelector to ComprehensiveReportPage
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Read [ComprehensiveReportPage.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/ComprehensiveReportPage.tsx) form layout.
  - Add one `FamilyProfileSelector` near the native/subject birth form.
  - Wire it to fill the subject's birth fields; clear any prior form errors on successful selection.
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `rule` TR-4.1: ComprehensiveReportPage imports and renders one `FamilyProfileSelector`.
  - `rule` TR-4.2: Selecting a profile populates all 7 subject birth fields (name/date/time/timezone/lat/lon/place).
- **Notes**: Keep layout consistent with BirthChartPage.

## Task 5: FamilyProfileForm bilingual + FamilyProfilesPage lang toggle
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Add a `lang?: 'en' | 'hi'` prop to [FamilyProfileForm.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/components/FamilyProfileForm.tsx).
  - Create a `LABELS` dictionary (English + Hindi) inside the component following the exact structure used in [TransitTimelinePage.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/TransitTimelinePage.tsx) lines 92–149.
  - Replace all hard-coded English visible strings with dictionary lookups; apply `font-hindi` className when `lang === 'hi'` on Devanagari labels.
  - Update [FamilyProfilesPage.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/FamilyProfilesPage.tsx) to either use the existing `use-lang` hook (if present) or add a minimal local `useState` toggle matching the look of EnhancedLanguageToggle used elsewhere; pass `lang` into both Add and Edit form instances.
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `rule` TR-5.1: FamilyProfileForm has a typed `lang` prop with default `'en'`; all hard-coded English visible strings are removed from JSX.
  - `rule` TR-5.2: FamilyProfilesPage renders a language toggle and passes the chosen lang to both the add and edit form variants.
  - `rubric` TR-5.3: Dimension = Hindi copy quality and completeness; scale 1–5; 1 = 1–3 labels translated, 3 = ~50%, 5 = every label/button/placeholder/validation message correctly rendered in Hindi with Devanagari script; threshold ≥ 4.
- **Notes**: Reuse the `RELATIONSHIPS` array as-is (English) unless there are existing translations; we do not invent translations for relationship names without a source. Optionally add a relationship mapping object if translations exist.

## Task 6: ReportShell collapsible section + Comprehensive beta layout
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - Implement the `collapsible?: boolean` prop on [ReportShell.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/components/ReportShell.tsx) `Section` component: when true, wrap the content area in an accessible expand/collapse UI (can use `@radix-ui/react-collapsible` via existing `Collapsible` ui component if available, or a simple inline `useState` with button + aria-expanded).
  - Update [ReportPreviewPage.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/ReportPreviewPage.tsx) Footer `links` array to include at minimum: Comprehensive Report, Compatibility/Matchmaking, Dasha+Transit live page links + Hindi label variants.
  - Update [ComprehensiveReportPage.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/ComprehensiveReportPage.tsx): add a top-level `Beta report layout` toggle (Switch component) defaulting to OFF. When ON, render the generated report content inside a `ReportShell` (Header, Metadata, Sections, Actions, Footer). Keep the original layout visible when the toggle is OFF.
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `rule` TR-6.1: `ReportShell.Section` supports a `collapsible` prop; rendering with `collapsible={true}` produces a button that toggles children visibility and has `aria-expanded` state.
  - `rule` TR-6.2: ReportPreviewPage Footer links array includes hrefs `/comprehensive`, `/matchmaking`, `/dasha-transit` (or their equivalents).
  - `rule` TR-6.3: ComprehensiveReportPage renders a toggle that, when ON, mounts a `ReportShell` compound structure in the DOM.
- **Notes**: For the Comprehensive beta shell, wire `ReportShell.Actions` with real handlers if print/share/export already exist on the page; otherwise keep them as no-op buttons with clear "Beta" badge near the toggle.

## Task 7: TransitTimeline polish (today note, quick-range, tooltip, accuracy link)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - [TransitTimelinePage.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/TransitTimelinePage.tsx) result area:
    1. In LegendPanel or next to it, add a short inline callout noting "Today is marked with the violet line" (or Hindi equivalent).
    2. Add a `view` state (`'6m' | '12m' | '24m' | 'all'`) with a segment/toggle group near the form actions. When a narrower view is selected, compute a zoomed `renderedDays` subset from the front of the range so the left side aligns with the start date; update `TimelineGrid` to accept rendered days and recompute ticks/percentages against the rendered subset, not the whole range.
    3. Add an accessible tooltip/popover to each timeline segment bar using `@radix-ui/react-tooltip` via the existing ui/tooltip if available (or a `title` attr for the scaffold minimum). Content: planet, sign, start date (YYYY-MM-DD), end date, "Retrograde (Rx)" badge when applicable.
    4. Append a link to `/accuracy` inside the scaffold disclaimer footer line with text "Track engine progress →" / "इंजन प्रगति ट्रैक करें →".
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `rule` TR-7.1: Result area contains a visible "today" hint in close proximity to the timeline grid or legend.
  - `rule` TR-7.2: Quick-range view toggle group (6m/12m/24m/all) is present and changes the rendered subset width.
  - `rule` TR-7.3: Every segment bar exposes hover information (title attr or aria-describedby tooltip) containing at least planet + sign + start date.
  - `rule` TR-7.4: Scaffold footer disclaimer contains an `<a>` or `<Link>` with href `/accuracy`.
- **Notes**: Keep the quick-range filter as a UI-only zoom for this scaffold phase. Do not trigger a new mock generator run unless necessary.

## Task 8: Feature registry badges + discoverability polish
- **Status**: `pending`
- **Priority**: low
- **Depends On**: None
- **Description**:
  - Re-open [featureRegistry.ts](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/routes/featureRegistry.ts) and verify that:
    - `/family-profiles` — badge "New", `isNew: true`, `showInDesktop: true`, `showInMobileSheet: true` (platform category).
    - `/transit-timeline` — badge "Scaffold", `isNew: true`, `showInDesktop: true`, `showInMobileSheet: true` (timing category).
    - `/report-preview` — badge "Scaffold", `isNew: true`, `showInDesktop: true` (foundation category).
  - Add any missing flags and ensure category/order matches the existing user journey ordering.
  - If either [DashboardPage.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/DashboardPage.tsx) or [QuickWinsDashboard.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/QuickWinsDashboard.tsx) exists, add a card "Explore new features" listing the three scaffold pages with icon links; skip if neither page exists.
- **Acceptance Criteria Addressed**: FR-5 (navigation coherence)
- **Test Requirements**:
  - `rule` TR-8.1: Each of the three entries has correct `badge` value and `showInDesktop/showInMobileSheet` as specified above.
- **Notes**: Keep this change surgical — do not reorder the entire catalog unless a flag is missing.

## Task 9: Build, typecheck, lint, and test
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Tasks 1–8
- **Description**:
  - Run `npm run typecheck` → fix any TS strict errors.
  - Run `npm run lint` → fix any ESLint issues.
  - Run `npm run build` → verify vite build succeeds.
  - Run `npm run test:run` → ensure all tests pass; only update tests that directly assert previous behaviour where our new UI elements cause selectors to miss (e.g., a test that counts `<Button>` elements on a page). Do NOT delete or weaken tests to make them pass.
- **Acceptance Criteria Addressed**: AC-6, AC-7
- **Test Requirements**:
  - `rule` TR-9.1: `npm run typecheck` exits 0.
  - `rule` TR-9.2: `npm run lint` exits 0.
  - `rule` TR-9.3: `npm run build` exits 0.
  - `rule` TR-9.4: `npm run test:run` exits 0.
  - `rule` TR-9.5: `grep -r ": any" src/pages src/components --include="*.tsx" --include="*.ts"` over the diff of touched files returns 0 new matches (excluding pre-existing).
- **Notes**: If any unrelated test failure pre-exists, note it in Completion Evidence but do not block on those — block only on tests whose failures are in files we touched.
