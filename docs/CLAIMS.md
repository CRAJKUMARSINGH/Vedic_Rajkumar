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
| **Total Test Suite**          | **2061 tests** across **122 test files** | `npm run test:run`                 | `src/tests/`                                 |
| **Ascendant Accuracy**        | **Sub-arcsecond (≤ 2″)**                 | `npm run test:accuracy:full`       | `src/tests/accuracy/corpusPhase1.test.ts`    |
| **Wartime Timezone Offset**   | **+6:30 (1941–1945 India)**              | `npm run test:tz-wiring`           | `src/services/chartWithTimezone.ts`          |
| **Ashta Koota Compatibility** | **36 points (all 8 factors)**            | `vitest run ashtakutaUnit.test.ts` | `src/tests/week6/ashtakutaUnit.test.ts`      |

---

## 2. Discrepancy Reconciliation

- **"15 charts vs 155 tests":** The test corpus contains **15 distinct historical/adversarial charts** (e.g. Mahatma Gandhi, Indira Gandhi, 1943 Mumbai wartime chart, Arctic circle, Southern hemisphere). Across these 15 charts, the automated suite executes **155 discrete validation assertions** covering Ascendant degree, Moon longitude, Nakshatra, Pada, Dasha seed, and planetary rashis.
- **"Superseded counts vs current":** earlier milestones quoted `1316` tests (Phase 1 pre-launch), then `1572` tests across 94 files (N2–N4 hardening), then `1625` tests across 101 files (orphan-asset integration), then `1678 tests across 103 files` (Answer Layer confidentiality). As of the SaraswatiMascot integration milestone the total was **1686 tests across 104 files**; the `as_of` de-coupling + publish-guard milestone brought it to **1692 tests across 105 files**; the agent-guide contract milestone brought it to **1700 tests across 106 files**; the Week 15 truth-before-reach milestone brings it to **1777 tests across 113 files**; the Week 17 bilingual answer-layer milestone (hi+en re-emit, `langParity` + permalink codec) brings it to **1987 tests across 115 files**; the Week 18 Ashtakavarga invariants milestone (BAV/SAV over the 15-chart corpus, Gochar wiring assertion) brings it to **2025 tests across 116 files**; the Dose 1 tier-robot milestone (weekly-drive allowance + client tier resolution + `tier-matrix` Playwright suite) brings it to **2034 tests across 117 files**. The dose-bundle milestone (ADR-004 one-source-of-truth, GTM spine, deploy-safety gates, ephemeris worker, IDB migrations, content golden) brings it to **2061 tests across 122 files**. `npm run docs:verify` fails the build if any documented figure drifts from the code.
- **"100% Verified Astrological Domains":**
  - **Verified against Swiss Ephemeris:** Planetary longitudes, Ascendant, Nakshatras, Padas, Vimshottari Mahadasha/Antardasha seeds, Ashta Koota math.
  - **Unverified Hand-Authored Prose (Honest Disclosure):** Classical answers prose in `classicalAnswerEngine.ts`, subjective reading prose in `interpretationEngine.ts`, Shadbala/Ashtakavarga interpretation commentary.

---

## 3. Registered Test Guides

New test/quality guides are registered here so `npm run docs:verify` tracks them as
claim-bearing documents rather than leaving them orphaned.

| Guide                                  | Purpose                                                     | Gate                                     |
| -------------------------------------- | ----------------------------------------------------------- | ---------------------------------------- |
| `docs/testing/TIER_MATRIX.md`          | grade × capability matrix + required `data-testid` contract | `npm run test:tiers`                     |
| `docs/testing/TIER_ROBOTIC_TESTING.md` | tier-robot mechanism, harness contract, runbook             | `npm run test:tiers:report`              |
| `docs/testing/WEEKLY_FREE_DRIVE.md`    | weekly free-user allowance rules + server authority         | `src/tests/features/weeklyDrive.test.ts` |

The tier robot proves the **UI contract** for Free · Pro · Enterprise grades. Every
gate is client-side (localStorage) today, so it does **not** prove authorisation —
tracked as `PARITY-001` and closed only when gating moves behind an edge function.

---

## 4. Landing-Page Claim Registry

`content/landing.yaml` attaches a `claim:` id to each proof point. `npm run gtm:audit`
resolves every id against the table below and fails the build if one is missing — a
proof point without a registered source is an unbacked promise.

| Claim id                    | Copy claim                                                 | Where it is proven                                          | Gate                        |
| --------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- | --------------------------- |
| `ephemeris.ayanamsa`        | Lahiri ayanamsa, sidereal by default                       | `src/services/ephemerisService.ts` (Lahiri/Swiss Ephemeris) | `npm run validate:accuracy` |
| `ephemeris.corpus`          | Accuracy pinned by a golden corpus, re-run on every commit | `tools/accuracy/golden/` (15 charts)                        | `npm run validate:accuracy` |
| `perf.mobile_mainthread`    | Runs on old Android without freezing the page              | heavy calc in `src/workers/`; main-thread budget            | `npm run budget:check`      |
| `privacy.no_account_needed` | Birth data needs no account to be computed                 | chart calc is client-side; no sign-in gate                  | `npm run gtm:audit`         |
