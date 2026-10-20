# Ascendant: what was wrong and what is now true

Code: `calcAscendant` in `src/services/precisionEphemerisService.ts`, plus the
three satellite engines (`src/features/kundli/engine.ts`,
`src/services/houseSystemService.ts`, `src/lib/mtss/vedicEngine.ts`).
Proof: `src/tests/ascendantProof.test.ts` and `src/tests/ascendant.test.ts`.

## Correction to an earlier claim

An earlier slice called the ascendant logic "the last real accuracy defect."
Having derived the maths by hand, that was overstated. The formula was correct
and its quadrant correction worked at every latitude anyone will cast a chart at.
The defects were real but narrower than claimed: a misnamed variable, a
correction applied for the wrong reason, and a comment trail that reads like a
debugging session.

## The defect that was live

The most damaging version of this bug — a negated `atan2` argument producing the
**descendant**, 180° off, at every latitude — was live in the satellite engines
listed above. The corpus gate only compared the precision engine, so nothing
caught it. `ascendantProof.test.ts` now asserts, for every engine, that the
result is not the descendant, so a re-introduction fails there instead of on the
user's Lagna.

## What the precision engine used to do

```
candidate = atan2( -cos(RAMC), sin(RAMC)*cos(e) + tan(phi)*sin(e) )
if angularDistance(candidate, norm(RAMC + 90)) > 90: candidate += 180
```

`atan2` with those arguments returns the descendant for every latitude, and the
correction flips it. The flip was triggered by comparing against `norm(RAMC + 90)`
— which the code called `mcApprox` and is **not** the MC; it is a rough ascendant.

That worked because `candidate` is always exactly 180° from truth and the proxy
lands within a few degrees of truth, so the two never fall on opposite sides of
the 90° test. The margin narrowed only as |latitude| approached the pole, where
the ecliptic becomes nearly tangent to the horizon and the ascendant–midheaven
separation approaches 180°.

## What the precision engine does now

```
e     = trueObliquity(T)                 # mean + nutation in obliquity
RAMC  = getGMST(jd) + lon
candidate = atan2( -cos(RAMC), sin(RAMC)*cos(e) + tan(phi)*sin(e) )
if hourAngle(candidate) < 0: asc = candidate      # east of the meridian
else:                        asc = candidate + 180
```

The two horizon intersections are exactly 180° apart. A rising body is **east**
of the meridian, so its hour angle is negative. Hour angle is defined here the
standard way, `H = LST − RA` (Meeus ch. 12), in `(−180, +180]`. That test is
exact and latitude-independent, so there is no discriminator, no proxy, and no
margin to erode — the reason the old approach needed one is gone.

The sign convention is the whole trick, and it is the easy thing to get wrong:
`RA − LST` is the negation of `H`, so a branch keyed on the wrong one silently
returns the descendant for every chart. That is precisely the failure class
`ascendantProof.test.ts` exists to catch.

Also added: nutation in obliquity (Meeus ch. 22, about 9 arcsec) via
`trueObliquity`, and a `seconds` field so the ascendant formats like every other
position.

## Residual error

| Source | Size |
| --- | --- |
| nutation in longitude (mean ayanamsa) | up to 17 arcsec |
| GMST polynomial vs UT1 | under 1 arcsec over 1800–2100 |

All under 0.01°, and the ascendant is no longer the weak point. The scale split
that keeps it that way is documented in `docs/TIME_SCALES.md`: angles are Earth's
rotation, so they take **UT**; hand them TT and the ascendant moves by
delta-T × 15 arcsec/s ≈ 900 arcsec ≈ 0.25°.

## Proof

Two test files, neither of which trusts the implementation's own helpers.

`src/tests/ascendantProof.test.ts` does two independent things:

1. **From the definition.** It recomputes GMST, obliquity, right ascension,
   declination, hour angle and altitude, then brute-forces the ecliptic longitude
   where `altitude(λ) = 0` with the hour angle negative (east of the meridian).
   The engine's ascendant must match that root to under 30 arcsec, and must not
   match the root plus 180° — across six fixtures spanning the equator, 28.61°N,
   19.07°N, 51.48°N, 64°N and a pre-dawn local time, in three timezones, for all
   four engines.
2. **Against Swiss Ephemeris.** `houses_ex` in Lahiri sidereal mode
   (`swisseph-wasm`), for all four engines, to under 30 arcsec.

Because a shared bug cannot hide between the definition and an independent
ephemeris, the pair is stronger than either alone.

`src/tests/ascendant.test.ts` recomputes GMST, obliquity, right ascension,
declination, altitude and hour angle independently, then asserts the engine's
ascendant has altitude 0 and a negative hour angle, across 13 latitudes from
−89.9° to +89.9° and 8 sidereal hours — including the near-polar band where the
old 90° discriminator had no margin left. It also checks the 30–180°
ascendant–midheaven separation, regresses the 15 reference charts' rashi, and
checks the whole-arcsecond `seconds` field and the degrees/minutes/seconds
rebuild.
