# c4 — Premium Chart Engine · Phase 0 Inspection

**Date:** 2026-11-20
**Status:** Phase 0 inspection COMPLETE (report only — no code change in this phase)
**Reference assets:** `CODE-JUNCTION/CHART IMAGES/` — 5 JPEG screenshots of the *Parashar Lite 9.0* mobile app, dated 2026-11-19
**Landed code under review:** `src/features/charts/**` (model + renderers)

> ## Confidentiality (AGENTS.md standing order §7)
> The reference screenshots contain a **named subject's birth data** (name, date of
> birth, time of birth, place). That data is **redacted from every line of this
> report by construction** and must never be copied into `public/`, an answer card,
> an emitted artifact or a log. The JPEGs live only under `CODE-JUNCTION/` (not
> world-readable) and were not moved. Any implementation test must use **synthetic
> fixtures only** (as `src/tests/charts/fixtures.ts` already does).

> ### Basis caveat
> `CODE-JUNCTION/c4.txt` (the c4 specification) was consumed and deleted during the
> 2026-11-20 CODE-JUNCTION cleanup, before this inspection ran. This Phase 0 report
> is therefore **reconstructed** from two primary sources: (a) the five reference
> screenshots, read via the Windows OCR engine (`Windows.Media.Ocr`, en-US/en-GB);
> and (b) the phase headers already present in the landed code. The exact phase
> numbering and any acceptance criteria recorded in the original `c4.txt` could not
> be recovered — the phase labels below are quoted from the code, not from the spec.

---

## 1. Reference asset inventory

| # | File | Pixels | OCR-extractable surface |
|---|---|---|---|
| 1 | `WhatsApp Image … PM (1).jpeg` | 899 × 438 | Birth chart — **North Indian** layout, with a subject header line |
| 2 | `WhatsApp Image … PM (2).jpeg` | 912 × 434 | Birth chart — **South Indian** layout, same data as #1 |
| 3 | `WhatsApp Image … PM (3).jpeg` | 223 × 226 | Compact **period (dasha) date list** — 10 dated rows |
| 4 | `WhatsApp Image … PM (4).jpeg` | 440 × 197 | Seven numeric **strength ratios** (≈0.7–1.3) |
| 5 | `WhatsApp Image … PM.jpeg` | 190 × 39 | Cropped slice of the #3 date column (dates only) |

All five are cropped regions of one Parashar Lite 9.0 session (one subject). None is
a full-screen capture; each is a widget crop.

---

## 2. Surface-by-surface catalogue

### 2.1 Birth chart — North Indian (ref 1, 899 × 438)
- **Header line:** subject name · date of birth · time of birth · place. *(values redacted)*
- **Title:** "Birth Chart".
- **Body:** a 12-compartment North Indian (diamond) chart.
- **Per-house annotation:** OCR reads house labels of the form `"1st h."`, `"2nd h."`,
  `"6th h."`, `"12th h."` — i.e. an ordinal house tag in each compartment — alongside
  a 2-digit value (e.g. `29`, `34`, `33` in the OCR). The 20–40 range and per-house
  placement are consistent with a **Sarvashtakavarga (SAV) bindus-per-house** figure,
  though OCR alone cannot confirm the label; flagged for visual confirmation.
- **Per-planet annotation:** each planet renders as **abbreviation + degree**, e.g.
  `As 21:39`, `Ra 29.19`, `Ju 06:53`, `Ke 29:19`, `Sa 05:01`, `Me 13:03`, `Ma 13:33`,
  `Su 26`. Degrees appear as `D.MM` / `D:MM` (degrees + arc-minutes).
- **Per-planet nakshatra:** OCR also returns short 3-letter tokens interspersed with
  the planets (`Pun`, `Ash`, `Dha`, `PBh`, `VBh`) that are **nakshatra abbreviations**
  (Punarvasu, Ashwini, Dhanishtha, Purva Bhadrapada, …). The reference chart therefore
  shows the **nakshatra name inline in the chart cell**, next to the planet.
- **Ascendant:** marked explicitly (`As`) with its degree.

### 2.2 Birth chart — South Indian (ref 2, 912 × 434)
- Same header line and same underlying planetary data as ref 1, rendered in the
  **South Indian** fixed-sign 4×4 grid (house numbers appear around the ring).
- Confirms the reference app offers **both regional layouts for the same chart** —
  the same design contract the landed `ChartSurface` encodes.

### 2.3 Period (dasha) date list (refs 3 & 5)
- Ref 3 is a small panel (223 × 226) listing **ten consecutive dated rows**:
  `16-10-2026, 11-03-2027, 19-07-2027, 20-12-2027, 06-05-2028, 02-07-2028,
  17-07-2028, 10-08-2028, 27-08-2028, 10-10-2028` — a Vimshottari period boundary
  ladder (level headers OCR as garbled Devanagari).
- Ref 5 (190 × 39) is a zoomed crop of the same date column (`11-03-2027`, `19-07-2027`),
  i.e. a detail/zoom state of ref 3, not a distinct screen.

### 2.4 Planetary strength values (ref 4, 440 × 197)
- Seven decimal values: `1.23, 0.69, 1.16, 0.88, 1.09, 1.04, 1.28`.
- Seven values → the seven *classical* grahas (Sun…Saturn), i.e. Rahu/Ketu excluded.
- Magnitude centred on ≈1.0 is consistent with a **Shadbala ratio** (achieved ÷
  required Rupas), the same canonical metric the landed `PlanetStrengthChart`
  encodes as `shadabalaRatio` with a 1.0 threshold marker.

---

## 3. Mapping to the landed implementation

