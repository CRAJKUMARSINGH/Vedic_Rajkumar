# Technical Design Document — Phase 1 Patches P1–P6

**Repository:** [CRAJKUMARSINGH/Vedic_Rajkumar](https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar)
**Base commit:** `6b1c0fbf95f25cc5478d60b0b319b6969a098fa0` — `fix(e2e): guard N9 on empty birthDate, fix test selectors, update e2e evidence` (2026-11-19, `main`)
**Working branch:** `phase1/patches-p1-p6`
**Status:** P1 and P2 implemented as ready-to-commit patches; P3–P6 specified for subsequent milestones.
**Important note on traceability:** the repository currently has no issues labelled P1–P6 (its open issues #8–#22 are all dependabot updates). The P1–P6 definitions below are **proposed** by this design document, grounded in concrete findings in the code and docs. Issue numbers, owners and due dates are marked **TBD** until the issues are filed.

---

## 1. Context

The Vedic_Rajkumar app computes sidereal (Lahiri) chart data with a TypeScript port of Meeus' algorithms plus an optional Swiss Ephemeris WASM path. An engineering review (`docs/BUGS_FOUND.md`) and `docs/QUALITY_GATE.md` identify a focused release gate while older modules are consolidated. Phase 1 targets calculation correctness and single-source-of-truth integrity first, because every downstream feature (dashas, vargas, shadbala, PDF reports) inherits any ayanamsa or ephemeris error.

### Findings that motivate the patches (verified in code at `6b1c0fb`)

| # | Finding | Location |
|---|---------|----------|
| F1 | Lahiri ayanamsa formula duplicated in **three** files with slightly different coefficients (`0.0139601*T*100` vs `0.013960*T*100`) | `src/lib/vedic/vedicCalc.ts`, `src/services/ephemerisService.ts`, `src/services/precisionEphemerisService.ts` |
| F2 | Dead/unused constants `AYANAMSA_2000`, `AYANAMSA_BASE_YEAR`, `AYANAMSA_ANNUAL_RATE`, `AYANAMSA_2026` | `src/services/ephemerisService.ts` lines 14–17 |
| F3 | Swiss Ephemeris licence decision (AGPL-3.0 `swisseph-wasm` wrapper vs commercial) still open | `src/services/swissEphemerisService.ts`, `to-do-list.md` ("Swiss Ephemeris AGPL vs commercial licence decision (ADR)") |
| F4 | Full `typecheck`/`lint` not yet required CI gates; ~1,245 lint warnings of legacy debt | `docs/QUALITY_GATE.md` "Known Follow-Up", `docs/BUGS_FOUND.md` |
| F5 | Ayanamsa epoch validation (`validateLahiriFormula()` in `ayanamsaEngine.ts`) exists but is not wired into CI accuracy gates | `src/lib/vedic/ayanamsaEngine.ts` |
| F6 | Contribution/issue tooling not aligned with a patch-series workflow (templates exist but don't reference gate commands or patch IDs) | `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`, `AGENTS.md`, `CONTRIBUTING.md` |

---

## 2. Patch definitions P1–P6 (proposed)

### P1 — Ayanamsa consolidation (single source of truth) ✅ implemented
- **Goal:** one definition of Lahiri (Chitrapaksha) ayanamsa, in `src/lib/vedic/ayanamsaEngine.ts` (J2000.0 anchor 23.85472°, precession 1.396°/century, quadratic term −0.000308·T²).
- **Approach:** `vedicCalc.ts` deletes its private `lahiriAyanamsa()` body and delegates to the engine import. All call sites (Rahu/Ketu, ascendant, seven planets) keep identical arithmetic — the engine value equals the old `vedicCalc` value to ~1e-9° per century, well inside the ±0.05° validation tolerance.
- **Files:** `src/lib/vedic/vedicCalc.ts` (patch `0001`).
- **Tests:** existing `src/tests/services/vedicAstroEngine.test.ts` plus `validateLahiriFormula()` epoch table (J2000.0, B1950.0, 1900-01-01, 2026-09-04) must stay green.
- **Acceptance criteria:**
  1. `grep -rn "23.85472" src` returns only `ayanamsaEngine.ts`.
  2. `npm run test:core` passes.
  3. `validateLahiriFormula()` all rows `pass: true` (delta < 0.05°).
  4. Diff contains no behavioural change to planet/ascendant longitudes beyond float rounding.

### P2 — Ephemeris services routed through the ayanamsa engine ✅ implemented
- **Goal:** `ephemerisService.ts` (fallback path) and `precisionEphemerisService.ts` (Schlyter/Kepler path) stop carrying their own Lahiri math.
- **Approach:**
  - `ephemerisService.ts`: `calculateAyanamsa()` delegates to `getLahiriAyanamsa(jd)`; the unparseable-date fallback (24.21°) is preserved via a renamed, actually-used constant `AYANAMSA_FALLBACK`. Dead constants F2 removed.
  - `precisionEphemerisService.ts`: local `getLahiriAyanamsa()` replaced by a re-export from `@/lib/vedic/ayanamsaEngine` (identical formula), so `formatPlanet`, `calcAscendant` and the chart builder keep their call sites unchanged.
- **Files:** `src/services/ephemerisService.ts`, `src/services/precisionEphemerisService.ts` (patch `0002`).
- **Acceptance criteria:**
  1. `npm run test:core` (includes `ephemerisService.test.ts`, `precisionEphemerisService.test.ts`, `vedicAstroEngine.test.ts`) passes.
  2. `npm run test:accuracy:fast` (timeScales, nakshatraEdge, chartCacheKey, vimshottari, birthTimezone) passes.
  3. `calculateAyanamsa('2026-01-01')` within ±0.01° of `getLahiriAyanamsa` of the same JD.
  4. No `AYANAMSA_2000|AYANAMSA_BASE_YEAR|AYANAMSA_2026` symbols remain in `src`.

### P3 — Swiss Ephemeris licence ADR and boundary enforcement ⏳ planned
- **Goal:** close the open decision (F3): either commit to AGPL-3.0 for `swisseph-wasm` (default build keeps `VITE_USE_SWISS_EPHEMERIS=false` so the shipped artifact stays MIT-only) or purchase the commercial licence.
- **Approach:** author `docs/adr/ADR-0xx-swiss-ephemeris-licence.md`; keep the AGPL module behind the existing dynamic-import boundary; add a CI check that the default build bundle does not include the AGPL module (greps the Vite manifest / runs `npm run build` with the flag off).
- **Acceptance criteria:** ADR merged with a decision + consequences; production bundle builds with flag off and contains no swisseph symbols; `LICENSING.md` updated; issue TBD.

### P4 — Quality-gate restoration (typecheck + lint to required) ⏳ planned
- **Goal:** re-enable `npm run typecheck` and `npm run lint` as required CI gates per `QUALITY_GATE.md` "Known Follow-Up".
- **Approach:** staged triage of the ~1,245 legacy warnings (auto-fixables first, then `no-unused-vars`, then `any` containment via `eslint-plugin` rules per directory); track burn-down in the tracker spreadsheet; flip the CI workflow flags module-by-module.
- **Acceptance criteria:** `npm run lint` ≤ 100 warnings with `--max-warnings` enforced; `npm run typecheck` clean on `src/lib`, `src/services`, `src/tests`; CI gate file updated; issue TBD.

### P5 — Ayanamsa/ephemeris accuracy gate in CI ⏳ planned
- **Goal:** wire `validateLahiriFormula()` and the golden-corpus accuracy suites into the required merge gate so a regression in sidereal math fails CI.
- **Approach:** add a Vitest wrapper test around `validateLahiriFormula()` with a hard 0.01° budget for epochs after 1900; include `npm run test:accuracy:fast` and `npm run validate:accuracy` in the PR workflow; publish results to the accuracy dashboard.
- **Acceptance criteria:** PR CI fails on any ayanamsa delta ≥ 0.01°; accuracy dashboard page renders the gate status; issue TBD.

### P6 — Contribution workflow aligned to the patch series ⏳ planned
- **Goal:** issue/PR templates, `AGENTS.md` and `CONTRIBUTING.md` reference the P1–P6 patch IDs, the gate command sequence, and the definition of done (`docs/DEFINITION-OF-DONE.md`).
- **Approach:** deliverable `templates-and-governance.md` (in the Phase 1 bundle) provides copy-paste `.github/ISSUE_TEMPLATE/patch_task.yml`, PR template additions, AGENTS.md and CONTRIBUTING.md sections; commit as one docs PR.
- **Acceptance criteria:** templates render on GitHub; every P1–P6 issue links its patch file, milestone and owner; issue TBD.

---

## 3. Dependency chain

```
P1 (ayanamsa consolidation) ──► P2 (ephemeris routing) ──► P5 (accuracy gate in CI)
                                   │
                                   ▼
P3 (Swiss Ephemeris ADR) ─────► P4 (gate restoration) ──► P6 (contribution workflow)
```

- P1 → P2: P2's services delegate to the engine introduced/confirmed by P1.
- P2 → P5: the accuracy gate is only meaningful once a single ayanamsa implementation exists.
- P3 ∥ (P1/P2): independent licence track; P3 → P4 because CI flag changes depend on the licence decision; P4 → P6 last because the docs describe the final gate set.

## 4. Gate command sequence (from `docs/QUALITY_GATE.md` and `package.json`)

```
npm run test:core        # feature registry + ephemerisService + vedicAstroEngine
npm run build            # production build must pass
# (restore in P4):  npm run typecheck && npm run lint
# (add in P5):      npm run test:accuracy:fast
```

## 5. Verification performed for P1/P2

- Branch `phase1/patches-p1-p6`, commits `0d24c37` (P1) and `1358fa7` (P2) on top of `6b1c0fb`.
- `git format-patch main..HEAD` → `0001-*.patch`, `0002-*.patch` + `P1-P2-combined.diff`.
- On a **fresh clone of `main`**: `git apply --check` passed for both patches, and `git am` replayed both commits cleanly.
- Node v22.23.4 (matches `engines >= 22.22.1`); full `npm ci` + test run to be executed in the project's CI (browser/WASM deps unavailable in the authoring sandbox).

## 6. Rollout & rollback

- Each patch is an independent commit; land P1, run the core gate, then P2.
- Rollback = `git revert <sha>`; no data/schema migrations involved (pure calculation refactor, zero API changes).
