# c3 — Answer Composer + Arudha Integration Report
Date: 2026-11-19 · HEAD: see git log · Status: PARTIAL (Phases 1–8 implemented; 9–11 pending)

## Implemented
| Module | File | Notes |
|---|---|---|
| Chart-fact projection | src/services/answerCard/chartFacts.ts | Validated read-only ChartData→ChartFacts; sign 0-11, house 1-12, SAV enum, dedup, canonical getPlanetDignity reuse; houseLord/placementsIn/placementOf helpers |
| Depth classifier | depth.ts | brief/standard/deep EN+roman-Hindi; fixed 'ya ' matching inside 'kya ' |
| Sequencing | sequencing.ts | Optional planning guidance only — copy never overrides medical/financial/safety obligations; stable tiebreak |
| Remedy plan | remedyPlan.ts | c3 corrections: MANTRA[planet] (TDZ fix), dedup, 'unknown' dignity excluded (unverified≠weak), remedy omitted when unverified, lunar-day claim softened, optional-practice disclaimer |
| Direction | — | OMITTED per c3 Phase 3: v1's km ranges/city pools unsupported |
| Composer | answerComposer.ts | verdict→why→sequence→remedy→links→question; depth-bounded; route-verified app_links |
| Contract 1.3 | AnswerCard.types.ts | composed?: ComposedAnswer (optional, additive); legacy cards valid |
| Builder/Render | answerCardBuilder.ts, answerCardRender.ts | composeAnswer wired; degraded-card composed block; markdown emits composed sections |

## Arudha exception — independent reconciliation (Phase 9 pre-step)
BPHS 29.4-5 literal: pada in source → 10th from pada; pada in 7th → 10th from pada.
- Lord dist 1 (same sign): raw pada = source → +9 = 10th from source. `{1:9}` ✓
- Lord dist 7: raw pada = source+6 → 10th from raw = source+15 ≡ source+3 = 4th. `{7:3}` ✓
Independent derivation agrees with implementation. Caveat: this rests on the
"10th from the pada" reading of BPHS 29.4-5; competing readings exist (see
ARUDHA_CALCULATION_CONVENTION.md). Marked RESOLVED-by-derivation, owner
sign-off still recommended — NOT certified by tests alone.

## Tests
- chartFacts 8/8 · composerUnits 6/6 · answerComposer 10/10 · contractCompat 3/3
- Full answerCard suite: 333/333 · tsc exit 0 · answers:emit 21 cards ·
  answers:check 21/21 verified · lint-staged clean

## Public artifacts
757 files regenerated (21 people × 36 + index). card_hash changed on all —
expected: stableHash covers the new composed field. No birth data added;
composed cites only placements already implied by verdicts. Committed in
batches (pre-commit prettier cmdline limit on Windows).

## Remaining (c3 not complete)
- Phase 9: arudhaImage.ts 13-layer module + provenance stamps + tests — NOT implemented
- Phase 10: full unit suite, E2E, accuracy, Lighthouse, docs:verify — partial only
- Phase 11: this report is interim; final certification pending
- c4 (premium chart engine): not started

CODE-JUNCTION retained: v1.txt v2.txt c3.txt c4.txt (+ .gitkeep files)
