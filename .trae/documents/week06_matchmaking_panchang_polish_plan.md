# Week 06: Core polish for Matchmaking and Panchang - Implementation Plan

## Repository Research

### Architecture

**MatchMaking.tsx** (`src/pages/MatchMaking.tsx`):
- Header already claims "Week 6: Core Polish II" in comments but several polish patterns missing vs Weeks 4-5
- Has: LABELS[lang] bilingual dict, basic state hooks, `ValidationInProgressNotice` (no spacing wrapper), inline `ChartErrorState` (no smart retry), 1 single LoadingSkeleton variant=card rows=5, ChartEmptyState above Calculate button
- Structure: Header (logo + title + lang toggle) → Description → 36pt Green Ashtakuta notice bar → ValidationNotice → Error → Sample Button → 2 Partner Form Cards (grid lg:cols-2) → LoadingSkeleton → EmptyState → Calculate button → [branch] result has h2 heading + NewMatch btn + CompatibilityReportComponent
- Missing diversified loading skeleton matching CompatibilityReport structure (partner cards + score circle + 8 category rows)
- Empty state renders AT SAME TIME as loading (both true when !report + loading) — should be mutual exclusivity precedence
- No Print/Copy actions in results section (Kundli Task 2 pattern missing)
- Retry handler on ChartErrorState only calls setInlineError(null), not smart re-submission when fields are populated
- Green 36-pt notice and ValidationNotice both lack mb-6 spacing wrappers

**PanchangPage.tsx** (`src/pages/PanchangPage.tsx`):
- Header claims "Week 5" — needs Week 6 lift to Week 4-5 standard
- Has: 10-city coords dict, date + city controls card, Suspense→PanchangCard, ErrorBoundary with ChartErrorState
- Structure: Header (emoji + title lang toggle + Home Link) → ValidationNotice (no mb-6) → Controls card (date+city, grid cols sm:cols-2) → role=region aria-live result area
- Loading fallback (Suspense): flat LoadingSkeleton variant=card rows=6
- Missing: ChartEmptyState for when PanchangCard returns null data fallback card
- Missing: Print/Copy summary actions (Kundli pattern)
- TabsList inside PanchangCard (3 cols) will overflow Hindi labels on < 640px same as QuestionPage
- Header subtitle "Tithi • Nakshatra • Yoga • Karana • Vara" is English-only even when isHi

**Shared Components (all pre-existing, no new files needed)**:
- `LoadingSkeleton`: variants card | table | chart | default, rows?
- `ChartErrorState`: message + optional onRetry callback + className
- `ChartEmptyState`: icon? + title + description? + action? + className
- `Button` variant=outline size=sm pattern from Kundli/QuestionPage actions
- `Share2`, `MessageSquareQuote`, `Printer`, `HelpCircle` from lucide-react (already in bundle)

### Constraints
- No new files
- MatchMaking LABELS dict is complete bilingual (no HI missing); PanchangPage mostly uses inline isHi ternaries
- Must pass `npm run build` exit 0 with strict TS
- Stop at Week 6, NO Week 7

## Files and Modules
- `src/pages/MatchMaking.tsx`: State rendering precedence, diversified skeleton, spacing wrappers, action buttons, smart retry
- `src/pages/PanchangPage.tsx`: Spacing wrapper, diversified skeleton, ChartEmptyState fallback, responsive TabsList in card
- `src/components/PanchangCard.tsx`: Bilingual header subtitle fix, responsive 3-tab TabsList overflow

## Implementation Steps

### Matchmaking (MatchMaking.tsx)
1. **State rendering precedence (fix loading+empty overlap)**: Lines 334-413 `!report` ternary branch: inside `<section>`, re-order contents so they follow exact precedence pattern: `{loading && <Skeleton/>}` → `{!loading && inlineError && <ChartErrorState/>}` → `{!loading && !inlineError && <ChartEmptyState/>}`. Remove the current `!loading &&` guard on ChartEmptyState line 380 and error wrapper guards to cleanly mutualize them. Error stays above form cards as it currently is (L326-332 correct).
2. **Diversified loading skeletons previewing CompatibilityReport**: Replace flat LoadingSkeleton variant=card rows=5 at L375-377 with `space-y-4` container of: (a) 2-column grid of `animate-pulse h-[90px] rounded border border-border` tiles previewing Partner Info cards; (b) `animate-pulse h-[140px] rounded-xl border border-border bg-muted/30` previewing Overall Score circle+text; (c) `LoadingSkeleton variant="card" rows={8}` previewing 8 Ashtakuta category rows. Wrap in aria-live polite role=status div.
3. **mb-6 spacing on notice bar and ValidationNotice**: Wrap 36-pt green Ashtakuta system notice (L307-321) in `<div className="mb-6">`; ValidationNotice L323 wrap in `<div className="mb-6">` like QuestionPage Task 9 pattern.
4. **Smart ChartErrorState retry handler**: Replace `onRetry={() => setInlineError(null)}` with `onRetry={handleRetry}`. Add handleRetry function after handleNewMatch: check if all 8 partner fields non-empty → if yes, call `void handleCalculate()`; else → `setInlineError(null)` + focus on `male-name` Input (ref needed). Add maleNameRef useRef, attach to name input of PartnerForm via optional forwarded ref or simple effect via document.getElementById fallback if PartnerForm doesn't accept refs.
5. **Print + Copy/Share Matchmaking result actions**: After `CompatibilityReportComponent` at L447-452, add `flex flex-wrap justify-end gap-2 mb-6` with 2 Button variant=outline size=sm: (a) `MessageSquareQuote` icon → `window.print()`, label EN="Print Report" HI="रिपोर्ट प्रिंट करें"; (b) `Share2` icon → writeText with structured summary (partner names, DOBs, totalPoints/maxPoints, overallCompatibility, percentage), transient "Copied"/"कॉपी हुआ" label (1800ms), copied useState hook + handleCopyReport async handler.

