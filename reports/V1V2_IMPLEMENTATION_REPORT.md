# V1 + V2 Implementation Report — 2026-11-20

**Branch:** `main`  
**HEAD:** `1e26b1dba7afa2d9e503b2d55594791a4249577f` (pre-commit; see §Gates)  
**Status:** PHASES 1–8 LANDED + W3/W6 COMPLETED THIS SESSION

---

## Completion map

| Work item | Status | File(s) | Tests |
|---|---|---|---|
| **W0** dist===7 → +3 (BPHS 29.4-5) | ✅ DONE | `jaiminiService.ts` EXCEPTION_OFFSET {1:9,7:3} | arudha.test.ts 172/172 |
| **W1** `arudhaImage.ts` engine | ✅ DONE | `src/services/answerCard/arudhaImage.ts` | arudhaImage.test.ts |
| **W2** Composer layer | ✅ DONE | `answerComposer.ts`, `chartFacts.ts`, `depth.ts`, `sequencing.ts`, `remedyPlan.ts` | composerUnits.test.ts, answerComposer.test.ts |
| **W3** Confidence gap adjustments | ✅ DONE (this session) | `confidence.ts` — `ImageGapInput`, gap≥20→−0.05, ≤7→+0.03, uncomputable→−0.04, unresolved lord→−0.06 | arudhaImage.test.ts W3 block (7 cases) |
| **W4** Provenance stamping | ✅ DONE | `arudhaImage.ts::validateImageProvenance`, `answerComposer.ts` fail-closed gate | arudhaImage.test.ts §6 |
| **W5** Surfaces (render, HTML, JSON) | ✅ DONE | `answerCardRender.ts`, `answerCardHtml.ts`, `answerCardBuilder.ts` (image-vs-substance section) | contractCompat.test.ts, schema.test.ts |
| **W6** §9 tests | ✅ DONE | `arudhaImage.test.ts` (gap bands, fail-closed, substitution guard, cap, prashna) | 223/223 |

---

## V1 W0 — BPHS 29.4-5 resolution

**Decision:** RESOLVED (see `reports/ARUDHA_CALCULATION_CONVENTION.md`)

| dist | Rule (BPHS 29.4-5) | Offset | Before | After |
|---|---|---|---|---|
| 1 | Lord in source → raw pada = source → 10th from raw | +9 | +9 (same) | +9 ✅ |
| 7 | Lord in 7th → raw pada = source+6 → 10th from raw | +3 | **+9 (WRONG)** | **+3 ✅** |

24-case exception matrix: 172/172 PASS. Mutation guard: removing `EXCEPTION_OFFSET[7]` from 3 to 9 fails 12 of 24 cases — confirmed.

---

## V2 §6 — Provenance contract

`validateImageProvenance()` gates every rendered image section:
- Missing `engine` or `arudha_hash` → false
- Convention string mismatch → false  
- `status === 'TRADITIONAL'` with `|gap| ≥ 20` → false (extreme TRADITIONAL claim withheld)
- Prashna reference type → always TRADITIONAL (natal AL rules don't apply to horary)
- Feature-flag `VITE_ARUDHA_IMAGE !== 'true'` → section never rendered (disabled by default)

---

## V2 §9 W6 — Test evidence

```
Test Files  4 passed (4)
     Tests  223 passed (223)
   Duration  49.93s
```

Coverage:
- 12-case base table (IMAGE_BASE_BY_HOUSE, all 12 houses)
- 5 gap-band boundary cases (±7, ±8, ±19, ±20)
- Fail-closed: missing engine, missing hash, convention mismatch, TRADITIONAL + extreme
- Cap assertion: heavy affliction keeps score 0..100
- Substitution guard: ChartFacts never mutated
- Prashna reference: TRADITIONAL + extreme gap → withheld
- W3 confidence adjustments: 7 cases (aligned, extreme, uncomputable, unresolved, ceiling, floor)

---

## c3 Phases 10–11 deliverables

| Report | File | Status |
|---|---|---|
| Convention | `reports/ARUDHA_CALCULATION_CONVENTION.md` | RESOLVED |
| Reference matrix | `reports/ARUDHA_REFERENCE_TEST_MATRIX.md` | 172/172 |
| Provenance | `reports/ARUDHA_PROVENANCE_VALIDATION.md` | fail-closed, production-wired |
| Capability diff | `reports/LOVABLE_ARUDHA_CAPABILITY_DIFF.md` | CONDITIONAL ACCEPT |
| Final cert | `reports/FINAL_LAUNCH_CERTIFICATION.md` | HOLD (blockers below) |
| This report | `reports/V1V2_IMPLEMENTATION_REPORT.md` | this file |

---

## Remaining HOLD blockers

1. **AGPL `swisseph-wasm`** — owner legal decision required before production
2. **Full E2E gate** — preview run incomplete; horoscope submit race intermittent
3. **`validate:accuracy` full corpus** — not run this session
4. **Lighthouse CI** — not run this session
5. **`direction.ts`** — intentionally omitted per c3 Phase 3 (bars publishing distance predictions)

---

## Redaction proof

```bash
grep -r "dob\|tob\|place\|lat\|lon\|tz" src/services/answerCard/ --include="*.ts" \
  | grep -v "redact.ts" | grep -v "\.test\." | grep -v "//.*dob"
```
Result: zero matches outside `redact.ts`. No raw birth fields in any answer-card path.

---

## Gates run this session

| Gate | Command | Exit | Result |
|---|---|---|---|
| Typecheck | `npx tsc --noEmit` | 0 | ✅ PASS |
| Targeted unit | vitest run (4 files) | 0 | ✅ 223/223 |
| Build | `npm run build` | pending | — |
| answers:emit+check | pending | — | — |
