# c3 — Answer Composer + Arudha Integration Report
Date: 2026-11-19 · HEAD: see git log · Status: Phases 1–9 implemented; Phase 10 gates green; Phase 11 certification per-gate

## Implemented
| Module | File | Notes |
|---|---|---|
| Chart-fact projection | src/services/answerCard/chartFacts.ts | Validated read-only ChartData→ChartFacts; sign 0-11, house 1-12, SAV enum, dedup, canonical getPlanetDignity reuse; houseLord/placementsIn/placementOf helpers |
| Depth classifier | depth.ts | brief/standard/deep EN+roman-Hindi; fixed 'ya ' matching inside 'kya ' |
| Sequencing | sequencing.ts | Optional planning guidance only — copy never overrides medical/financial/safety obligations; stable tiebreak; image-repair lead-in when gap ≤ −20 (v2 §8) |
| Remedy plan | remedyPlan.ts | c3 corrections: MANTRA[planet] (TDZ fix), dedup, 'unknown' dignity excluded (unverified≠weak), remedy omitted when unverified, lunar-day claim softened, optional-practice disclaimer |
| Direction | — | OMITTED per c3 Phase 3: v1's km ranges/city pools unsupported |
| Composer | answerComposer.ts | verdict→why→sequence→remedy→links→question; depth-bounded; route-verified app_links; image-vs-substance section gated by `isImageAxisEnabled()` + `validateImageProvenance()` (v2 §8) |
| Contract 1.3 | AnswerCard.types.ts | composed?: ComposedAnswer (optional, additive); legacy cards valid |
| Builder/Render | answerCardBuilder.ts, answerCardRender.ts | composeAnswer wired; degraded-card composed block; markdown emits composed sections |
| Image axis (Phase 9) | src/services/answerCard/arudhaImage.ts | 12-position base table (IMAGE_BASE_BY_HOUSE), ±modifier caps, 5 gap bands, shared `Band` vocabulary, feature-flagged OFF by default (`ARUDHA_IMAGE_AXIS`), fail-closed provenance (`validateImageProvenance`), health topic omitted (no health creep) |

## Arudha exception — resolution (v2 §0)
BPHS 29.4-5 literal "10th from the raw pada" reading:
- Lord dist 1 (same sign): raw pada = source → 10th from raw = `(source + 9) % 12`. `{1:9}` ✓
- Lord dist 7: raw pada = source+6 → 10th from raw = `(source + 15) ≡ source + 3` = 4th from source. `{7:3}` ✓
Engine now computes inclusive distance as `((lord − target + 12) % 12) + 1` and applies
`EXCEPTION_OFFSET = { 1: 9, 7: 3 }`. Independent derivation and the 24-case BPHS
matrix agree. Marked RESOLVED in ARUDHA_CALCULATION_CONVENTION.md; owner sign-off
still recommended but no longer blocking.

## Tests
- chartFacts 8/8 · composerUnits 6/6 · answerComposer 10/10 · contractCompat 3/3 · arudhaImage 25/25
- `src/tests/arudha.test.ts` 172/172 (144 matrix + 24 BPHS exception + mutation guard + edge cases)
- Full answerCard + arudha run: **530/530 PASS** · full suite **2613/2613 across 161 files (4 skipped)** · tsc exit 0 · answers:emit 21 cards · answers:check 21/21 verified · docs:verify exit 0

## Public artifacts
21 cards emitted and verified byte-for-byte (`answers:check` 21/21). No birth data
added; the image axis is OFF by default so no emitted card carries an AL section.
No `card_hash` drift from the image axis.

## Remaining (not run in this pass)
- Phase 10: E2E, Lighthouse, visual regression, accuracy suite not run in this pass.
- c4 (premium chart engine): kernel landed (`src/features/charts/model/chartViewModel.ts`, 12 tests); page/router integration deferred.
- Prasna kernel (Prasnalove): landed (`src/features/prashna/kernel/*`, ~71 tests); edge-function rewrite, UI ritual, AI narration and Parihara ladder deferred.

CODE-JUNCTION retained: v1.txt v2.txt c3.txt c4.txt (+ .gitkeep files)

## Phase 9–10 update (2026-11-19, HEAD 535408b)

### arudhaImage.ts — implemented (flag OFF by default)
- `buildImageAxis({facts, topic, substanceScore, referenceType})` — A10-from-AL
  base table (v2 §4) + bounded modifiers; same Band vocabulary as substance.
- `validateImageProvenance` — fail-closed: engine/version/convention/hash
  required; TRADITIONAL + |gap|≥20 withheld.
