# Shadbala

**Status: unverified.** Shadbala is computed and shown to users, but no layer of
it has been checked against a published worked example. This document records the
formulas, the ceilings, the school choices, and — at the end — everything that is
_not_ verified.

## Two implementations, deliberately

|            | File                                   | Role                                                                       |
| ---------- | -------------------------------------- | -------------------------------------------------------------------------- |
| **Oracle** | `tools/accuracy/shadbalaReference.mjs` | Independent reference. Own tables, own varga rules, **no `src/` imports**. |
| **Engine** | `src/services/shadabalaService.ts`     | What ships. Simplified approximation, in Rupas.                            |

The oracle exists so the engine can be compared against something other than
itself. If the two disagree, one has a typo — which is the point. A golden derived
from the engine's own output proves nothing.

The oracle is a pure function of a _sky snapshot_ (`lon`, `house`, `speed`,
`declination`, `cusps`, `isDay`, `third`, `lords`, `localHours`) with no ephemeris
dependency, so a disagreement is always an arithmetic or rule disagreement, never
a planetary-position one.

## Units

**Virupas** (shashtiamsas). **60 virupas = 1 rupa.** The oracle works in virupas
throughout; the engine works in Rupas. This unit difference is the source of the
scale divergence noted below, not a bug in either.

## School choices (explicit, never silently defaulted)

Two classical questions genuinely have more than one answer. Both are settled here
and encoded as `SCHOOLS.A` / `SCHOOLS.B` in the oracle rather than hardcoded:

| Question                                                  | Chosen                                                | Why                                                                                                  |
| --------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Do neuters (Mercury, Saturn) take Ojhayugmarasyamsa Bala? | **Yes** (school **A**, `neuterGetsOddSignBala: true`) | Follows the reading in which the natural benefic/malefic split drives the rule for all seven grahas. |
| Is Moon's Paksha Bala doubled?                            | **No** (school **A**)                                 | Less common; kept off so the component stays on the same 60-virupa ceiling as the rest.              |
| Friendship model                                          | **Natural only**                                      | Panchadha maitri (temporal + natural) is _not_ implemented — see "what this does not verify".        |

Every oracle function takes `school` as an argument. **A silent choice here is how
an interpretive layer gets unverified in the first place**, so there is no default
that is not written down.

## Components

Ceilings are `MAXIMA` in the oracle. `arc(a, b)` is the shorter angular distance
(0–180°).

### Sthana Bala — positional (ceiling 465 virupas)

Five sub-components. The first four are small and closed-form; Saptavargaja Bala
is three-quarters of the total (315 of 465 virupas), which is why the varga rules
matter so much.

| Sub-component          | Formula                                                                                   | Ceiling | BPHS (Graha Bala) |
| ---------------------- | ----------------------------------------------------------------------------------------- | ------- | ----------------- |
| Uchcha Bala            | `arc(lon, exaltation + 180) / 3`                                                          | 60      | Exaltation Bala   |
| Kendradi Bala          | 60 in a kendra (1/4/7/10), 30 in a panapara (2/5/8/11), 15 otherwise                      | 60      | Kendradi Bala     |
| Ojhayugmarasyamsa Bala | 15 or 0 by odd/even sign and planet nature                                                | 15      | Ojayugma Bala     |
| Drekkana Bala          | 15 if the planet owns the decanate group (Sun/Mars/Jupiter · Mercury/Saturn · Moon/Venus) | 15      | Drekkana Bala     |
| Saptavargaja Bala      | Σ over D1/D2/D3/D7/D9/D12/D30 of a dignity point value                                    | 315     | Saptavargaja Bala |

Dignity points (`DIGNITY_POINTS`): moolatrikona 45 · own/exaltation/great-friend
22.5 · friend 15 · neutral 7.5 · enemy 3.75 · great-enemy/debilitation 1.875.
`DIGNITY_POINTS.moolatrikona × 7 === MAXIMA.saptavargaja` is asserted directly, so
the two tables cannot drift apart.

### Dig Bala — directional (ceiling 60 virupas)

`(180 − arc(lon, cusp_of_strongest_bhava)) / 3`

Strongest bhava: Sun / Mars 10th · Jupiter / Mercury 1st · Saturn 7th ·
Moon / Venus 4th (`DIG_BEST_BHAVA`). Dig Bala depends on the planet's position
relative to its strongest **cusp**, _not_ on exaltation.

### Kala Bala — temporal (ceiling 195 virupas)

This is the first component that depends on the **birth moment**, which re-opens
the exact bug class the historical-timezone work fixed. 1 hour of offset moves
Nathonnatha and Tribhaga together.

| Sub-component                    | Formula                                                                                  | Ceiling     |
| -------------------------------- | ---------------------------------------------------------------------------------------- | ----------- |
| Nathonnatha Bala                 | Sun peaks at noon, Moon at midnight                                                      | 60          |
| Paksha Bala                      | `arc(elongation, 0) / 3` for benefics, complemented for malefics                         | 60          |
| Tribhaga Bala                    | 60 to the day/night lord of the third; Jupiter unconditionally                           | 60          |
| Varsha / Masa / Dina / Hora Bala | 15 / 30 / 45 / 60 to the matching lord                                                   | 15+30+45+60 |
| Ayana Bala                       | `60 × (kranti + 24) / 48`; Sun/Mars/Jupiter/Venus north-preferring, Moon/Saturn inverted | 60          |

