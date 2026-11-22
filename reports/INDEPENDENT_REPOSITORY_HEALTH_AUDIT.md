# Independent Repository Health & Correctness Audit

**Scope:** independent, evidence-based audit of the current HEAD of `E:\Rajkumar\Vedic_Rajkumar`, per the *INDEPENDENT REPOSITORY HEALTH & CORRECTNESS PATCH* directive (Stages 1–7).
**Mode:** read-only audit + minimal, low-risk local corrections. **RELEASE HOLD maintained** — nothing pushed, merged, deployed or re-licensed.
**Final rule applied:** *Correctness before features. Evidence before claims. Compatibility before refactoring. No unnecessary code.*

---

## Stage 1 — Ground truth

| Item | Value | Evidence |
| --- | --- | --- |
| Local HEAD | `4556fad75a3ae94a31ff52ded2efaa2c3d453446` | `git rev-parse HEAD` |
| Branch | `feature/lovable-hub-landing` | `git rev-parse --abbrev-ref HEAD` |
| Remote HEAD | same revision, 0/0 ahead/behind origin | `git status -sb` |
| Working tree | **dirty** — 10 modified + untracked files inherited from the prior *VED TRIAGE* task (preserved, not reverted) | `git status --porcelain` |
| CI | no live CI run captured locally; `docs:verify` is the local claim gate that CI mirrors | this report §Stage 7 |

Prior fixes from the *VED TRIAGE* task (`reports/VED_TRIAGE_ADOPTION_AUDIT.md`) were re-verified before proposing new ones. The intake router (`src/lib/intake/triage.ts`), its tests, and the doc-count pins described there are present and functioning. Historical statements in `reports/` (e.g. the earlier "F6 confidence score unbacked") are **stale observations about the legacy engine** and were re-classified in Stage 4 below — the live UI *does* surface a confidence value.

**Documentation vs code:** several README claims were re-checked against source and evidence rather than accepted. Results in Stage 6.

---

## Defect-by-defect register

Severity: **P0** = misleading/incorrect output; **P1** = correctness or gate reliability; **P2** = documentation/quality.

