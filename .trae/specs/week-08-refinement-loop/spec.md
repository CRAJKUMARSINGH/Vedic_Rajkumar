# Week 08: Refinement Loop - Product Requirements Document

## Overview
- **Summary**: Apply feedback-driven cleanup across all recently implemented UI flows from Weeks 5, 6, and 7. Standardize inconsistent labels, simplify confusing terminology, remove interaction friction, smooth awkward UI behavior, and clarify helper text across Family Profiles, Transit Timeline, Comprehensive Report, Matchmaking, Panchang, Horoscope, and Prashna Engine pages.
- **Purpose**: Per `trae_detailed_weekly_plan.MD` Week 8 directive: "Reduce confusion, simplify labels and flows, remove friction from recent changes, revise labels and helper text, simplify interactions based on test or pilot feedback, smooth out awkward UI behavior." Produce a cleaner user experience without major engineering overhead.
- **Target Users**: First-time users navigating the app's core journeys (Kundli, Prashna, Matchmaking, Panchang) plus power users experimenting with the newer Family Profiles, Transit Timeline, and Comprehensive Report features. Includes both English and Hindi-speaking users on desktop and mobile (<=390px viewports).

## Goals
1. **Label Consistency**: Standardize FamilyProfileSelector trigger labels, action button wording, and form field helper text across every page that adopted the Week 5-7 patterns.
2. **Friction Removal**: Eliminate the biggest workflow annoyances: missing language toggle on Enhanced Kundli Milan, Family Profile selectors without groom/bride context, unlabeled advanced fields, and terminology that assumes deep astro-jargon fluency.
3. **Confusion Reduction**: Replace astro-jargon ("Native", "Lagna", Dasha labels without plain-language hints) with approachable text or add inline tooltips so casual users understand what the UI is asking for.
4. **Pattern Parity**: Bring Week 6-7 pages (Horoscope, Matchmaking, Panchang, Transit Timeline, Comprehensive Report) up to the same Week 5 interaction standard — specifically the Print/Copy action pattern and explicit empty-state hints.
5. **Visual Smoothness**: Soften over-alarming status indicators (capacity warnings) and ensure scaffold/mock disclaimers are visible early rather than buried at page bottoms.

## Non-Goals
- **No engine changes**: Do not modify any astrological calculation, Vimshottari logic, Ashtakavarga rules, ayanamsa, or ephemeris behavior. Engine correctness remains outside Trae scope.
- **No new top-level features**: Do not create new routes, new pages, or new major components. Refinement only — every change touches an existing file from Weeks 5-7.
- **No Supabase persistence for Family Profiles**: localStorage-first architecture stays unchanged; do not add auth-gated storage.
- **No new npm packages**: Reuse existing Tailwind classes, `@/components/ui/*`, lucide-react icons, and `ChartEmptyState/ChartErrorState/LoadingSkeleton` primitives.
- **No scope creep into Week 09+ work**: Do not implement PDF engines, harden scaffold data, build the validation dashboard, or design remedy flows. Stop at Week 08.

## Background & Context
Weeks 5, 6, and 7 delivered significant UI scaffolding and polish:
- **Week 5** (Kundli + Prashna): Established the baseline standard — diversified loading skeletons, empty states, error states with retry, bilingual labels, Print/Copy actions, responsive tab grids, softened trust claims. Finalized at BirthChartPage.tsx and QuestionPage.tsx.
- **Week 6** (Matchmaking + Panchang): Applied the Week 5 pattern to MatchMaking.tsx and PanchangPage.tsx/PanchangCard.tsx — state mutual exclusivity, diversified skeletons, spacing rhythm, bilingual subtitles, responsive 3-tab grids, empty state inside PanchangCard.
- **Week 7** (Feature Scaffolding): Shipped three new scaffold features — Family Profiles (`FamilyProfilesPage.tsx`, `FamilyProfileForm.tsx`, `FamilyProfileSelector.tsx`, `useFamilyProfiles.ts`), Transit Timeline (`TransitTimelinePage.tsx`), and Report Shell (`ReportShell.tsx`, wired into `ComprehensiveReportForm.tsx`). Integrated `FamilyProfileSelector` into 4 new pages per FR-1: HoroscopePage, PrashnaEngine, EnhancedKundliMilan, ComprehensiveReportForm.

