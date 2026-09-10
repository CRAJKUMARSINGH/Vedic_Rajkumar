# Design: Marriage Matching Enhancements

## Architecture Overview

This feature adds five new files and modifies six existing ones. All changes are additive — no existing public API is broken.

```
NEW FILES
src/services/
  ├── doshaCheckerService.ts         (R2 — Dosha report)
  ├── ashtakutaServiceEnhanced.ts    (R3 — Enhanced Ashtakuta + Manglik)
  └── matchmakingPdfService.ts       (R7 — PDF export)

src/pages/
  └── ProspectComparisonPage.tsx     (R6 — Comparison UI)

MODIFIED FILES
src/services/
  └── ashtakutaService.ts            (R1 — complete YONI_COMPATIBILITY matrix)

src/features/matchmaking/
  └── stubs.ts                       (R5 — compareProspects real implementation)

src/data/jataks/
  └── JATAKS_DATABASE.json           (R4 — add 3 new entries)

src/pages/
  └── EnhancedKundliMilan.tsx        (R7 — add "Download PDF" button)

src/routes/
  └── appRoutes.tsx                  (R6 — register /prospect-comparison)
```

---

## 1. Yoni Compatibility Matrix (`ashtakutaService.ts`)

### Change

Replace the partial `YONI_COMPATIBILITY` constant (only Horse + Elephant rows defined) with a complete 14×14 matrix.

### Complete Matrix (per BPHS classical values)

The existing `YoniAnimal` enum already defines all 14 animals in the correct order. The matrix uses enum keys so TypeScript enforces completeness.