| # | Finding | Evidence (file:line) | Severity | Existing implementation | Required change | Test | Result | Remaining risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **F1** | Live Prashna edge function **fabricates a "Prashna Lagna" arithmetically** — no ephemeris, no latitude/longitude | `supabase/functions/prashna/index.ts` `computePrashnaLagna()` L18–42 (`totalMinutes = hour*60+minute+dayOfYear*4; lagnaIndex = floor((totalMinutes/120)%12)`); payload `{question,direction,birthName,questionTime}` carries **no coordinates** | **P0** | arithmetic clock formula + optional direction offset | Needs ask-for-location intake guard + real ascendant (ephemeris) — **architectural, escalated** | n/a (escalated) | **ESCALATED — not changed** | High: a user can receive a "Prashna Lagna" that is not astronomically derived |
| **F2** | Prashna **confidence silently defaults to 75** when the AI omits/fails to return one | `supabase/functions/prashna/index.ts` L180 `confidence_percent: typeof aiResult.confidencePercent === 'number' ? aiResult.confidencePercent : 75` | **P0** | hard-coded `75` | Remove the fabricated default; propagate an explicit "unavailable" state — **escalated** | n/a (escalated) | **ESCALATED — not changed** | High: an arbitrary number is presented as a measurement |
| **F3** | The live `/prashna-ai` path **bypasses the intake guard** | `PrashnaEngine.tsx` → `askPrashna` (`jyotishApiService.ts`) → edge function; `triage()` is wired only to `QuestionPage` | **P1** | guard exists but unwired on this route | Wire `triage()` to the `/prashna-ai` entry — **escalated** (changes user flow) | n/a (escalated) | **ESCALATED — not changed** | Medium: two Prashna entry paths with different safety |
| **F4** | `validateLahiriFormula()` self-check **could never pass** (dead invariant) | `src/lib/vedic/ayanamsaEngine.ts` L197 — tolerance `< 1e-9`; `getAyanamsa(2451545.0)` always adds ≈ `2.83e-8` deg of ΔT-induced precession | **P1** | `pass: Math.abs(y2000 - anchor) < 1e-9` | Loosen to `< 1e-6` (still ~10⁴× tighter than any real anchor error) + comment | `src/tests/accuracy/ayanamsaCore.golden.test.ts` | **FIXED** — golden test green | Low |
| **F5** | Ayanamsa core (`ayanamsaCore.ts`) had **no direct unit coverage** — a single wrong anchor would pass every suite | whole module previously untested; anchors are the single source of truth | **P1** | none | Add independent golden/regression tests | `src/tests/accuracy/ayanamsaCore.golden.test.ts` (19 tests) | **FIXED** — added | Low |
| **F6** | Review claim: `ephemerisService` **double-applies ΔT → 6.5″ error** | `ephemerisService.ts` L485/L643 pass `jdTT` into `calculateAyanamsa` → `ayanamsaAt` re-applies ΔT | **NON-defect** | `precessionRate × ΔT ≈ 1e-6″` | none | reasoned in Stage 3 | **REBUTTED — no change** | None (numerically nil) |
| **F7** | Question classifier **silently defaults to house 1** on zero keyword score | `src/services/questionAnalysisService.ts` `classifyQuestionDetailed` L418–432 (`best = {house:1,score:0}`, no zero-score branch) | **P1** | implicit house-1 default | Return an explicit "unclassified" state so the caller can ask — **changes live output, escalated** | proposed: unit test | **ESCALATED — not changed** | Medium: a no-match question is answered as if it were a 1st-house (self) question |
| **F8** | Live horary service derives **confidence from `Math.random()`** | `src/services/horaryAstrologyService.ts` L84–96 (`85 + Math.floor(Math.random()*10)` …) | **P1** | random + arbitrary base values | Replace with a documented, deterministic derivation — **escalated** | proposed: unit test | **ESCALATED — not changed** | Medium: identical input yields different confidence |
| **F9** | The most correct Prashna kernel is **dead code**; live path uses simpler heuristics | `src/features/prashna/kernel/*` imported only by `src/tests/prashna/*` (no runtime importer); live = `questionAnalysisService` + `prasnaMargaExtras` + edge fn | **P1 (arch)** | duplicate engines | Decide one engine (wire kernel or delete it) — **architectural, escalated** | n/a | **ESCALATED — not changed** | Medium: maintenance + "duplicate engine" drift the directive warned against |
| **F10** | Legacy `legacyTajikaRelation` classifies Ithasala/Esharapha from **house differences**, not Tajika drishti | `src/services/prashnaService.ts` L132–136 (`[0,3,4,6,8,9]`) — file also `@ts-nocheck` **and has no importers** | **P2** | house-diff heuristic | Dead code; delete or correct — **escalated** | n/a | **ESCALATED — not changed** | Low (dead) |
| **F11a** | README chart list typo **`D9/D9`** | README L49 (was) | **P2** | typo | `D1 + D9/D10` | `docs:verify` | **FIXED** | None |
| **F11b** | README advertised a **horary number 1–249 that is never collected or used** | README L50/L127 (was) vs `PrashnaEngine.tsx` / `triage.ts` (validates, UI never collects) | **P2** | false capability claim | Remove the claim | `docs:verify` | **FIXED** | None |
| **F11c** | Doc **test-count pins drifted** after adding F5's tests | 6 sites pinned `2697 / 169`; derived count is `2716 / 170` | **P2** | stale pins | Reconcile all six pins | `docs:verify` | **FIXED** | Low (see F12) |
| **F12** | `docs:verify` runs the **full suite** and is **environment-flaky** in count | identical tree reported `2716 passed` then `2163 passed` logs: `reports/evidence/health-docsverify*.txt` | **P1** | full-suite count gate | Investigate collection flake / pin to a deterministic subset — **escalated** | reruns recorded | **OBSERVED — not "fixed"** | Medium: gate can red/green on the same tree |
| **F13** | Mobile longtasks **exceed the 250 ms budget** | prior delivery-reliability audit: blocking tasks 380/330/781 ms | **P1** | — | Perf work (worker offload) — **escalated** | `npm run test:perf` | **ESCALATED — not changed** | Medium |
| **F14** | Accessibility axe coverage limited to **2 components** | `npm run test:a11y` → `src/tests/week5/accessibilityGaps.test.tsx` | **P2** | narrow coverage | Broaden a11y checks — **escalated** | `test:a11y` | **ESCALATED — not changed** | Low |
| **F15** | Windows Husky pre-push hook | `.husky/pre-push` + `scripts/hooks/pre-push.mjs` | **P1** | Node hand-off, `sh -e`-safe, checks **not** disabled | none — already repaired | manual read | **VERIFIED OK** | None |

