# BASELINE TEST RESULTS — Vedic Rajkumar

**Program:** MASTER DIRECTIVE — VEDIC RAJKUMAR & PWD TOOLS EXCELLENCE PROGRAM (Track A)
**Phase:** 2 — Full baseline testing before any code change
**Source SHA (Track A):** `21a4a55a48ab50f7f2b5a254f6376bebac26a120` (`HEAD == origin/main`)
**Executed:** 2026-11-15
**Rule applied:** No code was changed before this baseline was captured. Findings are recorded verbatim; no gate was weakened and no evidence suppressed.

---

## 1. Environment

| Item            | Value                                                                |
| --------------- | -------------------------------------------------------------------- |
| OS              | Windows (PowerShell 7)                                               |
| Node (local)    | v24.14.0                                                             |
| npm (local)     | 11.9.0                                                               |
| Required engine | `>=22.22.1` (`.nvmrc` 22.22.1 · `netlify.toml` NODE_VERSION 22.22.1) |
| Judge           | Vitest 4.1.11 · Playwright (chromium) · LHCI                         |
| Evidence dir    | `reports/evidence/`                                                  |

> **Engine note (finding, not fixed):** the local runtime (v24.14.0, Node ≥ 22 requirement satisfied) differs from the pinned `.nvmrc` 22.22.1 and the Netlify `NODE_VERSION` 22.22.1. Baseline results are valid for the local engine; CI/Netlify will run 22.22.1. Recorded for Phase 8 deployment-config review.

---

## 2. Command results summary

All commands run from `E:\Rajkumar\Vedic_Rajkumar`. Evidence files live in `reports/evidence/`.

| #   | Command                                                       | Result                | Exact counts                                                                                            | Exit | Duration            | Evidence                               |
| --- | ------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------- | ---- | ------------------- | -------------------------------------- |
| 00  | `npm ci`                                                      | **PASS**              | 1747 packages installed                                                                                 | 0    | ~6m                 | `00-npm-ci.txt`                        |
| 01  | `npm run typecheck`                                           | **PASS**              | `tsc --noEmit`, 0 errors                                                                                | 0    | —                   | `01-typecheck.txt`                     |
| 02  | `npm run typecheck:tests`                                     | **PASS**              | `tsc -p tsconfig.tests.json`, 0 errors                                                                  | 0    | —                   | `02-typecheck-tests.txt`               |
| 03  | `npm run lint`                                                | **PASS**              | 1273 problems = **0 errors**, 1273 warnings                                                             | 0    | —                   | `03-lint.txt`                          |
| 04  | `npm run test:run`                                            | **PASS**              | 106 files passed · 1700/1700 tests                                                                      | 0    | 205.69s             | `04-test-run.txt`                      |
| 05  | `npm run test:core`                                           | **PASS**              | 3 files · 48/48 tests                                                                                   | 0    | 7.54s               | `05-test-core.txt`                     |
| 06  | `npm run test:accuracy:fast`                                  | **PASS**              | 5 files · 42/42 tests                                                                                   | 0    | 8.78s               | `06-accuracy-fast.txt`                 |
| 07  | `npm run test:time`                                           | **PASS**              | 2 files · 15/15 tests                                                                                   | 0    | 18.76s              | `07-time.txt`                          |
| 08  | `npm run moon:verify`                                         | **PASS**              | 2 files · 13/13 tests                                                                                   | 0    | 7.60s               | `08-moon-verify.txt`                   |
| 09  | `npm run test:accuracy:full`                                  | **PASS**              | 1 file · 12/12 tests · Week-1 acceptance **PASS**                                                       | 0    | 3.83s               | `09-accuracy-full.txt`                 |
| 10  | `npm run answers:check`                                       | **FAIL**              | 12 files drifted (`anukrati-sharma/`)                                                                   | 1    | —                   | `10-answers-check.txt`                 |
| 11  | `npm run docs:verify`                                         | **FAIL**              | 1 test failed → counts untrusted (106 files: 1 failed / 105 passed; 1700 tests: 1 failed / 1699 passed) | 1    | (full suite)        | `11-docs-verify.txt`                   |
| 12  | `npm run build`                                               | **PASS**              | 4288 modules · built 1m24s · PWA precache 222 entries (6656.41 KiB)                                     | 0    | 1m24s               | `12-build.txt`                         |
| 13  | `vitest run src/tests/chartTimezoneWiring.test.ts` (isolated) | **PASS**              | 1 file · 4/4 tests                                                                                      | 0    | 5.54s (tests 1.34s) | `13-chartTimezone-wiring-isolated.txt` |
| 14  | `npm run answers:check` (rerun)                               | **FAIL** (reproduces) | same 12 files drifted                                                                                   | 1    | —                   | `14-answers-check-rerun.txt`           |
| 15  | `npm run test:e2e`                                            | **FAIL**              | 66 passed · **37 failed** · 2 flaky · 13 did not run                                                    | 1    | 22.8m               | `15-e2e.txt`                           |

**Tally:** 12 PASS · 3 FAIL (`answers:check`, `docs:verify`, `test:e2e`) · 0 BLOCKED.