```typescript
const YONI_COMPATIBILITY: Record<YoniAnimal, Record<YoniAnimal, number>> = {
  [YoniAnimal.HORSE]: {
    [YoniAnimal.HORSE]: 4,   [YoniAnimal.ELEPHANT]: 2, [YoniAnimal.GOAT]: 2,
    [YoniAnimal.SERPENT]: 3, [YoniAnimal.DOG]: 2,       [YoniAnimal.CAT]: 2,
    [YoniAnimal.RAT]: 2,     [YoniAnimal.COW]: 3,       [YoniAnimal.BUFFALO]: 0,
    [YoniAnimal.TIGER]: 1,   [YoniAnimal.DEER]: 2,      [YoniAnimal.MONKEY]: 3,
    [YoniAnimal.LION]: 1,    [YoniAnimal.MONGOOSE]: 2
  },
  [YoniAnimal.ELEPHANT]: {
    [YoniAnimal.HORSE]: 2,   [YoniAnimal.ELEPHANT]: 4, [YoniAnimal.GOAT]: 3,
    [YoniAnimal.SERPENT]: 3, [YoniAnimal.DOG]: 2,       [YoniAnimal.CAT]: 2,
    [YoniAnimal.RAT]: 2,     [YoniAnimal.COW]: 2,       [YoniAnimal.BUFFALO]: 3,
    [YoniAnimal.TIGER]: 2,   [YoniAnimal.DEER]: 2,      [YoniAnimal.MONKEY]: 3,
    [YoniAnimal.LION]: 0,    [YoniAnimal.MONGOOSE]: 2
  },
  [YoniAnimal.GOAT]: {
    [YoniAnimal.HORSE]: 2,   [YoniAnimal.ELEPHANT]: 3, [YoniAnimal.GOAT]: 4,
    [YoniAnimal.SERPENT]: 2, [YoniAnimal.DOG]: 1,       [YoniAnimal.CAT]: 2,
    [YoniAnimal.RAT]: 2,     [YoniAnimal.COW]: 3,       [YoniAnimal.BUFFALO]: 2,
    [YoniAnimal.TIGER]: 1,   [YoniAnimal.DEER]: 3,      [YoniAnimal.MONKEY]: 2,
    [YoniAnimal.LION]: 1,    [YoniAnimal.MONGOOSE]: 2
  },
  [YoniAnimal.SERPENT]: {
    [YoniAnimal.HORSE]: 3,   [YoniAnimal.ELEPHANT]: 3, [YoniAnimal.GOAT]: 2,
    [YoniAnimal.SERPENT]: 4, [YoniAnimal.DOG]: 1,       [YoniAnimal.CAT]: 2,
    [YoniAnimal.RAT]: 1,     [YoniAnimal.COW]: 3,       [YoniAnimal.BUFFALO]: 3,
    [YoniAnimal.TIGER]: 1,   [YoniAnimal.DEER]: 2,      [YoniAnimal.MONKEY]: 0,
    [YoniAnimal.LION]: 2,    [YoniAnimal.MONGOOSE]: 0
  },
  [YoniAnimal.DOG]: {
    [YoniAnimal.HORSE]: 2,   [YoniAnimal.ELEPHANT]: 2, [YoniAnimal.GOAT]: 1,
    [YoniAnimal.SERPENT]: 1, [YoniAnimal.DOG]: 4,       [YoniAnimal.CAT]: 2,
    [YoniAnimal.RAT]: 1,     [YoniAnimal.COW]: 2,       [YoniAnimal.BUFFALO]: 2,
    [YoniAnimal.TIGER]: 1,   [YoniAnimal.DEER]: 0,      [YoniAnimal.MONKEY]: 2,
    [YoniAnimal.LION]: 2,    [YoniAnimal.MONGOOSE]: 2
  },
  [YoniAnimal.CAT]: {
    [YoniAnimal.HORSE]: 2,   [YoniAnimal.ELEPHANT]: 2, [YoniAnimal.GOAT]: 2,
    [YoniAnimal.SERPENT]: 2, [YoniAnimal.DOG]: 2,       [YoniAnimal.CAT]: 4,
    [YoniAnimal.RAT]: 0,     [YoniAnimal.COW]: 2,       [YoniAnimal.BUFFALO]: 2,
    [YoniAnimal.TIGER]: 1,   [YoniAnimal.DEER]: 2,      [YoniAnimal.MONKEY]: 2,
    [YoniAnimal.LION]: 2,    [YoniAnimal.MONGOOSE]: 2
  },
  [YoniAnimal.RAT]: {
    [YoniAnimal.HORSE]: 2,   [YoniAnimal.ELEPHANT]: 2, [YoniAnimal.GOAT]: 2,
    [YoniAnimal.SERPENT]: 1, [YoniAnimal.DOG]: 1,       [YoniAnimal.CAT]: 0,
    [YoniAnimal.RAT]: 4,     [YoniAnimal.COW]: 3,       [YoniAnimal.BUFFALO]: 2,
    [YoniAnimal.TIGER]: 1,   [YoniAnimal.DEER]: 2,      [YoniAnimal.MONKEY]: 2,
    [YoniAnimal.LION]: 1,    [YoniAnimal.MONGOOSE]: 2
  },
  [YoniAnimal.COW]: {
    [YoniAnimal.HORSE]: 3,   [YoniAnimal.ELEPHANT]: 2, [YoniAnimal.GOAT]: 3,
    [YoniAnimal.SERPENT]: 3, [YoniAnimal.DOG]: 2,       [YoniAnimal.CAT]: 2,
    [YoniAnimal.RAT]: 3,     [YoniAnimal.COW]: 4,       [YoniAnimal.BUFFALO]: 3,
    [YoniAnimal.TIGER]: 0,   [YoniAnimal.DEER]: 2,      [YoniAnimal.MONKEY]: 2,
    [YoniAnimal.LION]: 1,    [YoniAnimal.MONGOOSE]: 2
  },
  [YoniAnimal.BUFFALO]: {
    [YoniAnimal.HORSE]: 0,   [YoniAnimal.ELEPHANT]: 3, [YoniAnimal.GOAT]: 2,
    [YoniAnimal.SERPENT]: 3, [YoniAnimal.DOG]: 2,       [YoniAnimal.CAT]: 2,
    [YoniAnimal.RAT]: 2,     [YoniAnimal.COW]: 3,       [YoniAnimal.BUFFALO]: 4,
    [YoniAnimal.TIGER]: 1,   [YoniAnimal.DEER]: 2,      [YoniAnimal.MONKEY]: 2,
    [YoniAnimal.LION]: 1,    [YoniAnimal.MONGOOSE]: 2
  },
  [YoniAnimal.TIGER]: {
    [YoniAnimal.HORSE]: 1,   [YoniAnimal.ELEPHANT]: 2, [YoniAnimal.GOAT]: 1,
    [YoniAnimal.SERPENT]: 1, [YoniAnimal.DOG]: 1,       [YoniAnimal.CAT]: 1,
    [YoniAnimal.RAT]: 1,     [YoniAnimal.COW]: 0,       [YoniAnimal.BUFFALO]: 1,
    [YoniAnimal.TIGER]: 4,   [YoniAnimal.DEER]: 0,      [YoniAnimal.MONKEY]: 2,
    [YoniAnimal.LION]: 2,    [YoniAnimal.MONGOOSE]: 1
  },
  [YoniAnimal.DEER]: {
    [YoniAnimal.HORSE]: 2,   [YoniAnimal.ELEPHANT]: 2, [YoniAnimal.GOAT]: 3,
    [YoniAnimal.SERPENT]: 2, [YoniAnimal.DOG]: 0,       [YoniAnimal.CAT]: 2,
    [YoniAnimal.RAT]: 2,     [YoniAnimal.COW]: 2,       [YoniAnimal.BUFFALO]: 2,
    [YoniAnimal.TIGER]: 0,   [YoniAnimal.DEER]: 4,      [YoniAnimal.MONKEY]: 2,
    [YoniAnimal.LION]: 1,    [YoniAnimal.MONGOOSE]: 2
  },
  [YoniAnimal.MONKEY]: {
    [YoniAnimal.HORSE]: 3,   [YoniAnimal.ELEPHANT]: 3, [YoniAnimal.GOAT]: 2,
    [YoniAnimal.SERPENT]: 0, [YoniAnimal.DOG]: 2,       [YoniAnimal.CAT]: 2,
    [YoniAnimal.RAT]: 2,     [YoniAnimal.COW]: 2,       [YoniAnimal.BUFFALO]: 2,
    [YoniAnimal.TIGER]: 2,   [YoniAnimal.DEER]: 2,      [YoniAnimal.MONKEY]: 4,
    [YoniAnimal.LION]: 2,    [YoniAnimal.MONGOOSE]: 2
  },
  [YoniAnimal.LION]: {
    [YoniAnimal.HORSE]: 1,   [YoniAnimal.ELEPHANT]: 0, [YoniAnimal.GOAT]: 1,
    [YoniAnimal.SERPENT]: 2, [YoniAnimal.DOG]: 2,       [YoniAnimal.CAT]: 2,
    [YoniAnimal.RAT]: 1,     [YoniAnimal.COW]: 1,       [YoniAnimal.BUFFALO]: 1,
    [YoniAnimal.TIGER]: 2,   [YoniAnimal.DEER]: 1,      [YoniAnimal.MONKEY]: 2,
    [YoniAnimal.LION]: 4,    [YoniAnimal.MONGOOSE]: 2
  },
  [YoniAnimal.MONGOOSE]: {
    [YoniAnimal.HORSE]: 2,   [YoniAnimal.ELEPHANT]: 2, [YoniAnimal.GOAT]: 2,
    [YoniAnimal.SERPENT]: 0, [YoniAnimal.DOG]: 2,       [YoniAnimal.CAT]: 2,
    [YoniAnimal.RAT]: 2,     [YoniAnimal.COW]: 2,       [YoniAnimal.BUFFALO]: 2,
    [YoniAnimal.TIGER]: 1,   [YoniAnimal.DEER]: 2,      [YoniAnimal.MONKEY]: 2,
    [YoniAnimal.LION]: 2,    [YoniAnimal.MONGOOSE]: 4
  },
};
```

