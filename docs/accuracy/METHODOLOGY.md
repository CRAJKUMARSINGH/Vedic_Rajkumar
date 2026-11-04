# Accuracy Methodology

This document describes how the Vedic Rajkumar engine is validated.

## Two-tier tolerance model

### Tier A — Astronomical (arcseconds)

| Quantity                               | Tolerance                            |
| -------------------------------------- | ------------------------------------ |
| Graha longitudes (Sun, Mercury…Saturn) | ≤ 1.0″                               |
| Moon longitude                         | ≤ 3.0″ (1 s of time ≈ 0.55″ of Moon) |
| Nodes (Rahu/Ketu)                      | ≤ 1.0″                               |
| Ascendant                              | ≤ 2.0″                               |
| MC                                     | ≤ 2.0″                               |
| Lahiri ayanamsa                        | ≤ 0.1″                               |

Tier A failures are invisible to users — they require arcsecond-level comparison.

### Tier B — Derived Jyotish (exact match)

`rashi · nakshatra · pada · navamsaSign · dashamsaSign · tithi · yoga · karana · vara · houseOccupancy`

Tier B failures ARE visible to users. A chart that assigns a planet to the wrong
nakshatra by a single arcminute will be rejected by any practising astrologer.
Tier B failures cause CI to exit non-zero.

### Varga (divisional) coverage

The varga mapping is gate-tested against the independent transform in
`tools/accuracy/lib/varga.mjs` over the 15-chart corpus
(`tools/accuracy/golden/varga/`). The convention is pinned in
`docs/accuracy/VARGA-CONVENTIONS.md`; no tolerance applies — an off-by-one varga
sign is a wrong chart.

| Divisions                    | Status                                                                                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| D2, D3, D7, D12, D30         | **Validated** — exact match to the classical rule                                                                                              |
| D10, D20, D24, D40, D45, D60 | **Diverging (documented)** — the engine falls through to a generic `(sign × division + part) mod 12`; tracked as `DEF-VARGA-10/20/24/40/45/60` |

The diverging set is a known implementation gap, disclosed rather than hidden.
Its current behaviour is pinned by `src/tests/accuracy/varga.test.ts` so it
cannot change silently; fixing the engine must update the test and
`VARGA-CONVENTIONS.md` in the same change.

## Reference sources

1. **Swiss Ephemeris** (`swisseph-wasm`) — primary authority for Tier A
2. **Jagannatha Hora (JHora)** — secondary cross-check for Tier B

Agreement with both sources makes the validation independent of any single
implementation.

## The historical timezone floor

`delta-T` uncertainty pre-1900 is ±3–10 s. That is ±1.6–5.5 arcsec of Moon
and ±0.25–2.7 arcmin of ascendant rotation. No ephemeris series can reduce this
floor — it is a measurement limit on historical Earth rotation.

Pre-1947 Indian charts additionally require correct historical timezone resolution
(see `docs/CHART_TZ_MIGRATION.md`). Most Jyotish apps get pre-1942 Mumbai wrong.

## Reproducibility

To reproduce the accuracy report from scratch:

```bash
git clone https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar
npm ci
npm run accuracy:golden    # generate golden values from Swiss Ephemeris
npm run test:accuracy:full # compare engine output to golden
```

The manifest at `tools/accuracy/golden/manifest.json` records the `swisseph-wasm`
version, ayanamsa mode, and corpus hash so results are reproducible to the
specific library version used.

## What is not yet validated

The following layers are deterministic transforms of the chart but have not yet
been independently gate-tested:

- Varga (divisional) charts D10, D20, D24, D40, D45 and D60 — D2, D3, D7, D12
  and D30 are validated (see "Varga (divisional) coverage" above)
- Yogas (qualitative, rule-matching)
- Shadbala
- Ashtakavarga scores
- Interpretation prose

Adding them to the gate is on the roadmap. Their absence is disclosed rather
than hidden.
