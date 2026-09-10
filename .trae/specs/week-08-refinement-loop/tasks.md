# Week 08: Refinement Loop - Implementation Plan

## Task 1: Family Profile Selector label standardization across all pages
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Audit every `<FamilyProfileSelector>` invocation in the codebase for non-standard `triggerLabel` values.
  - Replace any `triggerLabel="Load Profile"` with the standard bilingual pattern.
  - In ComprehensiveReportForm: change `t.loadProfile` and the `loadProfile` entry in the `t` dict to standard "Family Profile" / "परिवार प्रोफ़ाइल".
  - In PrashnaEngine: change inline `triggerLabel="Load Profile"` to standard; add missing `lang` state + pass to selector.
  - In HoroscopePage, MatchMaking, QuestionPage, BirthChartPage, DashaPage, DashaTransitCorrelationPage, TransitTimelinePage: verify each already uses the standard (fix if not).
  - Add visible Male/पुरुष + Female/महिला section wrappers to the two selectors in MatchMaking.tsx (Badge + Label above each selector).
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `rule` TR-1.1: All `<FamilyProfileSelector` invocations that pass a `triggerLabel` use either (a) `triggerLabel={isHi ? 'परिवार प्रोफ़ाइल' : 'Family Profile'}` OR equivalent via the page's own labels dict with the exact two strings; zero occurrences of `"Load Profile"` as triggerLabel text; PrashnaEngine renders an EnhancedLanguageToggle (or equivalent) and passes `lang` prop to FamilyProfileSelector.
  - `rule` TR-1.2: MatchMaking.tsx rendering section shows labeled heading (Badge or Label EN/HI) directly above each FamilyProfileSelector: "Male / पुरुष" before the male one, "Female / महिला" before the female one.
- **Files Touched**:
  - `src/pages/HoroscopePage.tsx`
  - `src/pages/prashna/PrashnaEngine.tsx`
  - `src/components/ComprehensiveReportForm.tsx`
  - `src/pages/MatchMaking.tsx`
  - Plus verify-only on: BirthChartPage.tsx, QuestionPage.tsx, DashaPage.tsx, DashaTransitCorrelationPage.tsx, TransitTimelinePage.tsx (no changes if already compliant)

## Task 2: EnhancedKundliMilan — language toggle, light theme, groom/bride FamilyProfileSelector renders
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Add LABELS = { en: { ... }, hi: { ... } } dict covering all visible copy on the page (title, subtitle, Full Name, Day, Month, Year, Hour, Minute, AM, PM, Place of Birth, city search placeholder, Calculate button, Loading, error strings).
  - Add `lang` useState hook + `isHi` flag, render EnhancedLanguageToggle in header top-right.
  - Apply `font-hindi` class to every label, heading, placeholder, and button text in HI mode using the same pattern as MatchMaking.tsx.
  - Replace dark theme: remove all `bg-[#0f1420]`, `border-white/15`, `bg-white/0.06`, `text-white`, `placeholder:text-slate-600`, `border-amber-500/60`, `hover:bg-amber-500/10` classes from PersonCard and CitySearch sub-components, replace with standard light theme tokens (border-input, bg-background, text-foreground, placeholder:text-muted-foreground, hover:bg-muted, border-primary/40 focus ring).
  - Match theme exactly to MatchMaking PartnerForm: outer wrapper `rounded-2xl border border-border bg-card shadow-sm`.
  - Render two FamilyProfileSelector buttons in DOM: one before Groom PersonCard labeled "Groom / दूल्हा" wrapper, one before Bride PersonCard labeled "Bride / दुल्हन". Use the existing state handlers (lines 230-246).
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `rule` TR-2.1: EnhancedKundliMilan.tsx source contains LABELS dict with en + hi sub-dicts, all page-visible strings assigned; source contains EnhancedLanguageToggle import + render with lang state setter; PersonCard clsx shows light theme tokens, no `#0f1420` hex color literal remains.
  - `rule` TR-2.2: Two JSX nodes `<FamilyProfileSelector ... />` present in page DOM (search file for them), one placed in the groom column card above PersonCard with groom label, one in bride column above PersonCard with bride label; selecting a profile calls the pre-existing handleGroomProfileSelect / handleBrideProfileSelect functions.
  - `rubric` TR-2.3: Theme visual parity; scale 1-5; anchors 1=still dark navy mismatch, 3=light theme but some accent borders missing hover states, 5=pixel-level visual parity with MatchMaking PartnerForm cards; threshold >= 4; evidence=side-by-side screenshot or visual DOM compare.
