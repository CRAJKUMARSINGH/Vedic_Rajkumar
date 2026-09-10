# Week 05: Core polish for Kundli and Prashna - Implementation Plan

## Repository Research

### Current Architecture
- **BirthChartPage.tsx** (`src/pages/BirthChartPage.tsx`): Kundli calculation page with 7-field form, result area containing ChartSummaryBar (3-column tiles) + PlanetTable (6 cols, 9+ rows). Currently uses single `LoadingSkeleton variant="card" rows={6}` for loading state. No print/share actions, English-only labels.
- **QuestionPage.tsx** (`src/pages/QuestionPage.tsx`): Prashna interface with 4 sections — Header/Hero, UniversalPrasnaResearch, Form Card, Results Panel (4-tab TabsList), Reading History. Current gaps: no results-area loading skeleton, no empty state, bare Alert error inline, 4-tab grid overflows on <640px, classical tab uses plain text loading, section spacing inconsistent, birth prompt contains 90% precision claim.
- **Shared Components (all existing, no new files needed)**:
  - `ChartLoadingState`: Wraps PageLoadingOverlay with role="status" | Props: `message?`, `className?`
  - `ChartEmptyState`: Uses Empty/EmptyHeader pattern | Props: `icon?`, `title`, `description?`, `action?`, `className?`
  - `ChartErrorState`: Alert variant=destructive with Try Again button | Props: `message`, `onRetry?`, `className?`
  - `LoadingSkeleton`: Variants `card` | `table` | `chart` | `default` | Props: `rows?`, `variant?`, `className?`
  - `Button`, `Label` from shadcn/ui already imported in both pages
  - Lucide icons available: `Share2`, `MessageSquareQuote`, `Printer`, `HelpCircle`, `Star` already imported or available

### Constraints
- No new files — only edit existing BirthChartPage.tsx and QuestionPage.tsx
- Bilingual parity required: all new copy must have `isHi ? "HI" : "EN"` ternaries with `font-hindi` class on Hindi
- Build must pass: `npm run build` with TypeScript strict mode
- Do NOT proceed to Week 06 after completion

## Files and Modules
- `src/pages/BirthChartPage.tsx`: Tasks 1, 2, 3 (skeletons, actions, bilingual labels)
- `src/pages/QuestionPage.tsx`: Tasks 4, 5, 6, 7, 8, 9, 10 (loading/empty/error states, responsive tabs, classical skeletons, spacing, trust claim softening)
- No new component files needed — all shared state components already exist

## Implementation Steps

### Kundli (BirthChartPage.tsx)
1. **Task 1 - Diversify loading skeletons**: Replace lines 339-341 single card skeleton with `space-y-4` container holding (a) 3-column grid of inline animated tiles previewing ChartSummaryBar, (b) `LoadingSkeleton variant="table" rows={10}`. Preserve `mb-4` outer and aria-live container.
2. **Task 2 - Print + Share/Copy actions**: Add `copied` useState. Below PlanetTable (or right-align in header flex), add `flex flex-wrap justify-end gap-2` with two `Button variant="outline" size="sm"`:
   - Print/Save: `MessageSquareQuote`/`Printer` icon → `window.print()`
   - Copy/Share: `Share2` icon → writeText with structured summary + transient "Copied"/"कॉपी हुआ" state (1800ms setTimeout)
   Import required icons from lucide-react.
3. **Task 3 - Bilingual labels**: Convert all 7 `<Label>` children to isHi ternaries with `font-hindi` class. Convert all 6 `<th>` in PlanetTable thead to isHi ternaries with `font-hindi`. Hindi translations per spec:
   Labels: नाम, जन्म तिथि, जन्म समय (24 घंटे), अक्षांश (दशमलव), रेखांश (दशमलव), IANA समय क्षेत्र, जन्म स्थान
   Headers: ग्रह, राशि, भाव, नक्षत्र, पद, वक्री