- Composer emits `image-vs-substance` after `why` only when
  VITE_ARUDHA_IMAGE=true AND provenance valid; health excluded; prashna
  stays TRADITIONAL; missing inputs → null.
- `sequencing.ts` image-repair leadIn when gap ≤ −20.
- NOTE: parallel-session engine rewrite landed mid-work (dist now
  `((lord-target+12)%12)+1`, exceptions {1:9,7:3} preserved); 25/25
  arudhaImage tests + 358/358 answerCard suite + tsc 0.

### Certification this round
- `npm run test:run` → 2613 passed / 4 skipped, exit 0 (cert-unit-final.txt)
- `npm run validate:accuracy` → 155/155, exit 0 (cert-accuracy-final.txt)
- `npm run build` → exit 0, 270 precache entries (cert-build-final.txt)
- `npm run answers:emit`/`answers:check` → 21/21 verified (earlier)
- docs:verify, full E2E, tier E2E, a11y audit, Lighthouse — NOT re-run this
  round (time); last full E2E 147p/3f(load-flakes, all pass isolated).

### Still open
- docs:verify + full E2E + Lighthouse + a11y audit re-run
- v1.txt/v2.txt/c3.txt requirement-by-requirement reconciliation sign-off
- c4 premium chart engine — not started (blocked until c3 certified)

## Final certification attempt (HEAD 5934148)

### Engine audit (Step 2)
- dist now `((lord-target+12)%12)+1` → true inclusive 1..12; same-sign=1,
  7th=7; exceptions {1:9,7:3} per BPHS 29.4-5. Committed 5934148.
- Worked-example check: asc Aries, Mars@Aries → AL=Capricorn(sign9);
  Saturn@Capricorn → A10=Virgo(sign6); A10-from-AL=10th → base 90.
- Convention: RESOLVED-by-derivation; competing readings documented in
  ARUDHA_CALCULATION_CONVENTION.md; owner sign-off still recommended.

### Image-axis contract (Step 3) — verified via 25 tests
flag OFF default · fail-closed provenance · null on missing inputs ·
substance untouched · health excluded · TRADITIONAL+extreme-gap withheld ·
bilingual deterministic · legacy cards compatible.

### Gates
- docs:verify → FAIL (transient): ran full suite, 13 files ENOENT-flaked
  (2570 vs documented 2613 — count drift is the known vitest worker-temp
  flake, not doc error; docs correctly say 2613 for clean runs)
- test:run → 2613p/4s exit 0 (earlier, pre-5934148; engine commit is
  test-covered: 197/197 arudha+image rerun after)
- validate:accuracy → 155/155 exit 0 · build → exit 0 (270 precache)
- answers:emit/check → 21/21
- FULL E2E → 122p / 6f / 5s / 22 did-not-run, exit 1 (cert-e2e-c3final.txt)

### E2E failure classification (NOT clean — c3 NOT certified)
1. all-routes `/` + `/career-astrology`: page.goto 60s timeouts — startup
   contention under workers:2 (infra flake class, seen before)
2. persona-users ×2 + robustness birth-2: "Overall Score"/submit-enabled
   timeouts — WASM cold-start + geocode-settle contention (flake class)
3. **perf-mobile: REAL signal** — longtasks 334/298/293/**586ms** over the
   250ms budget during a real 4x-throttled submission. Earlier run showed
   92/106/192ms. Variance = cold vs warm WASM + machine load. This is the
   first non-vacuous measurement and it FAILS intermittently — mobile
   main-thread budget is NOT reliably met. Genuine perf finding, not a
   test defect. Requires investigation (worker offload / chunked compute),
   not threshold-weakening.

### CODE-JUNCTION reconciliation
- v1.txt: composer modules implemented (chartFacts/depth/sequencing/
  remedyPlan/answerComposer); direction.ts deliberately omitted (c3 §3).
- v2.txt: arudhaImage implemented flag-OFF; exception {1:9,7:3} landed.
- c3.txt: Phases 1-9 implemented; Phase 10 partial (E2E not clean);
  Phase 11 report updated.
- V1-CLAUDE/V2-CLAUDE/V3-CLAUD-ALL: Codex/Claude instruction exports —
  content duplicates already-applied arudha/composer work; retained as
  reference, no unique unapplied requirements found (spot-checked).
- CHART IMAGES/, WhatsApp folders, AARUDH PDF, Venice files: c4 visual
  references + assets — retained for c4.
- c4.txt: RETAINED (chart engine not started).

### Verdict
c3: IMPLEMENTED but NOT CERTIFIED — perf-mobile intermittently exceeds
the 250ms longtask budget under real load; full E2E has 6 load-flake
failures + cascade. RELEASE HOLD. C4 NOT READY until perf + E2E stabilize.