The comment `// Add more mappings as needed - simplified for now` on line ~308 is removed.

---

## 2. `doshaCheckerService.ts` (new file)

### Dependencies
- `checkManglikDosha` from `./manglikService`
- `calculateCompletePlanetaryPositions` (already used inside manglikService — same import pattern)
- `calculateCompleteAscendant` (same)
- `KAAL_SARP_TYPES` data from `../data/kaalSarpData` (already exported)

### Key Types

```typescript
// src/services/doshaCheckerService.ts

export type KaalSarpType =
  | 'Anant' | 'Kulik' | 'Vasuki' | 'Shankhpal' | 'Padma' | 'Mahapadma'
  | 'Takshak' | 'Karkotak' | 'Shankhnaad' | 'Patak' | 'Vishdhar' | 'Sheshnag'
  | 'None';

export interface KaalSarpResult {
  present: boolean;
  type: KaalSarpType;
  affectedHouses: number[];
  severity: 'None' | 'Partial' | 'Full';
  description: { en: string; hi: string };
  remedies: { en: string[]; hi: string[] };
}

export interface DoshaReport {
  manglik: ManglikResult;           // from manglikService — full type, not simplified
  kaalSarp: KaalSarpResult;
  nadiDosha: null;                  // single-person check cannot determine
  summary: {
    totalDoshas: number;
    criticalDoshas: string[];
    moderateDoshas: string[];
    recommendations: string[];
  };
}

export async function getComprehensiveDoshaReport(
  dateOfBirth: string,
  timeOfBirth: string,
  latitude: number,
  longitude: number,
): Promise<DoshaReport>
```

