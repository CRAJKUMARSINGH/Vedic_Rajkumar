# Essential Corrections — Implementation Record

Companion to [INDEPENDENT_REPOSITORY_HEALTH_AUDIT.md](./INDEPENDENT_REPOSITORY_HEALTH_AUDIT.md).
This file records **only** the corrections that were implemented locally, why they are safe, and the evidence that they work. Architectural and formula-convention items were **not** implemented (see escalations).

**RELEASE HOLD maintained** — nothing pushed, deployed, merged, or re-licensed.

---

## Summary of changes

| ID | File | Change | Risk | Verified by |
| --- | --- | --- | --- | --- |
| F4 | `src/lib/vedic/ayanamsaEngine.ts` | Self-check tolerance `1e-9 → 1e-6` | Low | new golden test |
| F5 | `src/tests/accuracy/ayanamsaCore.golden.test.ts` | New independent golden suite (19 tests) | Low | `vitest run` (19 passed) |
| F11a | `README.md` | `D9/D9 → D9/D10` | None | `docs:verify` |
| F11b | `README.md` | Removed false "Horary number 1–249" claim | None | `docs:verify` |
| F11c | 6 doc sites | Test-count pins `2697/169 → 2716/170` | Low | `docs:verify` |

Nothing else was modified. No engine behaviour, no formula, no licensing, no dependency was changed.

---

## F4 — `validateLahiriFormula()` self-check could never pass

**Defect.** The structural self-check in `ayanamsaEngine.ts` asserted
`Math.abs(y2000 - AYANAMSA_ANCHORS.Lahiri.valueAtJ2000) < 1e-9`, where
`y2000 = getAyanamsa(2451545.0, 'Lahiri').value`. Because `ayanamsaAt` takes UT and
internally advances to TT, it always adds the precession accumulated over ΔT
(≈ 64 s at J2000 ≈ **2.83e-8 deg**). A `< 1e-9` bound is therefore unsatisfiable:
the check returned `false` on every call. It had no callers, so the broken
invariant was latent — until the new golden test (F5) exercised it.

**Change** (`src/lib/vedic/ayanamsaEngine.ts`):

```diff
   out.push({
     check: 'Lahiri at J2000.0 equals the locked anchor',
     detail: `${y2000.toFixed(6)}`,
-    pass: Math.abs(y2000 - AYANAMSA_ANCHORS.Lahiri.valueAtJ2000) < 1e-9,
+    // `getAyanamsa` takes UT and internally advances to TT, so it adds the
+    // ~2.8e-8 deg of precession accumulated over delta-T (≈64 s) since J2000.
+    // A 1e-9 tolerance could therefore never pass; 1e-6 is still ~1e4x tighter
+    // than any anchor error (>1e-3 deg) this check exists to catch.
+    pass: Math.abs(y2000 - AYANAMSA_ANCHORS.Lahiri.valueAtJ2000) < 1e-6,
   });
```

**Why this is correct, not a workaround:** the *implementation* is sound; only the
*tolerance* was wrong. `1e-6 deg` (≈ 3.6 milliarcsec) still fails loudly for any
real anchor error (the historical Fagan-Bradley typo was off by **0.699 deg**).

---

## F5 — Independent golden coverage for the ayanamsa core

**New file:** `src/tests/accuracy/ayanamsaCore.golden.test.ts` (19 tests).

The module the entire sidereal stack delegates to had **no direct unit coverage**.
The suite pins observable invariants and locked anchors (not a re-derivation):
engine identity/version `2.0.0`, the six systems and their `SE_SIDM` ids, that only
Lahiri is `golden-locked`, that Fagan-Bradley is **not** the defective `24.0440`,
True-Citra `trueStar`, monotonic drift 1900→2000→2026, the by-construction
separations (Lahiri vs Fagan-Bradley ≈ 0.89°, vs Raman ≈ 1.39°), `deltaTSeconds`
in-range + out-of-range fail-visible, `jdTTFromUT` advance, throw contracts,
`boundaryMargins`, and an exact reversible tropical↔sidereal round-trip.

Two bugs in the *first* draft of the test were caught before acceptance (a
malformed ternary assertion and an inverted Fagan-Bradley sign) — recorded here
because the test file itself must be trustworthy.

**Result:** `npx vitest run src/tests/accuracy/ayanamsaCore.golden.test.ts` → **19 passed** (exit 0).

---

## F11a — README `D9/D9` typo

