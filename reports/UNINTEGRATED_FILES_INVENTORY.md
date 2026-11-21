# Unintegrated Files Inventory

**Generated:** 2026-11-21
**Repo HEAD:** `5dfbebf` (in sync with `origin/main`)
**Scope:** Set A (present on disk, not tracked by git) + Set B (tracked in `main` but not wired into the app)
**Status of this document:** untracked — created for review, not yet committed.

---

## सारांश / Summary

| | English | हिन्दी |
|---|---|---|
| Set A | 35 git-ignored paths; only ~13 entries are real content (agent plans, arudha patch, patch tooling). The rest are build/test output. | 35 अनदेखी (ignored) प्रविष्टियाँ; केवल ~13 वास्तविक सामग्री हैं, शेष बिल्ड/टेस्ट आउटपुट हैं। |
| Set B | 258 files in `CODE-JUNCTION`, of which only 9 are code/patch material; plus 3 orphan app modules under `src/features/`. | `CODE-JUNCTION` में 258 फ़ाइलें, जिनमें केवल 9 कोड/पैच सामग्री हैं; साथ ही `src/features/` के अन्तर्गत 3 अनाथ (orphan) मॉड्यूल। |
| Headline | The ayanamsa consolidation patches P1/P2 are **not applied** — three duplicate Lahiri implementations still exist in the source. | अयनांश संयोजन पैच P1/P2 **लागू नहीं** हैं — स्रोत में लाहिरी की तीन प्रतियाँ अब भी मौजूद हैं। |

---

## 0. Method and evidence

| Fact | Command | Result |
|---|---|---|
| Working tree clean | `git status --porcelain` | 0 entries |
| Ignored paths | `git status --ignored --short` | 35 entries |
| CODE-JUNCTION tracked | `git ls-files CODE-JUNCTION` | 258 files |
| Root evidence files | `git ls-files` filtered to root `*.txt\|*.log` | 61 files |
| `reports/` tracked | `git ls-files reports` | 180 files |
| Orphan check | `grep -r "features/(charts\|dasha\|prashna)" src` | 19 hits, **all** in the modules' own tests — no `pages/`, `routes/`, `components/` importer |
| Patch state | inspected `vedicCalc.ts`, `precisionEphemerisService.ts`, `ephemerisService.ts` | P1 not applied; P2 partially obsolete |

### Verdict legend

| Verdict | Meaning |
|---|---|
| **INCORPORATE** | Real code/patch/data that belongs in the main app; needs an engineering task. |
| **GUIDANCE** | Design notes, research, plans, reference images; input to a task, not code itself. |
| **DERIVED-DISCARD** | Build output, logs, or vendored third-party noise; ignore or purge. |
| **KEEP** | Intentional, correct as-is. |
| **REVIEW** | Content not yet read; classification pending. |

---

## 1. Section A — present on disk, NOT tracked by git

35 ignored entries. Grouped by what they actually are.

### A1. GUIDANCE — agent task workspaces (`.agents/`, 8 files)

| Path | Verdict | Action |
|---|---|---|
| `.agents/tasks/panchang-fix/plan.md` | GUIDANCE | Panchang fix plan — reconcile against current panchang code, then action. |
| `.agents/tasks/panchang-fix/task.json` | GUIDANCE | Same task, machine form. |
| `.agents/tasks/panchang-fix/context.json` | GUIDANCE | Task context. |
| `.agents/tasks/panchang-fix/review.json` | GUIDANCE | Review record. |
| `.agents/tasks/panchang-fix/features/FEAT-001.json` | GUIDANCE | Feature ticket — check whether still open. |
| `.agents/tasks/panchang-fix/features/FEAT-002.json` | GUIDANCE | Feature ticket — check whether still open. |
| `.agents/tasks/security-audit-2026-10-12/dep-audit-findings.json` | GUIDANCE | Dependency audit findings — actionable; triage into the backlog. |
| `.agents/accuracy-run.log` | DERIVED-DISCARD | Run log. |

