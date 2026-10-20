# Time Scales: Which Frame Goes Where

## The rule

| Quantity                                   | Frame  | Why                                |
| ------------------------------------------ | ------ | ---------------------------------- |
| Body positions (Sun, Moon, planets, nodes) | **TT** | orbits are governed by gravity     |
| Ascendant, MC, house cusps                 | **UT** | rising is Earth's rotation         |
| Panchang (tithi, nakshatra, yoga, vara)    | **UT** | a calendar, not a dynamical frame  |
| Lahiri ayanamsa                            | **TT** | evaluated together with the bodies |

## Why this is not optional

1 second of time = 15 arcsec of rotation. `delta-T` ≈ 64 s in year 2000.

Passing TT to the ascendant formula moves the ascendant by **64 × 15 = 960 arcsec
≈ 0.27°** — five times the ascendant's own error bar. Passing UT to the planets
loses ~32 arcsec on the Moon.

## The dangerous refactor

Computing one JD at the top of the chart builder and threading it everywhere
looks clean and is wrong in one place. The temptation is real because "use one
JD" sounds like good DRY practice.

The safe approach: derive both scales once in `timeScalesFromJD` and pass each
named constant (`jdUT`, `jdTT`) explicitly to the function that needs it. The
name makes the correct choice self-documenting.

## The historical floor this creates

`delta-T` is a measured quantity, not a modelled one. Its uncertainty is the
accuracy floor for historical dates:

| Era       | delta-T uncertainty | Equivalent Moon error | Equivalent ascendant error |
| --------- | ------------------- | --------------------- | -------------------------- |
| pre-1600  | ±30 s               | ±17 arcsec            | ±7.5 arcmin                |
| 1600–1800 | ±10 s               | ±5.5 arcsec           | ±2.5 arcmin                |
| 1800–1900 | ±3 s                | ±1.6 arcsec           | ±0.75 arcmin               |
| post-1900 | < 1 s               | < 0.6 arcsec          | < 0.25 arcmin              |

No series length changes this — it is a property of how well Earth's rotation
has been measured historically.

## Verification

| Claim | Test | Margin |
| ----- | ---- | ------ |
| ascendant is on UT | `timeScales.test.ts` — independent LST recomputation | 960″ signal, 20″ tolerance |
| bodies are on TT | `bodyFrame.test.ts` — engine Moon vs Swiss Ephemeris | ~35″ frame signal vs ~10″ series error, 20″ tolerance |
| Sun sits at the published cardinal instants | `bodyFrame.test.ts` — gross-error smoke test | 120″ (the Sun frame signal is only 2.6″) |
| which functions were patched onto TT | `TT_BODIES` manifest, `timeScales.test.ts` | structural |
| nakshatra boundary detection | `nakshatraEdge.test.ts` | deterministic edge cases |
| Moon misclassification and dasha shift | `accuracy/moonFlipAudit.test.ts` | corpus vs Swiss golden |

Run the frame gate with `npm run test:time` (`time:verify`); run the Moon flip and
dasha-shift audit with `npm run test:accuracy:moon`.

## Known limits

- **DUT1** (UTC − UT1) is exposed and defaults to 0. Its ±0.9 s is ±13.5″ of
  ascendant — inside the ascendant's error bar.
- **The 1900 case cannot detect the trap.** `delta-T` was near zero then, so a
  1900 fixture passes whether or not the ascendant is on UT. Any test for this bug
  must use a modern date where `delta-T` is tens of seconds.
- **The Sun cannot isolate the frame.** The shipped Sun series carries ~25–40″ of
  its own error, which is larger than the 2.6″ the ΔT of the Sun is worth. A
  published equinox instant therefore cannot prove the Sun is on TT; that test is
  a gross-error smoke test only. The Moon carries the proof (~35″ of frame signal
  against ~10″ of series error).
- **Pre-1906 corpus charts carry `delta-T` uncertainty as the floor.** The corpus
  deliberately includes pre-IST-era births, and their residual is the historical
  `delta-T` uncertainty, not the series.

## See also

- `src/lib/timeScales.ts` — implementation
- `src/lib/nakshatraEdge.ts` — nakshatra boundary exposure
- `src/lib/vimshottari.ts` — dasha lord/balance, used by the flip audit
- `src/tests/timeScales.test.ts` — the trap quantified in a test
- `src/tests/bodyFrame.test.ts` — the bodies proved against the Moon
- `src/tests/accuracy/moonFlipAudit.test.ts` — nakshatra flips and dasha shift
- `docs/CHART_TZ_MIGRATION.md` — the companion timezone bug