### Kaal Sarp Detection Algorithm

```
1. Call calculateCompletePlanetaryPositions(dateOfBirth, timeOfBirth)
2. Find Rahu and Ketu rashiIndex (0-11)
3. Find ascendant rashiIndex via calculateCompleteAscendant
4. Convert each planet's rashiIndex to house number (1-12) relative to ascendant
5. rahuHouse = toHouseFromAsc(rahu.rashiIndex)
6. Identify KaalSarpType from RAHU_HOUSE_TO_TYPE map (rahuHouse → type name)
7. Determine arc: all planets must lie in the arc from Rahu → Ketu (going clockwise)
   - Full: all 7 classical planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) lie within arc
   - Partial: at least 1 classical planet is outside the arc
   - None: either no arc condition or Rahu/Ketu not found
8. affectedHouses: house numbers of planets within the arc
```

```typescript
const RAHU_HOUSE_TO_TYPE: Record<number, KaalSarpType> = {
  1: 'Anant', 2: 'Kulik', 3: 'Vasuki', 4: 'Shankhpal',
  5: 'Padma', 6: 'Mahapadma', 7: 'Takshak', 8: 'Karkotak',
  9: 'Shankhnaad', 10: 'Patak', 11: 'Vishdhar', 12: 'Sheshnag',
};
```

---

## 3. `ashtakutaServiceEnhanced.ts` (new file)

### Dependencies
- `calculateAshtakuta`, `PartnerData`, `CompatibilityReport` from `./ashtakutaService`
- `checkManglikDosha`, `ManglikResult` from `./manglikService`
- `getCoordinates` from `./geocodingService` (to convert `placeOfBirth` string → lat/lon)

### Types

```typescript
// src/services/ashtakutaServiceEnhanced.ts

export interface ManglikCrossCheck {
  maleStatus: ManglikResult;
  femaleStatus: ManglikResult;
  /** Classical rule: both Manglik neutralises the dosha */
  bothManglik: boolean;
  mismatch: boolean;        // exactly one partner is effectively Manglik
  recommendation: string;   // human-readable English
  remedies: string[];
}

export interface EnhancedCompatibilityReport {
  /** Full result from calculateAshtakuta — unmodified */
  ashtakuta: CompatibilityReport;
  manglikAnalysis: ManglikCrossCheck;
  criticalIssues: string[];
  overallRecommendation:
    | 'Highly Recommended'
    | 'Proceed with Remedies'
    | 'Caution Advised'
    | 'Not Recommended';
}

export async function calculateEnhancedAshtakuta(
  male: PartnerData,
  female: PartnerData,
): Promise<EnhancedCompatibilityReport>
```

### Recommendation Thresholds

| Ashtakuta Score | Critical Issues | Result |
|---|---|---|
| ≥ 28 | 0 | Highly Recommended |
| ≥ 21 | ≤ 1 | Proceed with Remedies |
| ≥ 18 | any | Caution Advised |
| < 18 | any | Not Recommended |

Manglik mismatch always adds one entry to `criticalIssues`, which floors the recommendation to at most "Proceed with Remedies" unless score is also < 18.

### Geocoding Strategy

`PartnerData.placeOfBirth` is a string. Use `getCoordinates(placeOfBirth)` from `geocodingService`. If the API call fails or returns null, fall back to India geographic centre (20.5937°N, 78.9629°E) and log a warning — do not throw.

---

## 4. JATAKS_DATABASE.json additions

Three entries appended to the `jataks` array. `totalJataks` changes from `17` → `20`.