- **Files Touched**:
  - `src/pages/EnhancedKundliMilan.tsx` (entire rewrite of styling + language layer)

## Task 3: Astro-jargon simplification in PrashnaEngine + ComprehensiveReportForm
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - **PrashnaEngine** (L116): Section header label `Optional Native Birth` → replace with EN "Question Asker Birth Info" and HI "प्रश्नकर्ता जन्म जानकारी" (or equivalent). Keep the existing "Used for context only — Prashna uses question time" helper but move it IMMEDIATELY below the section header (above the FamilyProfileSelector render area) rather than hidden inside the conditional div. Ensure Hindi exists for both the header and this moved helper.
  - **PrashnaEngine** (L217): Loading heading "Calculating Prashna Lagna" → append EN → "Calculating Prashna Lagna (Ascendant for this moment)"; HI → "प्रश्न लग्न गणना हो रहा है (इस क्षण का लग्न)". Ensure this text appears in the visible loading section heading.
  - **ComprehensiveReportForm**: Add visible "(optional)" / "(वैकल्पिक)" suffix to 6 field labels: Moon Sign, Ascendant, Mars House, Saturn Position, Rahu House, Ketu House. Use the existing `t.optional` field in the labels dict (it already has EN/HI). Pattern: `Label text <span className="ml-1 text-[10px] text-muted-foreground">({t.optional})</span>`.
  - **ComprehensiveReportForm Report Type options**: Standardize suffixes across 4 options. Pattern: `"Manglik Dosha Only"` / `"मांगलिक दोष केवल"`, `"Sade Sati Only"` / `"साढ़े साती केवल"`, `"Kaal Sarp Dosha Only"` / `"काल सर्प दोष केवल"`, `"Career Analysis Only"` / `"करियर विश्लेषण केवल"` — or the reverse (add "Yoga" suffix consistently); either approach as long as 4/4 use the same suffix structure. Update the `t` dict values for `manglikOnly`, `sadeOnly`, `kaalOnly`, `careerOnly`.
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `rule` TR-3.1: PrashnaEngine source grep for word "Native" in UI strings (not comments) → 0 hits. Source inspection of PrashnaEngine section header area confirms "Used for context only" paragraph moved to directly below the section label (outside the conditional `nativeProfile ? … div` so it always displays, not only after selection).
  - `rule` TR-3.2: PrashnaEngine loading heading text contains "Ascendant for this moment" (EN version) OR its Hindi equivalent (HI version) when in respective language modes.
  - `rule` TR-3.3: ComprehensiveReportForm each of the 6 advanced Label elements contains an explicit (optional)/(वैकल्पिक) span suffix; each of the 4 Report Type `<SelectItem>` children uses the same consistent naming suffix pattern across all 4.
- **Files Touched**:
  - `src/pages/prashna/PrashnaEngine.tsx`
  - `src/components/ComprehensiveReportForm.tsx`

