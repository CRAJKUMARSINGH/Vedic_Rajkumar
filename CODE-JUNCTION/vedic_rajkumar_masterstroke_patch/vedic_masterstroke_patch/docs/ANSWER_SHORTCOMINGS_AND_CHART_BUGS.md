# Study of Shortcomings in Generated Answers + Chart Drafting Bugs

## A. Shortcomings in Answers So Generated (Interpretation / AnswerCard layer)

After reviewing `interpretationEngine.ts`, `classicalAnswerEngine.ts`, `answerCard/*` and the 13-layer claims:

| #   | Shortcoming                                                                                      | Severity | Evidence / Root Cause                                                                                            | Masterstroke Fix Direction                                                                              |
| --- | ------------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | **Over-confident verdicts** without enough input quality signal                                  | High     | Confidence is calculated but often not capped hard when birth time is approximate or ayanamsa engine is degraded | Harden `deriveConfidenceV2` + always surface `inputQualityCaps` on the Answer Card                      |
| 2   | **Hedging language** still leaks ("may indicate", "could suggest") despite "Zero Hedging Policy" | Medium   | Prompt / template in `answerComposer` and layer-9 "Therefore" clause still soft                                  | Enforce a post-processor that rewrites soft verbs to decisive forms + append confidence basis           |
| 3   | **Remedy stack too generic**                                                                     | Medium   | Six-layer remedy often repeats the same planet across queries                                                    | Make remedy selection query-context aware (career vs marriage vs health) and rank by current dasha lord |
| 4   | **Missing citation of classical source**                                                         | Medium   | Claims "Prashna Marga" / "Jaimini" without verse or page                                                         | Add optional `sourceCitation` field that is rendered when available                                     |
| 5   | **Bilingual inconsistency**                                                                      | Medium   | Hindi gloss sometimes missing or machine-like                                                                    | Centralise `hiGloss` and force every verdict to have both EN + HI                                       |
| 6   | **No "I don't know" path** for impossible questions                                              | High     | Engine always produces a verdict                                                                                 | Add early exit when natal promise is clearly absent + confidence < 35                                   |

Web comparison (common industry problems also present here):

- Most free Vedic sites over-promise on timing.
- Transparent intermediate data is a real differentiator of this repo — keep amplifying it.

## B. Bugs / Shortcomings in Drafting Drawings (Chart Renderers)

There are **two** North Indian chart implementations:

1. **Legacy** – `src/components/NorthIndianChart.tsx` (messy dual HOUSE_PATHS + HOUSES arrays, overlapping polygons, hard-coded 440×400).
2. **Canonical (preferred)** – `src/features/charts/components/NorthIndianChart.tsx` (clean 0–100 coordinate system, proper HOUSE_POLYGONS, testids, accessible).

### Concrete geometry / drafting issues found

| Bug                                                               | Location                   | Impact                                                 | Fix                                                                                      |
| ----------------------------------------------------------------- | -------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Duplicate / conflicting polygon definitions                       | legacy NorthIndianChart    | Houses can render with wrong shapes or missing corners | Delete legacy or make it a thin re-export of features version                            |
| House 3 / 9 / 12 polygons in legacy are degenerate or overlapping | legacy lines ~130-200      | Visual artefacts, wrong click targets                  | Use the features version exclusively                                                     |
| Planet stacking overflow not always shown                         | both                       | When 4+ planets in one house, labels collide           | Canonical already has `house-*-overflow`; ensure legacy path is never used in production |
| Sign numbers sometimes not rotated from Lagna                     | older code paths           | Confuses traditional readers                           | Canonical correctly places sign relative to house 1 = Lagna                              |
| No explicit retrograde glyph in some views                        | VisualTransitChart / older | Advanced users miss Rx status                          | Add ℞ or (R) consistently                                                                |
| SVG viewBox not always square / responsive                        | size prop handling         | Mobile charts look stretched                           | Force `preserveAspectRatio="xMidYMid meet"` + square container                           |

### Other drafting / UI bugs

- Personal jatak data still shipped in client bundle (`JATAKS_DATABASE.json`) – privacy risk already flagged in BUGS_FOUND.md.
- ChartErrorState / ChartEmptyState exist but some calculation paths still throw uncaught instead of falling into them.
- PDF export can lose planet colours or labels on dark theme.

## C. Recommended Masterstroke Priorities (ordered)

1. **Unify on features/charts renderer** – one source of truth for North + South.
2. **Harden confidence gating** so basic users never see over-confident answers.
3. **Persona robotic suite** (basic / interm / advanced) wired into CI.
4. **Remove or redact personal data** from public client assets.
5. **Add overflow + Rx markers** consistently.
6. **Answer post-processor** that kills hedging language.
