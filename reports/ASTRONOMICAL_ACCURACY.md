# ASTRONOMICAL ACCURACY — status summary (2026-11-16)

Scope note: this audits _calculation correctness_ (positions, ayanamsa, time
scales, chart geometry) against independent references. It makes **no claim**
that astrological interpretations are scientifically validated — Jyotish
readings are traditional interpretive frameworks, presented as such in-app.

## Engine verification already in place

| Suite                                                                                 | Command                                   | Result                                                                          |
| ------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------- |
| Accuracy fast suite (time scales, nakshatra edge, Vimshottari, birth TZ, chart cache) | `npm run test:accuracy:fast`              | 42/42 PASS                                                                      |
| Core engine tests (ephemeris, vedicAstroEngine, feature registry)                     | `npm run test:core`                       | 48/48 PASS                                                                      |
| Full unit suite                                                                       | `npm run test:run`                        | 1717/1717 PASS                                                                  |
| Swiss Ephemeris comparison                                                            | `npm run validate:accuracy`               | see `dist/accuracy-report.txt` (15 reference charts + house cusps + antardasha) |
| Golden corpus                                                                         | `src/tests/accuracy/corpusPhase1.test.ts` | in suite above                                                                  |

Prior deep audits on file: `reports/COMPLETE_12_HOUSES_PRASHNA_TRANSIT_AUDIT_REPORT.md`,
`docs/MOON_ACCURACY.md`, `docs/TIME_SCALES.md`, `docs/ASCENDANT.md`.

## Module status

- **Kundli** — sidereal Lahiri ayanamsa enforced (AGENTS.md domain rule);
  planetary longitudes, ascendant, nakshatra, divisional charts and Vimshottari
  dasha covered by engine tests + accuracy suites. PASS (engineering level).
- **Prashna** — question-time/location handling and rule evaluation covered by
  `week5/prashna*` tests; verdict provenance via answer-card layer. PASS.
- **Kundli Milan** — eight Ashta Koota factors, 36-point total and exception
  rules in `ashtakutaService`; `week6/ashtakutaUnit` + `matchmakingIntegration`
  tests PASS.
- **Panchang/Muhurat** — Tithi/Vara/Nakshatra/Yoga/Karana + sunrise/sunset in
  `panchangAstronomy` utils; `panchangUnit`, `panchangIntegration`,
  `panchangPolish` tests PASS; offline SW-verified.

## Tolerances

Engine targets Swiss Ephemeris agreement within documented arcsecond/arcminute
tolerances defined in `src/tests/validation/accuracySuite.test.ts`; house-cusp
and antardasha checks extended in Week 02 per AGENTS.md. Any drift beyond
tolerance fails the suite — none observed in the runs above.

**Residual risk:** interpretations (dasha phal, yoga naming, remedy text) are
curated knowledge, not empirically validated predictions; the UI already
carries educational-reference disclaimers.
