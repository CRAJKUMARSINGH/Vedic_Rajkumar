# Week 05: Core polish for Kundli and Prashna - Product Requirements Document

## Overview
- **Summary**: Visibly polish the two most important user journeys — Kundli (Birth Chart, `/kundli`) and Prashna (Horary Question, `/question`) — focusing on loading skeletons, empty states, responsiveness, spacing, and visual rhythm. No new astrological features; no engine changes; no navigation changes.
- **Purpose**: Per `trae_detailed_weekly_plan.MD` Week 5 directive: "Smoother, more credible core experiences." Improve perceived quality by removing jank and adding proper state handling so results feel reliable, and the UI feels trustworthy on both desktop and mobile.
- **Target Users**: First-time users computing a chart on mobile, users with slow devices, returning users comparing prashna readings, anyone producing a printable/exportable Kundli.

## Goals
- Improve responsiveness on Kundli and Prashna (especially viewports < 480px wide)
- Add or improve loading skeletons across both pages (result areas + per-section)
- Fix awkward empty states (first-load UX before any calculation is run)
- Align spacing, hierarchy, and visual rhythm

## Non-Goals
- Do not change any astrological calculation engine, chart math, dasha logic, BPHS rules, or ayanamsa.
- Do not modify routing or site navigation.
- Do not build brand-new top-level pages or features outside the two page surfaces.
- Do not alter the BirthChartPage component's existing typed state (`ChartResult`, `calculateChart` contract).
- Do not move on to Week 06 (Matchmaking + Panchang polish) unless explicitly instructed by the user (project hard constraint).

## Background & Context
Per `trae_detailed_weekly_plan.MD` Week 5 description:
> Focus on visible flow quality in the two most important user journeys. Goals: improve responsiveness, improve loading and empty states, reduce visual friction. Expected work: add or improve loading skeletons, fix awkward empty states, improve responsiveness on smaller screens, align spacing, hierarchy, and visual rhythm. Expected result: smoother, more credible core experiences.

Current state as of 2026-09-07:

### Kundli (BirthChartPage.tsx)
- Already has foundation from a "Week 5 Full polish rewrite" comment at the file top: LoadingSkeleton (1 variant), ChartEmptyState, ChartErrorState, ErrorBoundary, responsive `grid-cols-1 sm:grid-cols-2`, labeled inputs, aria-live on result area.
- Gaps identified in exploration:
  1. **Loading skeletal diversity**: The single `LoadingSkeleton variant="card" rows={6}` at line 340 stands in for the entire result area but the result display has a ChartSummaryBar (a 3-column summary tile row) plus a PlanetTable (tabular). One generic card skeleton does not visually preview the actual structure — users feel a jarring layout shift when data renders.
  2. **Share/Export absence**: The result section (lines 371-392) has no Print, PDF, or Share button. Project already contains a PDF generator (`vedicGaneshPDFGenerator.ts`) used in Index.tsx and other pages — Kundli should provide at minimum Print and "Share reading text" affordances to match the Prashna level of polish.
  3. **PlanetTable accessibility & bilingualism**: The table `<th>` headers (lines 66-71) are English-only ("Planet", "Sign", "House", "Nakshatra", "Pada", "Retro") even though the page already declares a typed `isHi` language state. Headers should be bilingual when Hindi is active.
  4. **Form label bilingual gap on Kundli**: 7 input section labels on BirthChartPage — Name, Date of Birth, Time of Birth, Latitude, Longitude, IANA Timezone, Place of Birth — are EN-only. This is the only remaining page in the Week-05 scope without bilingual form labels.

### Prashna (QuestionPage.tsx)
- Much richer content engine (UniversalPrasnaResearch → Form → 4-tab verdict card + PrasnaMargaMeters + Progeny card + EnhancedAnalysisPanel + ReadingHistory) but with multiple state-handling gaps.
- Gaps identified in exploration:
  1. **Missing loading skeleton for results**: Only a tiny inline button spinner (`Loader2`) at line 868 shows state during calculation. The entire result card block (lines 891-1433) collapses to `null` / nothing when `!result`. On slower devices users stare at blank space below the form with no indication the analysis is running. This is the single biggest trust-friction gap.
  2. **No empty-state component before first calculation**: When a user lands on `/question` and `!loading && !error && !result`, the only UI below the form is `PrasnaReadingHistory` (section 4, line 1437). Users have no call-to-action or hint about what they'll see.
  3. **Error UI lacks retry button**: Bare `Alert variant=destructive` at line 880-886 with no "Try again" action. Standardized `ChartErrorState` component exists but is not used.
  4. **Tabs overflow on narrow mobile**: `TabsList className="grid w-full grid-cols-4"` at line 960 has no `sm:` breakpoint. On 320–400px viewports, 4 equal tabs produce cramped, clipped, or overlapping tab triggers.
  5. **Classical Reading tab loading fallback is plain text**: Inside TabsContent value="classical" (lines 1167-1336) when `!classicalAnswer`, the fallback at line 1331-1335 shows a plain `<div>Loading classical reading...</div>` instead of a LoadingSkeleton placeholder previewing the 5-section structure that's coming.
  6. **Spacing rhythm inconsistency**:
     - ValidationInProgressNotice at line 542 has no bottom margin before UniversalPrasnaResearch at line 545 — they sit flush.
     - UniversalPrasnaResearch component (L545) and the Form Card (L548) have no gap — they butt directly against each other.
  7. **Stale absolute trust claim in birth prompt**: Anonymous-to-Jatak upgrade prompt at lines 818-822 claims: *"This yields up to **90% higher** predictive precision."* Per project_memory.md hard constraint ("soften trust claims / avoid absolute terms"), this absolute unsupported number must be softened to a conservative wording like "enables more complete analysis" or "produces a more complete and grounded reading."