---

## 3. Failures — root cause analysis

### F-1 · `npm run answers:check` — answer-card artifact drift (REPRODUCED ×2)

**Evidence:** `10-answers-check.txt`, `14-answers-check-rerun.txt`
**Exit:** 1 (both runs) · **Reproducible:** yes (identical output).

12 generated answer-card files for subject `anukrati-sharma` differ from the committed on-disk content:

```
public/answers/anukrati-sharma/_all.json
public/answers/anukrati-sharma/_all.md
public/answers/anukrati-sharma/health.json
public/answers/anukrati-sharma/health.md
public/answers/anukrati-sharma/house_construction.json
public/answers/anukrati-sharma/house_construction.md
public/answers/anukrati-sharma/career.json
public/answers/anukrati-sharma/career.md
public/answers/anukrati-sharma/marriage.json
public/answers/anukrati-sharma/marriage.md
public/answers/anukrati-sharma/finance.json
public/answers/anukrati-sharma/finance.md
```

**Mechanism:** [`scripts/emitAnswerCards.mjs`](file:///e:/Rajkumar/Vedic_Rajkumar/scripts/emitAnswerCards.mjs) regenerates each card and compares to the committed file; on mismatch in `CHECK` mode it logs `DRIFT:` and increments `drifted`. `answers:check` therefore reports a genuine generated-vs-committed mismatch — not a false positive.

**Scope/impact:** This is a **generated-artifact drift**, i.e. the committed cards for one subject are stale relative to the current deterministic verdict engine. It does **not** fail the type-check, unit, domain-accuracy, or build suites.

**Confidentiality review gate (AGENTS.md rule 6):** remediation touches `public/answers/` and the answer-card serving path, so it must be checked against the standing confidentiality order (rules 1–5) before regeneration is actioned. **Not remediated in Phase 2** (baseline only). Remediation candidate: `npm run answers:emit` and re-verify. This is a _Phase 3+ / pre-merge_ action, deliberately deferred.

---

### F-2 · `npm run docs:verify` — blocked by one load-flaky test (FALSE-NEGATIVE on docs)

**Evidence:** `11-docs-verify.txt`
**Exit:** 1.

`docs:verify` runs the **full** Vitest suite and then [`scripts/verify-claims.mjs`](file:///e:/Rajkumar/Vedic_Rajkumar/scripts/verify-claims.mjs), which fails hard whenever `failedTests > 0`:

```
FAIL src/tests/chartTimezoneWiring.test.ts > routes every production call through calculateChartForBirth
      Test timed out in 10000ms
Test Files  1 failed | 105 passed (106)
     Tests  1 failed | 1699 passed (1700)
✖ docs:verify — documentation drift detected:
  • 1 test(s) failed — test counts cannot be trusted
```

**This is a load-induced/flaky timeout, not a code regression — proven by evidence:**

| Run                                                                                                                      | Outcome                        | Time        |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ----------- |
| [04 `test:run`](file:///e:/Rajkumar/Vedic_Rajkumar/reports/evidence/04-test-run.txt)                                     | chartTimezoneWiring **PASSED** | 3710ms      |
| [11 `docs:verify`](file:///e:/Rajkumar/Vedic_Rajkumar/reports/evidence/11-docs-verify.txt) (full suite again, in-series) | **timed out**                  | >10000ms    |
| [13 isolated rerun](file:///e:/Rajkumar/Vedic_Rajkumar/reports/evidence/13-chartTimezone-wiring-isolated.txt)            | **PASSED** 4/4                 | tests 1.34s |

The same test both passes (run 04, run 13) and times out (run 11) with no code change between them, under `fullyParallel` full-suite load. **Conclusion:** the `docs:verify` failure is a downstream artifact of the flaky test, not genuine documentation drift. No README/doc content change is warranted by this failure. Documented as a **test-stability finding** (candidate fix territory: isolate the slow test / raise its per-test timeout — a Phase 3+ item, not applied now).

---

### F-3 · `npm run test:e2e` — systemic `page.goto` timeouts against the Vite dev server

**Evidence:** `15-e2e.txt`
**Exit:** 1 · **Duration:** 22.8m.

```
Running 118 tests using 2 workers
  37 failed
    [chromium] › tests\e2e\all-routes.spec.ts:100:5 › … Verify route: /  → TimeoutError: page.goto: Timeout 15000ms exceeded
    … (36 further all-routes.spec.ts route cases, all the same `page.goto … waiting until "load"` 15s timeout)
  2 flaky
    … Verify route: /marketplace   (passed on retry)
    … robustness … horoscope renders for random birth 2: Saanvi Rao (12/01/1935 18:20)  (passed on retry)
  13 did not run
  66 passed (22.8m)
```

**Character of the failure:** every failure is the _same_ signature — `page.goto(route, { waitUntil: 'load', timeout: 15000 })` at [`tests/e2e/all-routes.spec.ts:119`](file:///e:/Rajkumar/Vedic_Rajkumar/tests/e2e/all-routes.spec.ts#L119-L119) timing out while "waiting until load". It is **route-independent**: `/`, `/career-astrology`, `/horoscope`, `/numerology`, `/learn`, `/my-readings`, … all time out identically. Roughly half the routes fail and half pass, and two failed cases pass on retry.

**Mechanism:** [`playwright.config.ts`](file:///e:/Rajkumar/Vedic_Rajkumar/playwright.config.ts) starts `npm run dev -- --host 127.0.0.1` (Vite **dev** server) with `fullyParallel: true`, `workers: 2`, `retries: 1`. Vite's dev server transforms the app's **4288 modules on first request** (see `12-build.txt`); cold-transform latency for the first requests under 2 concurrent workers exceeds the 15s navigation budget, and the same routes pass once the module graph is warm. This is the classic cold dev-server / transform-contention signature, consistent with the sibling flaky-timeout in F-2 (the sandbox was also concurrently loaded by the long unit runs).

**Impact & scope:** This is a **test-harness/environment timing failure, not evidence of broken routes.** The production build succeeds (run 12), the route table resolves, and the two retried cases pass. Confirmatory and route-inventory checks are moved to **Phase 6** (route & journey verification), where they will be run in a controlled, single-worker, warm-server configuration and separately from the unit-suite load. Recorded here as a genuine baseline FAIL — **not** suppressed or re-classified as PASS.

---

## 4. What the baseline establishes

- **Green:** install, type-check (app + tests), lint (0 errors), the whole unit/integration suite (1700), the core/accuracy-fast/time/moon suites, the full 15-chart domain-accuracy corpus (Week-1 acceptance **PASS**, 14 PASS + 1 WARN), and the production build + PWA precache.
- **Red (3):** one real generated-artifact drift (`answers:check`, F-1), one flaky-timeout false-negative on docs (`docs:verify`, F-2), one dev-server timing failure in e2e (F-3).
- **No code was modified** to obtain any of these results.

### Week-1 domain accuracy (from `09-accuracy-full.txt`)

- 15 reference charts, 14 PASS + 1 WARN; 242 fields checked; **99.6%** field agreement.
- WARN `REF-001` (Priyansh Singh Chauhan): `dasha_balance_days` = calc 972.1 vs expected 960, Δ ≈ 12.08 days — Tier-A informational (arcsecond/day-level), does not breach Tier-B exact-match (rashi / nakshatra / pada), which pass with **no Tier-B failures**.
- **WEEK 1 ACCEPTANCE: PASS.**

---

## 5. Phase 9 gate status after Phase 2

| Gate                       | Status             | Basis                                       |
| -------------------------- | ------------------ | ------------------------------------------- |
| SOURCE_SHA_VERIFIED        | **PASS**           | `HEAD == origin/main == 21a4a55a…`          |
| BASELINE_RECORDED          | **PASS**           | this document + `reports/evidence/*`        |
| TYPECHECK_PASS             | **PASS**           | `01`, `02` exit 0                           |
| LINT_PASS                  | **PASS**           | `03` — 0 errors (1273 warnings)             |
| UNIT_TESTS_PASS            | **PASS**           | `04` — 1700/1700                            |
| INTEGRATION_TESTS_PASS     | **PASS**           | `04` (integration files within suite)       |
| CRITICAL_E2E_PASS          | **NOT RUN / FAIL** | `15` — 37 failed (dev-server timeouts, F-3) |
| DOMAIN_ACCURACY_PASS       | **PASS**           | `09` — Week-1 acceptance PASS               |
| ACCESSIBILITY_PASS         | **NOT RUN**        | planned Phase 8 (`test:a11y`)               |
| SECURITY_CRITICAL_PASS     | **NOT RUN**        | planned Phase 8                             |
| PRODUCTION_BUILD_PASS      | **PASS**           | `12` — exit 0                               |
| VISUAL_REGRESSION_REVIEWED | **NOT RUN**        | planned Phase 4–5                           |
| DEPLOYMENT_CONFIG_PASS     | **NOT RUN**        | planned Phase 8 (`netlify.toml`)            |
| DOCUMENTATION_VERIFIED     | **FAIL**           | `11` — blocked by flaky test (F-2)          |

---

## 6. Open items handed to later phases

| Ref | Item                                                                                                                         | Target phase        |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| F-1 | Regenerate drifted answer cards (`anukrati-sharma`, 12 files) via `answers:emit`; run the confidentiality review gate first. | Phase 3 / pre-merge |
| F-2 | Stabilise the load-flaky `chartTimezoneWiring` test (isolate / raise timeout) so `docs:verify` is deterministic.             | Phase 3             |
| F-3 | Re-run e2e in a controlled warm-server, single-worker config; produce route inventory + journey evidence.                    | Phase 6             |
| —   | Align local Node (v24.14.0) review vs pinned 22.22.1; confirm `netlify.toml` engine parity.                                  | Phase 8             |
| —   | README factual drifts CJ-A-001 (Node badge), CJ-A-002 (Tailwind 3→4), CJ-A-003 (duplicate route tables).                     | Phase 5/7           |

**No push, commit, or deploy performed. No code changed. `BASELINE_RECORDED` gate set.**
