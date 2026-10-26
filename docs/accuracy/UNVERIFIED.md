# Unverified layers

**This file is the inventory of everything the app computes and shows that has
not been checked against an external authority.** It is deliberately short: a
layer is listed here only while it is _deterministic but unverified_, and it
leaves the list the moment a gate exists.

The table below is **gated**. `src/tests/accuracy/unverifiedDoc.test.ts` reads it
and fails if it drifts from `UNVERIFIED_AREAS` in `src/lib/accuracyReport.ts`,
which is what the public `/accuracy` page renders at `data-testid="unverified-list"`.
So the published disclosure and this document cannot disagree.

## The list

| Area                          | Why                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| Varas (weekday)               | derived from the calendar, never cross-checked against a fixture.                           |
| Vimshottari dasha dates       | computed twice by independent code and the two agree, but neither is checked against JHora. |
| Yogas                         | rule-based; no external authority consulted.                                                |
| Shadbala                      | a formula chain with no published worked example in the corpus.                             |
| Ashtakavarga                  | same as shadbala.                                                                           |
| Divisional charts (D9 and up) | inherit a verified ascendant and Moon, but their own transform is unverified.               |
| Interpretation prose          | authored text; no accuracy claim applies.                                                   |

Every interpretive output in the app must be labelled **verified** or
**unverified**. A surface that renders one of the areas above carries a badge
saying so; the absence of a badge is a claim of verification and must not be made
by accident.

## What "unverified" does and does not mean

- **Verified** means: gated against an authority that is _not this codebase_ — Swiss
  Ephemeris for the astronomical layer, per `docs/accuracy/METHODOLOGY.md`.
- **Unverified** does **not** mean "wrong". It means "no one outside this repository
  has confirmed it". A layer can be internally consistent and still unverified:
  computing the same value twice with two code paths only proves the two agree.
- Where a layer is **known to be wrong** it is called out explicitly below; that is
  a stronger statement than "unverified" and is recorded so it cannot be mistaken
  for a safe default.

## Known concrete defects under these headings

These are not "perhaps imprecise" — they are specific, reproducible divergences.
Each is pinned by a test so a fix is forced to update the test and this file
together.

| Defect                             | Where                                     | Detail                                                                                                                                                                                                                                                                                                   |
| ---------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Varga rules missing for D4/D20/D60 | `src/services/divisionalChartsService.ts` | `calculateVargaRashi` special-cases only 2, 3, 7, 9, 12, 30. D4/D20/D60 fall through to the generic `(rashi × n + part) % 12`. For D60 this collapses to `part % 12` (60 ≡ 0 mod 12), making the divisional sign independent of the rashi. See `docs/accuracy/SHADBALA.md` and `shadbala.varga.test.ts`. |
| Sun's required Shadbala minimum    | `src/services/shadabalaService.ts`        | `REQUIRED_RUPAS.Sun = 6.5` against BPHS's 5. Every other graha's minimum agrees. Pinned in `shadbala.corpus.test.ts`.                                                                                                                                                                                    |
| Sthana Bala scale                  | `src/services/shadabalaService.ts`        | Engine caps Sthana at 3.0 Rupas; the classical ceiling is 465 virupas = 7.75 Rupas. A different (simplified) model, not a rounding error.                                                                                                                                                                |
| Non-deterministic strength fields  | `src/services/divisionalChartsService.ts` | `shadbala.total` / `shadbala.ratio` and `overall` are seeded from `Math.random()`. Decorative only; must never be read as a Shadbala value. Not yet removed because removing them changes a rendered surface.                                                                                            |
| Shadbala approximations            | `tools/accuracy/shadabalaReference.mjs`   | Coarse Cheshta Bala (three values from the sign of speed), approximate Drik Bala, no Graha Yuddha in the oracle, natural-only friendship (not panchadha maitri). Enumerated in `docs/accuracy/SHADBALA.md`.                                                                                              |

## How a layer leaves this list

1. A gate exists that compares the layer against a non-repository authority (or a
   published worked example), and
2. the gate runs in CI, and
3. the entry is removed from both `UNVERIFIED_AREAS` and this table in the same
   change.

Verification is per _claim_, not per _module_: a chart whose ascendant is verified
by Swiss Ephemeris does not make its yogas verified. That distinction is the whole
point of the list.