## Functional Requirements
- **FR-1 — Kundli load skeletons diversified**: Kundli loading state must preview the actual structure: a 3-column summary row (ChartSummaryBar analogue) followed by a tabular skeleton (PlanetTable analogue).
- **FR-2 — Kundli export/print**: Kundli result view must expose a Print (native `window.print()`) action and at least one Share/Copy reading summary action to the clipboard. Buttons must be bilingual.
- **FR-3 — Kundli bilingual table + labels**: PlanetTable column headers and the Birth Details form `<Label>` elements must render Hindi text when `isHi` is true. Existing `font-hindi` class convention must be applied to Hindi labels and table headers.
- **FR-4 — Prashna result-area loading skeleton**: During `loading=true`, Prashna must render a structured skeleton (or a ChartLoadingState overlay with a clear message) in the results-panel region in lieu of the actual result card. The animated OM PageLoadingOverlay is acceptable for a full result-area loader.
- **FR-5 — Prashna empty state**: When `!loading && !error && !result`, a standardized `ChartEmptyState` (or visually equivalent) must appear in Section 3 with a clear call-to-action prompting the user to ask a question.
- **FR-6 — Prashna error retry**: Replace the bare Alert error block with `ChartErrorState` passing an `onRetry` handler that re-triggers the submitted analysis (or simply clears error + refocuses form).
- **FR-7 — Prashna responsive tabs**: The 4-item TabsList in the verdict card must break from `grid-cols-4` (desktop) to `grid-cols-2` or smaller on narrow viewports (<640px) to avoid overflow.
- **FR-8 — Prashna classical-tab skeleton loading**: Replace "Loading classical reading..." text with a structured LoadingSkeleton that previews the 5 numbered sections of the classical reading (Direct Answer, Reasoning, Timing, Risks, Remedies).
- **FR-9 — Spacing rhythm fix**: Add vertical margin separators between ValidationNotice → UniversalPrasnaResearch → Form on the Prashna page, and verify all section blocks have consistent `mb-6` or `space-y-6` rhythm.
- **FR-10 — Soften absolute trust claims**: Replace the absolute "up to 90% higher predictive precision" claim in the Anonymous birth prompt with a softer, evidence-appropriate phrase (no percentage numbers, no "precision" guarantees) in both languages.

## Non-Functional Requirements
- **NFR-1 TypeScript strict**: No `any` types without explicit justification.
- **NFR-2 Build passes**: `npm run build` must exit with code 0 after all changes.
- **NFR-3 Tailwind conventions**: Use existing Tailwind classes and patterns consistent with adjacent pages. Do not add custom CSS.
- **NFR-4 Mobile responsiveness**: Both pages must lay out without horizontal scroll bars at 360px × 640px and 480px × 800px viewports.
- **NFR-5 No new dependencies**: Reuse existing LoadingSkeleton/ChartEmptyState/ChartErrorState/ui primitives and lucide-react icons. Do not introduce new packages.
- **NFR-6 Bilingual parity**: Every new or changed UI string must have both English and Hindi variants paired with `isHi`/Hindi `font-hindi` class applied.

## Constraints
- **Technical**: React + Vite + Tailwind + shadcn/ui. TypeScript strict mode.
- **Business**: Soften absolute trust claims — avoid "Best", "Accurate", "Guaranteed", and any unsupported numeric precision claims like "90% higher" (per `project_memory.md` hard constraint "Soften marketing/trust claims").
- **Dependencies**: No new packages.