```json
{
  "id": "jatak_018",
  "name": "Arpit",
  "dateOfBirth": "2001-10-03",
  "timeOfBirth": "08:05",
  "placeOfBirth": "Shikohabad",
  "state": "Uttar Pradesh",
  "country": "India",
  "coordinates": { "latitude": "27.11°N", "longitude": "78.59°E" },
  "relationship": "Prospect (Male)",
  "nakshatra": "Swati",
  "moonRashi": "Libra (तुला)",
  "moonRashiIndex": 6,
  "inExcel": false,
  "notes": "Marriage matching prospect – 2026"
},
{
  "id": "jatak_019",
  "name": "Anukrati Sharma",
  "dateOfBirth": "2002-01-11",
  "timeOfBirth": "15:02",
  "placeOfBirth": "Aligarh",
  "state": "Uttar Pradesh",
  "country": "India",
  "coordinates": { "latitude": "27.88°N", "longitude": "78.08°E" },
  "relationship": "Prospect (Female) – Girl01",
  "nakshatra": "Pushya",
  "moonRashi": "Cancer (कर्क)",
  "moonRashiIndex": 3,
  "inExcel": false,
  "notes": "Match prospect for Arpit – expected ~24/36"
},
{
  "id": "jatak_020",
  "name": "Parshvi Sharma",
  "dateOfBirth": "2002-02-02",
  "timeOfBirth": "21:12",
  "placeOfBirth": "Kota",
  "state": "Rajasthan",
  "country": "India",
  "coordinates": { "latitude": "25.18°N", "longitude": "75.83°E" },
  "relationship": "Prospect (Female) – Girl02",
  "nakshatra": "Mrigashirsha",
  "moonRashi": "Gemini (मिथुन)",
  "moonRashiIndex": 2,
  "inExcel": false,
  "notes": "Match prospect for Arpit – expected ~27/36"
}
```

---

## 5. `stubs.ts` — `compareProspects` upgrade

The stub already has the correct shape and logic skeleton. The only change needed is replacing the `calculateCompatibility` call (which remains stubbed) with `calculateEnhancedAshtakuta` from the new service, and computing an **effective score** for ranking.

### Effective Score Formula

```
effectiveScore = ashtakutaScore - (criticalIssueCount × 4)
```

Rationale: Nadi Dosha or Manglik mismatch each subtract 4 points from the ranking score (but the displayed `ashtakutaScore` stays as raw /36).

### Key change in `compareProspects`

```typescript
import { calculateEnhancedAshtakuta } from '@/services/ashtakutaServiceEnhanced';

// inside the map():
const enhanced = await calculateEnhancedAshtakuta(
  { name: basePerson.name, dateOfBirth: basePerson.dob, timeOfBirth: basePerson.time, placeOfBirth: basePerson.place },
  { name: prospect.name, dateOfBirth: prospect.dob, timeOfBirth: prospect.time, placeOfBirth: prospect.place },
);
const criticalCount = enhanced.criticalIssues.length;
const effectiveScore = enhanced.ashtakuta.totalPoints - criticalCount * 4;
```

Sort by `effectiveScore` descending; tie-break by `criticalCount` ascending.

`recommendationReason` must specifically name the key differentiator:

```
`${recommended.name} scores ${recommended.ashtakutaScore}/36` +
(criticalCount === 0
  ? ` with no critical doshas`
  : ` (effective ${effectiveScore}/36 after dosha adjustment)`)
+ (others exist ? ` vs ${secondBest.name}'s ${secondBest.ashtakutaScore}/36` : '').
```

---

## 6. `ProspectComparisonPage.tsx` (new page)

### Component Structure

```
ProspectComparisonPage
├── Header (title, subtitle)
├── InputSection
│   ├── BasePersonPicker
│   │   ├── JatakDropdown (from JATAKS_DATABASE)
│   │   └── ManualEntryToggle (shows PersonForm if selected)
│   └── ProspectsPicker (up to 5)
│       ├── JatakDropdown × N
│       ├── [+ Add Prospect] button
│       └── ManualEntryToggle per prospect
├── [Compare] button
├── LoadingState (spinner + "Calculating compatibility…")
├── ErrorBanner (per-prospect inline errors)
└── ResultsTable (visible after calculation)
    ├── RecommendedBanner (highlighted card for top prospect)
    └── ComparisonTable
        ├── thead: Name | Score /36 | Manglik | Critical Doshas | Rating | Actions
        └── tbody: one row per prospect
            └── [Download PDF] button per row
