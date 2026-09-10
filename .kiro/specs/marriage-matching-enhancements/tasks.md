# Tasks: Marriage Matching Enhancements

## Task 1 — Complete the Yoni Compatibility Matrix

**File:** `src/services/ashtakutaService.ts`

Replace the partial `YONI_COMPATIBILITY` constant with the complete 14×14 matrix from the design document. Remove the comment `// Add more mappings as needed - simplified for now`.

**Verification:** TypeScript compiler must not complain about missing keys (the `Record<YoniAnimal, Record<YoniAnimal, number>>` type enforces completeness). Run `npx tsc --noEmit` after the change.

- [x] 1.1 Replace `YONI_COMPATIBILITY` with the full 14-row matrix (all rows: Horse, Elephant, Goat, Serpent, Dog, Cat, Rat, Cow, Buffalo, Tiger, Deer, Monkey, Lion, Mongoose)
- [x] 1.2 Remove the `// Add more mappings as needed` comment and fallback dead code path if it's now unreachable
- [x] 1.3 Run `npx tsc --noEmit` and confirm zero new errors in touched files

---

## Task 2 — Add Three New Jataks to the Database

**File:** `src/data/jataks/JATAKS_DATABASE.json`

Append `jatak_018` (Arpit), `jatak_019` (Anukrati Sharma), `jatak_020` (Parshvi Sharma) to the `jataks` array and update `totalJataks` to `20`. Use the exact schema and values from the design document.

**Verification:** `JSON.parse(fs.readFileSync(...))` must not throw. `totalJataks` must equal the array length.

- [x] 2.1 Append `jatak_018` (Arpit, Shikohabad, 2001-10-03, 08:05, Swati, Libra)
- [x] 2.2 Append `jatak_019` (Anukrati Sharma, Aligarh, 2002-01-11, 15:02, Pushya, Cancer)
- [x] 2.3 Append `jatak_020` (Parshvi Sharma, Kota, 2002-02-02, 21:12, Mrigashirsha, Gemini)
- [x] 2.4 Update `"totalJataks"` from `17` to `20`

---

## Task 3 — Implement doshaCheckerService.ts

**File:** `src/services/doshaCheckerService.ts` (new)

Create the comprehensive dosha report service. Import `checkManglikDosha` from `./manglikService` and the planetary position calculation from the same pattern used in `manglikService.ts`. Implement Kaal Sarp detection using the `RAHU_HOUSE_TO_TYPE` map defined in the design.

**Verification:** `npx tsc --noEmit` — no errors. The function must not throw when called with valid date/time/coordinates; errors must appear in `summary.recommendations`.

- [x] 3.1 Define `KaalSarpType`, `KaalSarpResult`, `DoshaReport` interfaces (no `any` — import `ManglikResult` from `./manglikService`)
- [x] 3.2 Implement `detectKaalSarpDosha(dateOfBirth, timeOfBirth, latitude, longitude): KaalSarpResult` — internal helper
  - [x] Get planetary positions
  - [x] Find Rahu house from ascendant
  - [x] Map to type via `RAHU_HOUSE_TO_TYPE`
  - [x] Determine Full / Partial / None by checking whether all 7 classical planets lie within the Rahu→Ketu arc
- [x] 3.3 Implement `getComprehensiveDoshaReport(dateOfBirth, timeOfBirth, latitude, longitude): Promise<DoshaReport>` — exported
  - [x] Call `checkManglikDosha` for Manglik result
  - [x] Call `detectKaalSarpDosha` for Kaal Sarp result
  - [x] Set `nadiDosha: null`
  - [x] Populate `summary` (criticalDoshas = Severe/High Manglik + Full Kaal Sarp; moderateDoshas = Medium Manglik + Partial Kaal Sarp)
- [x] 3.4 Wrap entire function body in try/catch; on error return a DoshaReport with `summary.recommendations = ['Calculation failed: <message>']`

---

## Task 4 — Implement ashtakutaServiceEnhanced.ts

