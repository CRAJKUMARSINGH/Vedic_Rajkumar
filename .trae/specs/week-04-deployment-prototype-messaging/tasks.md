# Week 04: Deployment and Prototype Messaging - Implementation Plan

## Task 1: Integrate ValidationInProgressNotice on the main app workspace (/app — Index.tsx)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Import `ValidationInProgressNotice` from `@/components/PrototypeStatusBanner` into `src/pages/Index.tsx`
  - Render the compact version above the main content — specifically before the Quick Links grid or before the feature-tabs result area — so validation context is immediately visible when the workspace loads
  - Use the existing `isHi` state variable already present in the Index component to toggle Hindi copy
  - Use `compact={true}` to avoid excessive vertical space on the dense workspace page
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `rule` TR-1.1: At runtime, visiting `/app` renders a DOM element with the validation notice heading "Accuracy Validation — Work in Progress" (English) OR "सटीकता सत्यापन — कार्य प्रगति पर है" (Hindi); evidence: browser DOM inspection or source JSX containing `<ValidationInProgressNotice` in `Index.tsx`
  - `rule` TR-1.2: The notice uses the same `isHi` value as the rest of the Index component; evidence: source code showing `isHi={isHi}` prop passed (not hard-coded)
  - `rubric` TR-1.3: Notice placement dimension; scale 1-5; anchors 1 = notice below fold after long scroll, 3 = notice visible but in middle of dense input section, 5 = notice clearly visible above primary action/results area without pushing hero content down excessively; threshold >= 4; evidence: screenshot at 1024px viewport width
- **Notes**: `Index.tsx` already declares `const isHi = lang === "hi";` at line 204 — reuse it

## Task 2: Integrate ValidationInProgressNotice on BirthChartPage (/kundli)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Import `ValidationInProgressNotice` into `src/pages/BirthChartPage.tsx`
  - Detect/declare a language toggle state to support both English and Hindi (follow the same `isHi` / `useState<SupportedLanguage>` pattern as other pages; or if a lang state already exists, reuse it)
  - Render the compact notice in the main section, above the form or first result heading
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `rule` TR-2.1: `BirthChartPage.tsx` contains an import of `ValidationInProgressNotice` and renders it in the page JSX; evidence: source file grep
  - `rule` TR-2.2: Hindi copy is supported (either via toggle or `isHi` prop); evidence: source code showing `isHi={...}` prop or conditional strings with both en/hi variants
  - `rubric` TR-2.3: Mobile layout quality at 360px width; scale 1-5; anchors 1 = notice overflows horizontally, 3 = readable but wraps awkwardly, 5 = clean stacking with no horizontal scroll; threshold >= 4; evidence: responsive-mode DOM inspection

## Task 3: Integrate ValidationInProgressNotice on MatchMaking page (/matchmaking)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Import `ValidationInProgressNotice` into `src/pages/MatchMaking.tsx`
  - The MatchMaking page already has a `hi`/`en` `LABELS` constant and likely a language state — reuse or wire it to the notice's `isHi` prop
  - Render the compact notice in the main content, above the partner forms
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `rule` TR-3.1: `MatchMaking.tsx` imports and renders `ValidationInProgressNotice`; evidence: source file grep
  - `rule` TR-3.2: `isHi` prop is correctly wired from the page's language state; evidence: source code inspection
  - `rubric` TR-3.3: Mobile layout quality at 360px width; scale 1-5; anchors 1 = notice clips or overlaps form controls, 3 = readable but tight, 5 = clean stacking above both partner forms; threshold >= 4; evidence: responsive-mode DOM inspection

## Task 4: Integrate ValidationInProgressNotice on QuestionPage (Prashna, /question)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Import `ValidationInProgressNotice` into `src/pages/QuestionPage.tsx`
  - Detect/declare an `isHi` language state if none exists (check existing patterns on the page)
  - Render the compact notice above the ask-your-question form or UniversalPrasnaResearch bar
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `rule` TR-4.1: `QuestionPage.tsx` imports and renders `ValidationInProgressNotice`; evidence: source file grep
  - `rule` TR-4.2: Hindi copy is supported via `isHi` prop; evidence: source code inspection
  - `rubric` TR-4.3: Mobile layout quality at 360px width; scale 1-5; anchors 1 = overlaps research bar or form, 3 = readable but pushes hero content too far, 5 = clean, clearly visible, not intrusive; threshold >= 4; evidence: responsive-mode DOM inspection

