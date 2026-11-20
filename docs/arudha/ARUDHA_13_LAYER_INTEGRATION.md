# Arudha Lagna in the 13-layer forecast stack

Design guide for wiring Arudha Lagna (AL) into the app's forecast layers.

- **Source:** the Venice.ai session design ("Arudha Lagna in the 13-layer forecast
  stack") reconciled with the Codex brief `CODE-JUNCTION/V1-CLAUDE` (work items
  W0–W6) and against the code actually present in this repo.
- **Status:** design record. §0 is **landed**; §1–§4 are the target contract for
  the (feature-flagged, disabled-by-default) image axis. See §5 for the
  repo-reality reconciliation.
- This document carries **no birth data** and no derived chart values.

---

## 0. Arithmetic correction (BPHS 29.4–5)

`reports/ARUDHA_CALCULATION_CONVENTION.md` carries an owner decision —
_dist===7 → 10th or 4th_. It is resolvable, and the older code was wrong on that
branch.

BPHS 29.4–5: if the pada falls in the bhava itself or the 7th from it, **the 10th
from that pada** is taken. Apply literally:

| Lord's distance from bhava | Raw pada  | 10th from raw pada     | Final              |
| -------------------------- | --------- | ---------------------- | ------------------ |
| 1st (same sign)            | bhava + 0 | bhava + 9              | 10th from bhava    |
| 7th                        | bhava + 6 | bhava + 15 ≡ bhava + 3 | **4th from bhava** |

The final rule:

```ts
// src/services/jaiminiService.ts
const EXCEPTION_OFFSET: Record<1 | 7, number> = { 1: 9, 7: 3 };
const pada =
  dist === 1 || dist === 7
    ? (sourceSign + EXCEPTION_OFFSET[dist]) % 12
    : (lordSign + dist) % 12;
```

`expectedPada()` in `src/tests/arudha.test.ts` uses the same table. The "10th or
4th" decision closes as _4th from the source_.
`reports/ARUDHA_CALCULATION_CONVENTION.md` moves from OPEN to RESOLVED with the
BPHS citation.

> **Repo status: RESOLVED.** This correction is already landed in
> [`jaiminiService.ts`](../../src/services/jaiminiService.ts) with the
> `EXCEPTION_OFFSET = { 1: 9, 7: 3 }` table and the 24-case matrix; the
> convention doc is marked RESOLVED (2026-11-19). Nothing downstream of a wrong
> A10 is salvageable, so this is a blocker, not a nit.

---

## 1. The rule that governs the whole design

**Arudha is maya.** It is the image, the reputation, the perception — never the
substance. The 12th house from lagna is loss; the 12th from Arudha Lagna is _loss
of image_. A chart can have a magnificent AL and a hollow 10th house. Forecast AL
as image and only image, or the app starts predicting press releases instead of
outcomes.

Consequence: **AL never carries a layer alone and never overturns a substance
verdict.** It enters as a second axis and a bounded modifier. The composite cap
is **±8 points**; the image axis is displayed but ranked below substance in every
conflict.

---

## 2. The two-axis output

Forecast substance and forecast image separately, then publish the **gap**. The
gap is the actual predictive payload — it is what a competent astrologer reads
and what no horoscope app currently says out loud.

| Gap (image − substance) | Reading        | Copy (EN)                                                                                              | Copy (HI)                                                                 |
| ----------------------- | -------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| ≥ +20                   | over-promised  | "You will be credited above your delivery. Bank the goodwill; do not spend it before the work exists." | "आपको काम से अधिक श्रेय मिलेगा। साख बचाएँ, काम होने से पहले खर्च न करें।" |
| +8 … +19                | slightly ahead | "Perception is running ahead of substance. Close the gap quietly."                                     | "धारणा काम से आगे है। चुपचाप अंतर पाटें।"                                 |
| −7 … +7                 | aligned        | "How you are seen matches what you can deliver."                                                       | "जैसे देखे जाते हैं, वैसा ही कर पाते हैं।"                                |
| −8 … −19                | undervalued    | "You deliver more than you are credited for. Visibility is the missing input, not skill."              | "आप श्रेय से अधिक देते हैं। कमी दिखने की है, कौशल की नहीं।"               |
| ≤ −20                   | invisible      | "Substance without audience. Nothing moves until the image is repaired first."                         | "काम है, दर्शक नहीं। साख सुधरे बिना कुछ नहीं चलेगा।"                      |

The band vocabulary is `over-promised · ahead · aligned · undervalued ·
invisible`.

---

## 3. Where AL enters each of the 13 layers