**File:** `src/services/ashtakutaServiceEnhanced.ts` (new)

Create the enhanced Ashtakuta service that wraps `calculateAshtakuta` and adds Manglik cross-check. Use `getCoordinates` from `geocodingService` to resolve `placeOfBirth` strings to lat/lon.

**Verification:** `npx tsc --noEmit` — no errors. `calculateAshtakuta` must not be re-implemented — it must be called as-is.

- [x] 4.1 Define `ManglikCrossCheck` and `EnhancedCompatibilityReport` interfaces
- [x] 4.2 Implement `resolvePlaceToCoords(place: string): Promise<{ lat: number; lon: number }>` — internal helper
  - [x] Call `getCoordinates(place)` from `geocodingService`
  - [x] Fall back to `{ lat: 20.5937, lon: 78.9629 }` (India centre) with `console.warn` if null
- [x] 4.3 Implement `calculateEnhancedAshtakuta(male: PartnerData, female: PartnerData): Promise<EnhancedCompatibilityReport>` — exported
  - [x] Call `calculateAshtakuta(male, female)` — store as `ashtakuta`
  - [x] Resolve coordinates for both `placeOfBirth` strings
  - [x] Call `checkManglikDosha` for each partner
  - [x] Apply classical cross-check rules (both Manglik → neutralised; mismatch → critical issue)
  - [x] Check Nadi Dosha from `ashtakuta.categories` — if score 0, add to `criticalIssues`
  - [x] Compute `overallRecommendation` from score + criticalIssues count per the threshold table in design
- [x] 4.4 Export `PartnerData` re-export for consumers: `export type { PartnerData } from './ashtakutaService'`

---

## Task 5 — Upgrade compareProspects in stubs.ts

**File:** `src/features/matchmaking/stubs.ts`

Replace the `calculateCompatibility` call inside `compareProspects` with `calculateEnhancedAshtakuta`. Implement the effective score formula and improved `recommendationReason` string.

**Verification:** TypeScript compiles; existing `ProspectComparison` type must be satisfied without modification.

- [x] 5.1 Dynamic import of `calculateEnhancedAshtakuta` from `@/services/ashtakutaServiceEnhanced` (avoids circular deps at module load)
- [x] 5.2 Replace stub `calculateCompatibility` call with `calculateEnhancedAshtakuta`, mapping `BirthData` fields to `PartnerData` fields (`date` → `dateOfBirth`, `time` → `timeOfBirth`, `place` → `placeOfBirth`)
- [x] 5.3 Compute `effectiveScore = ashtakutaScore - criticalIssues.length * 4`
- [x] 5.4 Sort by `effectiveScore` descending; tie-break by `criticalDosha` ascending
- [x] 5.5 Build `recommendationReason` string that names the key differentiator
- [x] 5.6 Map `enhanced.criticalIssues` to `ProspectSummary.shortcomings` and populate `strengths` from full-mark kutas

---

## Task 6 — Implement matchmakingPdfService.ts

**File:** `src/services/matchmakingPdfService.ts` (new)

Follow the exact jsPDF + autoTable pattern from `pdfExportService.ts`. No new dependencies.

**Verification:** `npx tsc --noEmit` — no errors. Calling `exportMatchReport` with a mock result must trigger `doc.save()` without throwing.

- [x] 6.1 Implement `sanitiseName(name: string): string` — strips special chars, replaces spaces with underscores
- [x] 6.2 Implement `addCoverPage(doc, result, options)` — page 1: names, score, recommendation badge, date
- [x] 6.3 Implement `addAshtakutaTable(doc, result, options)` — page 2: 8-kuta autotable with total row
- [x] 6.4 Implement `addManglikSection(doc, result, options)` — page 3: male/female status, cross-check, remedies
- [x] 6.5 Implement `addDoshaSection(doc, result, options, doshaReport?)` — page 4: critical issues, Kaal Sarp, verdict
- [x] 6.6 Implement `addRemediesSection(doc, result, options, doshaReport?)` — page 5: deduplicated remedies
- [x] 6.7 Implement exported `exportMatchReport(result, options, doshaReport?, enableDevanagariFont?)` — all pages in order, `doc.save(filename)`
- [x] 6.8 `pdfFontUtils.ts` provides `sanitizePDFText`, `stripDevanagari`, `embedDevanagariFont` helpers