Gaps discovered during exploration (these are the Week 08 targets):

### Family Profile Label Chaos
- Trigger labels are inconsistent across 9 page instances:
  - BirthChartPage, MatchMaking, QuestionPage → uses `triggerLabel={isHi ? 'परिवार प्रोफ़ाइल' : 'Family Profile'}`
  - HoroscopePage → same label BUT placed in header without helper text
  - ComprehensiveReportForm → `triggerLabel={t.loadProfile}` — "Load Profile" is ambiguous without the "Family" keyword
  - PrashnaEngine → `triggerLabel="Load Profile"` — no "Family", no Hindi
  - EnhancedKundliMilan → selectors exist in state but NO DOM render at all (code exists but never rendered to UI)
  - MatchMaking → selectors exist but no visible Male/Female labels indicating which selector belongs to whom

### EnhancedKundliMilan — Major Parity Gaps
- **Zero language toggle**: `EnhancedKundliMilan.tsx` is the only major core page without EN/HI toggle. All labels, placeholders, buttons, errors are English-only despite the rest of the app being bilingual.
- **Wrong theme**: Dark navy `#0f1420` theme + white text while every other Week 5-6-7 page uses the standard light Tailwind theme (`bg-background`, `text-foreground`). Users switching between MatchMaking (/matchmaking) and Enhanced Kundli Milan (/enhanced-matchmaking) experience a jarring theme flip.
- **Family Profile selectors never rendered**: Lines 230-246 define `handleGroomProfileSelect` and `handleBrideProfileSelect` but there's zero JSX that renders the two `FamilyProfileSelector` buttons. This is a Week 7 FR-1c violation — shipped in state but not in UI.

### Jargon in User-Facing Labels
- **PrashnaEngine L116**: "Optional Native Birth" — "Native" is astrologer jargon for "the person asking the question." General users think it means "indigenous" or "built-in."
- **PrashnaEngine L217**: "Calculating Prashna Lagna" — "Lagna" is Sanskrit. Casual users won't know it means "Ascendant/Rising Sign."
- **ComprehensiveReportForm L128-L133**: Fields `moonSign`, `ascendant`, `marsHouse`, `saturnPosition`, `rahuHouse`, `ketuHouse` ask users to manually input values that should be calculable from Name+DOB. No hint that these are optional or that a Kundli calculation would normally provide them.
- **ComprehensiveReportForm L119**: Report type labels are inconsistent: "Manglik Yoga Only", "Sade Sati Only", "Kaal Sarp Yoga Only", "Career Only" — "Yoga Only" suffix appears on 2/4 options but not the other 2/4.

### Helper Text Confusion
- **FamilyProfileForm L59**: `birthPlaceHelper` says "Start here — city name usually determines timezone and coordinates" — but Birth Place is the LAST field in the visual form (after Lat, Lon, Timezone). Telling users to "start here" when it's at the bottom is actively confusing.
- **FamilyProfileForm L47**: `birthTimeHelper` says "If unknown, leave blank — approximate sunrise is used for charts." This is technically true but alarming because users don't understand the *impact*. Sunrise-approx charts are less accurate. Rephrase to be honest but reassuring.
- **TransitTimelinePage L113 vs L131**: Two semantically overlapping range labels exist — `rangeMonths` ("Timeline length") and `viewRange` ("Zoom"). Users will think these are the same control. `viewRange` should become "Zoom to focus" or "Quick view window" to disambiguate.
- **TransitTimelinePage L132-133**: `trackEngineProgress` string is English-only even in Hindi mode (`trackEngineProgressHi` is defined but never actually used in the rendered JSX).
- **PanchangPage**: 10-city hardcoded dropdown (Delhi, Mumbai, … Varanasi) with no helper text. Users in Chennai get results; users in Patna or Lucknow stare at the dropdown wondering why their city is missing.

