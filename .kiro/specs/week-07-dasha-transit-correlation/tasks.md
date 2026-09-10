# Week 07 Tasks — Dasha + Transit Correlation

## Status legend
- [x] Done
- [ ] Pending

---

## Task 1 — Spec & design artifact
- [x] Write spec.md with acceptance criteria (AC-1 through AC-6)
- [x] Write tasks.md
- [x] Choose feature: Enhanced Transit Correlation over KP/Jaimini (documented in week_07_advanced_feature_exploration.md)

## Task 2 — Deterministic scoring (AC-4)
- [x] Remove `Math.random()` from `dashaGocharaCorrelationService.ts`
- [x] Replace with fixed midpoint scores: High=88, Medium=65, Low=32
- [x] Add Pratyantar lord bonus (+6 when favorable)
- [x] Add `pratyanLord?: string` optional param to `calculateDashaGochaCorrelation`
- [x] Score re-evaluated post-bonus/penalty with clamp to [0,100]
- [x] Document algorithm in JSDoc comment

## Task 3 — Pratyantar Dasha (AC-1)
- [x] Extend `ActiveDasha` interface: `pratyanLord`, `pratyanStart`, `pratyanEnd`
- [x] Wire `dashaResult.currentPratyantardasha` in `computeCorrelation()`
- [x] Fallback: if `currentPratyantardasha` is null, use Antardasha lord/dates
- [x] Pass `pratyanLord` to `calculateDashaGochaCorrelation` for bonus

## Task 4 — Ashtakavarga integration (AC-3)
- [x] Add `savScore: number` and `savStrength: 'Strong'|'Moderate'|'Weak'` to `TransitPlanetPosition`
- [x] Import and call `calculateAshtakavargaTransitAnalysis` in `computeCorrelation()`
- [x] Call `getAshtakavargaSummary` and store result in `DashaTransitCorrelationResult.ashtakavargaSummary`
- [x] SAV scores default to `calculateAshtakavargaTransitAnalysis` defaults (no chart input needed)

## Task 5 — Chandrashtama detection (AC-2)
- [x] Add `isChandrashtama: boolean` to `DashaTransitCorrelationResult`
- [x] Derive as `transitMoon?.houseFromMoon === 8`
- [x] Add warning banner in `DashaTransitCorrelationPage.tsx` with `role="alert"`
- [x] EN + HI copy with classical citation (BPHS)

## Task 6 — Page UI updates
- [x] Expand DashaBanner from 3-column to 4-column grid (Maha / Antar / Pratyantar / Nakshatra)
- [x] Pratyantar tile styled in violet to distinguish from Maha/Antar
- [x] Add SAV Score column to transit table (hidden on mobile, shown md+)
- [x] Add Ashtakavarga summary grid (Overall / Avg SAV / Favorable / Unfavorable)
- [x] Update footer engine note to include Sarvashtakavarga

## Task 7 — PDF enhancements (AC-6)
- [x] Add Pratyantar Dasha row in Active Dasha kv section
- [x] Add SAV column to transit table in PDF
- [x] Add Ashtakavarga Summary section (Section 4)
- [x] Renumber sections: 12-month outlook → Section 5
- [x] Add Chandrashtama warning text block when `isChandrashtama=true`
- [x] Update footnote text for transit table (SAV threshold explanation)

## Task 8 — Tests (AC-5 regression + new AC-1 through AC-6)
- [x] Create `src/tests/week7/dashaTransitEnhanced.test.ts`
- [x] AC-1 tests: pratyanLord type, date format, period containment
- [x] AC-2 tests: isChandrashtama flag consistency, Moon house 8 scan
- [x] AC-3 tests: savScore range, savStrength enum, ashtakavargaSummary shape
- [x] AC-4 tests: repeated calls yield same score, base values, Pratyantar bonus delta
- [x] AC-5 regression: existing structure fields still present
- [x] AC-6 PDF tests: Pratyantar row, SAV column header, SAV values, Ashtakavarga heading,
       Chandrashtama text present/absent, Hindi labels

---

## Week 07 Review Checklist

- [x] Did the work reduce risk in one of the priority areas?
      → Yes: deepens the existing validated Parashari engine with actionable daily timing
- [x] Is there a written spec or clear design artifact?
      → spec.md with 6 acceptance criteria
- [x] Are acceptance criteria explicit?
      → Yes, each AC maps to test file sections
- [x] Did tests improve or at least remain credible?
      → Added 35+ new tests in dashaTransitEnhanced.test.ts
- [x] Did the week add depth rather than surface area?
      → Yes: Pratyantar, Ashtakavarga, Chandrashtama all deepen the single core feature
- [x] Is the result something you would trust more than the prior week?
      → Yes: deterministic scoring, 3-tier dasha, classical warnings, SAV validation