## Assumptions
- Existing `LoadingSkeleton` component (lines 27-123) supports variants "default", "card", "chart", and "table" and can be composed multiple times on one page.
- `ChartEmptyState` and `ChartErrorState` components are reusable on the Prashna page without modification (they accept title/description/icon props).
- Bilingual Hindi label translations for Kundli form fields can be reasonable domain-standard translations without further translator review.
- No actual PDF-generation contract is required for Kundli — native Print + Copy Share meet the requirement.

## Acceptance Criteria

### AC-1: Kundli loading skeletons preview result structure
- **Type**: `rule`
- **Given**: A user has submitted birth details and `isLoading=true` on `/kundli`
- **When**: The loading state renders
- **Then**: The loading area displays both a 3-column summary-tile skeleton (for ChartSummaryBar) AND a tabular-row skeleton (for PlanetTable) stacked vertically
- **Pass Condition**: BirthChartPage.tsx loading block contains at least one `LoadingSkeleton variant="table"` invocation plus either (a) three `LoadingSkeleton` blocks styled in a 3-column grid, or (b) a single LoadingSkeleton card + explicit grid of 3 summary tile skeletons using `Skeleton` primitive
- **Evidence**: Source code inspection of lines ~338-341 in BirthChartPage.tsx (or the new loading section)

### AC-2: Kundli result section exposes Print and Copy/Share actions
- **Type**: `rule`
- **Given**: A Kundli result has been computed and renders (ChartResult shown)
- **When**: The user scrolls through the ChartResult heading area
- **Then**: At least two buttons are visible: one labeled "Print / Save" (or Hindi equivalent) that calls `window.print()`, and one labeled "Share / Copy" (or Hindi equivalent) that writes a short chart summary to the clipboard and shows a transient "Copied" visual state
- **Pass Condition**: Result heading or action area contains two Button elements with `onClick` handlers — one for `window.print()`, one for `navigator.clipboard.writeText(...)` — both with bilingual labels via `isHi`
- **Evidence**: Source code inspection of the result section (around lines 375-392) in BirthChartPage.tsx

### AC-3: Kundli form labels + PlanetTable headers render Hindi when isHi true
- **Type**: `rule`
- **Given**: The page language is toggled to Hindi (`isHi === true`) on `/kundli`
- **When**: The Birth Details form and PlanetTable result are rendered
- **Then**: All 7 form labels (Name, DOB, TOB, Lat, Lon, TZ, Place) render in Hindi, and all 6 PlanetTable `<th>` headers (Planet, Sign, House, Nakshatra, Pada, Retro) render in Hindi with the `font-hindi` class
- **Pass Condition**: For each of the 7 labels and 6 table headers, the JSX contains a ternary `isHi ? "Hindi label" : "English label"` with `className` including `font-hindi` when Hindi renders
- **Evidence**: Source code grep for `isHi ?` in BirthChartPage.tsx Label and `<th>` elements, with ≥13 matching ternaries (7 labels + 6 headers)

### AC-4: Prashna results-area has a loading state skeleton
- **Type**: `rule`
- **Given**: The user has submitted a Prashna question and `loading === true`
- **When**: The section 3 results area renders
- **Then**: Either `ChartLoadingState` (with a calculating message) OR a composite LoadingSkeleton (card variant + rows) replaces the empty result block
- **Pass Condition**: QuestionPage.tsx section 3 area (around the `{result && ...}` block at lines 891-1434) also contains `{loading && (...)}` with either `<ChartLoadingState>` or `<LoadingSkeleton>` component rendered
- **Evidence**: Source code inspection of section 3 in QuestionPage.tsx

### AC-5: Prashna has a visible empty state before first calculation
- **Type**: `rule`
- **Given**: A first-time visitor lands on `/question` with no result yet, no error, and not loading
- **When**: The viewport shows area between Section 2 (form) and Section 4 (history)
- **Then**: A ChartEmptyState (or Empty primitive construct) with an icon, title, description, and potentially a hint prompts the user to complete the form
- **Pass Condition**: QuestionPage.tsx contains `{!loading && !error && !result && (<ChartEmptyState ... />)}` (or visually equivalent `<Empty>...</Empty>` construct) in section 3 area
- **Evidence**: Source code inspection of section 3 in QuestionPage.tsx

### AC-6: Prashna error block uses ChartErrorState with retry button
- **Type**: `rule`
- **Given**: The analysis produces an error state (`error !== null`)
- **When**: The error renders below the form submit area (or in section 3)
- **Then**: `ChartErrorState` component is used instead of the bare Alert, with a `onRetry` handler present that re-attempts submission or at minimum clears the error and refocuses the textarea question input
- **Pass Condition**: QuestionPage.tsx error JSX contains `<ChartErrorState message={error} onRetry={...}>` with `onRetry` being a valid callback
- **Evidence**: Source code grep for `<ChartErrorState` in QuestionPage.tsx, with `onRetry` prop present

