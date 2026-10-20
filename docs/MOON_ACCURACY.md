# Moon accuracy: the measurable slice

Status: verified by `npm run moon:verify` and `npm run test:accuracy:moon`
Code: `src/services/moonSeries.ts`, `src/lib/nakshatraEdge.ts`

## The target

The Moon is the only body in this engine whose error is large enough to change a
*label* rather than move a number. A nakshatra spans 13°20' (48 000 arcsec), so a
Moon error bar of 180 arcsec (0.05°) puts every chart within 0.375% of an edge at
risk of being classified by the series rather than by the birth data — and
nakshatra sets the Vimshottari dasha sequence, so a flip moves dasha dates, not
just a label.

Shrinking the bar shrinks the exposed band. Charts did not move; the bar did.
That is worth saying plainly rather than implying the corpus changed.

## The number that is not a tautology

`src/tests/accuracy/moonFlipAudit.test.ts` compares the engine Moon against the
independent Swiss golden for every chart in the corpus and reports:

- the largest engine-vs-Swiss Moon error,
- how many charts the shipped series misclassifies (nakshatra index differs),
- the exposure band at the old claim and at the shipped claim,
- for every flip, the old → new nakshatra *and* the shift in first-mahadasha
  start, computed from an independent formula (`src/lib/vimshottari.ts`).

It also asserts that every flip sits near a boundary. A flip far from an edge
would mean the series is wrong rather than short, which is a different bug and
should not be silently averaged into a pass.

Measured on the current 15-chart corpus (run `npm run test:accuracy:moon`):

```
largest engine Moon error vs Swiss:              10.41 arcsec
charts the shipped Moon series misclassified:    0
charts inside a 180 arcsec band (old claim):     0
charts inside a 15 arcsec band (shipped):        0
```

The corpus is small, so the flip count is a floor rather than a survey. Re-run
the audit when the corpus grows: it is the check, not this table.

## What changed in the engine

`getMoonLongitude` in `src/services/precisionEphemerisService.ts` now delegates
to `moonLongitudeTrue` from `moonSeries.ts`; the previous inline series is gone.

The new series is Meeus ch. 47 — 60 periodic terms for longitude and distance, 60
for latitude, the A1/A2/A3 additive corrections, and the eccentricity factor E —
where the old code kept a handful of terms. It also applies delta-T.

Because `moonSeries` converts UT → TT itself, the engine hands it **UT** and does
not re-derive TT around it; that would double-count ~35 arcsec of lunar motion.
This is the one exception to the slice-9 rule (bodies take UT and derive TT
internally) and it is commented as such at the call site.

## Why delta-T is now the floor

The Swiss Ephemeris converts UT to TT internally. Matching it requires the same
conversion, and delta-T is 58 s in 1992 — **32 arcsec of lunar motion**, larger
than every other term in this module combined.

Pre-1900 the *uncertainty* in delta-T is ±3 to ±10 s, so ±1.6 to ±5.5 arcsec. No
amount of series length fixes that. It is the honest ceiling on historical Moon
accuracy and it is stated in the module header rather than hidden.

## What is verified against what

| Check | Against | File |
| --- | --- | --- |
| longitude, latitude, distance | Meeus example 47.a, a printed result | `src/tests/moonSeries.test.ts` |
| nutation in longitude | Meeus example 22.a | `src/tests/moonSeries.test.ts` |
| delta-T at four epochs | Espenak & Meeus published values | `src/tests/moonSeries.test.ts` |
| engine Moon == series | the series | `src/tests/moonWiring.test.ts` |
| nakshatra flips | the corpus + Swiss golden | `src/tests/accuracy/moonFlipAudit.test.ts` |

The first three are against published numbers computed decades before this repo,
which is the only kind of check that can find a shared bug.

Current deltas from those published numbers (printed by the test):

```
lambda delta:   0.00 arcsec   (published 133.162655 deg)
beta delta:     4.18 arcsec   (published -3.229126 deg)
distance delta: 0.02 km       (published 368409.7 km)
delta-psi:     -3.863 arcsec  (published -3.788 arcsec)
```

## Known limits

- The final nine latitude terms are the smallest in table 47.B and the ones most
  likely to be mistranscribed. Each is under 0.75 arcsec, and **latitude does not
  affect nakshatra**, so the blast radius is nil. If `beta` in the example test is
  off by more than about 10 arcsec, that is where to look.
- 15 arcsec is a claim, not a measurement. `npm run test:accuracy:full` is what
  measures it against Swiss; if the `moon` row lands over claim there, the claim
  is wrong and the tolerance should be raised with a comment saying why.
- The harness `moon` tolerance (3 arcsec) is an *informational* Tier-A target in
  `src/tests/accuracy/corpusPhase1.test.ts`; the hard gate is the user-visible
  0.5° bound. Nothing here is gated on the 3 arcsec figure.