### A2. INCORPORATE — Arudha integration patch (`vedic-vijay/`, 3 files)

| Path | Verdict | Action |
|---|---|---|
| `vedic-vijay/AARUDH-LAGNA/VEDIC_RAJKUMAR_LOVABLE_ARUDHA_INTEGRATION_PATCH.md` | INCORPORATE | Arudha integration patch — compare with the landed `e44e569` fix; apply whatever is still outstanding. |
| `vedic-vijay/AARUDH-LAGNA/CODEX.txt` | GUIDANCE | Prior codex brief for the same work. |
| `vedic-vijay/AARUDH-LAGNA/lovable chat.txt` | GUIDANCE | Source conversation. |

### A3. Patch / release tooling (3 files)

| Path | Verdict | Action |
|---|---|---|
| `scripts/patch-util.mjs` | INCORPORATE | Reusable patch utility — decide whether it belongs in `scripts/` as tracked tooling. |
| `scripts/do-commit-push.ps1` | INCORPORATE | Commit/push helper — same decision. |
| `apply-patch-6.mjs` | DERIVED-DISCARD | One-off applier for patch #6; superseded. |

### A4. GUIDANCE — continuity chatlog (1 file)

| Path | Verdict | Action |
|---|---|---|
| `CREAT.MD` | GUIDANCE | Standing-order chatlog (SO-2). Intentionally git-ignored — keep local only. |

### A5. DERIVED-DISCARD — build, test and runtime output (20 entries)

| Path | Files | Verdict |
|---|---|---|
| `dist/` | 1040 | DERIVED-DISCARD |
| `node_modules/` | (deps) | DERIVED-DISCARD |
| `tr-rb2/` | 2443 | DERIVED-DISCARD — Playwright artifacts (`.playwright-artifacts-0`, `.last-run.json`). |
| `test-results/` | 106 | DERIVED-DISCARD |
| `test-results-rb/` | 3 | DERIVED-DISCARD |
| `.husky/_/` | — | DERIVED-DISCARD — generated hook shims. |
| `.netlify/` | 1 | DERIVED-DISCARD |
| `supabase/.temp/` | 1 | DERIVED-DISCARD |
| `.vitest-report.json` | 1 | DERIVED-DISCARD |
| `build-out.txt` | 1 | DERIVED-DISCARD |
| `dev-server.log` | 1 | DERIVED-DISCARD |
| `preview-probe.log` | 1 | DERIVED-DISCARD |
| `robustness-run.log` | 1 | DERIVED-DISCARD |
| `robustness-run-after-fix.log` | 1 | DERIVED-DISCARD |
| `vite-clerk-dev.log` | 1 | DERIVED-DISCARD |
| `reports/*.log` (14 files) | 14 | DERIVED-DISCARD — see list below |

`reports/` ignored logs: `browser-regression-build.log`, `browser-regression-complete-dev.log`, `browser-regression-dev.log`, `browser-regression-final-dev.log`, `browser-regression-full-preview.log`, `browser-regression-landing.log`, `browser-regression-preview.log`, `browser-regression-release.log`, `browser-regression-robustness-debug.log`, `browser-regression-robustness.log`, `browser-submit-before.log`, `evidence/00-npm-ci.detached.log`, `evidence/build-robotic.log`, `persona/e2e-dev-run.log`.

---

## 2. Section B — tracked in `main`, but NOT wired into the app

### B1. `CODE-JUNCTION/` bundle (258 files)

Only 15 of the 258 files carry engineering content. The bulk is vendor noise.

#### B1a. INCORPORATE — code and patches (9 files)

