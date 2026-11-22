# VED TRIAGE — OBSERVATION REVIEW & SAFE ADOPTION AUDIT

**Repository:** `E:\Rajkumar\Vedic_Rajkumar`
**Input reference:** `CODE-JUNCTION/Ved triage.txt` (the robotic review)
**Status:** Conditional adoption executed locally. **RELEASE HOLD MAINTAINED.**
**Authorization used:** local audit · safe local implementation · tests · documentation.
**Authorization withheld:** push · merge · deployment · release-gate relaxation · unsupported astrology claims.

---

## 1. Phase 0 — Repository verification

| Item | Value |
|---|---|
| Branch | `feature/lovable-hub-landing` |
| HEAD (local) | `4556fad75a3ae94a31ff52ded2efaa2c3d453446` |
| `origin/feature/lovable-hub-landing` | in sync with HEAD (`0 0` left/right divergence) |
| Working tree | **dirty** — 10 modified, 8 untracked (the adoption patch; not committed) |
| `CODE-JUNCTION` instructions | read; empty-dir `.gitkeep` standing order preserved |

The review's `Ved triage.txt` remains in place under `CODE-JUNCTION/`. No `CODE-JUNCTION` file was altered. The standing 12-minute `CREAT.MD` log cadence and the `docs:verify` claim-pinning gate were both respected (see §7).

### 1.1 Modules inspected (all still applicable to `4556fad`)

- `src/services/prashnaService.ts`
- `src/services/questionAnalysisService.ts`
- `src/pages/QuestionPage.tsx`
- `src/services/prasnaMargaExtras.ts`
- `src/lib/intake/triage.ts` (created by this patch)
- AnswerCard provenance/publication guards (`src/services/answerCard/AnswerCard.types.ts`, `publishGuard`, `redact`)
- Intake/validation modules and the conclusion that no prior equivalent router existed

No functionality was duplicated: the router, the placement parser and `classifyQuestionDetailed` did not previously exist anywhere under `src/`.

---

## 2. F1–F9 disposition

Legend: **CONFIRMED** (defect reproduced in `4556fad`) · **CONFIRMED-OPEN** (reproduced, deliberately unresolved this pass) · **ALREADY FIXED** (was already correct) · **PARTIAL** · **NOT REPRODUCIBLE**.

| # | Finding | Disposition | Evidence in `4556fad` | Action taken |
|---|---|---|---|---|
| **F1** | `PrashnaQuery` = `{question, category, queryDate, queryTime, latitude, longitude, placeName?}` — no placements, no horary | **CONFIRMED** | `prashnaService.ts` interface unchanged | New intake router accepts placements + a validated horary number; `PrashnaQuery` left intact (no silent widening of the engine contract) |
| **F2** | Verdict computed from the freshly cast ascendant; user placements invisible | **CONFIRMED** | `calculatePrashnaHoroscope` scores the cast chart only | Router sends typed-placement input to `placements_only`, which has **no engine**; `QuestionPage` never reaches the engine on that lane |
| **F3** | Classifier returns one best house; `score 0` → house 1 indistinguishable from a real 1st-house match | **CONFIRMED** | `classifyQuestion` returned `number` only | Added `classifyQuestionDetailed(): {house, score}`; `classifyQuestion` now delegates. Router maps `score === 0` → `topicHouse: null` (topic-less), distinct from a genuine house-1 topic |
| **F4** | Anonymous mode silently defaults to Delhi `28.6139 / 77.2090` | **CONFIRMED** | literal present in `QuestionPage.tsx` | Removed the literal; added `placeExplicit` gate + `place-default-warning` chip; an unresolved location now **blocks** rather than casting |
| **F5** | README advertises horary number 1–249; never collected, never threaded | **CONFIRMED-OPEN** | README vs `QuestionPage`/`calculatePrashnaHoroscope` | Router **validates** 1–249 (`invalid_horary_number`, never clamps) but does not yet thread it into the engine or collect it in the UI. Contract drift remains — decision outstanding (§8) |
| **F6** | README advertises a "confidence score"; `PrashnaResult` has none | **CONFIRMED-OPEN** | `PrashnaResult` has no `confidence` field | The router's `ceiling` is a **routing ceiling**, explicitly documented as *not* a prediction probability. The README/engine drift remains — decision outstanding (§8) |
| **F7** | Gulika claimed in the query; only **Gulika hora** is modelled, never Gulika as occupant | **CONFIRMED** | `getGulikaKala` (hora) only | Parser treats Gulika as `CONTEXT_ONLY`: recorded in `unknownTokens`, **never** a house occupant, never scored. Matches the review's "register Gulika as context_only" |
| **F8** | `prashnaService.ts` is `// @ts-nocheck` under a strict-TS repo | **CONFIRMED-OPEN** | header line 1 | **Not removed.** Removal requires full type-safety without weakening checks — the review's own precondition. Note: `prashnaService.ts` has **no live importers** in `src/`; the live Prashna path is `questionAnalysisService` + `features/prashna/kernel/*` |
| **F9** | Ithasala/Esharapha decided by the kendra/kona sign set `[0,3,4,6,8,9]`, not classical Tajika drishti | **CONFIRMED** | `legacyTajikaRelation` extracted + pinned | Algorithm **left unchanged** (review: "Do not replace Tajika rules with an unverified hardcoded set"). A verified degree-based kernel already exists in `src/features/prashna/kernel/tajika.ts`; a regression test pins the divergence |

