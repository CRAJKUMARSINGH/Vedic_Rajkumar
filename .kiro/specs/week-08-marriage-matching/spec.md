# Week 08 Spec: Marriage Matching Enhancements

## Status: Complete

## Summary

Week 08 delivers the second high-value feature: **multi-prospect marriage matching** with a
complete Ashtakuta engine, comprehensive dosha detection, Manglik cross-check, prospect
comparison UI, and PDF match report export.

Chosen over generic "family mode" (already fully implemented in Week 07) because the
marriage matching spec was the next concrete, user-focused item in the `.kiro` backlog
with clear acceptance criteria and real test data (Arpit vs Anukrati/Parshvi).

---

## Goals

1. Complete the Yoni compatibility matrix (14×14, full BPHS values)
2. Add a Comprehensive Dosha Checker service (Manglik + Kaal Sarp for one chart)
3. Enhanced Ashtakuta service wrapping the existing engine with Manglik cross-check
4. Three new Jataks in JATAKS_DATABASE (Arpit, Anukrati Sharma, Parshvi Sharma)
5. Upgrade `compareProspects` stub to use the real enhanced engine
6. PDF match report export (jsPDF + autotable, no new deps)
7. ProspectComparisonPage — base person vs up to 5 prospects ranked table
8. PDF download button on EnhancedKundliMilan after results load
9. Route `/prospect-comparison` registered + feature registry entry

---

## Acceptance Criteria

### AC-1 Yoni Matrix Complete
- `YONI_COMPATIBILITY` in `ashtakutaService.ts` is a 14×14 matrix, all values 0–4
- Enemy pairs score 0: Horse–Buffalo, Elephant–Lion, Goat–Monkey, Serpent–Mongoose,
  Dog–Deer, Cat–Rat, Cow–Tiger
- Fallback branch still exists as safety net but is never reached for valid inputs

### AC-2 doshaCheckerService.ts
- Exports `getComprehensiveDoshaReport(dob, tob, lat, lon): Promise<DoshaReport>`
- Includes `manglik`, `kaalSarp`, `nadiDosha: null`, and `summary`
- Kaal Sarp identifies all 12 types (Anant through Sheshnag) by Rahu house
- Full KSY (all 7 classical planets in arc) distinguished from Partial
- Errors caught; summary.recommendations describes failure

### AC-3 ashtakutaServiceEnhanced.ts
- Exports `calculateEnhancedAshtakuta(male, female): Promise<EnhancedCompatibilityReport>`
- Wraps `calculateAshtakuta` without reimplementing it
- Adds Manglik cross-check via `checkManglikDosha` + geocoding fallback
- `criticalIssues` includes Nadi Dosha (0 pts), Bhakoot Dosha (0 pts), Manglik mismatch
- `overallRecommendation` follows the threshold table (≥28+0 → Highly Recommended, etc.)

### AC-4 JATAKS_DATABASE Updated
- `jatak_018` (Arpit), `jatak_019` (Anukrati Sharma), `jatak_020` (Parshvi Sharma) present
- `totalJataks = 20`
- JSON valid and parseable

### AC-5 compareProspects Real Implementation
- Calls `calculateEnhancedAshtakuta` per prospect
- Ranks by effectiveScore = ashtakutaScore − criticalIssues.length × 4
- Tie-break by fewer criticalDoshas
- `recommendationReason` names the key differentiator

### AC-6 matchmakingPdfService.ts
- Exports `exportMatchReport(result, options, doshaReport?)`
- Uses existing jsPDF + autotable (no new deps)
- 5 pages: Cover, Ashtakuta table, Manglik analysis, Dosha summary, Remedies
- Filename: `MatchReport_<name1>_<name2>_<YYYY-MM-DD>.pdf`
- `language` option: 'en' | 'hi' | 'both'

### AC-7 ProspectComparisonPage
- Route `/prospect-comparison` renders the page
- Base person picker + up to 5 prospects from JATAKS_DATABASE or manual entry
- Results table: Name | Score /36 | Manglik | Critical Doshas | Rating | Actions
- Recommended row: `ring-2 ring-emerald-500` + "⭐ Recommended" badge
- RecommendedBanner above table with name + reason
- Per-row PDF download button
- Accessible: `<table>` with `<th scope="col">`, `aria-live` loading region

### AC-8 EnhancedKundliMilan PDF Button
- "Download Match Report PDF" button visible after results are shown
- `handleDownloadPdf` calls `calculateEnhancedAshtakuta` + `exportMatchReport`
- `pdfLoading` spinner while generating

### AC-9 Feature Registry
- `/prospect-comparison` in FEATURE_CATALOG: badge "New", isNew: true,
  showInDesktop: true, showInMobileSheet: true, category: 'marriage'

### AC-10 Build Quality
- `npm run typecheck` exits 0 on Week 08 files
- `npm run build` succeeds
- No new `any` types introduced in Week 08 files

---

## Architecture

```
NEW FILES
src/services/
  ├── doshaCheckerService.ts         (AC-2)
  ├── ashtakutaServiceEnhanced.ts    (AC-3)
  ├── matchmakingPdfService.ts       (AC-6)
  └── pdfFontUtils.ts                (font support for matchmakingPdfService)

src/pages/
  └── ProspectComparisonPage.tsx     (AC-7)

MODIFIED FILES
src/services/
  └── ashtakutaService.ts            (AC-1 — Yoni matrix completed)

src/features/matchmaking/
  └── stubs.ts                       (AC-5 — compareProspects real impl)

src/data/jataks/
  └── JATAKS_DATABASE.json           (AC-4 — 3 new entries)

src/pages/
  └── EnhancedKundliMilan.tsx        (AC-8 — PDF button added)

src/routes/
  ├── appRoutes.tsx                  (AC-7 — route registered)
  └── featureRegistry.ts             (AC-9 — prospect-comparison entry)
```

## Test Locations
`src/tests/week8/` — marriage matching enhancement tests

## Not In Scope
- Navamsha (D9) real engine (tracked separately)
- Supabase persistence of match results
- Full i18n for comparison UI
- KP sub-lord tables