```diff
- Lahiri ayanamsa · North/Central Indian layout · D1 + D9/D9 divisional charts · ...
+ Lahiri ayanamsa · North/Central Indian layout · D1 + D9/D10 divisional charts · ...
```

## F11b — README false "horary number" capability

The README advertised a horary number (1–249). The router *validates* such a number
(`triage.ts`), but **no UI collects it and no engine consumes it** (`PrashnaEngine.tsx`,
`questionAnswerService`, the edge function, and the kernel all lack the field). The
claim was removed; the accurate description of the moment-cast flow was kept.

## F11c — Doc test-count reconciliation

Adding F5's 19 passing tests moved the derived canonical from `2697 / 169` to
`2716 / 170` (baseline was verified correct at HEAD: `2697 passed / 4 skipped / 169 files`).
All six pinned sites were reconciled:

| File | Was | Now |
| --- | --- | --- |
| `README.md` (badge) | `tests-2697` | `tests-2716` |
| `README.md` (CLI comment) | `(2697 tests)` | `(2716 tests)` |
| `docs/ENTERPRISE_LAUNCH_GUIDE.md` | `# 2697 tests` | `# 2716 tests` |
| `docs/CLAIMS.md` | `2697 tests / 169 files` | `2716 tests / 170 files` |
| `docs/launch/pre-launch-user-testing-playbook.md` | `2697 passed (169 files` | `2716 passed (170 files` |
| `app-robustness-testing.md` | `2697 tests / 169 files` | `2716 tests / 170 files` |

No other numeric claim (corpus 15, assertions 155, tolerances) changed.

---

## Explicitly NOT implemented (RELEASE HOLD — awaiting approval)

| Item | Reason |
| --- | --- |
| Prashna fabricated ascendant (F1) | Architectural: needs location intake + ephemeris |
| Default confidence `75` (F2) | Changes an API contract / user-visible number |
| Routing `/prashna-ai` through the guard (F3) | Changes user flow |
| Classifier zero-score semantics (F7) | Changes live question output |
| `Math.random()` confidence (F8) | Formula/convention change |
| De-duplicating the dead Prashna kernel (F9/F10) | Architectural refactor |
| Stabilising the `docs:verify` count flake (F12) | Gate/infra change |
| Mobile longtask budget (F13) / a11y breadth (F14) | Perf & coverage work streams |

---

## Verification evidence

- `reports/evidence/health-lint.txt`, `health-core.txt`, `health-a11y.txt`,
  `health-accuracy.txt`, `health-build.txt`
- `reports/evidence/health-docsverify*.txt` (claim-gate runs, including the
  reproduced count flake)
- New test: `src/tests/accuracy/ayanamsaCore.golden.test.ts`

**Status: HOLD.** No push, deploy, merge or license change.

### Commit decision

The working tree was **already dirty** when this audit began: the prior *VED TRIAGE*
task left 10 modified + many untracked files uncommitted, and several of those files
(`README.md`, `package.json`, `src/pages/QuestionPage.tsx`, `src/services/prashnaService.ts`,
`src/lib/intake/`, `src/tests/intake/`) are **shared** with this audit's edits. Committing
now would entangle two change sets, and would have to split `README.md` mid-hunk — a
correctness hazard in a RELEASE-HOLD context.

Therefore commits were **deliberately withheld**. When authorised, stage this audit's
changes as one focused commit (excluding build output and the prior task's files):

```
git add src/tests/accuracy/ayanamsaCore.golden.test.ts \
        reports/INDEPENDENT_REPOSITORY_HEALTH_AUDIT.md \
        reports/ESSENTIAL_CORRECTIONS_IMPLEMENTATION.md \
        reports/evidence/health-lint.txt \
        reports/evidence/health-core.txt \
        reports/evidence/health-a11y.txt \
        reports/evidence/health-accuracy.txt \
        reports/evidence/health-build.txt \
        reports/evidence/health-docsverify.txt \
        reports/evidence/health-docsverify2.txt \
        reports/evidence/health-docsverify3.txt \
        reports/evidence/health-docsverify4.txt
# then, hunk-by-hunk for the files shared with the prior task:
git add -p src/lib/vedic/ayanamsaEngine.ts README.md \
        docs/CLAIMS.md docs/ENTERPRISE_LAUNCH_GUIDE.md \
        docs/launch/pre-launch-user-testing-playbook.md app-robustness-testing.md
```