---

## Stage 2 — P0 calculation safety

- **Intake guard exists** (`src/lib/intake/triage.ts`, built in the prior task). It is a *pure* router with four lanes, explicit completeness states (`NatalCompleteness`/`PrashnaCompleteness`), a `blockAnswer` flag, `INTAKE_ENGINES.placements_only === false` (a placements-only lane is a **summary**, never a calculation), and it **never substitutes a location**. This satisfies the "minimal intake guard" requirement — no new engine was added.
- **Gap:** the guard is wired to `QuestionPage` only. The `/prashna-ai` route (`PrashnaEngine.tsx`) calls the Supabase `prashna` function directly, where **F1** (fabricated lagna) and **F2** (default confidence 75) live. Both are **escalated** as architectural.
- **No speculative placements-only prediction engine was implemented** (explicitly forbidden by the directive).

## Stage 3 — P0 astronomical regression

- `src/lib/vedic/ayanamsaCore.ts` is a single source of truth: Lahiri anchor `23.853194` (`golden-locked`), all others `pending-golden`; `seSidMode` ids; provenance (`source` / `degraded`); ΔT (Espenak & Meeus, 1900–2150, out-of-range → `{0,false}`); IAU-2006 precession; IAU-1980 nutation; `normalise()`; sidereal conversion applied **exactly once**; boundary margins.
- **Verified correct:** by-construction separation of Lahiri (±0.9° from Fagan-Bradley, +1.39° from Raman), monotonic drift 1900→2026, throw contracts, out-of-range ΔT fail-visible, reversible tropical↔sidereal.
- **F4** (dead self-check) found and fixed; **F5** (missing core coverage) closed with an independent golden test.
- **F6** rejected: the "double-TT / 6.5″" claim is numerically nil (≈ 1e-6″); no change justified.

## Stage 4 — P1 Prashna mathematical audit

Full detail from an independent sub-agent audit (`src/features/prashna/**`, `src/services/*prashna*`, `src/pages/prashna/**`, `supabase/functions/prashna/**`):

- **Question classifier / zero-score:** F7 — silent house-1 default.
- **Horary number 1–249:** validated in the router, **never collected by any UI, never threaded into any engine** → the README claim (F11b) was false; corrected.
- **Gulika hora vs occupant:** the dead kernel distinguishes them correctly (`timeline.ts`); the live `prasnaMargaExtras.getGulikaKala()` uses a `Lagna + 7` shortcut and a fixed 6 AM sunrise — approximate, not astronomical.
- **Tajika drishti / Ithasala / Esharapha / orbs:** the correct degree-based implementation (five aspect angles + deeptamsha orbs, applying/separating by gap-now vs gap-later) exists **only in the dead kernel** (`tajika.ts`); live services use house-position heuristics (F9/F10).
- **Confidence semantics:** three unrelated derivations — principled (dead kernel), arbitrary stub (dead), and the live defaults F2/F8.
- **Type safety:** `@ts-nocheck` on `src/services/prashnaService.ts` (dead) and `src/services/jyotishApiService.ts` (**live**).

*Per the directive, no formula was changed — traditional-convention changes require documented conventions + independent cases + approval.*

## Stage 5 — P1 delivery reliability

