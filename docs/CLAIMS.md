# Single Source of Truth — Metric Claims & Technical Status

**Document:** `docs/CLAIMS.md`  
**Owner:** Core Engineering & Quality Assurance  
**Last Verified:** 2026-10-25  
**Purpose:** Reconcile all numerical claims and test statistics across README.md, SOC 2 checklist, and launch documentation.

---

## 1. Authoritative Metric Baseline

| Metric                        | Authoritative Value                      | Primary Verification Command       | Canonical Location                           |
| ----------------------------- | ---------------------------------------- | ---------------------------------- | -------------------------------------------- |
| **Reference Golden Corpus**   | **15 charts**                            | `npm run validate:accuracy`        | `tools/accuracy/golden/`                     |
| **Accuracy Assertions**       | **155 assertions**                       | `npm run validate:accuracy`        | `src/tests/validation/accuracySuite.test.ts` |
| **Total Test Suite**          | **1777 tests** across **113 test files** | `npm run test:run`                 | `src/tests/`                                 |
| **Ascendant Accuracy**        | **Sub-arcsecond (≤ 2″)**                 | `npm run test:accuracy:full`       | `src/tests/accuracy/corpusPhase1.test.ts`    |
| **Wartime Timezone Offset**   | **+6:30 (1941–1945 India)**              | `npm run test:tz-wiring`           | `src/services/chartWithTimezone.ts`          |
| **Ashta Koota Compatibility** | **36 points (all 8 factors)**            | `vitest run ashtakutaUnit.test.ts` | `src/tests/week6/ashtakutaUnit.test.ts`      |

---

## 2. Discrepancy Reconciliation

- **"15 charts vs 155 tests":** The test corpus contains **15 distinct historical/adversarial charts** (e.g. Mahatma Gandhi, Indira Gandhi, 1943 Mumbai wartime chart, Arctic circle, Southern hemisphere). Across these 15 charts, the automated suite executes **155 discrete validation assertions** covering Ascendant degree, Moon longitude, Nakshatra, Pada, Dasha seed, and planetary rashis.
- **"Superseded counts vs current":** earlier milestones quoted `1316` tests (Phase 1 pre-launch), then `1572` tests across 94 files (N2–N4 hardening), then `1625` tests across 101 files (orphan-asset integration), then `1678 tests across 103 files` (Answer Layer confidentiality). As of the SaraswatiMascot integration milestone the total was **1686 tests across 104 files**; the `as_of` de-coupling + publish-guard milestone brought it to **1692 tests across 105 files**; the agent-guide contract milestone brought it to **1700 tests across 106 files**; the Week 15 truth-before-reach milestone brings it to **1777 tests across 113 files**. `npm run docs:verify` fails the build if any documented figure drifts from the code.
- **"100% Verified Astrological Domains":**
  - **Verified against Swiss Ephemeris:** Planetary longitudes, Ascendant, Nakshatras, Padas, Vimshottari Mahadasha/Antardasha seeds, Ashta Koota math.
  - **Unverified Hand-Authored Prose (Honest Disclosure):** Classical answers prose in `classicalAnswerEngine.ts`, subjective reading prose in `interpretationEngine.ts`, Shadbala/Ashtakavarga interpretation commentary.
