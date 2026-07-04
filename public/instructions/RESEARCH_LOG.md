# RESEARCH LOG — ETERNAL_RESEARCH_CHILD
## Vedic Astrology App Merger — Knowledge Extraction Engine

---

## [2026-05-12 00:00] Source: KNOWLEDGE_BASE directory scan
- Content type: PRE-PROCESSED KNOWLEDGE BASE
- Knowledge extracted: Two pre-processed knowledge base files found:
  - vedic-knowledge-base-2026-05-12.md
  - vedic-knowledge-base-2026-05-12 (1).md
- Implementable as: Reference for ebook_index.md — skip already-processed books
- Priority: HIGH
- Status: QUEUED — read and index before ebook scanning begins
- Reason if skipped: N/A

---

## [2026-05-12 00:01] Source: ATTACHED_ASSETS/new 2.txt
- Content type: PRIOR ANALYSIS DOCUMENT
- Knowledge extracted:
  1. Critical Bug: Date selector in Index.tsx does NOT pass selected date to getPlanetaryPositions() — still uses CURRENT_POSITIONS
  2. Missing: PLANET_REMEDIES per-planet data (code ready in document)
  3. Missing: LIFE_AREA_EFFECTS (Career/Health/Finance/Relations per planet-house)
  4. Missing: TransitTable.tsx remedies accordion for unfavorable planets
  5. Missing: Ashtakavarga bindus integration
  6. Missing: Dasha (Mahadasha/Antardasha) integration
- Implementable as: Bug fix in Index.tsx + data additions to transitData.ts + UI in TransitTable.tsx
- Priority: HIGH (date selector bug), MEDIUM (remedies/life-area data)
- Status: QUEUED
- Reason if skipped: N/A

---

## [2026-05-12 00:02] Source: TRI_HYBRID_MERGE_ANALYSIS.md (REFERENCE-APP02)
- Content type: PRIOR MERGE ANALYSIS
- Knowledge extracted:
  1. A prior 3-way merge (Base + APP00 + APP01 + Vedic-Transit-Analysis) was completed April 29, 2026
  2. QuestionPage.tsx and questionAnalysisService.ts were identified as the ONLY unique features from reference apps
  3. Both are already present in cursor-baseline (Base) — confirmed in src/pages/QuestionPage.tsx and src/services/questionAnalysisService.ts
  4. APP00 and APP01 are confirmed subsets of Base — no unique features
  5. REFERENCE-APP02 is essentially the same as Base with audit fixes applied
- Implementable as: Confirms cursor-baseline is the most advanced version
- Priority: HIGH
- Status: IMPLEMENTED (prior merge already done)
- Reason if skipped: N/A

---

## [2026-05-12 00:03] Source: FINAL_AUDIT_STATUS.md (REFERENCE-APP02)
- Content type: AUDIT REPORT
- Knowledge extracted:
  1. 6 critical issues were fixed in REFERENCE-APP02 (April 27, 2026)
  2. Key fixes: .env removed from git, zero-width char in filename fixed, duplicate toast removed, TypeScript strict mode enabled
  3. cursor-baseline (Base) App.tsx has ADDITIONAL features vs REFERENCE-APP02:
     - Clerk authentication (ClerkProvider, ClerkProviderWithNavigate, ClerkQueryClientCacheInvalidator)
     - MainLayout wrapper component
     - Additional routes: /knowledge, /knowledge/add, /knowledge/ingest, /prashna-ai, /prashna-history, /pricing, /marriage, /nakshatra-precautions, /my-readings, /sign-in, /sign-up
  4. cursor-baseline has prasnaMargaExtras.ts, DashaAIInsights.tsx, PrasnaMargaMeters.tsx, PrasnaReadingHistory.tsx, PrasnaToolbar.tsx — NOT in REFERENCE-APP02
  5. cursor-baseline has astrologyLibrary.ts data file — NOT in REFERENCE-APP02
  6. cursor-baseline has src/lib/vedic/ subfolder (mangalDosha.ts, marriageTiming.ts, pdfExport.ts, utils.ts, vedicCalc.ts) — NOT in REFERENCE-APP02
  7. cursor-baseline has src/modules/core-vedha-analysis/ — NOT in REFERENCE-APP02