| Path | Verdict | Note |
|---|---|---|
| `CODE-JUNCTION/g1-patch/phase1/src/lib/vedic/ayanamsaEngine.ts` | INCORPORATE | Proposed single source of truth for Lahiri ayanamsa. |
| `CODE-JUNCTION/g1-patch/phase1/src/lib/vedic/ayanamsaCore.ts` | INCORPORATE | Supporting core. Target path `src/lib/vedic/ayanamsaCore.ts` **does not exist** in the repo yet. |
| `CODE-JUNCTION/g1-patch/phase1/src/astrology/core/ephemeris.ts` | INCORPORATE | Target `src/astrology/core/ephemeris.ts` exists — diff before applying. |
| `CODE-JUNCTION/g1-patch/phase1/src/services/ayanamsaService.ts` | INCORPORATE | Target `src/services/ayanamsaService.ts` exists — diff before applying. |
| `CODE-JUNCTION/g1-patch/phase1/phase1-ayanamsa-ephemeris.patch` | INCORPORATE | Phase-1 patch — **not applied** (see finding F1). |
| `CODE-JUNCTION/g3-patch/patches/0001-fix-ayanamsa-consolidate-Lahiri-ayanamsa-into-ayanam.patch` | INCORPORATE | Targets `src/lib/vedic/vedicCalc.ts`. **Not applied** — the `P1` marker and `getLahiriAyanamsa` import are absent. |
| `CODE-JUNCTION/g3-patch/patches/0002-fix-ephemeris-route-ephemeris-services-through-share.patch` | INCORPORATE | **Partially obsolete** — hunk 1 (`ephemerisService.ts`) was overtaken by commit `d523aab`; hunk 2 (`precisionEphemerisService.ts`) still applies. |
| `CODE-JUNCTION/g3-patch/patches/P1-P2-combined.diff` | INCORPORATE | Combined diff of the two patches above. |
| `CODE-JUNCTION/g1-patch/g1.txt` | REVIEW | Patch-instruction text; read before acting. |

#### B1b. GUIDANCE — plans, research, reference (13 files)

| Path | Verdict | Note |
|---|---|---|
| `CODE-JUNCTION/V1-CLAUDE` (9.8 KB) | GUIDANCE | AI brief. |
| `CODE-JUNCTION/V2-CLAUDE` (11.0 KB) | GUIDANCE | AI brief. |
| `CODE-JUNCTION/V3-CLAUD-ALL` (23.4 KB) | GUIDANCE | AI brief (largest). |
| `CODE-JUNCTION/g1-patch/AYANAMSA_REGRESSION_RESEARCH.md` | GUIDANCE | Regression research behind F1. |
| `CODE-JUNCTION/g1-patch/phase1/README.txt` | GUIDANCE | Patch application notes. |
| `CODE-JUNCTION/g2-patch/PHASE2_CODE_PATCH_PLAN.md` | GUIDANCE | Phase-2 plan. |
| `CODE-JUNCTION/g2-patch/new 1.txt` | GUIDANCE | Draft. |
| `CODE-JUNCTION/g3-patch/TECHNICAL_DESIGN_P1-P6.md` | GUIDANCE | Technical design for the P1–P6 series. |
| `CODE-JUNCTION/g3-patch/templates-and-governance.md` | GUIDANCE | Governance/template rules. |
| `CODE-JUNCTION/g3-patch/P1-P6_tracker.xlsx` | GUIDANCE | Tracker spreadsheet. |
| `CODE-JUNCTION/g3-patch/P1-P6_dependency_infographic.png` | GUIDANCE | Dependency diagram. |
| `CODE-JUNCTION/g3-patch/Phase1_patch_plan_slides.pptx` | GUIDANCE | Slide deck. |
| `CODE-JUNCTION/g3-patch/new 1.txt` / `g4-patch/new 1.txt` / `g5-patch - Copy/new 2.txt` | GUIDANCE | Working drafts. |

#### B1c. GUIDANCE — reference source material (14 files)

| Path | Files | Verdict |
|---|---|---|
| `CODE-JUNCTION/CHART IMAGES/*.jpeg` | 5 | GUIDANCE — reference chart images. |
| `CODE-JUNCTION/WhatsApp Unknown 2026-11-20 at 7.13.16 AM/*.jpeg` | 6 | GUIDANCE — reference images. |
| `CODE-JUNCTION/AARUDH-LAGNA/pdfcoffee.com_arudha-lagnapdf-pdf-free.pdf` | 1 | GUIDANCE — arudha reference text. |
| `CODE-JUNCTION/AARUDH-LAGNA/.gitkeep` | 1 | KEEP — placeholder. |
| `CODE-JUNCTION/.gitkeep` | 1 | KEEP — placeholder. |

