# Week 04: Deployment and Prototype Messaging - Product Requirements Document

## Overview
- **Summary**: Improve product messaging so the app clearly communicates prototype status, validation-in-progress status, and user expectations across the entire UI surface. Add lightweight banners, notices, and polished onboarding text without changing core information architecture.
- **Purpose**: Reduce trust gaps by setting realistic expectations, making prototype status understandable (not alarming), and establishing transparent communication about accuracy validation work.
- **Target Users**: First-time visitors, returning users, and users performing astrological computations (Kundli, Prashna, Matchmaking, Panchang).

## Goals
- Reduce trust gaps by being transparent about prototype/preview status
- Set realistic user expectations about validation-in-progress and result interpretation
- Make prototype status visible but not alarming
- Improve first-time user onboarding copy to include prototype context and usage guidance

## Non-Goals
- Do not change routing, navigation, or information architecture
- Do not add new astrological calculation features or modify calculation engines
- Do not build new pages or change existing component hierarchies substantially
- Do not implement backend validation infrastructure — only UI messaging
- Do not move to Week 05 (Kundli/Prashna polish) in this cycle

## Background & Context
- Per `trae_detailed_weekly_plan.MD` Week 04 description: "Deployment and prototype messaging. Focus on communicating the product state clearly."
- Existing state as of 2026-09-06:
  - `PrototypeStatusBanner` component exists in [PrototypeStatusBanner.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/components/PrototypeStatusBanner.tsx) and is integrated in [MainLayout.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/components/MainLayout.tsx) on both landing and app routes.
  - `ValidationInProgressNotice` component is **exported but not used anywhere** in the application.
  - `WelcomeModal` onboarding copy in [WelcomeModal.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/components/WelcomeModal.tsx) markets the Pro plan but contains **zero mention** of prototype status, validation-in-progress, or educational-reference disclaimers.
  - Landing page [LandingPageV3.tsx](file:///C:/Users/Rajkumar/Vedic_Rajkumar/src/pages/LandingPageV3.tsx) has minor references to "Reference-chart validation in progress" and "Transparent roadmap" in feature lists.
- Project hard constraint from `project_memory.md`: Do not proceed to subsequent weeks unless explicitly instructed by the user.

## Functional Requirements
- **FR-1**: The `ValidationInProgressNotice` component must be integrated on all primary astrological result pages so users see validation status immediately before interpreting results.
- **FR-2**: The `WelcomeModal` onboarding flow must include prototype status messaging, validation-in-progress context, and educational-reference disclaimers in both English and Hindi at the appropriate point in the user journey.
- **FR-3**: Prototype banner dismissal state must continue to be persisted in localStorage (existing behavior) and the banner must remain visible on the landing page route where it is currently shown.
- **FR-4**: All new and updated copy must be bilingual — English and Hindi parity must be maintained, matching the existing `font-hindi` class convention.
- **FR-5**: The validation dashboard link `/validation` from the PrototypeStatusBanner must remain functional, and any new validation notices must link there consistently.
- **FR-6**: Notices must be non-intrusive — they may be compact on result pages but must remain clearly visible above the fold on the main computing surfaces.

## Non-Functional Requirements
- **NFR-1**: Must not introduce any TypeScript `any` types without explicit justification.
- **NFR-2**: Build must pass `npm run build` with zero errors after all changes.
- **NFR-3**: Must follow existing Tailwind styling conventions and use existing UI primitives (Badge, Button, Alert patterns).
- **NFR-4**: Must maintain mobile responsiveness — banners and notices must collapse gracefully on viewports < 640px wide.
- **NFR-5**: Must be lazy-load friendly — avoid importing heavy computation dependencies in messaging components.

## Constraints
- **Technical**: TypeScript strict mode; existing shadcn/ui + Tailwind stack; React + Vite with Router v6.
- **Business**: Soften trust claims — avoid absolute terms like "Best", "Accurate", "Guaranteed"; use "Recommended", "Auspicious", "Target pricing", "For educational reference" instead (per project_memory.md hard constraints).
- **Dependencies**: No new third-party dependencies; reuse existing lucide-react icons and existing UI components.

## Assumptions
- The existing `/validation` route exists and renders a ValidationDashboardPage.
- Users who dismiss the prototype banner understand the status and do not need to see it again on the same device/browser.
- The 15 reference chart benchmarking and Swiss Ephemeris comparison text in `ValidationInProgressNotice` is current and accurate (we will reuse existing copy verbatim unless explicitly instructed otherwise).

## Acceptance Criteria

### AC-1: Validation notices appear on core feature pages
- **Type**: `rule`
- **Given**: A user visits the main astrological computation pages
- **When**: The user lands on `/app` (workspace), `/kundli`, `/matchmaking`, `/question` (Prashna), or `/panchang`
- **Then**: A `ValidationInProgressNotice` is rendered above the fold on each page before any computation results
- **Pass Condition**: All 5 pages contain a rendered `<ValidationInProgressNotice />` or equivalent notice instance that is visible and links to `/validation`
- **Evidence**: Source code inspection of each page component + devtools DOM inspection on each route

### AC-2: WelcomeModal includes prototype and validation context
- **Type**: `rule`
- **Given**: A first-time user opens the app and the WelcomeModal is displayed
- **When**: The modal shows the welcome step (step = "welcome")
- **Then**: A clearly labeled prototype/preview badge AND a concise validation-in-progress statement AND an educational-reference disclaimer appear in the modal body, with both English and Hindi versions available
- **Pass Condition**: WelcomeModal welcome step contains: (1) prototype/preview status indicator, (2) validation context mention or link, (3) disclaimer about consulting a qualified astrologer for decisions — all with Hindi parity
- **Evidence**: Source code inspection of WelcomeModal.tsx welcome step JSX + bilingual toggle verification

### AC-3: Prototype banner remains correctly integrated
- **Type**: `rule`
- **Given**: The MainLayout wraps all routes
- **When**: A user visits any route (landing `/` or non-landing `/app`, `/kundli`, etc.)
- **Then**: The `PrototypeStatusBanner` is correctly rendered per route (showValidation=false on landing, true on app routes) and its dismissal state is persisted across sessions via localStorage
- **Pass Condition**: MainLayout.tsx contains correct banner placements for both landing AND non-landing branches; localStorage key `protoBannerDismissed` is read on init and written on dismiss
- **Evidence**: Source code inspection of MainLayout.tsx PrototypeStatusBanner usages

### AC-4: All copy maintains bilingual parity
- **Type**: `rule`
- **Given**: Any new or modified text strings in the changes
- **When**: The `isHi` prop is toggled between `true` and `false`
- **Then**: Every piece of UI text that changes has a matching English and Hindi variant, and Hindi text uses `font-hindi` class where appropriate
- **Pass Condition**: Zero instances of unpaired English-only or Hindi-only copy in all changed files (excluding technical labels like HTML aria-label which mirror the visible text)
- **Evidence**: Source code grep for `isHi ?` patterns with matching string pairs in changed files

### AC-5: Production build succeeds
- **Type**: `rule`
- **Given**: All implementation tasks are complete
- **When**: `npm run build` is executed from the project root
- **Then**: The build completes with exit code 0 and no TypeScript or Vite errors
- **Pass Condition**: Command output shows successful build; `dist/` directory populated
- **Evidence**: Terminal output from `npm run build`

### AC-6: Messaging tone and positioning quality
- **Type**: `rubric`
- **Dimension**: Messaging clarity — prototype status, validation state, and expectations are communicated across banners, notices, and onboarding
- **Scale**: 1-5
- **Anchors**: 1 = messaging absent or contradictory; 3 = basic notices present but inconsistent placement / missing on key surfaces; 5 = consistent, clear, reassuring messaging present everywhere users make decisions with matching Hindi parity
- **Pass Threshold**: >= 4
- **Evidence**: Walkthrough of `/`, `/app`, `/kundli`, `/matchmaking`, `/question`, `/panchang`, and WelcomeModal

### AC-7: Mobile responsiveness of new messaging elements
- **Type**: `rubric`
- **Dimension**: Visual and layout quality on mobile viewports (360px–480px)
- **Scale**: 1-5
- **Anchors**: 1 = banners/notices wrap badly, overlap content, or hide interactive controls; 3 = readable but tight spacing; 5 = clean stacking, readable text, no overflow or clipping at 360px wide
- **Pass Threshold**: >= 4
- **Evidence**: Browser devtools responsive mode inspection at 360px and 480px widths on affected pages

## Open Questions
- None at this time. All scope items are explicitly defined in the Week 04 plan.