- Implementable as: Confirms cursor-baseline is MORE advanced than REFERENCE-APP02
- Priority: HIGH
- Status: DOCUMENTED
- Reason if skipped: N/A

---

## [2026-05-12 00:04] Source: Vedic_Rajkumar-V01 (replit-baseline)
- Content type: REPLIT PROTOTYPE — Backend-focused architecture
- Knowledge extracted:
  1. Completely different architecture: Express 5 + PostgreSQL + Drizzle ORM + Orval codegen
  2. Has a proper REST API layer (api/index.mjs) with Clerk auth middleware
  3. Has saved_readings CRUD endpoints (GET/POST/DELETE /api/readings)
  4. Has OpenAPI spec (lib/api-spec/openapi.yaml) — currently only /healthz endpoint
  5. Has Zod validation layer (lib/api-zod/)
  6. Has React Query hooks auto-generated from OpenAPI (lib/api-client-react/)
  7. Uses pnpm workspaces with separate packages for db, api-spec, api-zod, api-client-react
  8. NO frontend pages — this is a backend scaffold only
  9. DATABASE_URL required (PostgreSQL) — different from cursor-baseline's Supabase
- Implementable as: Backend API layer pattern for future FastAPI/Express migration
- Priority: MEDIUM (architecture reference for Phase 7 backend scaling)
- Status: QUEUED — backend patterns to be evaluated in Phase 7
- Reason if skipped: N/A

---

## [2026-05-12 00:05] Source: Vedic-mARRIAGE, Vedic-Match-Analysis, Match-Data-Analyzer
- Content type: REPLIT PROTOTYPES — Specialized feature apps
- Knowledge extracted:
  1. All three are pnpm workspace scaffolds with .replit config
  2. No src/ directories visible — likely empty scaffolds or artifacts-only
  3. Vedic-mARRIAGE has AGENT_CHAT_LOG.md — may contain feature discussions
  4. Match-Data-Analyzer has attached_assets — may contain test data
  5. All use same base stack as Vedic_Rajkumar-V01 (pnpm, TypeScript 5.9)
- Implementable as: Feature reference for marriage/matchmaking modules
- Priority: LOW (cursor-baseline already has MatchMaking.tsx and VedicMarriagePage.tsx)
- Status: QUEUED — scan AGENT_CHAT_LOG.md for unique feature ideas
- Reason if skipped: N/A

---

## [2026-05-12 00:06] Source: data/astrology-library/ (ebook scan — initial index)
- Content type: EBOOK LIBRARY
- Knowledge extracted: 121 files, 14 directories. Key formats: .pdf (68), .PDF (9), .xlsx (7), .epub (4), .docx (6)
  Notable books identified:
  - Prasnatantra-Raman-B-V.pdf (HIGH PRIORITY — Prasna Marga source)
  - Mathematical-Calculation-of-Longevity.doc
  - Ancestors curse.docx / Ancestors-Curse-Pitradosh-Remedies.doc
  - Ank-Vidya.pdf (Numerology)
  - Bhartiya Jyotish ka Parichay.pdf
  - Dynamic-Astrology.pdf
  - CIJ01.pdf, CIJ02.pdf, CIJ03.pdf (Collected Indian Jyotish?)
  - Derek Appleby - Horary Astrology (1985)
  - Chara Dasha Part 1 (Basics & Calculations)
  - DIVISIONAL CHARTS D10 folder
  - ASTROLOGY E-BOOK ARUN SAHMITA LAL KITAB folder
- Implementable as: ETERNAL_RESEARCH_CHILD ebook processing queue
- Priority: HIGH (Prasnatantra), MEDIUM (others)
- Status: QUEUED — Phase 4 ebook processing
- Reason if skipped: N/A