## Task 5: Integrate ValidationInProgressNotice on PanchangPage (/panchang)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Import `ValidationInProgressNotice` into `src/pages/PanchangPage.tsx`
  - Reuse the existing `isHi` state already declared on line 45 of PanchangPage.tsx
  - Render the compact notice inside `<main>` before the controls section
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `rule` TR-5.1: `PanchangPage.tsx` imports and renders `ValidationInProgressNotice`; evidence: source file grep
  - `rule` TR-5.2: `isHi` is wired from the existing `isHi` state (line 45), not duplicated; evidence: source code inspection
  - `rubric` TR-5.3: Mobile layout quality at 360px width; scale 1-5; anchors 1 = clips controls heading or date select, 3 = readable but spacing inconsistent, 5 = clean placement before controls with consistent spacing; threshold >= 4; evidence: responsive-mode DOM inspection

## Task 6: Improve WelcomeModal onboarding copy with prototype status and validation context
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Edit `src/components/WelcomeModal.tsx` to add, in the "welcome" step (the step immediately before register), three new messaging elements with full Hindi + English parity:
    1. A visible prototype/preview status badge (using existing Badge component and a "PROTOTYPE / प्रोटोटाइप" label, styled consistently with the top banner)
    2. A validation-in-progress note (mentioning 15 reference charts + Swiss Ephemeris comparison) — ideally as a small callout that links to `/validation`
    3. An educational-reference disclaimer advising users to consult a qualified astrologer before making life decisions
  - Place these elements after the decorative header and before the plan cards (or immediately following the existing intro paragraph at line 105)
  - Maintain consistency with the existing tone (warm, encouraging) while being transparent
  - Ensure all strings have proper Hindi parity and use the `font-hindi` class where appropriate
- **Acceptance Criteria Addressed**: AC-2, AC-4
- **Test Requirements**:
  - `rule` TR-6.1: Welcome modal welcome-step JSX contains a prototype/preview badge (Badge component or equivalent visual label); evidence: source code of WelcomeModal.tsx welcome step
  - `rule` TR-6.2: Welcome modal welcome step contains validation-in-progress text mentioning at least "15 reference charts" OR "Swiss Ephemeris" and links to `/validation`; evidence: source code grep
  - `rule` TR-6.3: Welcome modal welcome step contains an educational-reference disclaimer instructing users to consult a qualified astrologer (matching the top banner wording spirit); evidence: source code text inspection
  - `rule` TR-6.4: All three new elements (badge, validation note, disclaimer) have Hindi parity (`isHi` ternary with both en and hi strings); evidence: source code inspection showing matching `isHi ? "…hi…" : "…en…"` patterns
  - `rubric` TR-6.5: Onboarding flow consistency dimension; scale 1-5; anchors 1 = new messaging clashes with existing plan cards layout or makes modal feel spammy, 3 = messaging present but visually disconnected, 5 = cohesive callout, visual hierarchy preserved, plan cards still clearly the primary action; threshold >= 4; evidence: modal screenshot at 1024px width

## Task 7: Verify and harden PrototypeStatusBanner integration in MainLayout
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - Review [MainLayout.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/components/MainLayout.tsx) lines 40–48 (landing branch) and 51–72 (non-landing branch) to confirm the `PrototypeStatusBanner` integration is correct and consistent with spec intent
  - Confirm `showValidation={false}` on the landing page route (so landing users are not pushed to the internal validation dashboard prematurely)
  - Confirm `showValidation={true}` (or default) on non-landing app routes, linking to `/validation`
  - Confirm localStorage `protoBannerDismissed` logic works in both branches (it should — it's inside the component itself)
  - If any discrepancy or opportunity for clearer copy inside the banner is found within the scope of Week 04, adjust the banner copy softly
- **Acceptance Criteria Addressed**: AC-3, AC-4
- **Test Requirements**:
  - `rule` TR-7.1: MainLayout.tsx landing branch (line 40-48) renders `<PrototypeStatusBanner isHi={...} showValidation={false} />`; evidence: source code
  - `rule` TR-7.2: MainLayout.tsx non-landing branch renders `<PrototypeStatusBanner isHi={...} />` or `showValidation={true}` equivalent; evidence: source code
  - `rule` TR-7.3: PrototypeStatusBanner.tsx component itself reads localStorage on init (line 16-22) and writes on dismiss (line 24-31); evidence: source code inspection
  - `rubric` TR-7.4: Banner copy clarity dimension; scale 1-5; anchors 1 = copy confusing or too alarming, 3 = acceptable but could be shorter, 5 = clear, honest, non-alarming tone with proper Hindi parity; threshold >= 4; evidence: source copy review

## Task 8: Run build and fix any TypeScript / Vite errors
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 3, Task 4, Task 5, Task 6, Task 7
- **Description**:
  - Execute `npm run build` from the repo root after all implementation tasks complete
  - Fix any TypeScript strict-mode errors, unused import warnings, or Vite bundling issues introduced by the changes
  - Re-run until the build exits with code 0
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `rule` TR-8.1: `npm run build` exits with code 0; evidence: terminal output showing exit code 0 and "✓ built in …" message