```

### State Shape

```typescript
interface PageState {
  basePerson: JatakEntry | ManualEntry | null;
  prospects: Array<JatakEntry | ManualEntry>;
  loading: boolean;
  errors: Record<string, string>;       // prospectId → error message
  result: ProspectComparison | null;
  pdfGenerating: Record<string, boolean>; // prospectId → loading flag
}
```

### JatakEntry vs ManualEntry

```typescript
// from JATAKS_DATABASE
type JatakEntry = { source: 'jatak'; jatak: JatakRecord };

// typed directly by user
type ManualEntry = {
  source: 'manual';
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
};
```

### Accessibility Requirements
- `<table role="table">` with `<th scope="col">` headers
- Dropdowns: `aria-label="Select base person from database"`
- Buttons: `aria-label="Download PDF for {name}"`
- Loading state: `aria-live="polite"` region
- Recommended row: `aria-label="Recommended match"` on the highlight element

### Route Registration

In `appRoutes.tsx`:
```typescript
const ProspectComparisonPage = lazy(() => import('@/pages/ProspectComparisonPage'));
// in APP_ROUTES array:
route('/prospect-comparison', <ProspectComparisonPage />),
```

---

## 7. `matchmakingPdfService.ts` (new file)

### Dependencies
- `jsPDF` from `jspdf` (already in `node_modules`)
- `autoTable` from `jspdf-autotable` (already in `node_modules`)
- Follows the pattern established in `pdfExportService.ts` — same import style, same page layout helpers

### Public API

```typescript
export async function exportMatchReport(
  result: EnhancedCompatibilityReport,
  options: CompatibilityPdfOptions = {},
): Promise<void>
```

### PDF Section Order

| Page | Content |
|---|---|
| 1 | Cover: names, overall recommendation badge, score /36, date |
| 2 | Ashtakuta table: 8-row autotable (Kuta / Scored / Max / Compatibility) |
| 3 | Manglik analysis: male status, female status, cross-check recommendation |
| 4 | Dosha summary: Kaal Sarp type + severity, critical issues list |
| 5 | Remedies: bulleted list |

### Filename Pattern
```
MatchReport_${name1}_${name2}_${new Date().toISOString().slice(0,10)}.pdf
```

Names are sanitised (spaces → underscores, special chars stripped).

### Language Handling
- `'en'`: render only English text fields
- `'hi'`: render only Hindi text fields
- `'both'`: render English paragraph, then Hindi paragraph with a light divider between them

### Integration with EnhancedKundliMilan.tsx

Add after the "Classical reference" section (before the Muhurta block):

```tsx
{result && (
  <button
    onClick={() => handleDownloadPdf()}
    disabled={pdfLoading}
    aria-label="Download match report as PDF"
    className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold
               transition-colors flex items-center justify-center gap-2 border border-white/10">
    {pdfLoading
      ? <><span className="animate-spin">⚙</span> Generating PDF…</>
      : <><span>📄</span> Download Match Report PDF</>}
  </button>
)}
```

`handleDownloadPdf` converts `result` (the local `MilanResult`) into an `EnhancedCompatibilityReport`-shaped object and calls `exportMatchReport`.

---

## Data Flow Summary

```
User selects persons
      │
      ▼
compareProspects(basePerson, [prospect1, prospect2])    ← stubs.ts (upgraded)
      │
      ├──► calculateEnhancedAshtakuta(male, female)      ← ashtakutaServiceEnhanced.ts
      │         │
      │         ├──► calculateAshtakuta(male, female)    ← ashtakutaService.ts (YONI fix)
      │         └──► checkManglikDosha(lat, lon, …)      ← manglikService.ts (unchanged)
      │
      ▼
ProspectComparison (ranked, with recommendedId)
      │
      ├──► ProspectComparisonPage renders table
      │
      └──► exportMatchReport(enhanced, options)          ← matchmakingPdfService.ts
                │
                └──► jsPDF + autoTable → browser download
```

---

## TypeScript Strictness Notes

- `doshaCheckerService.ts`: avoid `any` — import `ManglikResult` type from `manglikService`; import planet position types from wherever `calculateCompletePlanetaryPositions` exports them.
- `ashtakutaServiceEnhanced.ts`: `CompatibilityReport` is already exported from `ashtakutaService.ts` — use it directly.
- `ProspectComparisonPage.tsx`: the `JatakRecord` type must be derived from the JSON shape — define a local interface or import from a types file.
- All `async` functions must have explicit return type annotations.
- `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comments are acceptable only in the geocoding fallback path.