| Reference surface | Landed artefact | Phase (per code header) |
|---|---|---|
| Birth chart, North layout (#1) | [NorthIndianChart.tsx](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/charts/components/NorthIndianChart.tsx) | c4 Phase 2 |
| Layout switch North ⇄ South | [ChartSurface.tsx](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/charts/components/ChartSurface.tsx) | c4 Phase 3 |
| Birth chart, South layout (#2) | [SouthIndianChart.tsx](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/charts/components/SouthIndianChart.tsx) | c4 Phase 3 |
| Planet table (sign/house/degree/nakshatra/pada/motion/dignity) | [ChartDetailsTable.tsx](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/charts/components/ChartDetailsTable.tsx) | c4 Phase 4 |
| Strength values (#4) | [PlanetStrengthChart.tsx](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/charts/components/PlanetStrengthChart.tsx) | c4 Phase 6 |
| Projection model for all of the above | [chartViewModel.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/charts/model/chartViewModel.ts) | c4 Phase 1 |
| Bilingual labels + DMS/degree formatting | [labels.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/features/charts/model/labels.ts) | c4 Phases 1, 4, 8 |
| Unit tests (synthetic fixtures) | `src/tests/charts/chartViewModel.test.ts` (12), `chartSurface.test.tsx` (4) | c4 Phase 9 |

Verified green: full suite **2613/2613 across 161 files** and `npx tsc --noEmit` exit 0
(recorded 2026-11-20 in `reports/C3_ANSWER_COMPOSER_INTEGRATION.md`). The `src/tests/charts`
group is part of that run.

---

## 4. Gap analysis (reference vs implementation)

| # | Reference shows | Implemented? | Gap | Severity |
|---|---|---|---|---|
| G1 | North + South layout for the same chart, switchable | ✅ Yes | none — `ChartSurface` switches layout without recalculating | — |
| G2 | Planet **degree inside the chart cell** (`Ju 06:53`) | ⚠️ Partial | chart cells show planet abbreviation only; the degree is in the expanded house panel and the details table, not inline in the cell | Medium |
| G3 | Planet **nakshatra abbreviation inside the chart cell** | ⚠️ Partial | nakshatra appears in the expanded house panel and the details table, **not** inline in the SVG cell | Medium |
| G4 | Per-house tag (`"2nd h."`) with a 2-digit value, likely SAV bindus | ❌ No | no inline SAV-per-house figure in the chart; `emit`/`chartFacts` carry SAV elsewhere but the chart renderer does not surface it | Medium *(pending visual confirmation)* |
| G5 | A **dasha period date ladder** (refs 3, 5) | ❌ No | `src/features/charts` has no dasha-timeline renderer; the reference widget has no counterpart in the chart engine | High *(scope unclear — may belong to a dasha module, not c4)* |
| G6 | Strength values as bare ratios around 1.0 | ✅ Yes | implemented — `PlanetStrengthChart` shows `shadabalaRatio` with a 1.0 threshold; it *additionally* shows Rupas | Low |
| G7 | Subject header line (name · DOB · TOB · place) | ❌ Out of charts scope | belongs to the birth-data intake surface, not the chart engine; **and is exactly the PII the standing order forbids publishing** | — |
| G8 | D1/D9/D10 type selector | ✅ Yes | `ChartSurface` provides D1/D9/D10 buttons (*not visible in the crops, but required for the landed contract*) | — |

---

## 5. Phase 0 findings & recommendations

1. **The two chart layouts and the strength panel in the reference are already
   covered** by landed c4 code (G1, G6, G8). No new chart-renderer work is required
   for those.
2. **Inline density is the real delta.** The reference packs *degree* and
   *nakshatra* into each chart compartment (G2, G3). The landed renderers show
   abbreviation only, with the detail behind a click. Before implementing, confirm
   visually that ref 1's `Pun/Ash/Dha/PBh/VBh` tokens are indeed nakshatras — OCR
   is suggestive, not conclusive.
3. **Confirm the per-house 2-digit value (G4)** — if it is SAV bindus, a small
   read-only inline figure would close a visible parity gap. Do **not** infer the
   label from OCR alone.
4. **The dasha date ladder (G5) is the largest unknown** and probably out of c4
   scope. Determine whether c4 owns a dasha-timeline widget or whether the
   reference panel belongs to the timing/dasha module; do not build it speculatively.
5. **The header line (G7) must not be reproduced** in any chart-engine output that
   could be published — it is the very PII the confidentiality order protects.
6. **Recommended Phase 0 exit artefacts:** this document plus a 3-question
   clarification (nakshatra inline? SAV inline? dasha panel ownership?) before any
   Phase-2/3 renderer change.

---

## 6. Phase status snapshot

| Phase | Description (as evidenced) | State |
|---|---|---|
| 0 | Inspection of reference screenshots | ✅ this report |
| 1 | Chart view-model projection (`chartViewModel.ts`, `labels.ts`) | ✅ landed |
| 2 | North Indian SVG renderer | ✅ landed |
| 3 | South Indian renderer + layout/type switch | ✅ landed |
| 4 | Accessible/printable planet detail table | ✅ landed |
| 5 | *(no header evidence in code)* | ❓ unknown |
| 6 | Planetary strength (Shadbala) panel | ✅ landed |
| 7 | *(no header evidence in code)* | ❓ unknown |
| 8 | Bilingual labels + formatting | ✅ landed |
| 9 | Unit tests (synthetic fixtures) | ✅ landed, green |
| 10+ | Page/router integration, E2E, visual regression | ⛔ deferred |

Phase 5 and Phase 7 are unaccounted for because the spec is gone; they must be
recovered from `c4.txt` if it is restored, or treated as never-defined.
