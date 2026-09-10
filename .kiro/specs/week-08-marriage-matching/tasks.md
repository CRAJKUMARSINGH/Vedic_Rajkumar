# Week 08 Tasks — Marriage Matching Enhancements

## Status legend
- [x] Done
- [ ] Pending

---

## Task 1 — Complete Yoni Compatibility Matrix (AC-1)
- [x] Replace partial `YONI_COMPATIBILITY` in `ashtakutaService.ts` with full 14×14 matrix
- [x] All enemy pairs score 0 (Horse–Buffalo, Elephant–Lion, Goat–Monkey, Serpent–Mongoose, Dog–Deer, Cat–Rat, Cow–Tiger)
- [x] Safety fallback retained but unreachable for valid nakshatra inputs
- [x] `@ts-nocheck` header removed; matrix uses `YoniAnimal` enum keys

---

## Task 2 — Three New Jataks in JATAKS_DATABASE (AC-4)
- [x] `jatak_018`: Arpit, Shikohabad UP, 2001-10-03, 08:05, Swati nakshatra, Libra Moon
- [x] `jatak_019`: Anukrati Sharma, Aligarh UP, 2002-01-11, 15:02, Pushya nakshatra, Cancer Moon
- [x] `jatak_020`: Parshvi Sharma, Kota Rajasthan, 2002-02-02, 21:12, Mrigashirsha nakshatra, Gemini Moon
- [x] `totalJataks` updated to 20
- [x] JSON valid and parseable

---

## Task 3 — doshaCheckerService.ts (AC-2)
**File:** `src/services/doshaCheckerService.ts` (new)
- [x] `KaalSarpType`, `KaalSarpResult`, `DoshaReport` interfaces defined (no `any`)
- [x] `detectKaalSarpDosha(dob, tob, lat, lon): KaalSarpResult` — internal helper
  - [x] Gets planetary positions via `calculateCompletePlanetaryPositions`
  - [x] Finds Rahu/Ketu house from ascendant via `calculateCompleteAscendant`
  - [x] Maps rahuHouse → KaalSarpType via `RAHU_HOUSE_TO_TYPE`
  - [x] Distinguishes Full (all 7 classical in arc) vs Partial vs None
  - [x] Returns `affectedHouses` array
- [x] `getComprehensiveDoshaReport(dob, tob, lat, lon): Promise<DoshaReport>` — exported
  - [x] Calls `checkManglikDosha` for Manglik result
  - [x] Calls `detectKaalSarpDosha` for Kaal Sarp result
  - [x] Sets `nadiDosha: null`
  - [x] Populates `summary` (critical/moderate doshas, recommendations)
- [x] Errors caught; returns valid DoshaReport with error in recommendations

---

## Task 4 — ashtakutaServiceEnhanced.ts (AC-3)
**File:** `src/services/ashtakutaServiceEnhanced.ts` (new)
- [x] `ManglikCrossCheck` and `EnhancedCompatibilityReport` interfaces defined
- [x] `resolvePlaceToCoords(place): Promise<{lat, lon}>` — geocoding helper with India fallback
- [x] `calculateEnhancedAshtakuta(male, female): Promise<EnhancedCompatibilityReport>` — exported
  - [x] Calls `calculateAshtakuta(male, female)` — NOT reimplemented
  - [x] Resolves coords for both partners via `getCoordinates`
  - [x] Calls `checkManglikDosha` for each partner
  - [x] Classical cross-check: both Manglik → neutralised; mismatch → criticalIssues
  - [x] Nadi Dosha detected from categories (score 0 → critical issue)
  - [x] Bhakoot Dosha detected from categories (score 0 → critical issue)
  - [x] `overallRecommendation` from threshold table (≥28+0 → Highly Recommended)
- [x] `PartnerData` and `CompatibilityReport` re-exported for consumers

---

## Task 5 — Upgrade compareProspects in stubs.ts (AC-5)
**File:** `src/features/matchmaking/stubs.ts`
- [x] Dynamic import of `calculateEnhancedAshtakuta` (avoids circular deps)
- [x] All prospects run `calculateEnhancedAshtakuta` in parallel via `Promise.all`
- [x] `effectiveScore = ashtakutaScore - criticalIssues.length * 4`
- [x] Sort by effectiveScore desc; tie-break by `criticalDosha` asc
- [x] `recommendationReason` names key differentiator (names, scores, dosha status)
- [x] `strengths` from full-mark kutas; `shortcomings` from criticalIssues + zero kutas
- [x] Error handling per prospect — placeholder summary on failure, no overall crash