| #   | Layer                  | AL contribution                                                       | Weight     | Gate                               |
| --- | ---------------------- | --------------------------------------------------------------------- | ---------- | ---------------------------------- |
| 1   | Rajyoga gate           | none — yoga is a substance layer                                      | 0          | —                                  |
| 2   | House promise (SAV)    | **A10/A11/A4 image sub-score, parallel to SAV, never replacing it**   | image axis | SAV row present, else `UNVERIFIED` |
| 3   | Dasha activation       | AL lord's dasha period boosts image axis only                         | ±4         | dasha engine hash                  |
| 4   | Transit timing         | A10 ingress windows for reputation activation                         | ±3         | ingress engine, as-of pinned       |
| 5   | Placement citations    | `A10 falls in the Nth from AL` line                                   | prose      | arudha hash                        |
| 6   | Direction              | A10 sign → posting direction (image-driven relocation only)           | prose      | —                                  |
| 7   | Muhurat windows        | none — muhurat is a substance/election layer                          | 0          | —                                  |
| 8   | Sequencing             | image repair is step 0 when gap ≤ −20                                 | ordering   | gap computed                       |
| 9   | Remedies               | remedy keyed to AL lord when image axis < 40                          | prose      | AL lord resolved                   |
| 10  | Confidence calibration | gap ≥ 20 or ≤ −20 → −0.05 (two axes disagreeing); gap in band → +0.03 | ±0.05      | —                                  |
| 11  | Provenance             | `arudha` engine + version + `arudha_hash` on every card carrying AL   | required   | N9 `validateProvenance`            |
| 12  | Answer composition     | dedicated section `image-vs-substance`, placed after `why`            | —          | —                                  |
| 13  | Delivery surfaces      | rendered in card JSON, `.md`, static HTML, `app_links`                | —          | `answers:check`                    |

Layers 1 and 7 get nothing from AL. Say so in the doc rather than manufacturing a
contribution — a 13-layer table where every layer claims an AL input reads as
padded.

---

## 4. Image sub-score (deterministic, 0–100)

Base from A10's house counted **from AL**:

| House from AL | Base |     | House from AL | Base |
| ------------- | ---- | --- | ------------- | ---- |
| 10th          | 90   |     | 4th           | 52   |
| 11th          | 80   |     | 7th           | 48   |
| 9th           | 76   |     | 6th           | 38   |
| 1st           | 72   |     | 8th           | 30   |
| 5th           | 66   |     | 12th          | 22   |
| 2nd           | 60   |     | 3rd           | 56   |

Modifiers, applied in order, then clamp 0–100:

```text
AL lord dignity   exalted +12 · own +8 · friend +4 · neutral 0 · enemy −6 · debilitated −12
each benefic in AL  +6   (max +12)
each malefic in AL  −5   (max −10)
retrograde in AL    −3   (max  −6)
planet in 12th from AL −4 (max  −8)
AL lord retrograde  −6
```

`band_gap` thresholds: ≥ +20 over-promised · +8…+19 ahead · ±7 aligned ·
−8…−19 undervalued · ≤ −20 invisible.

Forecast-bearing Arudhas only: **A10 (career), A11 (finance), A4
(house_construction), A7 (marriage)**. Health emits **no** image axis (health is
a bhava matter — no health creep).

### Confidence deltas

- gap ≥ 20 or ≤ −20 → **−0.05**
- gap within ±7 → **+0.03**
- A10 uncomputable → **−0.04** and omit the axis
- AL lord unresolved → **−0.06** and omit the axis
- AL may never push confidence above **0.9**; floor stays **0.2**.

### Fail-closed provenance

Stamp every AL-carrying card with
`provenance.arudha = { engine, version, convention, arudha_hash, status }`,
routed through N9 `validateProvenance`, fail-closed. Reject the AL section when
engine or hash is missing, the convention string mismatches, or
`status === 'TRADITIONAL'` while `band_gap` is extreme (|gap| ≥ 20).

---

## 5. Repo-reality reconciliation

This section exists because the source session assumed work that was partly
already landed and partly still aspirational. Verified against this repo:

| Claim in the source design                                        | Reality in this repo                                                                                                                                                                                |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §0 dist===7 must be corrected to `+3`                             | **Already landed.** `EXCEPTION_OFFSET { 1: 9, 7: 3 }` is in `jaiminiService.ts`; convention doc RESOLVED; oracle corrected.                                                                         |
| Image axis engine `arudhaImage.ts`                                | **Landed but disabled.** [`arudhaImage.ts`](../../src/services/answerCard/arudhaImage.ts) exists behind `VITE_ARUDHA_IMAGE === 'true'`.                                                             |
| Base table §4                                                     | Matches `IMAGE_BASE_BY_HOUSE` exactly.                                                                                                                                                              |
| Modifiers §4                                                      | **Partial.** Landed: benefic +6 (cap +12), malefic −5 (cap −10), retrograde −3 (cap −6). Not yet landed: AL-lord dignity, planet in 12th from AL, AL-lord retrograde — omitted rather than guessed. |
| Gap bands §2                                                      | Matches `gapBand()` and `GAP_LINE` (both EN/HI).                                                                                                                                                    |
| Provenance `{ engine, version, convention, arudha_hash, status }` | Matches `ImageAxis.provenance`; `validateImageProvenance` is fail-closed and withholds TRADITIONAL + extreme gap.                                                                                   |
| Health emits no image axis                                        | Enforced — `TOPIC_ARUDHA` omits `health`.                                                                                                                                                           |
| Confidence deltas §4                                              | **Not yet wired into `confidence.ts`.**                                                                                                                                                             |
| §3 layer table                                                    | Aspirational wiring map; the image axis is the only piece that exists today.                                                                                                                        |
| Card composition (section after `why`)                            | The composer layer is present; the `image-vs-substance` section is gated by the flag.                                                                                                               |

**Interpretation of the design's experimental parameters.** The image score,
gap bands and thresholds are **experimental design parameters** — not classical
constants and not calibrated predictions. That is why the axis ships disabled by
default and why every emitted line is prefixed as an experimental note. Owner
sign-off is required before the flag is turned on.