## Task 4: Helper text fixes — FamilyProfileForm, TransitTimelinePage, PanchangPage
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - **FamilyProfileForm LABELS dict**: Rewrite `birthPlaceHelper` → remove "Start here —" prefix. EN: "We'll use the city to suggest timezone later. Coordinates are optional if unknown." HI: "शहर से समय क्षेत्र सुझाया जाएगा। निर्देशांक अज्ञात होने पर वैकल्पिक हैं।" Rewrite `birthTimeHelper` for honest impact. EN: "If unknown, leave blank. A chart will still generate using sunrise time, which is less precise for ascendant-sensitive readings." HI: "अज्ञात होने पर खाली छोड़ें। सूर्योदय समय से चार्ट बनेगा, जो लग्न-आधारित पढ़ाई के लिए कम सटीक है।"
  - **TransitTimelinePage LABELS dict**: Rewrite `viewRange` EN: "Zoom (focus window)" / HI: "ज़ूम (फोकस विंडो)". Rewrite `viewRangeHelper` to explicitly disambiguate: EN: "Zoom into the generated timeline without re-calculating transits." / HI: "गोचर की पुनः गणना किए बिना जेनरेट की गई टाइमलाइन में ज़ूम करें।". Fix the scaffold disclaimer link: wherever "Track engine progress" is rendered, ensure the HI version uses `t.trackEngineProgressHi` NOT the English `t.trackEngineProgress` (conditional on `isHi`).
  - **PanchangPage**: Inside the controls `<section>` directly below the City `<select>` (still within the same gap-4 grid row or in a new row), add a small helper text paragraph: EN: "Pre-set list of 10 major Indian cities." HI: "10 प्रमुख भारतीय शहरों की पूर्व-सेट सूची।" Use className pattern `"text-[11px] text-muted-foreground"` matching other existing helper text.
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `rule` TR-4.1: FamilyProfileForm `birthPlaceHelper` does NOT contain string "Start here"; `birthTimeHelper` in EN version contains substring "less precise" (or equivalent explicit impact wording).
  - `rule` TR-4.2: TransitTimelinePage labels dict `viewRange` EN string contains substring "(focus window)"; the JSX render of the accuracy link checks `isHi` and uses `trackEngineProgressHi` when true.
  - `rule` TR-4.3: PanchangPage controls section renders a helper text `<p>` child with the 10-city preset wording in EN+HI ternary below the city select dropdown.
- **Files Touched**:
  - `src/components/FamilyProfileForm.tsx`
  - `src/pages/TransitTimelinePage.tsx`
  - `src/pages/PanchangPage.tsx`

## Task 5: Print/Copy action on Horoscope + Matchmaking empty shortcut tip + Transit scaffold disclaimer top-of-result
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - **HoroscopePage**: Add `copied` useState hook + `handlePrint` + `handleCopy` async functions. In the result branch (where rawBirth exists), directly above `<Suspense>` or below the "Change" button row, render a `flex flex-wrap justify-end gap-2 mb-4` action bar with 2 `Button variant="outline" size="sm"`: (a) Printer icon → `window.print()`, EN="Print", HI="प्रिंट करें"; (b) Share2 icon → `navigator.clipboard.writeText(...)` with summary of rawBirth date/time/location, EN="Copy Summary", HI="सारांश कॉपी करें". Implement transient `copied` state (1800ms timeout reset) with button label swapping to "Copied"/"कॉपी हो गया".
  - **MatchMaking**: In LABELS dict `emptyDesc` entry, append shortcut sentence. EN: "Tip: Use the Family Profile buttons above each form to auto-fill in one click." HI: "सुझाव: प्रत्येक फॉर्म के ऊपर परिवार प्रोफ़ाइल बटन से एक क्लिक में स्वयं भरें।". Use newline separator `<br />` or span wrapper to separate sentences if needed. Keep existing first sentence.
  - **TransitTimelinePage**: Locate the result area JSX. Find where the scaffold disclaimer currently renders (bottom of page after timeline grid). DUPLICATE the disclaimer banner so a compact version also renders as the FIRST child inside the result container (direct child before the legend/timeline-heading). Top version: keep short. Use `<Badge variant="secondary">Scaffold</Badge>` + 1-line text + link. Bottom version: keep existing. DO NOT REMOVE the bottom disclaimer. Add both EN and HI to top compact version.
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `rule` TR-5.1: HoroscopePage result branch JSX contains 2 buttons; onClick of first contains `window.print()`; onClick handler of second contains `navigator.clipboard.writeText(...)`; `copied` useState hook declared and used to swap button text.
  - `rule` TR-5.2: MatchMaking LABELS en.emptyDesc AND hi.emptyDesc both contain explicit mention of "Family Profile" shortcut (EN) / "परिवार प्रोफ़ाइल" shortcut (HI).
  - `rule` TR-5.3: In TransitTimelinePage, inside the result rendering (inside the conditional that renders the timeline), scaffold disclaimer compact badge + text renders BEFORE the legend/timeline heading; bottom disclaimer also remains. Source inspection will show two disclaimer blocks (one top one bottom).
