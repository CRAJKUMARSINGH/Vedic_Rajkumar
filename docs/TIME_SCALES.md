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

## See also

- `src/lib/timeScales.ts` — implementation
- `src/tests/timeScales.test.ts` — the trap quantified in a test
- `docs/CHART_TZ_MIGRATION.md` — the companion timezone bug
