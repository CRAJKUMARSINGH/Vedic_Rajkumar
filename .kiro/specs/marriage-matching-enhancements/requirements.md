# Requirements: Marriage Matching Enhancements

## Overview

This spec addresses targeted gaps in the existing marriage matching system. It does **not** replace any working code — it completes, wires, and surfaces capabilities that are partially stubbed or missing.

The concrete use case driving this work: evaluating prospects for **Arpit** (Male, b. 3 Oct 2001, Shikohabad) against **Anukrati Sharma** (Girl01, b. 11 Jan 2002, Aligarh) and **Parshvi Sharma** (Girl02, b. 2 Feb 2002, Kota).

---

## Requirement 1 — Complete the Yoni Compatibility Matrix

**User Story:** As a user running Ashtakuta compatibility, I want all 14 × 14 Yoni animal pairs to return accurate classical scores rather than the generic fallback of 2.

### Acceptance Criteria

1.1 `YONI_COMPATIBILITY` in `src/services/ashtakutaService.ts` must contain all 14 rows (Horse, Elephant, Goat, Serpent, Dog, Cat, Rat, Cow, Buffalo, Tiger, Deer, Monkey, Lion, Mongoose) × 14 columns with integer scores 0–4 per Brihat Parashara Hora Shastra.

1.2 The matrix must be symmetric: `YONI_COMPATIBILITY[A][B] === YONI_COMPATIBILITY[B][A]` except for enemy pairs (where the score may differ by direction).

1.3 The fallback branch (`// Default scoring for missing combinations`) must still exist as a safety net but must never be reached for any standard nakshatra input.

1.4 Existing Vitest tests in `src/tests/` for `calculateYoniMatching` must pass without modification.

---

## Requirement 2 — Comprehensive Dosha Checker Service

**User Story:** As a user, I want a single service call that returns all major doshas (Manglik, Kaal Sarp, Nadi, Bhakoot) for a birth chart, so I don't need to call three separate services.

### Acceptance Criteria

2.1 A new file `src/services/doshaCheckerService.ts` must export:
```ts
getComprehensiveDoshaReport(
  dateOfBirth: string,     // ISO format YYYY-MM-DD
  timeOfBirth: string,     // HH:MM (24hr)
  latitude: number,
  longitude: number
): Promise<DoshaReport>
```

2.2 `DoshaReport` must include:
- `manglik`: result from the existing `checkManglikDosha()` in `manglikService.ts` — **not** a simplified re-implementation.
- `kaalSarp`: `{ present: boolean; type: KaalSarpType; affectedHouses: number[]; severity: 'None' | 'Partial' | 'Full' }` — computed from planet positions relative to Rahu/Ketu axis.
- `nadiDosha`: `null` (single-person check cannot determine this — requires partner Nakshatra).
- `summary`: `{ totalDoshas: number; criticalDoshas: string[]; moderateDoshas: string[]; recommendations: string[] }`.

2.3 Kaal Sarp detection must identify the type (Anant, Kulik, Vasuki, Shankhpal, Padma, Mahapadma, Takshak, Karkotak, Shankhchur, Ghatak, Vishdhar, Sheshnag) based on which house axis Rahu/Ketu occupy.

2.4 Partial Kaal Sarp (one or more planets outside the Rahu–Ketu arc) must be distinguished from Full Kaal Sarp (all 7 classical planets within the arc).

2.5 The service must not throw; errors must be caught and reflected in the summary with a descriptive message.

---

## Requirement 3 — Manglik Cross-Check in Ashtakuta Scoring

**User Story:** As a user, I want the Ashtakuta report to automatically warn me when there is a Manglik mismatch between partners, because this is a critical issue that overrides the numeric score.

### Acceptance Criteria

3.1 A new file `src/services/ashtakutaServiceEnhanced.ts` must export:
```ts
calculateEnhancedAshtakuta(
  male: PartnerData,
  female: PartnerData
): Promise<EnhancedCompatibilityReport>
```

3.2 `EnhancedCompatibilityReport` must contain:
- `ashtakuta`: the full result from the existing `calculateAshtakuta()` (no reimplementation).
- `manglikAnalysis`: `{ maleStatus: ManglikResult; femaleStatus: ManglikResult; recommendation: string; remedies?: string[] }`.
- `criticalIssues`: `string[]` — includes Nadi Dosha and unmatched Manglik.
- `overallRecommendation`: one of `'Highly Recommended' | 'Proceed with Remedies' | 'Caution Advised' | 'Not Recommended'`.

3.3 Manglik cross-check rules (classical):
- Both Manglik → dosha neutralised; no penalty.
- One Manglik, other not → `criticalIssues` entry + `'Caution Advised'` floor on recommendation.
- Neither Manglik → no impact.

3.4 `calculateEnhancedAshtakuta` must call `checkManglikDosha` from `manglikService.ts` using geocoded coordinates (via `geocodingService.ts`), matching the existing precision standard.