### AC-7: Prashna 4-tabs TabsList breaks responsively at <640px
- **Type**: `rule`
- **Given**: The Prashna result verdict card tabs are rendered
- **When**: Browser viewport is <640px
- **Then**: TabsList has `grid-cols-2` (or `flex-wrap` / `sm:grid-cols-4`) instead of forcing 4 columns on all breakpoints
- **Pass Condition**: QuestionPage.tsx TabsList className (line 960) includes `grid-cols-2 sm:grid-cols-4` OR equivalent responsive pattern (e.g. `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` acceptable as long as narrow widths don't force 4)
- **Evidence**: Source code inspection + devtools responsive mode at 360px showing 2-column tabs

### AC-8: Prashna classical-reading-tab fallback uses structured LoadingSkeleton
- **Type**: `rule`
- **Given**: Prashna verdict is shown but `classicalAnswer` is still computing (result arrived but classical generation pending)
- **When**: User clicks to the "Classical Reading" tab
- **Then**: A structured LoadingSkeleton (or at least 5 stacked card/section variant skeletons) previews the 5 sections, instead of the plain text div
- **Pass Condition**: QuestionPage.tsx classical tab's `!classicalAnswer` fallback contains at least 3 distinct LoadingSkeleton invocations stacked (or 1 LoadingSkeleton with rows≥10) rather than plain text
- **Evidence**: Source code inspection of classical tab fallback lines (~1331)

### AC-9: Prashna vertical section spacing is consistently separated
- **Type**: `rule`
- **Given**: Full Prashna page is rendered top-to-bottom
- **When**: DOM flow of direct children inside max-w-5xl container (lines 504-1443) is inspected
- **Then**: Each of ValidationInProgressNotice → UniversalPrasnaResearch → Form Card → Section 3 results area → Section 4 history has ≥ mb-4 or explicit vertical gap between them
- **Pass Condition**: Each major child of the `.max-w-5xl` container has `className` including `mb-6` or equivalent; specifically ValidationInProgressNotice at line 542 is wrapped or modified with an `mb-6` class (or equivalent gap), and UniversalPrasnaResearch at L545 has bottom margin before the Form Card at L548
- **Evidence**: Source code inspection per DOM hierarchy

### AC-10: Stale absolute precision claim removed in Anonymous birth prompt
- **Type**: `rule`
- **Given**: Anonymous mode user triggers the birth-details prompt on Prashna
- **When**: Prompt body renders the paragraph at lines 818-822
- **Then**: Paragraph does NOT contain any absolute numeric percentage or "90%" or "predictive precision" wording in either language
- **Pass Condition**: Hindi + English prompt paragraphs contain neither "90%" nor percentages, nor precision guarantees. Both language versions use softer wording like "produces a more complete and grounded reading" or "enables deeper combined analysis."
- **Evidence**: Source code inspection of birth prompt paragraph in QuestionPage.tsx lines 818-822

### AC-11: Production build succeeds
- **Type**: `rule`
- **Given**: All implementation tasks complete
- **When**: `npm run build` is executed
- **Then**: Exit code 0; "✓ built in ..." line visible in terminal output last 10 lines
- **Evidence**: Terminal output from build command

### AC-U1: Overall perceived flow quality on Kundli + Prashna (rubric)
- **Type**: `rubric`
- **Dimension**: Smoothness & credibility across both journeys
- **Scale**: 1-5
- **Anchors**: 1 = blank areas visible in loading/error/empty on either page; 3 = all states handled but screens feel cramped on mobile or layouts noticeably shift; 5 = loading skeletons preview actual structure perfectly, empty states inviting, error state actionable, tab layout smooth responsive at 360px, consistent spacing rhythm top-to-bottom, no absolute trust claims
- **Pass Threshold**: ≥ 4
- **Evidence**: Visual walkthrough of `/kundli` + `/question` in desktop + 360px mobile viewports, traversing all states (empty → loading → result → error → retry)

### AC-U2: Mobile responsiveness of both pages at 360px (rubric)
- **Type**: `rubric`
- **Dimension**: Layout quality at 360×640 viewport
- **Scale**: 1-5
- **Anchors**: 1 = horizontal scroll or overlapping controls present on either page; 3 = readable but tight/awkward wrapping on at least one page; 5 = clean stacking, no overflow, inputs full width, buttons never clipped, tables scroll horizontally only when unavoidable and are wrapped with overflow containers
- **Pass Threshold**: ≥ 4
- **Evidence**: Browser responsive-mode inspection at 360px width

## Open Questions
None at this time. All scope items directly trace to the Week 5 plan and exploration findings.