**Confirmed defects this pass:** F1, F2, F3, F4, F7 (mitigated in code). **Confirmed-open:** F5, F6, F8, F9 (documented, not silently "fixed").

---

## 3. Rejected patch assumptions

The review's proposed code was **not pasted**. These specific details were rejected with reasons:

1. **`hasBirthData / hasMoment / hasPlace` booleans → rejected.** A boolean cannot distinguish "no date" from "date, no city". Replaced by explicit completeness states (`NatalCompleteness`, `PrashnaCompleteness`).
2. **Cross-segment house inheritance → rejected.** The review's two-pass parser carried house context across sentence boundaries, so `"Sun in 1st, Moon"` yielded `Moon:1` (their TC-06/TC-09 relied on this). That is an ambiguous inherited assignment: house context is reset at each segment and such a planet is reported in `unresolved` instead.
3. **`blockAnswer === (lane === 'insufficient')` (their global invariant #3) → rejected.** A natal or Prashna request with an *unresolved location* cannot be cast, so it blocks **and asks** without falling back to another lane's engine.
4. **`gulika:1` as a placement mention (their TC-01 expected 5 mentions incl. Gulika) → rejected.** Contradicts F7. Gulika is context-only, never a mention (`TC-13` pins this).
5. **`Ask.place` copy "The default is Delhi." → rejected.** It directly contradicts the no-silent-default requirement. Ours reads "Which city are you asking from?".
6. **Additive `intake_lane` + `placements_source` to the AnswerCard provenance as a "1.4 bump" → deferred, not applied.** `ANSWER_CONTRACT_VERSION` was already `1.4`; a further additive field must have defined migration/validation/publication behaviour and consumers audited (Phase 4). Not bumped. The lane is instead persisted on the local reading history only (`PrasnaReading.intakeLane`), which is versioned and survives legacy entries.
7. **`confidenceCeiling` naming → replaced** by `ceiling`, documented as a routing ceiling, so no arbitrary "prediction probability" is implied.

---

## 4. Files changed (all uncommitted — RELEASE HOLD)

### 4.1 New

| File | Purpose |
|---|---|
| [triage.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/lib/intake/triage.ts) | Pure, deterministic intake router + placement parser + validators. No `src/services/**` imports (survives the `noEngineImports` gate) |
| [triage.test.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/tests/intake/triage.test.ts) | 31 deterministic tests — TC-01…TC-18 + global invariants + validator units |
| [legacyTajika.regression.test.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/tests/prashna/legacyTajika.regression.test.ts) | 5 tests pinning F9 legacy behaviour and its divergence from the verified kernel |
| [intake-lane.spec.ts](file:///e:/Rajkumar/Vedic_Rajkumar/tests/e2e/intake-lane.spec.ts) | 2 Playwright tests proving the lane **controls engine invocation**, not just a badge |

### 4.2 Modified

| File | Change |
|---|---|
| [QuestionPage.tsx](file:///e:/Rajkumar/Vedic_Rajkumar/src/pages/QuestionPage.tsx) | Triage before any engine call; `blockAnswer`/`placements_only` early-return; silent Delhi literal removed; `placeExplicit` gate; lane UI testids; `intakeLane` persisted |
| [questionAnalysisService.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/services/questionAnalysisService.ts) | Added `classifyQuestionDetailed`; `classifyQuestion` delegates |
| [prashnaService.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/services/prashnaService.ts) | Extracted & exported `legacyTajikaRelation` with F9 doc comment (algorithm unchanged; `@ts-nocheck` retained — F8) |
| [prasnaMargaExtras.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/services/prasnaMargaExtras.ts) | Additive `intakeLane` on `PrasnaReading` (legacy `_v1` entries survive as `undefined`) |
| [package.json](file:///e:/Rajkumar/Vedic_Rajkumar/package.json) | `test:core` now includes `src/tests/intake/triage.test.ts` |
| [README.md](file:///e:/Rajkumar/Vedic_Rajkumar/README.md) · [CLAIMS.md](file:///e:/Rajkumar/Vedic_Rajkumar/docs/CLAIMS.md) · [ENTERPRISE_LAUNCH_GUIDE.md](file:///e:/Rajkumar/Vedic_Rajkumar/docs/ENTERPRISE_LAUNCH_GUIDE.md) · [pre-launch-user-testing-playbook.md](file:///e:/Rajkumar/Vedic_Rajkumar/docs/launch/pre-launch-user-testing-playbook.md) · [app-robustness-testing.md](file:///e:/Rajkumar/Vedic_Rajkumar/app-robustness-testing.md) | Test-count pins aligned to the measured suite: `2651 / 165` → `2697 / 169` |

Evidence captured under `reports/evidence/triage-*.txt`.

---

## 5. New contracts

- **`src/lib/intake/triage.ts`** — pure module. Key exports: `IntakeLane`, `INTAKE_ENGINES`, `NatalCompleteness`, `PrashnaCompleteness`, `IntakeRequest`, `ParseResult`, `TriageResult`, `parsePlacements`, `validateNatal`, `validatePrashna`, `validateIntake`, `selectRoute`, `triage`, `LANE_BADGE`.
  - **Invariant:** `INTAKE_ENGINES.placements_only === false` and `INTAKE_ENGINES.insufficient === false`. A lane is a *routing* decision, never a claim that an engine exists.
  - **Invariant:** validation (`validateIntake`) and route selection (`selectRoute`) are separate; either can be read without the other.
  - **Invariant:** `asks.length <= 2`; every `ceiling ∈ [0,1]`; the parser never invents longitudes/signs/nakshatras/birth times.
- **`classifyQuestionDetailed(question): {house, score}`** — additive; `classifyQuestion` unchanged in shape (`{house, label, karaka}` preserved).
- **`legacyTajikaRelation(houseA, houseB)`** — exported for regression pinning only.
- **`PrasnaReading.intakeLane: string`** — additive; history is versioned `_v1`.
- **`ANSWER_CONTRACT_VERSION` unchanged at `1.4`** (pinned by TC-17).

---

## 6. Phase 5 — Prashna correctness (independent verification)

| Point | Verified finding |
|---|---|
| Topic classification / zero-score fallback | Verified: `score 0` was indistinguishable from a real house-1 match. Now separable via `classifyQuestionDetailed` |
| Horary number 1–249 | Verified: not collected by the page, not accepted by `calculatePrashnaHoroscope`. Router validates 1–249 and **never clamps** (`250 → null + issue`); threading remains F5-open |
| Confidence claims in docs | Verified: `PrashnaResult` has **no** `confidence` field — README drift is real (F6) |
| Gulika modelling | Verified: only Gulika **hora** exists (`getGulikaKala`); never a chart occupant (F7). Parser honours context-only |
| Tajika aspect rules | Verified: legacy rule uses kendra/kona house diffs `[0,3,4,6,8,9]`, not classical Tajika `[2,4,6,8,10]` (F9) |
| Ithasala / Esharapha implementation | Pinned by `legacyTajika.regression.test.ts`; **no arithmetic change made** (regression test written first, algorithm left intact) |
| `@ts-nocheck` | Verified present on `prashnaService.ts`. **Retained** — removal deferred until type-safety can be achieved without weakening checks (F8) |

---

## 7. Phase 6/7 — Tests and regression gates

**Tested HEAD:** `4556fad75a3ae94a31ff52ded2efaa2c3d453446` (`feature/lovable-hub-landing`) + working-tree changes.

| Gate | Command | Exit | Result | Evidence |
|---|---|---|---|---|
| Typecheck | `npx tsc --noEmit` | **0** | clean | `reports/evidence/triage-typecheck.txt` |
| Lint | `npm run lint` | **0** | `1248 problems (0 errors, 1248 warnings)` | `reports/evidence/triage-lint.txt` |
| Focused intake | `vitest run src/tests/intake src/tests/prashna/legacyTajika.regression.test.ts` | **0** | 36 passed (31 + 5) | — |
| Full unit suite | `npm run test:run` | **0** | **2697 passed · 4 skipped (2701)**, 168 files passed + 1 skipped | `reports/evidence/triage-full-suite.txt` |
| `test:core` (incl. intake) | `npm run test:core` | **0** | 80 passed | — |
| Prashna + AnswerCard | focused vitest | **0** | 453 passed | — |
| Accuracy suite | `npm run validate:accuracy` | **0** | **155/155 PASS** | `reports/evidence/triage-accuracy.txt` |
| Production build | `npm run build` | **0** | PASS, 270 precache entries | `reports/evidence/triage-build.txt` |
| Docs claim pin | `npm run docs:verify` | **0** | **✔ every tracked claim matches the code** | `reports/evidence/triage-docsverify.txt` |
| Lane E2E (Playwright) | `npx playwright test tests/e2e/intake-lane.spec.ts` | **0** | **2 passed (27.4s)** | `reports/evidence/triage-e2e-lane.txt` |

### 7.1 Failing traces preserved / explained

- **First `docs:verify` run** (executed concurrently with Playwright) exited **1** with **157 `ENOENT`** errors on `%TEMP%\...` paths and reported only 188 tests — a **temp-dir/environment contention artifact**, not a code failure. Re-run **in isolation** → exit **0**, `2697 passed`, claim-pin clean.
- **First lane E2E run** reported **2 flaky** (first-attempt `page.goto` 90 s timeout, dev-server cold start while `docs:verify` ran). Re-run **in isolation** → **2 passed**.

**Lesson recorded:** run heavy Vitest gates and Playwright dev-server gates **sequentially, never concurrently** — concurrent runs exhaust the temp dir and produce false ENOENT/timeout failures.

### 7.2 UI integration proof (not badge-only)

`intake-lane.spec.ts` asserts the **verdict tabs count is 0** on the `placements_only` lane and on the blocked-location lane — i.e. the engine genuinely did **not** run. It does not merely assert badge text.

---

## 8. Remaining blockers & outstanding decisions

| # | Blocker | Owner decision required |
|---|---|---|
| B1 (F5) | Horary number 1–249 is validated by the router but not collected in the UI nor threaded into the engine, while README still advertises it | Implement collection + threading **or** amend the README claim |
| B2 (F6) | README advertises a Prashna "confidence score"; the engine returns none | Add `confidence` to `PrashnaResult` **or** delete the README claim |
| B3 (F8) | `prashnaService.ts` remains `// @ts-nocheck` | Remove once type-safety is achievable without weakening checks |
| B4 (F9) | Legacy Tajika drishti set retained; verified degree-based kernel exists separately | Convert the legacy path to the verified kernel under new math tests |
| B5 | AnswerCard provenance augmentation (`intake_lane`, `placements_source`) deferred | Audit schema + consumers before any contract change |
| B6 | `dist===7` Arudha exception variant; AGPL `swisseph-wasm`; intermittent E2E horoscope submit | Pre-existing owner decisions (carried over, unchanged) |

---

## 9. Follow-up recommendations

1. Resolve **B1/B2** by *deleting* the unbacked README claims first (cheapest honesty win), then implement behind tests if the feature is wanted.
2. Lift **F8** by typing `prashnaService.ts` incrementally; its `legacyTajikaRelation` is now standalone and already partially typed.
3. Converge **F9** onto `features/prashna/kernel/tajika.ts` (`aspectGap`, deeptamsha orb) with new math regression tests, then retire `legacyTajikaRelation` — do **not** hand-roll a "corrected" hardcoded set.
4. Add the intake lane + input source to AnswerCard provenance only after the **B5** consumer audit, as an additive minor bump with defined validation/publication behaviour.
5. Keep the intake module pure; enforce with the existing `noEngineImports` test.

---

## 10. README claims — evidence status

README was updated **only** for the measured test count (`2697 tests`, matching `docs:verify`). **No new capability claim was added.** The F5 (horary 1–249) and F6 (confidence score) claims remain **unbacked** and are flagged here for correction rather than silently endorsed.

---

**RELEASE HOLD MAINTAINED.** No commit, push, merge, deploy or release-gate relaxation was performed. The adoption patch is local and uncommitted on `feature/lovable-hub-landing` at `4556fad`(+dirty).
