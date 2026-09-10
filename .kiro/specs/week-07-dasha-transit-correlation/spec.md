# Week 07 Spec: Dasha + Transit Correlation View

## Status: Implementation

## Summary

Deliver the **Dasha + Transit Correlation** feature as Week 07's single high-value addition.
Chosen over KP Support and Jaimini Extensions because:

- Highest ROI: drives daily active usage through time-sensitive insights
- Lowest validation risk: reuses the same Meeus/Swiss Ephemeris engine already validated
- Deepens existing Parashari foundation rather than adding competing rule systems

## Acceptance Criteria

### AC-1 Pratyantar Dasha Display
- [ ] Active Pratyantar Dasha lord and dates shown alongside Mahadasha + Antardasha
- [ ] Three-tier Dasha banner: Maha / Antar / Pratyantar
- [ ] All three lords stored in `DashaTransitCorrelationResult.activeDasha`
- [ ] Score augmented when Pratyantar lord also transits a favorable house

### AC-2 Chandrashtama Warning
- [ ] When transiting Moon occupies house 8 from natal Moon (Chandrashtama), show
  a visible warning banner
- [ ] Warning contains classical guidance: avoid important decisions, increased
  mental/physical stress expected
- [ ] Warning available in EN and HI
- [ ] Warning is accessible (role="alert" or aria-live)

### AC-3 Ashtakavarga Integration
- [ ] Sarvashtakavarga (SAV) scores shown per transiting planet in the transit table
- [ ] Strength indicator (Strong ≥ 28, Moderate 25–27, Weak < 25) visible
- [ ] Overall transit strength summary shown
- [ ] Ashtakavarga section included in PDF export

### AC-4 Deterministic Scoring
- [ ] Correlation score is fully deterministic (no `Math.random()` in production path)
- [ ] Same input always produces same score
- [ ] Score algorithm documented in code comments

### AC-5 Quality & Tests
- [ ] Pratyantar Dasha tests: lord is a known planet, dates are valid
- [ ] Chandrashtama test: Moon in house 8 triggers isChandrashtama flag
- [ ] Ashtakavarga test: SAV scores present in result
- [ ] Determinism test: two identical calls return identical scores
- [ ] All existing Week 07 tests continue to pass

### AC-6 PDF Enhancement
- [ ] Pratyantar Dasha row in Active Dasha section of PDF
- [ ] Ashtakavarga strength column added to transit table in PDF
- [ ] Chandrashtama warning shown in PDF when applicable

## Architecture Decisions

### Deterministic Score
Replace `Math.random()` in `dashaGocharaCorrelationService.ts` with a fixed midpoint:
- Both lords favorable → score = 88
- One lord favorable → score = 65
- Neither → score = 32

### Pratyantar in Service
Extend `ActiveDasha` interface to include `pratyanLord`, `pratyanStart`, `pratyanEnd`.
The `dashaService.ts` already exposes `currentPratyantardasha` on `DashaResult` — wire it through.

### SAV in TransitPosition
Add optional `savScore?: number` and `savStrength?: 'Strong' | 'Moderate' | 'Weak'` to
`TransitPlanetPosition`. Populate via `calculateAshtakavargaTransitAnalysis`.

### Chandrashtama
Add `isChandrashtama: boolean` to `DashaTransitCorrelationResult`. Derived as:
`transitPositions.find(p => p.planet === 'Moon')?.houseFromMoon === 8`

## Test Locations
`src/tests/week7/dashaTransitEnhanced.test.ts`

## Not In Scope (Week 07)
- KP sub-lord tables
- Jaimini Chara Dasha
- Birth time rectification
- Animated transit wheel