3.5 Existing `calculateAshtakuta` function signature must not be changed.

---

## Requirement 4 — Add Three New Jataks to the Database

**User Story:** As a developer/astrologer, I want Arpit, Anukrati Sharma, and Parshvi Sharma present in `JATAKS_DATABASE.json` so they can be selected from the prospect picker without manual entry.

### Acceptance Criteria

4.1 `src/data/jataks/JATAKS_DATABASE.json` must include three new entries with IDs `jatak_018`, `jatak_019`, `jatak_020`.

4.2 Each entry must follow the existing schema exactly (id, name, dateOfBirth, timeOfBirth, placeOfBirth, state, country, coordinates, relationship, nakshatra, moonRashi, moonRashiIndex, inExcel, notes).

4.3 `totalJataks` at the root must be updated to `20`.

4.4 The JSON file must remain valid (parseable by `JSON.parse`).

---

## Requirement 5 — Prospect Comparison Service (Real Implementation)

**User Story:** As a user on the MatchMaking page, I want to compare one base person (Arpit) against multiple prospects side-by-side and get a ranked recommendation with the winner highlighted.

### Acceptance Criteria

5.1 `src/features/matchmaking/stubs.ts` → `compareProspects()` must be upgraded from its stub implementation to call `calculateEnhancedAshtakuta()` for each prospect pair.

5.2 The returned `ProspectComparison` must rank prospects by effective score (Ashtakuta total minus critical-dosha penalty of 4 points per critical issue).

5.3 `recommendedProspectId` must point to the highest effective-score prospect; if tied, prefer the one with fewer criticalDoshas.

5.4 `recommendationReason` must be a human-readable English sentence summarising the key differentiator (e.g., "Parshvi scores 27/36 with no critical Manglik mismatch vs Anukrati's 24/36 with Nadi Dosha").

5.5 The existing `ProspectComparison`, `ProspectSummary`, and `CompatibilityResult` type interfaces in `types.ts` must not be modified.

---

## Requirement 6 — Prospect Comparison UI

**User Story:** As a user, I want a dedicated page where I select a base person and up to 5 prospects from the Jataks database and see a ranked comparison table.

### Acceptance Criteria

6.1 A new page `src/pages/ProspectComparisonPage.tsx` must render:
- A "Base Person" picker (dropdown from JATAKS_DATABASE or manual entry).
- A "Prospects" multi-picker (up to 5, from JATAKS_DATABASE or manual entry).
- A "Compare" button that triggers `compareProspects()`.
- A results table showing: Name, Ashtakuta Score (/36), Manglik status, Critical Doshas, Overall Rating, Recommendation badge.
- The recommended prospect highlighted with a distinct visual treatment (green border / star badge).

6.2 Loading state must be shown while calculations are running.

6.3 Errors (e.g., missing birth time) must display an inline error message per prospect row, not a full-page crash.

6.4 The page must be accessible: all interactive elements have ARIA labels; the results table uses `<table>` semantics with proper `<th scope>`.

6.5 The route `/prospect-comparison` must be registered in the router (file: `src/routes/`).

---

## Requirement 7 — Match Report PDF Export

**User Story:** As a user, I want to download a PDF of any two-person compatibility result that includes Ashtakuta detail, Manglik analysis, Dosha summary, and remedies.

### Acceptance Criteria

7.1 A new file `src/services/matchmakingPdfService.ts` must export:
```ts
exportMatchReport(
  result: EnhancedCompatibilityReport,
  options?: CompatibilityPdfOptions
): Promise<void>
```

7.2 The PDF must use the existing `jspdf` + `jspdf-autotable` pattern from `pdfExportService.ts` — no new PDF library may be introduced.

7.3 The PDF must contain these sections (in order):
1. Cover page: names, overall recommendation badge, date generated.
2. Ashtakuta detail table: all 8 Koota rows with scored / max / compatibility label.
3. Manglik Dosha section: male status, female status, combined recommendation.
4. Dosha summary: Kaal Sarp result, critical issues list.
5. Remedies: bulleted list (English).

7.4 The `CompatibilityPdfOptions.language` field must be respected: `'en'` → English only; `'hi'` → Hindi only; `'both'` → bilingual (English then Hindi for each section).

7.5 The PDF filename must follow the pattern: `MatchReport_<name1>_<name2>_<YYYY-MM-DD>.pdf`.

7.6 A "Download PDF" button must appear on `ProspectComparisonPage.tsx` per row (per prospect) and in `EnhancedKundliMilan.tsx` after results are shown.

---

## Out of Scope

- Re-implementing any already-working service (manglikService, ashtakutaService, pdfExportService).
- Navamsha (D9) analysis — already tracked separately.
- Supabase persistence of match results.
- i18n for the UI beyond the `CompatibilityPdfOptions.language` field.