### Panchang (PanchangPage.tsx + PanchangCard.tsx)
6. **mb-6 spacing on ValidationNotice**: PanchangPage L99 ValidationNotice wrap in `<div className="mb-6">`.
7. **Diversified Panchang Suspense fallback skeleton**: PanchangPage L163-168 replace Suspense fallback contents with: (a) `animate-pulse h-[60px] rounded-t-xl border-b border-border` previewing header with title + PDF button area; (b) `animate-pulse mt-4 h-[36px] rounded-md bg-muted mx-auto w-full max-w-md` previewing 3-tab TabsList; (c) 3-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4) of 3 animate-pulse h-[130px] rounded-xl border border-border cards previewing Tithi/Nakshatra/Yoga section cards; (d) animate-pulse h-[90px] mt-4 rounded-xl border border-border previewing Sunrise/Sunset time strip. Wrap in `role="status"` container with aria-label for screen readers. Keep LoadingSkeleton variant=card for the lowest fallback line too.
8. **ChartEmptyState for null panchang data in ErrorBoundary**: After Suspense block inside ErrorBoundary children, conditional: if Suspense resolves but PanchangCard returns null card, wrap PanchangCard inside helper div OR keep it. Actually ErrorBoundary fallback handles crashes. For the "empty but loaded" case: inside PanchangCard component itself, when buildDisplayData returns null → already renders null card. But PanchangCard L151-161 renders plain `text-center text-muted-foreground`. Replace THAT inner block with `<ChartEmptyState icon={<Calendar className="h-8 w-8" />} title={isHi ? 'पंचांग डेटा उपलब्ध नहीं है' : 'Panchang data not available'} description={isHi ? 'अलग दिनांक या शहर का प्रयास करें।' : 'Try a different date or city.'} />`. Import Calendar/ChartEmptyState from components if missing inside PanchangCard.
9. **Responsive 3-tab TabsList overflow fix inside PanchangCard**: PanchangCard L228 replace `grid w-full grid-cols-3` with `"grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-2 w-full"`. Each TabsTrigger: add `text-xs sm:text-sm shrink-0 min-w-0 whitespace-normal` to prevent Hindi labels ("पंचांग", "मुहूर्त", "त्योहार") from clipping/overflowing on narrow widths.
10. **Bilingual Panchang header subtitle bullet list**: PanchangPage L74-78 `<p className="text-xs text-muted-foreground">` change to ternary: when isHi → "तिथि • नक्षत्र • योग • करण • वार" (Hindi script bullets matching Kundli's bilingual label set); when !isHi → existing English. Add `{isHi ? 'font-hindi' : ''}` className on p element.

### Build & Validation
11. **Production build + typecheck on changed files**: Run `npm run build`, then `npm run typecheck`. Fix ONLY errors from changed files. Pre-existing errors in other files are ignored per Task 11 rule. Repeat build until "✓ built in …" with exit 0.

## Dependencies and Considerations
- MatchMaking: all 3 state visuals (loading/empty/error) must be mutually exclusive — this is the critical correctness fix over current code
- PanchangCard: ChartEmptyState import path '@/components/ChartEmptyState' — verify PanchangCard already has access to component imports (it does via '@/components/ui/*' same pattern)
- PanchangCard TabsList change is inside lazy-loaded component — will not increase main bundle size
- MatchMaking handleRetry maleNameRef: PartnerForm takes idPrefix, so we can use `document.getElementById('male-name')?.focus()` (no forwardRef needed)
- MatchMaking CompatibilityReport actions: position matters — below report container, right-aligned (matches Kundli L443 position pattern)

## Validation
- **Visual @1024px MatchMaking loading**: 2 partner-card tiles preview + 1 tall score circle preview + 8 category card skeleton rows; NOT single flat card.
- **Visual @1024px Panchang loading**: 1 header strip + 1 short tab bar + 3 grid cards + 1 sunrise time strip skeleton visible during lazy import; NOT single 6-row card.
- **Visual @360px PanchangCard**: TabsList renders vertically stacked 3-rows-1-col, Hindi labels wrap without clipping (no horizontal overflow).
- **Visual @360px MatchMaking**: PartnerCards grid-cols-1 (existing), loading skeleton col-1 (new 2-col preview will also collapse to col-1 below lg).
- **Logic test - MatchMaking**: While loading, ChartEmptyState NOT visible; on error retry all fields non-empty → re-triggers calculate; empty fields → clears error, focuses name.
- **`npm run build`**: exit 0, "✓ built in Xs"
- **Functionality**: MatchMaking Print/Copy buttons show copied state; Panchang subtitle displays Hindi bullets on Hindi.

## Risks
- **Risk: PartnerForm doesn't expose ref for focusing** → Handle: use `document.getElementById('male-name')` with idPrefix.
- **Risk: PanchangCard lazy-loaded with Suspense fallback, animate-pulse grid layout breaks** → Handle: use same responsive breakpoint classes (md/lg) as real cards, fallback to mobile stack.
- **Risk: ChartEmptyState imported in PanchangCard causes circular import** → Handle: '@/components/ChartEmptyState' is plain tsx component with no PanchangCard import, no circular.
- **Risk: Build fails if ChartEmptyState missing className support** → Confirm via prior use: component signature DOES accept className prop (confirmed used in MatchMaking L385).