### Prashna (QuestionPage.tsx)
4. **Task 4 - Results-area loading skeleton**: After Card Section 2 closing (L888), before `{result && (` block (L891), insert `{loading && (<ChartLoadingState message={...} />)}` with bilingual EN/HI message.
5. **Task 5 - ChartEmptyState pre-first-calculation**: Below loading block, before `{result && (`, insert `{!loading && !error && !result && (<ChartEmptyState ... />)}` with HelpCircle icon, bilingual title "No question analyzed yet"/"अभी कोई प्रश्न विश्लेषण नहीं हुआ", bilingual description with CTA hint.
6. **Task 6 - Replace bare Alert error with ChartErrorState**: Remove inline Alert at L880-886. Move error rendering into Section 3 results area (after empty state, before result block) as `<ChartErrorState message={error} onRetry={retryHandler} />`. Implement retryHandler: if question non-empty → `onSubmit(false)`, else → `setError(null)` + focus question textarea.
7. **Task 7 - TabsList responsive overflow**: L960 replace `grid w-full grid-cols-4` with `"grid grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-2 w-full"`. Verify Hindi labels don't clip; add `text-xs`/`whitespace-normal` on TabsTrigger if needed.
8. **Task 8 - Classical reading structured skeletons**: L1330-1336 replace plain text div with `space-y-4` container of 5 stacked `LoadingSkeleton variant="card"` blocks: rows={3}, rows={5}, rows={4}, rows={3}, rows={4} matching 5 sections. Wrap with role="status" aria-live="polite".
9. **Task 9 - Section spacing rhythm**: Wrap `<ValidationInProgressNotice>` (L542) in `<div className="mb-6">` if component doesn't accept className (wrap in div). Wrap `<UniversalPrasnaResearch/>` (L545) in `<div className="mb-6">`.
10. **Task 10 - Soften 90% trust claim in birth prompt**: L818-822 replace both EN and HI strings with conservative framing. EN: "Providing your birth details enables a combined Natal Chart + Gochar (Transit) analysis, producing a more complete and grounded reading. Would you like to enter your birth details?" HI per spec. No percentage numbers, no "precision" words.

### Build & Validation
11. **Task 11 - Production build**: Run `npm run build`, fix TS/lint/bundling errors from changed files, repeat until exit code 0 with "✓ built in …".

## Dependencies and Considerations
- Tasks 1-3 are independent of 4-10 (different files) — could be done in parallel but sequential is simpler
- Task 6 requires careful reading: error block moves location AND changes component
- Task 4/5/6 rendering order matters in Section 3: loading → error → empty → result
- Hindi `font-hindi` class must be on text wrapper; for `<Label>` and `<th>` apply on the element itself or an inner span
- Button size="sm" pattern from QuestionPage L1117-1126 should be reused exactly for Kundli actions
- Verify `isHi` variable exists in both pages — yes: BirthChartPage L129, QuestionPage L151

## Validation
- Visual inspection at 1024px: Kundli loading shows 3-tile skeleton + table skeleton; Prashna loading shows ChartLoadingState; Prashna empty shows ChartEmptyState; error shows ChartErrorState with retry
- Visual inspection at 360px: TabsList wraps to 2 columns without horizontal scroll; Hindi tab labels don't clip/overlap
- `npm run build`: exits 0 with "✓ built in"
- `npm run typecheck`: no TS errors
- Functionality: Copy button shows "Copied" state for ~1.8s; Print button triggers window.print(); Retry on error re-submits if question present; Birth prompt text has no digit percentages

## Risks
- **Risk: TabsTrigger Hindi text wrapping awkwardly at 360px** → Handle: add `text-xs shrink-0 min-w-0` or `whitespace-normal` to TabsTrigger if needed during visual check
- **Risk: ValidationInProgressNotice doesn't accept className** → Handle: wrap in div with mb-6 instead of passing className prop (safest approach regardless)
- **Risk: Missing lucide-react imports in BirthChartPage** → Handle: add Share2 and MessageSquareQuote/Printer to existing import line
- **Risk: ChartErrorState "Calculation Error" title is English-only** → Acceptable per existing ChartErrorState design; onRetry Try Again also English. Task says use component as-is, no requirement to change component internals
- **Risk: BirthChartPage result rendering needs lagna/moon/sun data for clipboard summary** → Handle: safely access with same find() pattern as ChartSummaryBar uses (L96-98), fallback to '—' if not found