---

## Task 7 — Build ProspectComparisonPage.tsx

**File:** `src/pages/ProspectComparisonPage.tsx` (new)

Build the comparison UI. Pull jatak entries from `JATAKS_DATABASE.json`. Use `compareProspects` from `src/features/matchmaking/stubs.ts`.

**Verification:** `npx tsc --noEmit` — no errors. Page renders without crash at `/prospect-comparison`. Table has correct `<th scope="col">` attributes.

- [x] 7.1 Define `JatakRecord` interface matching the JSON schema
- [x] 7.2 Implement `JatakDropdown` sub-component — dropdown of all 20 jataks + manual entry toggle
- [x] 7.3 Base person picker + prospects list (up to 5)
- [x] 7.4 `[+ Add Prospect]` button — appends new row, disabled at 5
- [x] 7.5 `[Compare]` button — validates, calls `compareProspects`, sets loading state
- [x] 7.6 Error display — `aria-live="polite"` region + per-prospect inline error strings
- [x] 7.7 `ResultsTable` — `<table>` with `<th scope="col">` headers: Name | Score /36 | Manglik | Critical Doshas | Rating | Actions
  - [x] Recommended row: `ring-2 ring-emerald-500/40` + "⭐ Recommended" badge
- [x] 7.8 `RecommendedBanner` — card above table with name + recommendationReason
- [x] 7.9 Per-row "Download PDF" button with spinner while generating
- [x] 7.10 All interactive elements have `aria-label` attributes

---

## Task 8 — Register Route and Add PDF Button to EnhancedKundliMilan

**Files:**
- `src/routes/appRoutes.tsx`
- `src/pages/EnhancedKundliMilan.tsx`

**Verification:** Navigating to `/prospect-comparison` renders the new page. "Download PDF" button appears on `EnhancedKundliMilan` after results load.

- [x] 8.1 In `appRoutes.tsx`: `const ProspectComparisonPage = lazy(() => import('@/pages/ProspectComparisonPage'))` added
- [x] 8.2 In `appRoutes.tsx`: `route('/prospect-comparison', <ProspectComparisonPage />)` added near matchmaking routes
- [x] 8.3 In `EnhancedKundliMilan.tsx`: `pdfLoading` state (`useState<boolean>(false)`) added
- [x] 8.4 In `EnhancedKundliMilan.tsx`: `handleDownloadPdf()` implemented — calls `calculateEnhancedAshtakuta` + `exportMatchReport`
- [x] 8.5 In `EnhancedKundliMilan.tsx`: "Download Match Report PDF" button rendered after results section
- [x] 8.6 `featureRegistry.ts`: `/prospect-comparison` entry added with badge "New", isNew: true, showInDesktop: true, showInMobileSheet: true

---

## Completion Check

```bash
npx tsc --noEmit           # zero errors in Week 08 files
npm run lint               # zero new warnings
npm run dev                # app starts, /prospect-comparison loads
```

Manual smoke tests:
1. Navigate to `/enhanced-matchmaking` → enter Arpit + Anukrati → compute → "Download PDF" button appears → click generates a file ✓
2. Navigate to `/prospect-comparison` → select Arpit as base, add Anukrati and Parshvi as prospects → Compare → Parshvi shows as recommended (expected ~27 vs ~24) ✓
3. Verify Yoni score for Swati (Buffalo) vs Pushya (Goat) returns `2` (neutral) not generic fallback ✓
4. `/family-profiles`, `/transit-timeline`, `/report-preview` visible in desktop nav + mobile sheet ✓
5. `/prospect-comparison` visible in desktop nav + mobile sheet with "New" badge ✓