### Missing Pattern Parity (Week 5 standards not applied)
- **HoroscopePage**: No Print/Copy actions. Week 5 added these to Kundli (BirthChartPage) and they should be mirrored for Horoscope (the /horoscope route, which is the actual "Kundli" in the nav).
- **MatchMaking empty state**: Line 76 empty description says "Fill in both partners' birth details above…" but never mentions the Family Profile shortcut that would save them 8 fields of typing. Empty state should advertise the shortcut.
- **TransitTimelinePage scaffold disclaimer**: Buried at the very bottom of the page after the result grid. Because the generator runs and produces a colorful, legitimate-looking chart, a user might trust it as real data. A scaffold banner at the TOP of the result section (next to the legend) is needed.
- **ComprehensiveReportForm Family Profile**: `handleProfileSelect` (L220) only fills Name + Birth Date from the family profile. Users expect it to also fill Moon Sign, Ascendant, Mars House etc. — but these need a kundli calculation. The gap is the UX doesn't explain what WAS filled vs what WASN'T. An inline status badge after selection is needed.

### Over-Alarming Status
- **FamilyProfilesPage L382-395**: Capacity notice when user hits MAX_PROFILES (10) uses an amber/red warning palette (`border-amber-300 bg-amber-50 text-amber-800` + `variant="destructive"` on the count badge). A max-profiles informational notice is not an error condition and shouldn't use destructive/warning colors. Soften to `variant="secondary"` neutral palette with an informational tone.

### ComprehensiveReportForm — Friction by Omission
- User selects a Family Profile → only Name + DOB populate. User has no idea the other 6 fields (Moon Sign → Ketu House) still need manual entry because no indicator appears. After selection, show a small inline banner: "Name & Birth Date loaded. For automatic Moon Sign / Ascendant fill, first compute on Kundli page (coming soon)."
- The 6 advanced astrology fields (Moon Sign through Ketu House) have no "(optional)" tags. Given that `generateManglikReport` etc. have `if (marsHouse)` guards, these are genuinely optional when report type doesn't require them. Add visible "(optional)" suffix to every advanced field.

## Functional Requirements

