# The published accuracy report

The `/accuracy` page has two parts:

1. **The live runner** — a `Run Validation` button that re-derives the 15-chart
   comparison in the browser. Internal engineering tool; `noindex`.
2. **The published report panel** — a snapshot rendered verbatim from
   `src/generated/summary.json`. This is the part a visitor is meant to read.

Both render on the same route. There is no separate public page.

## What the panel is for

Most Jyotish apps quote an accuracy figure with no way to check it. This panel
states:

- how many charts were compared and against what (Swiss Ephemeris, Lahiri);
- the observed arcsecond error per body, next to the engine's own advertised
  claim and the ceiling that fails the gate;
- how many corpus charts have a Moon sitting inside the engine's own error bar
  of a nakshatra edge (where arithmetic, not the birth record, picks the
  nakshatra);
- the delta-T floor that no series length can fix;
- **what is not verified** — the layers that are computed and shown to users but
  are not compared against any external authority.

The last section is the point. A claim is only useful next to its boundary.

## Generating the snapshot

```bash
npm run accuracy:publish
```

The script (`scripts/publish-accuracy.mjs`) does not copy a gate artefact. It
re-derives the numbers:

- loads `tools/accuracy/golden/*.json` (Swiss Ephemeris, `swisseph-wasm`) and the
  reference corpus;
- runs the engine for each chart through the Vite SSR module runner (TypeScript
  and `@/` aliases resolved the same way the app resolves them);
- computes per-body max arcsecond deviation, the nakshatra-boundary exposure, and
  the corpus counts;
- writes `src/generated/summary.json`.

If the corpus or golden directory is missing, the script exits 0 and warns, and
the checked-in snapshot stays a placeholder — the panel then shows
`data-testid="placeholder-warning"` telling you to run the command.

`npm run ship` runs publish then build, and `netlify.toml` uses the same order so
production never ships a stale snapshot.

### Claims vs ceilings

`CLAIM_ARCSEC` in the publish script is the engine's advertised accuracy per body.
The gate ceiling is a flat `1800″` (0.5°) — the largest error that stays invisible
at the arcminute resolution users see. A body whose observed error exceeds its
claim renders as **OVER CLAIM**; the page does not round it green. As of the last
publish, Sun is over its own 36″ claim at 49.9″ while every body stays far under
the 1800″ ceiling.

## The data shape

`src/lib/accuracyReport.ts` owns the shape and a defensive loader.

- A missing field becomes a label, never a crash.
- The verdict is **derived from the numbers** (`observed ≤ claim`), not read from
  a `verdict` field, so a stale or optimistic field cannot paint a failing body
  green.
- An absent `observed` is `unmeasured`, not `pass`.

`UNVERIFIED_AREAS` and `DELTA_T_NOTE` live here too, so the honesty list ships with
the code rather than the snapshot.

## Tests

- `src/tests/accuracyPage.test.tsx` — the panel renders, names the unverified
  layers, carries the delta-T caveat, reports its frame, and the loader derives
  verdicts from the numbers.
- `src/tests/week10/accuracyDashboardPage.test.tsx` — the pre-existing dashboard
  tests; the live per-chart table is queried by its accessible name so the
  panel's summary table does not shadow it.

## See also

- `docs/accuracy/METHODOLOGY.md` — the two-tier tolerance model.
- `docs/TIME_SCALES.md` — why bodies use TT and angles use UT.
- `docs/ASCENDANT.md` — the ascendant definition and its exact resolution.
