# ADR-002: Swiss Ephemeris WASM Migration

**Date**: April 2026  
**Status**: In Progress (Week 28-30)  
**Context**: Phase 4 — Type-Safe Integration & Accuracy

---

## Problem

Current ephemeris uses simplified JS algorithms with ±2-3° accuracy. The 100-week plan requires 99.99% accuracy (Swiss Ephemeris standard) for professional-grade Vedic calculations.

## Decision

Migrate to `swisseph-wasm@0.0.5` (already installed) for all planetary position calculations.

## Migration Strategy

### Phase A — Wrapper ready (Week 26, DONE)
- `src/services/swissEphemerisService.ts` created
- `initSwissEphemeris()` loads WASM asynchronously
- `calcPlanetsAccurate()` falls back to simplified service if WASM unavailable
- Feature flag: `VITE_USE_SWISS_EPHEMERIS=false` (safe default)

### Phase B — Integration (Week 28-30)
- Wire `calcPlanetsAccurate()` into `useChartCalculation` hook
- Enable via `VITE_USE_SWISS_EPHEMERIS=true` in production
- Validate against astro.com reference charts for all 13 jataks
- Add accuracy regression tests to `tests/` suite

### Phase C — Full rollout (Week 30+)
- Replace all `calculateCompletePlanetaryPositions` calls
- Add Ashtakavarga, Vimshottari Dasha, D9/D10 using Swiss Ephemeris
- Validate 100+ Yogas against Jagannatha Hora

## Accuracy Targets

| System | Current | Target |
|--------|---------|--------|
| Sun position | ±1-2° | ±0.001° |
| Moon position | ±2-3° | ±0.001° |
| Ascendant | ±2-3° | ±0.01° |
| Ayanamsa | ±0.1° | ±0.001° |

## Rollback

Set `VITE_USE_SWISS_EPHEMERIS=false` — instantly reverts to simplified service.

## References

- [Swiss Ephemeris docs](https://www.astro.com/swisseph/swephprg.htm)
- [swisseph-wasm npm](https://www.npmjs.com/package/swisseph-wasm)
- Jagannatha Hora for reference chart validation