- **Husky (F15): repaired and verified** — `.husky/pre-push` is a `sh -e`-safe Node hand-off; `scripts/hooks/pre-push.mjs` treats the **exit code** as the contract and never skips checks.
- **`docs:verify` flake (F12):** reproduced — the same working tree yielded `2716 passed / 4 skipped` and `2163 passed / 0 skipped`. Evidence: `reports/evidence/health-docsverify2.txt`, `health-docsverify3.txt`. The deterministic claim-pinning is correct; the *count source* (a full-suite run) is unstable in this environment. Not concealed; escalated.
- **Mobile longtasks (F13)**, **a11y breadth (F14)**, **Lighthouse** (configured, 0.9 thresholds, no stored evidence) — recorded, escalated.
- **CI/local parity:** the local `docs:verify` gate is the CI mirror; its flake is a parity risk.

## Stage 6 — Documentation integrity

| Claim | Verdict | Action |
| --- | --- | --- |
| `D9/D9` divisional charts | **false** | fixed → `D9/D10` |
| Horary number 1–249 | **false** (never collected/used) | claim removed |
| Test count `2697` | **stale** after F5 | reconciled to `2716 / 170` (6 sites) |
| Prashna "confidence score" surfaced in UI | **true** (stale prior "F6") | kept |
| Accuracy `15/15 charts ≤2″` | **true** (`validate:accuracy` 155/155; numeric pins pass) | kept |
| MIT + AGPL dependency boundary | **true** (structural isolation test; AGPL legal review remains an open blocker) | kept |
| "Active prototype · 4 core features production-ready" | **true** (not "certified production") | kept |
| Swiss Ephemeris is **optional** (`VITE_USE_SWISS_EPHEMERIS`) and **not authorised for prod** | **true** | kept |

Accurate, verified capabilities were **not** removed.

## Stage 7 — Verification log

| Gate | Command | Exit | Evidence |
| --- | --- | --- | --- |
| TypeScript | `npm run typecheck` | 0 | (batch 1) |
| Lint | `npm run lint` | 0 (0 errors / 1248 warnings) | `reports/evidence/health-lint.txt` |
| Core unit | `npm run test:core` | 0 (80 passed) | `reports/evidence/health-core.txt` |
| Accuracy corpus | `npm run validate:accuracy` | 0 (155 passed) | `reports/evidence/health-accuracy.txt` |
| Build | `npm run build` | 0 (PWA 270 precache) | `reports/evidence/health-build.txt` |
| A11y (axe) | `npm run test:a11y` | 0 | `reports/evidence/health-a11y.txt` |
| Ayanamsa golden (new) | `npx vitest run src/tests/accuracy/ayanamsaCore.golden.test.ts` | 0 (19 passed) | this report |
| Prashna regression | `npx vitest run src/tests/prashna` | 0 (76 passed, 10 files) | command output |
| AnswerCard compatibility | `npm run answers:check` | 0 (21 cards verified) | command output |
| Docs claim gate | `npm run docs:verify` | **0** (green after reconciliation; 2716 passed) | `reports/evidence/health-docsverify4.txt` |
| Full Playwright E2E | `npm run test:e2e` | **NOT RE-RUN** — heavy + previously flaky (one consistent 120 s timeout in `persona-users.spec.ts`, recorded in the prior delivery audit) | prior audit |
| Mobile performance | `npm run test:perf` (lhci) | **NOT RE-RUN** — configured (0.9 thresholds); prior audit found longtasks over the 250 ms budget (F13) | prior audit |

---

## Escalations requiring approval (unchanged, RELEASE HOLD)

1. **F1/F2/F3** — Prashna edge function: real ascendant + no fabricated confidence + route the `/prashna-ai` path through the intake guard.
2. **F7** — classifier zero-score semantics (changes live output).
3. **F8** — replace `Math.random()` confidence with a documented derivation.
4. **F9/F10** — de-duplicate the Prashna engines (wire or delete the dead kernel).
5. **F12** — stabilise the `docs:verify` count source.
6. **F13/F14** — mobile longtask budget; a11y breadth.

## Status

**RELEASE HOLD.** Only low-risk, evidence-backed corrections were applied (F4, F5, F11a–c). Nothing pushed, deployed, merged, or re-licensed.
