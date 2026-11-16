# DOMAIN ACCURACY REPORT — 2026-11-16

Astronomical correctness only; interpretations are traditional frameworks,
not scientifically validated predictions (UI carries educational disclaimers).

| Module   | Conventions verified                                                                                       | Evidence                                                             |
| -------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Kundli   | Sidereal Lahiri ayanamsa; longitudes, ascendant, nakshatra/pada, D1 + divisional charts, Vimshottari dasha | `test:core` 48/48, `test:accuracy:fast` 42/42, engine suites in 1717 |
| Prashna  | question timestamp, location/TZ, significator rules, provenance via answer cards                           | `week5/prashna*` tests PASS                                          |
| Milan    | 8 Ashta Koota, 36-pt total, Mangal Dosha, exceptions                                                       | `week6/ashtakutaUnit` + `matchmakingIntegration` PASS                |
| Panchang | Tithi/Vaara/Nakshatra/Yoga/Karana, sunrise/sunset, muhurat boundaries                                      | `panchangUnit/Integration/Polish` PASS + offline SW test             |

Independent references: Swiss Ephemeris comparison suite
(`validate:accuracy`, 15 charts + cusps + antardasha) — last full run in CI;
fast suite green this cycle. Tolerances defined in
`src/tests/validation/accuracySuite.test.ts`.

**Known limitation:** `swisseph-wasm` is AGPL/commercial dual-licensed —
flagged in CODE-JUNCTION/Tex21.txt review; legal decision pending, not a code
defect. Four parallel astrology engines exist (`services/`, `lib/vedic/`,
`lib/mtss/`, `features/*/stubs.ts`) — consolidation recommended, not blocking.