### Cheshta Bala — motional (ceiling 60 virupas)

`speed < 0 → 60 · speed == 0 → 30 · speed > 0 → 0`. **Coarse** — see below.

### Naisargika Bala — natural (fixed, totals 240 virupas)

`Sun 60 · Moon 51.43 · Venus 42.86 · Jupiter 34.29 · Mercury 25.71 · Mars 17.14 ·
Saturn 8.57`. Strictly descending in the classical order; the total is asserted.

### Drik Bala — aspectual (signed, ±30 virupas here)

Sputa drishti with Mars 4/8, Jupiter 5/9 and Saturn 3/10 specials, signed by
benefic/malefic and divided by 4. **Approximate** — see below.

### Aggregation

`totalVirupas = sthana + dig + kala + cheshta + naisargika + drik`, and
`rupas = totalVirupas / 60`. `meetsMinimum` compares `rupas` against
`REQUIRED_MIN_RUPAS`.

## Engine ↔ oracle divergence (pinned, not hidden)

The shipped engine is a _simplified approximation_. Where it disagrees with the
oracle, the disagreement is asserted as a known fact so it cannot drift silently
and so fixing it forces a test change in the same commit.

| Item                                | Oracle (BPHS / classical) | Engine                                                                     | Pinned in                 |
| ----------------------------------- | ------------------------- | -------------------------------------------------------------------------- | ------------------------- |
| Sthana scale                        | 465 virupas = 7.75 Rupas  | capped at 3.0 Rupas (+ Vargottama 0.5, Neecha Bhanga 0.75 outside the cap) | `shadbala.corpus.test.ts` |
| Sun's required minimum              | **5** Rupas               | **6.5** Rupas                                                              | `shadbala.corpus.test.ts` |
| Every other graha's minimum         | 6 / 5 / 7 / 6.5 / 5.5 / 5 | identical                                                                  | `shadbala.corpus.test.ts` |
| Dig / Naisargika / Cheshta ceilings | 1 Rupa each               | 1 Rupa each                                                                | `shadbala.corpus.test.ts` |
| D4, D20, D60 divisional signs       | classical rules           | generic `(rashi × n + part) % 12` — **wrong**                              | `shadbala.varga.test.ts`  |

Notes on the varga divergence:

- **D4, D20, D60 have no rule in `calculateVargaRashi`** and fall through to the
  generic mapping. D60 is the worst case: `(s × 60 + part) % 12` collapses to
  `part % 12` because 60 ≡ 0 (mod 12), so the divisional sign is completely
  independent of the rashi.
- **D7 needs no special case.** `(7s + part) % 12` _is_ the closed form of the
  classical rule (odd signs count from the sign, even signs from the 7th). It is
  asserted as _agreeing_, not diverging.

## What this does not verify

- **No published worked example.** The corpus contains no chart with a
  hand-computed Shadbala. Every claim above is internal consistency between two
  implementations of the same reading of BPHS — **not** agreement with BPHS, with
  JHora, or with any other authority. The goldens under
  `tools/accuracy/golden/shadbala/` are _regression_ baselines, not truth.
- **Cheshta Bala is coarse.** Three values (60 / 30 / 0) from the sign of the
  speed alone. Real Cheshta Bala interpolates against the mean and the
  retrograde/direct arc. Without a speed _magnitude_ in the sky snapshot, this
  cannot be improved here.
- **Drik Bala is an approximation.** It uses a simplified sputa-drishti with the
  special aspects and no graded virupa curve. Treated as approximate.
- **Graha Yuddha (planetary war) is not implemented** in the oracle at all. The
  engine applies a crude ×1.2 / ×0.5 multiplier; the oracle applies nothing.
- **Friendship is natural-only.** Panchadha maitri (natural + temporal, plus
  compound relationships) is not implemented; the dignity table uses the natural
  relationship only.
- **D4 / D20 / D60 divisional rules are out of scope here.** The oracle implements
  them so the engine's divergence can be measured; the engine's values for those
  three are wrong and unconsumed by any verified surface.
- **School-dependent branches are only tested under school A.** School B paths
  exist in the oracle but are not exercised end-to-end.
- **The engine's strength fields in `src/services/divisionalChartsService.ts` are
  non-deterministic** — `shadbala.total`, `shadbala.ratio` and `overall` are
  seeded from `Math.random()`. Those values are decorative, must never be treated
  as a Shadbala reading, and are disclosed in `docs/accuracy/UNVERIFIED.md`.

## Reproducing

```bash
npm run accuracy:shadbala-golden   # regenerate oracle goldens (only when a rule changes)
npm run test:accuracy:shadbala     # analytic + varga + corpus + tz-wiring + golden drift
```

> **When a golden fails, read the diff before regenerating.** Regenerating blind
> converts the oracle back into a tautology.

## Sources

- **BPHS, Graha Bala adhyaya** — the six-fold strength scheme and the component
  ceilings.
- `tools/accuracy/shadbalaReference.mjs` — the normative implementation of the
  formulas as written here.