---

---

## [2026-05-12 01:00] Source: KNOWLEDGE_BASE pre-processed files (both)
- Content type: PRE-PROCESSED KNOWLEDGE BASE (from ETERNAL_RESEARCH_CHILD first run)
- Knowledge extracted:
  1. Files were processed from G:/ASTROLOGY/ path — no longer accessible
  2. Content: Western astrology texts (ACG Astro*Carto*Graphy, Alfridaries, Jeff Green outer planets)
  3. 5 cards in first file, 10 cards in second (duplicates)
  4. NO Vedic classical texts processed yet
  5. The ebooks in data/astrology-library/ have NOT been processed
- Implementable as: Confirms Phase 4 ebook processing must start fresh with local library
- Priority: HIGH — Phase 4 activation needed
- Status: DOCUMENTED — Phase 4 queue ready
- Reason if skipped: N/A

---

## [2026-05-12 01:01] Source: Vedic-mARRIAGE/artifacts/vedic-kanchi/
- Content type: REPLIT ARTIFACT — Marriage timing app for Kanchi Jain
- Knowledge extracted:
  1. NorthIndianChart.tsx — SVG North Indian style chart component (UNIQUE)
  2. marriageTiming.ts — 5-method marriage timing analysis (Vimshottari, Jupiter transit, UL, Saturn, Jaimini)
  3. vedicCalc.ts — Jean Meeus astronomical algorithms (Lahiri ayanamsa, LST, VSOP87)
  4. pdfExport.ts — jsPDF chart export with D-1 and D-9
  5. mangalDosha.ts — Mangal Dosha detection
  6. KanchiPage.tsx — Full marriage analysis page with tabs
  7. Marriage timing methods documented in AGENT_CHAT_LOG.md
  8. Spouse direction analysis (7th lord house → direction map)
  9. Upapada Lagna (UL) calculation (Jaimini method)
  10. Jaimini Chara Dasha / A7 (Darapada) calculation
  - NOTE: vedicCalc.ts, marriageTiming.ts, pdfExport.ts, mangalDosha.ts are ALREADY in Base/src/lib/vedic/
  - NOTE: NorthIndianChart.tsx and KanchiPage.tsx are NOT in Base — these are unique
- Implementable as: NorthIndianChart.tsx → port to Base as new component; KanchiPage.tsx → enhance VedicMarriagePage.tsx
- Priority: 🟠 HIGH — NorthIndianChart is a unique visual component
- Status: QUEUED — port NorthIndianChart.tsx to Base
- Reason if skipped: N/A

---

## [2026-05-12 01:02] Source: Baseline test run — cursor-baseline
- Content type: TEST RESULTS
- Knowledge extracted:
  1. 203/203 tests PASS
  2. 12 test files covering: ascendant, ashtakavarga, dasha, divisionalCharts, ephemeris, jaimini, manglik, nakshatra, precisionEphemeris, shadabala, yoga, useChartCalculation
  3. OOM issue on first run — requires NODE_OPTIONS=--max-old-space-size=4096
  4. TypeScript: 0 errors (strict mode)
  5. .env NOT tracked in git ✅
  6. PLANET_REMEDIES IS present in transitData.ts ✅
  7. TransitTable.tsx already has remedies accordion ✅
  8. Date selector already uses calculateDynamicTransits with transitDate ✅
- Implementable as: Baseline documented — all critical items already implemented
- Priority: HIGH
- Status: DOCUMENTED
- Reason if skipped: N/A

---

## [2026-05-15T03:31:43.550Z] Source: VEDIC.txt | Pages/Section: Full Document
- Content type: LFS-DATA / TXT
- Knowledge extracted: BV Raman methodology, Vedha, Vipreet Vedha, Tarabala rules
- Implementable as: src/services/vipreetVedhaService.ts
- Priority: MEDIUM
- Status: QUEUED
- Reason if skipped: None
---