---

## Task 6 — matchmakingPdfService.ts (AC-6)
**File:** `src/services/matchmakingPdfService.ts` (new)
- [x] `sanitiseName(name): string` — safe filename chars
- [x] `addCoverPage(doc, result, options)` — page 1: names, score, recommendation badge
- [x] `addAshtakutaTable(doc, result, options)` — page 2: 8 kutas + total row
- [x] `addManglikSection(doc, result, options)` — page 3: male/female status, cross-check, remedies
- [x] `addDoshaSection(doc, result, options, doshaReport?)` — page 4: critical issues, Kaal Sarp
- [x] `addRemediesSection(doc, result, options, doshaReport?)` — page 5: combined deduped list
- [x] `exportMatchReport(result, options, doshaReport?, enableDevanagariFont?)` — exported
  - [x] Calls pages in order
  - [x] Filename: `MatchReport_<name1>_<name2>_<YYYY-MM-DD>.pdf`
  - [x] `language` option: 'en' | 'hi' | 'both'
  - [x] Optional Devanagari font embedding via `pdfFontUtils.embedDevanagariFont`

---

## Task 7 — ProspectComparisonPage.tsx (AC-7)
**File:** `src/pages/ProspectComparisonPage.tsx` (new)
- [x] `JatakRecord` interface matches JSON schema
- [x] `JatakDropdown` sub-component — select from 20 jataks + manual entry toggle
- [x] Base person picker (single selection)
- [x] Prospects picker — up to 5, add/remove rows
- [x] `[Compare]` button — validates fields, calls `compareProspects`, sets loading state
- [x] Error display — `aria-live="polite"` region, per-prospect inline errors
- [x] `ResultsTable` — `<table>` with `<th scope="col">` for all columns
  - [x] Recommended row: `ring-2 ring-emerald-500/40` + "⭐ Recommended" badge
- [x] `RecommendedBanner` above table with name + recommendationReason
- [x] Per-row "Download PDF" button with spinner while generating
- [x] Score reference grid at bottom
- [x] All interactive elements have `aria-label` attributes

---

## Task 8 — Route Registration + Feature Registry (AC-7, AC-9)
- [x] `appRoutes.tsx`: `const ProspectComparisonPage = lazy(...)` added
- [x] `appRoutes.tsx`: `route('/prospect-comparison', <ProspectComparisonPage />)` added near matchmaking routes
- [x] `featureRegistry.ts`: `/prospect-comparison` entry with badge "New", isNew: true, showInDesktop: true, showInMobileSheet: true, category: 'marriage'

---

## Task 9 — EnhancedKundliMilan PDF Button (AC-8)
**File:** `src/pages/EnhancedKundliMilan.tsx`
- [x] `exportMatchReport` imported from `matchmakingPdfService`
- [x] `calculateEnhancedAshtakuta` imported from `ashtakutaServiceEnhanced`
- [x] `pdfLoading` state (`useState<boolean>(false)`)
- [x] `handleDownloadPdf()` — builds PartnerData from form values, calls enhanced service + export
- [x] "Download Match Report PDF" button rendered after results section
- [x] Spinner during PDF generation, `aria-label` set correctly

---

## Task 10 — Build, typecheck, lint
- [x] Week 08 new files have no `any` types (except intentional eslint-disable comments in stubs.ts for dynamic kuta array shape)
- [x] Pre-existing TypeScript errors in unrelated files (lalKitabService, CareerAstrology, etc.) are not introduced by Week 08 work
- [x] `npm run build` succeeds with Week 08 changes

---

## Week 08 Review Checklist

- [x] Did the work reduce risk in one of the priority areas?
      → Yes: completes the marriage matching feature with real engine, not stubs; user can now compare Arpit vs Anukrati/Parshvi
- [x] Is there a written spec or clear design artifact?
      → spec.md with 10 acceptance criteria
- [x] Are acceptance criteria explicit?
      → Yes, each AC maps to concrete file changes and observable behaviors
- [x] Did tests improve or at least remain credible?
      → Week 08 test directory exists; stubs.ts now uses real engine (better test signal)
- [x] Did the week add depth rather than surface area?
      → Yes: enhanced engine, comprehensive doshas, PDF export — all deepen the single marriage matching feature
- [x] Is the result something you would trust more than the prior week?
      → Yes: real Ashtakuta with Manglik cross-check replaces stub logic; PDF gives users a tangible output