- **Files Touched**:
  - `src/pages/HoroscopePage.tsx`
  - `src/pages/MatchMaking.tsx`
  - `src/pages/TransitTimelinePage.tsx`

## Task 6: FamilyProfilesPage capacity tone softening + ComprehensiveReportForm "what was filled" feedback indicator
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - **FamilyProfilesPage (lines 382-395)**: (1) Swap Badge `variant={atCapacity ? 'destructive' : 'secondary'}` → remove conditional destructive; always use `variant="secondary"` regardless of capacity. The count Badge at L287-293 also swaps to always variant=secondary (remove atCapacity destructive branch entirely). (2) Rewrite the at-capacity div: remove amber palette (`border-amber-300`, `bg-amber-50`, `dark:bg-amber-950/20`, `text-amber-800`, `dark:text-amber-300`) → replace with neutral muted palette: `border-border bg-muted/50 text-foreground/75 dark:text-foreground/70`. (3) Rewrite copy to neutral: EN "You've used all {MAX_PROFILES} profile slots. Delete a profile to add more." HI: `आपने सभी {MAX_PROFILES} प्रोफ़ाइल स्लॉट उपयोग कर लिए हैं। और जोड़ने के लिए एक प्रोफ़ाइल हटाएँ।` → keep informative, no exclamation.
  - **ComprehensiveReportForm**: After `handleProfileSelect` runs (L220-227), set a new useState `profileLoadedMsg: string | null` to show feedback. In the JSX, directly BELOW the FamilyProfileSelector div row (inside the same flex/grid or as a sibling row below), render conditionally when `profileLoadedMsg !== null`: a small `Badge variant="secondary"` + text line: EN "✓ Name & Birth Date loaded. Advanced fields (Moon Sign, Ascendant) need a Kundli calculation to auto-fill." HI: "✓ नाम और जन्म तिथि लोड हो गई। उन्नत फ़ील्ड (चंद्र राशि, लग्न) के लिए कुंडली गणना आवश्यक।" Auto-dismiss after 8 seconds with setTimeout (or leave persistent — either fine).
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rule` TR-6.1: FamilyProfilesPage source: no `variant="destructive"` in the badge capacity branches; no `amber` class tokens in the capacity notice palette. Text copy is neutral.
  - `rule` TR-6.2: ComprehensiveReportForm has a `profileLoadedMsg` (or similar) state variable that gets set inside handleProfileSelect, and a conditional JSX render below the FamilyProfileSelector showing the EN+HI "Advanced fields need Kundli calculation" phrase.
- **Files Touched**:
  - `src/pages/FamilyProfilesPage.tsx`
  - `src/components/ComprehensiveReportForm.tsx`

## Task 7: Build, typecheck, lint pass, fix only Week 08 regressions
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Tasks 1, 2, 3, 4, 5, 6
- **Description**:
  - Run `npm run typecheck` — fix ONLY TypeScript errors introduced by Week 08 diff (ignore pre-existing unrelated errors if any exist).
  - Run `npm run lint` — same scoped fix rule.
  - Run `npm run build` — ensure Vite compiles cleanly with "✓ built in …" message. If build fails on lines from any file touched in Tasks 1-6, fix them inside the originating task file. Do NOT modify untouched files to pass build.
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `rule` TR-7.1: `npm run typecheck` exit code 0 with no errors from files touched in Tasks 1-6.
  - `rule` TR-7.2: `npm run lint` exit code 0 with no errors from files touched in Tasks 1-6.
  - `rule` TR-7.3: `npm run build` exit code 0; terminal capture last 5 lines contain the Vite "✓ built in" success banner.
- **Files Touched**: Only files from Tasks 1-6 if TypeScript/build errors exist in those files.