### FR-1: Family Profile Selector Label Standardization
- **FR-1a**: Every `FamilyProfileSelector` instance across ALL pages must use the same trigger label pattern: `triggerLabel={isHi ? 'परिवार प्रोफ़ाइल' : 'Family Profile'}` (pages that already use `lang`/`isHindi` state map accordingly).
- **FR-1b**: MatchMaking page — wrap each of the two selectors in a labeled section (Male / पुरुष for the first, Female / महिला for the second) so it's obvious which profile belongs to whom.
- **FR-1c**: EnhancedKundliMilan page — render the two FamilyProfileSelector instances that currently exist only in state (handleGroomProfileSelect / handleBrideProfileSelect). Label them clearly (Groom / दूल्हा for first; Bride / दुल्हन for second). Add the missing EN/HI language toggle to this page.
- **FR-1d**: PrashnaEngine — change trigger label from "Load Profile" to the standard "Family Profile" and pass correct `lang` prop (page currently lacks `lang` state; add a simple toggle mirroring HoroscopePage's pattern).

### FR-2: Astro-Jargon Simplification with Inline Clarifications
- **FR-2a**: PrashnaEngine "Optional Native Birth" section header label → replace "Native" with "Question Asker (your birth info)" in both EN and HI. Keep the existing helper line at L132-134 which explains the context-only caveat, but move it to be directly below the header so users see it before reading further.
- **FR-2b**: PrashnaEngine loading heading "Calculating Prashna Lagna" → append a parenthetical plain-language explanation: EN "(Ascendant for this moment)" / HI "(इस क्षण का लग्न)".
- **FR-2c**: ComprehensiveReportForm — add visible "(optional)" / "(वैकल्पिक)" suffix badge to the 6 advanced astrology fields: Moon Sign, Ascendant, Mars House, Saturn Position, Rahu House, Ketu House. Use the existing `t.optional` pattern.
- **FR-2d**: ComprehensiveReportForm — standardize Report Type option labels so every option follows the same suffix convention: remove "Yoga" from the two options that have it, or add it to the two that don't. Use consistent pattern: "Manglik Only", "Sade Sati Only", "Kaal Sarp Only", "Career Only" OR keep "Yoga" suffix on all dosha-related + add "Analysis" to Career (choose one consistent pattern). Apply both EN and HI labels.

### FR-3: Helper Text Rewrite for Order & Clarity
- **FR-3a**: FamilyProfileForm — rewrite `birthPlaceHelper` from "Start here — …" to a location-agnostic statement since BirthPlace is last in the form: EN "We'll use city to suggest timezone later. Coordinates are optional if unknown." / HI "शहर से समय क्षेत्र सुझाया जाएगा। निर्देशांक अज्ञात होने पर वैकल्पिक हैं।"
- **FR-3b**: FamilyProfileForm — rewrite `birthTimeHelper` to state impact honestly without being alarming: EN "If unknown, leave blank. A chart will still generate using sunrise time, which is less precise for ascendant-sensitive readings." / HI "अज्ञात होने पर खाली छोड़ें। सूर्योदय समय से चार्ट बनेगा, जो लग्न-आधारित पढ़ाई के लिए कम सटीक है।"
- **FR-3c**: TransitTimelinePage — disambiguate the two range controls by renaming `viewRange` label string: EN from "Zoom" → "Zoom (focus window)"; HI from "ज़ूम" → "ज़ूम (फोकस विंडो)". Update the `viewRangeHelper` to explicitly say it does NOT re-calculate.
- **FR-3d**: TransitTimelinePage — ensure the "Track engine progress" link actually uses `trackEngineProgressHi` when `isHi` is true (currently renders the EN string in both modes).
- **FR-3e**: PanchangPage — add a 1-line helper text below the City `<select>` dropdown: EN "Pre-set list of 10 major Indian cities." / HI "10 प्रमुख भारतीय शहरों की पूर्व-सेट सूची।"

### FR-4: Print/Copy Pattern Parity (Week 5 standards)
- **FR-4a**: HoroscopePage — after the HoroscopeCard renders in the result branch, add a right-aligned `flex flex-wrap justify-end gap-2 mb-6` action bar containing: (a) Print button calling `window.print()` with EN/HI labels, (b) Copy Summary button calling `navigator.clipboard.writeText(...)` with a transient "Copied"/"कॉपी हुआ" state. Mirror the exact Week 5 BirthChartPage button pattern (variant="outline", size="sm", Printer + Share2 icons).
- **FR-4b**: MatchMaking empty-state description — append a second sentence mentioning the shortcut: EN "Tip: Use the Family Profile buttons above each form to auto-fill in one click." / HI "सुझाव: प्रत्येक फॉर्म के ऊपर परिवार प्रोफ़ाइल बटन से एक क्लिक में स्वयं भरें।"
- **FR-4c**: TransitTimelinePage — move the scaffold disclaimer (the banner that links to `/accuracy`) from page-bottom to be rendered directly inside the result area as the FIRST child (before the legend or timeline grid). Keep a compact version also at the bottom as-is for post-read context. Apply standard `bg-violet-50 dark:bg-violet-950/20 border-violet-200` informational coloring, not destructive or warning palette.

### FR-5: Visual Tone Softening & Feedback Indicators
- **FR-5a**: FamilyProfilesPage — at-capacity notice (lines 382-395): swap destructive `Badge variant="destructive"` for neutral `variant="secondary"`, swap amber warning border/background palette for standard muted informational palette (bg-muted/60 + text-foreground/80 + border-border). Rewrite copy to be lighter: EN remove "You've reached the maximum of" → "You've used all" + remove exclamation urgency.
- **FR-5b**: ComprehensiveReportForm — after user selects a Family Profile, render an inline status chip/line directly below the selector for 4-5 seconds (or persistently) showing: EN "✓ Name & Birth Date loaded. Advanced fields (Moon Sign, Ascendant) require a Kundli calculation to auto-fill." / HI "✓ नाम और जन्म तिथि लोड हो गई। उन्नत फ़ील्ड (चंद्र राशि, लग्न) के लिए कुंडली गणना आवश्यक।" Use `Badge variant="secondary"` + muted text styling.

### FR-6: EnhancedKundliMilan Theme Normalization
- **FR-6a**: Replace the dark `#0f1420` navy theme and text-white styling across EnhancedKundliMilan's `PersonCard`, `CitySearch`, and page wrapper components with the project standard light theme tokens: `bg-background text-foreground border-border rounded-2xl bg-card shadow-sm` — matching exactly what MatchMaking.tsx uses for its PartnerForm cards.
- **FR-6b**: Add a complete EN/HI language toggle to EnhancedKundliMilan (top-right header region as on MatchMaking). Add EN/HI bilingual dictionary object `LABELS = { en: {...}, hi: {...} }` covering: page title, subtitle, Full Name, Day, Month, Year, Hour, Minute, AM/PM labels, Place of Birth, calculate button text, loading text, error messages. Apply `isHi ? 'font-hindi' : ''` class to every label/button affected.
- **FR-6c**: Re-render the existing FamilyProfileSelector handlers (groom + bride) in the DOM above their respective PersonCards with Groom/Bride labels, mirroring the MatchMaking FR-1b layout pattern.

## Non-Functional Requirements
- **NFR-1: TypeScript strict**: Zero new `any` types. All touched components compile with `tsc --noEmit` passing.
- **NFR-2: Mobile layout**: Every touched page must remain fully scrollable and usable at 360×640 viewport without horizontal overflow. Touch targets ≥40px.
- **NFR-3: Zero new dependencies**: Reuse only existing packages (Tailwind, shadcn/ui, lucide-react, react-router-dom).
- **NFR-4: Build passes**: `npm run typecheck`, `npm run lint`, and `npm run build` must all exit with code 0.
- **NFR-5: Bilingual parity**: Every new or changed UI string MUST have paired English + Hindi translations, with `font-hindi` class applied to rendered Hindi text.
- **NFR-6: No file creation unless unavoidable**: All edits should happen inside existing files. Refrain from creating new components unless the week's scope literally cannot be met without one (expected: 0 new files).

## Constraints
- **Technical**: React 18 + Vite + Tailwind + shadcn/ui + lucide-react + react-router-dom. TypeScript strict mode. No CSS files or custom CSS.
- **Business**: Scaffold content must continue to explicitly carry disclaimers (do not remove existing ones; we're only adding/relocating for clarity).
- **Business**: Softened trust claims constraint from project_memory applies — do not add any numeric accuracy claims (e.g. "80%") or absolute superlatives ("Best", "Guaranteed").
- **Dependencies**: Family profile data access uses ONLY `useFamilyProfiles` / `getProfileById` / `validateProfile` from existing files. Do not add Supabase calls.

## Assumptions
- `EnhancedLanguageToggle` component already accepts all props we need (`currentLang`, `onChange`, `showRegion`, `autoDetect`) — this is verified in HoroscopePage, ComprehensiveReportPage, and PanchangPage usage. No changes needed inside the toggle component itself.
- `ReportShell.Section collapsible` prop already exists in ReportShell.tsx. If it doesn't, we add it as a simple Boolean gate on chevron + collapsed state inside the existing ReportShell component only if ComprehensiveReportForm needs it. Otherwise no ReportShell changes are in Week 08 scope.
- `toast()` hooks on PrashnaEngine / MatchMaking remain English-only unless we're already touching that exact line for another reason. We do not expand bilingual scope to toasts unless trivial (<2 line change).
- `PanchangCard` internal 3-tab list overflow: already fixed per Week 6 to `grid-cols-1 sm:grid-cols-3`. We only add the city helper text to the page wrapper, not inside PanchangCard. If the fix is missing at implementation time, we apply the Week 6 responsive pattern as part of FR-3e.
- The existing Horoscope page renders its birth result via lazy `HoroscopeCard`. Copy summary for horoscope will be a lightweight string summary of `rawBirth` (date + time + location + moon sign display name if accessible). If HoroscopeCard does not expose moon sign as a prop, we fall back to summarizing the raw birth data only without crashing.

## Acceptance Criteria

### AC-1: FamilyProfileSelector uses standard label everywhere
- **Type**: `rule`
- **Given**: App is built and running, and a user visits /horoscope, /prashna-ai, /enhanced-matchmaking, /comprehensive, /kundli, /question, /matchmaking, /dasha, /dasha-transit, /transit-timeline
- **When**: They look at any FamilyProfileSelector trigger button label
- **Then**: Every visible trigger label text follows the standard pattern ("Family Profile" in English, "परिवार प्रोफ़ाइल" in Hindi) with NO shorthand variants like "Load Profile" or missing "Family" keyword
- **Pass Condition**: Grep for `<FamilyProfileSelector` across all source files — every invocation with an explicit `triggerLabel` prop uses the standard EN/HI strings, and invocations without explicit prop rely on `SELECTOR_LABELS[lang].defaultTrigger` which is already the standard label. Zero occurrences of `"Load Profile"` as a triggerLabel.
- **Evidence**: Source grep output + DOM inspection of all 4 core pages (Horoscope, PrashnaEngine, EnhancedKundliMilan, ComprehensiveReportForm) showing the trigger labels.

### AC-2: EnhancedKundliMilan has EN/HI toggle + standard light theme + groom/bride selectors visible
- **Type**: `rule`
- **Given**: User opens `/enhanced-matchmaking`
- **When**: They look at page header, form cards, language controls
- **Then**: (1) A visible EN/HI language toggle exists in the header; toggling switches labels between English and Devanagari with font-hindi applied. (2) All PersonCard / CitySearch / page wrapper components use the standard Tailwind light theme (bg-background, text-foreground, border-border) instead of dark navy. (3) Two FamilyProfileSelector buttons are rendered in DOM, one labeled Groom/दूल्हा, one labeled Bride/दुल्हन, above their respective PersonCards.
- **Pass Condition**: Source inspection of EnhancedKundliMilan.tsx shows (a) LABELS dict with en+hi keys, (b) EnhancedLanguageToggle import+render with lang state setter, (c) theme classes replaced with Tailwind default tokens on PersonCard+CitySearch wrappers, (d) two JSX `<FamilyProfileSelector ... />` calls inside the page form before each PersonCard, each wrapped in a labeled section or prefixed with Badge heading.
- **Evidence**: Source code diff + DOM render at 360px.

### AC-3: Astro-jargon labels simplified or annotated with plain language
- **Type**: `rule`
- **Given**: PrashnaEngine in loading state AND ComprehensiveReportForm form fields visible AND PrashnaEngine "Optional Native Birth" section header visible
- **When**: Reading the header and loading text of Prashna + form labels of Comprehensive Report
- **Then**: (1) "Native" word removed from Prashna section header, replaced with language meaning "Question Asker" or "Your birth info". (2) "Calculating Prashna Lagna" has a parenthetical "(Ascendant for this moment)" in English + Hindi equivalent. (3) All 6 advanced astrology fields in ComprehensiveReportForm display an (optional) / (वैकल्पिक) suffix badge or inline note. (4) Report Type dropdown options use consistent suffix patterns (no arbitrary "Yoga Only" vs "Only" mixing).
- **Pass Condition**: Source grep of PrashnaEngine for "Native" returns zero in UI strings. Source grep of loading heading contains string "Ascendant" or its Hindi equivalent. Source grep of ComprehensiveReportForm Label elements for the 6 advanced fields each contain `t.optional` or explicit (optional) suffix text in ternary. Source of Report Type options shows identical naming pattern across all options.
- **Evidence**: Source inspection of the two files.

### AC-4: Helper text matches control position and disambiguates overlapping concepts
- **Type**: `rule`
- **Given**: FamilyProfileForm in add mode, TransitTimelinePage result section with Hindi, PanchangPage form section
- **When**: Reading helper text below form field labels
- **Then**: (1) FamilyProfileForm birthPlaceHelper does NOT contain "Start here" wording. BirthTimeHelper contains an honest statement about sunrise-approx impact without being alarming. (2) TransitTimelinePage `viewRange` label includes a "(focus window)" or equivalent disambiguator so users don't confuse it with `rangeMonths` (Timeline length). (3) In Hindi mode, the "Track engine progress" link in TransitTimelinePage uses `trackEngineProgressHi` Hindi text, NOT English. (4) Below PanchangPage city select, a visible 1-line helper mentions the 10-city preset.
- **Pass Condition**: Source diff of FamilyProfileForm LABELS dict strings for birthPlaceHelper + birthTimeHelper. Source diff of TransitTimelinePage LABELS dict viewRange strings and track link rendering. Source diff of PanchangPage city section with added helper text `<p>`.
- **Evidence**: Source inspection of the three files.

### AC-5: Week 5 Print/Copy action pattern applied to Horoscope + MatchMaking empty hints + Transit scaffold disclaimer early
- **Type**: `rule`
- **Given**: A user has computed a horoscope on `/horoscope` and views the result section, OR views matchmaking empty state on `/matchmaking` with no report computed yet, OR generates a transit timeline on `/transit-timeline` and scrolls the result section
- **When**: They look at the action bar on Horoscope, the empty-state description on Matchmaking, and the top of the Transit Timeline result area
- **Then**: (1) Horoscope result area has Print + Copy buttons matching Week 5 pattern (right-aligned, variant="outline", size="sm", Printer + Share2 icons, EN/HI labels, clipboard transient state). (2) MatchMaking ChartEmptyState description contains the Family Profile shortcut tip sentence with EN+HI. (3) First child of the Transit Timeline result area (<= second DOM element, above legend) contains a compact scaffold disclaimer banner linking to `/accuracy`, not just at page-bottom.
- **Pass Condition**: Source grep of HoroscopePage for `window.print()` + `navigator.clipboard` (must find both). Source inspection of MatchMaking empty state description paragraph for the shortcut sentence in both languages. Source inspection of TransitTimelinePage result area JSX order — scaffold disclaimer DOM node is at the beginning of the generated result section.
- **Evidence**: Source inspection.

### AC-6: Softened capacity indicator on FamilyProfilesPage + inline feedback on Comprehensive after profile selection
- **Type**: `rule`
- **Given**: FamilyProfilesPage with 10 profiles (at MAX_PROFILES = 10), AND ComprehensiveReportForm where the user has just selected a Family Profile
- **When**: They look at the capacity notice in the Family Profile header/badge area, and the area directly under the Comprehensive selector
- **Then**: (1) FamilyProfilesPage capacity notice does NOT use `variant="destructive"` on the count badge, does NOT use amber warning palette (bg-amber/text-amber). It uses variant="secondary" / muted / neutral color palette. Copy is neutral-informational not exclamation-urgent. (2) Under Comprehensive's selector, an inline notice persists explaining that only Name + DOB auto-filled and advanced fields need Kundli calculation.
- **Pass Condition**: Source diff of FamilyProfilesPage lines ~382-395 showing badge variant changed and palette classes replaced with muted/neutral classes. Source grep of ComprehensiveReportForm JSX tree for a Badge/paragraph under the FamilyProfileSelector containing the "advanced fields require Kundli calculation" phrase in EN + HI.
- **Evidence**: Source inspection of the two files.

### AC-7: Production build + typecheck + lint passes
- **Type**: `rule`
- **Given**: Week 08 diff applied to working tree
- **When**: Running `npm run typecheck ; npm run lint ; npm run build`
- **Then**: All three commands exit with code 0. Build output last 5 lines contain "✓ built in" Vite success marker.
- **Pass Condition**: Exit code 0 for all three commands and build success marker visible.
- **Evidence**: Terminal capture of all three commands.

### AC-U1: Reduction in confusion across flows (rubric)
- **Type**: `rubric`
- **Dimension**: Subjective walkthrough clarity of Weeks 5-7 flows
- **Scale**: 1-5
- **Anchors**:
  - 1 = Multiple jarring inconsistencies visible: dark-to-light theme flips, "Load Profile" vs "Family Profile" mixing, astro jargon without annotations, helper text that contradicts field order.
  - 3 = Most flows are consistent but 1-2 remaining annoyances still cause confusion during a full walkthrough of the 7 affected pages.
  - 5 = Every flow in the walkthrough feels unified: standard labels, consistent theme, jargon always explained, helper text matches field order, shortcuts mentioned, capacity/info indicators calm.
- **Pass Threshold**: ≥ 4
- **Evidence**: Manual walkthrough of /horoscope → /prashna-ai → /enhanced-matchmaking → /comprehensive → /family-profiles → /transit-timeline → /matchmaking → /panchang on desktop and 360px mobile with EN→HI toggle checks.

### AC-U2: Mobile responsiveness of all touched pages at 360px (rubric)
- **Type**: `rubric`
- **Dimension**: Layout quality and lack of overflow at 360×640
- **Scale**: 1-5
- **Anchors**:
  - 1 = Horizontal scroll bar present on at least 2 of 7 touched pages; labels overlap; action buttons clip.
  - 3 = Everything readable but some minor wrapping awkwardness or tight spacing on at least 1 page.
  - 5 = Every touched page clean stacks, no horizontal overflow, inputs full width, selectors wrap instead of clip, Print/Copy actions wrap to new line gracefully.
- **Pass Threshold**: ≥ 4
- **Evidence**: Responsive 360px browser render snapshots or manual walkthrough DOM check for `document.documentElement.scrollWidth > document.documentElement.clientWidth`.

## Open Questions
None. All scope items directly trace to Week 08 plan and codebase exploration findings.
