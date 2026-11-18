# Venice AI Comparative Capability Matrix

**Repository:** `https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar`
**HEAD:** `d3e6a9f`  
**Date:** 2026-11-18  
**Source:** `CODE-JUNCTION/VEDIC_RAJKUMAR_VENICE_AI_PROVENANCE_AND_ENRICHMENT_PATCH.md`  
**Evidence reviewed:** `CODE-JUNCTION/venice ai test.txt` (external Venice AI conversation)

> **Privacy note:** The Venice AI conversation contains a real person's name and full birth
> details. Per `AGENTS.md` Rules 1–4, those details are NOT reproduced here. All test
> fixtures use a **synthetic identity only** (`synth-udaipur-f-1999`).

---

## Classification of Venice AI output

| Dimension | Assessment |
|---|---|
| Origin | Venice AI (external model); no tool trace, no app endpoint log, no chart JSON |
| App provenance | **UNVERIFIED** — a URL in the prompt is not evidence of app execution |
| Label to use | `UNVERIFIED_EXTERNAL_MODEL` until proven otherwise |
| Usable for? | Adversarial test fixture design (claims to falsify); **not** as golden truth |

---

## Capability gap matrix

| Venice AI claim | App route / component | Source file | Calculation available? | Validated? | Gap | Action |
|---|---|---|---|---|---|---|
| Lagna + planetary house/sign placements | `/horoscope` → `HoroscopeCard` | `src/components/HoroscopeCard.tsx`, `src/services/horoscopeService.ts` | YES — Swiss Ephemeris WASM + Lahiri | YES (wasmPathAccuracy 135/135) | None — but N7 narrative layer absent | N7 Vani (Navratri Phase B) |
| Vimshottari dasha + antardasha windows | `/dasha`, `/dasha-timeline` | `src/pages/DashaPage.tsx`, `src/pages/DashaTimelinePage.tsx` | YES | YES (vimshottari.test.ts) | Pratyantar API not yet unified (N4 open) | N4 Kaal |
| Gochar / transit (dasha–transit linkage) | `/horoscope` → transit section, `DynamicTransitCalculator` | `src/services/dynamicTransitService.ts` | YES (Lagna + Moon frames, Sade Sati) | YES (gocharN3.test.ts) | N6 synthesis not wired | N6 Yukti |
| Sade Sati phase | `/horoscope` transit section | `src/astrology/transits/sadeSati.ts`, `dynamicTransitService.ts` | YES (computeShaniStatus) | YES (gocharN3 anchor) | UI surfacing incomplete | N9 gate |
| Shadbala strength | `ShadabalaCard` (UI), accuracy suites | `src/services/shadabalaService.ts`, `src/tests/accuracy/shadbala.*.test.ts` | YES (oracle gate merged week15) | PARTIAL (golden fixtures: 3 cases) | N5 feed into synthesis | N5 Bala |
| D9 Navamsa | Referenced in answer cards | `src/services/divisionalChartsService.ts` | YES (calculateShodashVarga) | PARTIAL (natalCoreN2: D9 verified) | UI dedicated page not in core nav | N9 gate |
| Manglik / Mangal Dosha score | `/matchmaking`, `ComprehensiveReport` | `src/services/ashtakutaService.ts` | YES | YES (ashtakutaUnit tests) | None | — |
| Employment / job-start muhurta filter | `/muhurat`, `/enhanced-muhurat`, `/wedding-muhurat` | `src/pages/MuhuratCalendarPage.tsx` | YES (Muhurta calendar exists) | PARTIAL | "Job-start" filter specifically claimed by Venice — UI label to verify | Manual check |
| 36-guna kundli milan | `/matchmaking` | `src/services/ashtakutaService.ts` | YES | YES | None | — |
| Hindi bilingual output | All core pages | `lang` prop, `font-hindi`, i18n strings throughout | YES | YES (persona e2e #4, #18) | Hindi narrative layer absent (N7) | N7 Vani |
| Direction-based predictions (N/NW city ranking) | **ABSENT** | — | NO | NO | Invented feature; no route, no service | Do not implement without classical citations |
| "App will show Shani gochar effect" claim | `/horoscope` transit section | `dynamicTransitService.ts` → `shaniStatus` | YES (computeShaniStatus wired) | YES | Minor: Venus exalted in 10H claim needs independent computation before display | N9 provenance gate |
| Solar eclipse on birth date assertion | **ABSENT** | — | NO | NO | Eclipse calculation not in app; Venice claim unverified | Add astronomical verification test |
| Specific graha longitude/pada (e.g. Moon in Dhanishtha p4) | Calculator output field | `swissEphemerisService.ts` → `nakshatra`, `pada` | YES (computed) | YES (wasmPathAccuracy) | Venice transcript gives no calculation trace | N9: reject unsourced pada claims |

---

## Identified discrepancies in Venice transcript

| # | Discrepancy | Severity | Required test |
|---|---|---|---|
| D1 | Ahmedabad/Mumbai listed as favorable cities (section 1) then as southern/unfavorable (section 2) | HIGH | Consistency gate: contradictory recommendations must be flagged |
| D2 | Specific dasha/pratyantar windows (Mar–Jul 2027 etc.) given without ayanamsa/timezone/ephemeris provenance | HIGH | Every dated claim must reference a calculator output |
| D3 | "Solar eclipse" on birth date asserted — Amavasya ≠ eclipse | MEDIUM | Astronomical event verification test |
| D4 | "App will show X" claims without evidence the UI feature is callable | MEDIUM | Route existence test; stub ≠ working calculation |
| D5 | 10th-house occupancy (Jupiter + Venus + Saturn) not independently verifiable | HIGH | Reference chart fixture test |
| D6 | Career, marriage AND family requested; reply omits marriage and family detail | LOW | Completeness test: multi-topic query must address all topics or explain gap |

---

## Release gates status

| Gate | Status |
|---|---|
| Intermittent horoscope submit (145-test gate) | HOLD — root cause unresolved |
| Typecheck | ✅ PASS (d3e6a9f) |
| Unit suite | ✅ PASS 1717+/1717+ |
| validate:accuracy | NOT RUN this session |
| Lighthouse CI | NOT RUN |
| AGPL / swisseph-wasm license | BLOCKED — owner decision required |
| N4–N9 Navratri Phase B | NOT STARTED |
| Provenance contract implemented | NOT YET |

**FINAL DECISION: HOLD**

---

*Evidence preserved in `reports/`; source `CODE-JUNCTION/venice ai test.txt` deleted after audit (contained private birth data — AGENTS.md Rule 1).*