#### B1d. DERIVED-DISCARD — vendored third-party page mirror (220 files)

| Path | Files | Verdict |
|---|---|---|
| `CODE-JUNCTION/Venice Agent - Venice Uncensored AI.htm` | 1 | DERIVED-DISCARD — unrelated saved web page. |
| `CODE-JUNCTION/Venice Agent - Venice Uncensored AI_files/` | 219 | DERIVED-DISCARD — minified vendor JS/CSS/AVIF from that page. |

These 220 files (~25 of the 28 MB imported) have no relationship to the project. They were committed in `5dfbebf`; consider removing them from history.

### B2. Orphan application modules under `src/` (21 source + 16 test files)

No `pages/`, `routes/`, or `components/` file imports any of these — the only importers are their own tests.

| Path | Files | Verdict | Action |
|---|---|---|---|
| `src/features/charts/` (`components/`, `model/`) | 7 | INCORPORATE | Wire the chart surface / view-model into the kundli route. |
| `src/features/dasha/` (`components/DashaTimeline.tsx`) | 1 | INCORPORATE | Wire the Vimshottari timeline into the kundli route. |
| `src/features/prashna/` (`kernel/`, `index.ts`) | 13 | INCORPORATE | Wire the prashna kernel into the prashna route — **gated on pandit sign-off and physical-book citation verification.** |
| `src/data/prasna/` | (data) | INCORPORATE | Kernel citation/friendship tables. |
| `src/tests/charts/` | 7 | KEEP | Tests for the modules above. |
| `src/tests/prashna/` | 9 | KEEP | Tests for the modules above. |

### B3. DERIVED-DISCARD — tracked evidence artifacts at repo root (61 files)

Build/certification console output kept at the repo root. Full list in Appendix A. Recommended: relocate to `reports/evidence/` or add to `.gitignore`.

### B4. KEEP — `reports/` (180 tracked files)

The designated reporting directory; intentionally tracked. Includes the newly added `reports/UNINTEGRATED_FILES_INVENTORY.md` (this file).

---

## 3. Findings requiring engineering decisions

### F1 — Three duplicate Lahiri ayanamsa implementations (the reason patches P1/P2 exist)

