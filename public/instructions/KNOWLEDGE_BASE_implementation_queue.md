# IMPLEMENTATION QUEUE — ETERNAL_RESEARCH_CHILD
## C:\VedicMerge\KNOWLEDGE_BASE\implementation_queue.md
**Last Updated:** 2026-05-12

---

| # | Priority | Feature/Fix | Source | Type | Status |
|---|----------|-------------|--------|------|--------|
| 1 | 🔴 CRITICAL | Fix date selector → ephemeris wiring in Index.tsx | new 2.txt (ATTACHED_ASSETS) | BUG FIX | ✅ ALREADY FIXED — uses calculateDynamicTransits with transitDate |
| 2 | 🔴 CRITICAL | Verify .env not tracked in cursor-baseline git | FINAL_AUDIT_STATUS.md | SECURITY | ✅ VERIFIED — git ls-files .env returns empty |
| 3 | 🟠 HIGH | Add PLANET_REMEDIES data to transitData.ts | new 2.txt (ready code) | DATA | ✅ ALREADY PRESENT — lines 320+ of transitData.ts |
| 4 | 🟠 HIGH | Add LIFE_AREA_EFFECTS data to transitData.ts | new 2.txt (ready code) | DATA | ✅ ALREADY PRESENT — in enhancedTransitEffects.ts |
| 5 | 🟠 HIGH | Wire per-planet remedies accordion in TransitTable.tsx | new 2.txt (ready code) | UI | ✅ ALREADY IMPLEMENTED — TransitTable.tsx lines 194-203 |
| 6 | 🟠 HIGH | Read pre-processed knowledge base files | KNOWLEDGE_BASE/ | RESEARCH | ✅ DONE — Western astrology only, Vedic ebooks not yet processed |
| 7 | 🟠 HIGH | Process Prasnatantra-Raman-B-V.pdf | ATTACHED_ASSETS/ | EBOOK | QUEUED |
| 8 | 🟠 HIGH | Process Mathematical-Calculation-of-Longevity.doc | data/astrology-library/ | EBOOK | QUEUED |
| 9 | 🟠 HIGH | Process CIJ01-03.pdf series | data/astrology-library/ | EBOOK | QUEUED |
| 10 | 🟠 HIGH | Process Chara Dasha Part 1.htm | data/astrology-library/ | EBOOK | QUEUED |
| 11 | 🟠 HIGH | Scan Astrology Books/ folder | data/astrology-library/ | EBOOK | QUEUED |
| 12 | 🟠 HIGH | Scan ASTROLOGY E-BOOK ARUN SAHMITA LAL KITAB/ | data/astrology-library/ | EBOOK | QUEUED |
| 13 | 🟠 HIGH | Scan DIVISIONAL CHARTS D10/ | data/astrology-library/ | EBOOK | QUEUED |
| 14 | 🟡 MEDIUM | Port saved_readings API from Vedic_Rajkumar-V01 | Vedic_Rajkumar-V01/api/ | BACKEND | QUEUED |
| 15 | 🟡 MEDIUM | Scan Vedic-mARRIAGE AGENT_CHAT_LOG.md | Reference/Vedic-mARRIAGE/ | RESEARCH | ✅ DONE — NorthIndianChart.tsx and KanchiPage.tsx identified as unique |
| 15a | 🟠 HIGH | Port NorthIndianChart.tsx to Base | Vedic-mARRIAGE/artifacts/vedic-kanchi/ | FEATURE | QUEUED |
| 15b | 🟠 HIGH | Enhance VedicMarriagePage.tsx with KanchiPage features | Vedic-mARRIAGE/artifacts/vedic-kanchi/ | FEATURE | QUEUED |
| 16 | 🟡 MEDIUM | Add Ashtakavarga bindus to transit view | Planned | FEATURE | QUEUED |
| 17 | 🟡 MEDIUM | Add Dasha integration to transit view | Planned | FEATURE | QUEUED |
| 18 | 🟡 MEDIUM | Add GitHub Actions CI/CD workflow | New | DEVOPS | QUEUED |
| 19 | 🟡 MEDIUM | Process Ank-Vidya.pdf (Numerology) | data/astrology-library/ | EBOOK | QUEUED |
| 20 | 🟡 MEDIUM | Process Ancestors curse / Pitradosh docs | data/astrology-library/ | EBOOK | QUEUED |
| 21 | 🟢 LOW | Process Derek Appleby Horary Astrology | data/astrology-library/ | EBOOK | QUEUED |
| 22 | 🟢 LOW | Process Dynamic-Astrology.pdf | data/astrology-library/ | EBOOK | QUEUED |
| 23 | 🟢 LOW | TanStack Router migration evaluation | Planned | ARCHITECTURE | QUEUED |
| 24 | 🟢 LOW | Sentry error tracking integration | New | MONITORING | QUEUED |

---

## Completed Items

| # | Feature/Fix | Completed | Notes |
|---|-------------|-----------|-------|
| — | Phase 1 Architecture Audit | 2026-05-12 | ARCHITECTURE_AUDIT_REPORT.md |
| — | Best Feature Matrix | 2026-05-12 | BEST_FEATURE_MATRIX.md |
| — | MERGE_LOG.md initialized | 2026-05-12 | — |
| — | RESEARCH_LOG.md initialized | 2026-05-12 | — |
| — | ebook_index.md initialized | 2026-05-12 | — |
| — | Prior merge (Prashna feature) | 2026-04-29 | QuestionPage + questionAnalysisService in Base |
| — | Prior audit fixes | 2026-04-27 | Applied in REFERENCE-APP02 |

---

*Queue initialized: 2026-05-12*  
*Next action: Item #1 — Fix date selector bug in Index.tsx*