| # | Location | State |
|---|---|---|
| 1 | [vedicCalc.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/lib/vedic/vedicCalc.ts) — `lahiriAyanamsa()`, J2000 constant `23.85472` | Duplicate, **not consolidated**. |
| 2 | [precisionEphemerisService.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/services/precisionEphemerisService.ts#L154) — `getLahiriAyanamsa()` | Duplicate, **not consolidated**. |
| 3 | [ephemerisService.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/services/ephemerisService.ts) — `calculateAyanamsa()` | Third copy; its now-dead `AYANAMSA_*` constants were already removed by `d523aab`. |

The intended single source of truth is [ayanamsaEngine.ts](file:///e:/Rajkumar/Vedic_Rajkumar/src/lib/vedic/ayanamsaEngine.ts), which already exists. Patches `0001`/`0002` are the consolidation mechanism and are **outstanding**.

### F2 — Patch 0002 is half-obsolete

Its own commit message says `calculateAyanamsa()` should keep "the unparseable-date fallback". Commit `d523aab` deliberately **removed** that fallback in favour of throwing. Applying hunk 1 verbatim would re-introduce the silent-fallback behaviour. Apply hunk 2 only, or rebase the patch.

### F3 — `src/lib/vedic/ayanamsaCore.ts` has no counterpath in the repo

The g1 bundle ships this file, but no such path exists. It is either new (to be added) or a rename. Confirm before applying.

---

## 4. Recommended action order

1. **F1/F3 first** — consolidate the ayanamsa to the single engine, rebasing `0001` and the still-valid hunk of `0002`. This is a correctness-adjacent change and blocks nothing else.
2. **B2** — wire `src/features/charts` and `src/features/dasha` into the kundli route; the prashna kernel waits on pandit sign-off.
3. **A2** — diff the `vedic-vijay` Arudha integration patch against the landed `e44e569` fix; apply only what is outstanding.
4. **A1** — triage the `.agents/` panchang tickets (FEAT-001/002) and the dependency-audit findings into the backlog.
5. **A3** — decide whether `scripts/patch-util.mjs` and `scripts/do-commit-push.ps1` become tracked tooling.
6. **B3/A5/B1d housekeeping** — relocate or ignore the 61 root log files; optionally purge the 220-file vendor mirror from history.

---

## Appendix A — tracked evidence files at repo root (61)

All verdict: **DERIVED-DISCARD**.

| Group | Count | Files |
|---|---|---|
| `cert-*` | 21 | `cert-acc`, `cert-accuracy-final`, `cert-accuracy-full`, `cert-accuracy-postpatch`, `cert-build`, `cert-build-final`, `cert-build-postpatch`, `cert-core`, `cert-e2e`, `cert-e2e-c3final`, `cert-e2e-final`, `cert-e2e-gates`, `cert-e2e-postpatch`, `cert-e2e-rerun`, `cert-e2e-rerun2`, `cert-e2e-rerun3`, `cert-test2`, `cert-tiers`, `cert-tsc`, `cert-unit-final`, `cert-unit-postpatch` |
| `vitest-*` | 9 | `vitest-final`, `vitest-nofp-exit`, `vitest-nofp-out`, `vitest-phase3`, `vitest-push-repro`, `vitest-serial-exit`, `vitest-serial-out`, `vitest-v1v2`, `vitest-verify-out2` |
| test output | 6 | `ac-tests.txt`, `agpl-test-out.txt`, `answercard-test-out.txt`, `answerscheck-out.txt`, `arudha-test-out.txt`, `dasha-test-out.txt` |
| `docsverify-*` | 5 | `docsverify-exit`, `docsverify-exit2`, `docsverify-full-out`, `docsverify-full2-out`, `docsverify-notests-out` |
| `build-*` | 4 | `build-arudha`, `build-phase4`, `build-v1v2`, `build-verify` |
| `e2e-*` | 3 | `e2e-final-gate3`, `e2e-preview-result`, `e2e-tiers-result` |
| `lint-*` | 3 | `lint-final`, `lint-out`, `lint-verify` |
| `typecheck-*` | 2 | `typecheck-exit`, `typecheck-out` |
| `pw-*` | 2 | `pw-phase2`, `pw-verify` |
| singletons | 6 | `acc-fast.txt`, `accuracy-out.txt`, `landing-run.txt`, `perf-run.txt`, `tc-core.txt`, `unverified-test-out.txt` |

Also at root (not in the count above): `vitest-list.json`.

## Appendix B — `CODE-JUNCTION/` composition (258 tracked files)

| Group | Files | Verdict |
|---|---|---|
| `Venice Agent ... _files/` + `.htm` | 220 | DERIVED-DISCARD |
| `g3-patch/` | 9 | mixed (see B1a/B1b) |
| `g1-patch/` | 8 | mixed (see B1a/B1b) |
| `WhatsApp Unknown 2026-11-20 .../` | 6 | GUIDANCE |
| `CHART IMAGES/` | 5 | GUIDANCE |
| `AARUDH-LAGNA/` | 2 | GUIDANCE + KEEP |
| `g2-patch/` | 2 | GUIDANCE |
| `g4-patch/` | 1 | GUIDANCE |
| `g5-patch - Copy/` | 1 | GUIDANCE |
| `V1-CLAUDE`, `V2-CLAUDE`, `V3-CLAUD-ALL` | 3 | GUIDANCE |
| `.gitkeep` | 1 | KEEP |

**Totals (258):** INCORPORATE 8 · GUIDANCE 27 · DERIVED-DISCARD 220 · KEEP 2 · REVIEW 1.
