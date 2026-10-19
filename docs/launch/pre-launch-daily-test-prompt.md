# Global Daily Pre-Launch Test Prompt

**Purpose:** A single, repeatable instruction that must be executed **once per day, before the app
goes live (or before any production deploy)**. It exercises the full quality spine of Vedic
Rajkumar — static checks, unit/integration tests, ephemeris accuracy, accessibility, production
build, and a **live-browser robustness sweep with randomly generated birth data and multidimensional
questions**.

**Rule of engagement:** Do not launch / deploy unless **every mandatory gate below is GREEN**, or a
documented `RISK_ACCEPTED` disposition exists for the specific failing item.

---

## How To Use This Prompt

Paste the block below into the agent (or read it as a runbook) to trigger a full pre-launch sweep.
The agent must run the gates **in order**, capture evidence, and report a final GO / NO-GO verdict.

> **PROMPT (copy verbatim):**
>
> ```
> Run the Global Daily Pre-Launch Test Sweep for Vedic Rajkumar.
> Execute gates G0→G5 in order (G6 optional/periodic). Do not stop on a failure — collect all
> results, then emit a single GO / NO-GO verdict with evidence.
> For each gate report: command run, exit code, pass/fail, and artifact path.
> Treat any uncaught browser page error, any new console error, or any accuracy regression as a
> STOP-THE-LAUNCH condition until dispositioned.
> Finish with a "Pre-Launch Certification" table and the exact report artifact paths.
> ```

---

## Prerequisites

1. Node `>= 22.22.1` (see `engines` in [package.json](file:///e:/Rajkumar/Vedic_Rajkumar/package.json)).
2. Dependencies installed: `npm ci` (or `npm install`).
3. A Playwright browser available. This repo's robustness config reuses the **system Edge**
   (`channel: 'msedge'`) to avoid downloading bundled Chromium. Ensure
   `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` exists, or override the channel.
4. Environment: do **not** run with `CI=true` when reusing a manually started dev server — it forces
   Playwright to spawn its own server and can conflict on port `5173`. Clear it first:
   `$env:CI=$null`.

---

## Gate Matrix

| Gate | Name | Command | Blocking? |
| ---- | ---- | ------- | --------- |
| G0 | Static analysis | `npm run typecheck` · `npm run lint` | Typecheck: **yes**. Lint: advisory (see note) |
| G1 | Unit / integration | `npm run test:run` | **Yes** |
| G2 | Ephemeris accuracy | `npm run validate:accuracy` | **Yes** |
| G3 | Accessibility | `npm run test:a11y` | **Yes** |
| G4 | Production build | `npm run build` | **Yes** |
| G5 | Live-browser robustness | `npx playwright test --config=playwright.robustness.config.ts` | **Yes** |
| G6 | Performance budget | `npm run test:perf` | Periodic (weekly / pre-major-release) |

> **Lint note:** per [QUALITY_GATE.md](file:///e:/Rajkumar/Vedic_Rajkumar/docs/QUALITY_GATE.md),
> `npm run typecheck` / `npm run lint` still surface legacy issues outside the focused scope. Lint is
> advisory: **new** errors in changed files are blocking; pre-existing legacy noise is not.

---

## G0 — Static Analysis

```
npm run typecheck
npm run lint
```

- **Pass:** `tsc --noEmit` exits 0.
- **Fail:** any type error in `src/` → investigate; do not ship.
- Capture the count of new lint errors vs. the legacy baseline.

## G1 — Unit / Integration Tests

```
npm run test:run
```

- **Pass:** 0 failing tests. The suite is ~1100+ tests (Vitest).
- Faster focused variant acceptable for hotfixes: `npm run ci:core`
  (`test:core` + `build`), which covers feature-registry/nav integrity, Swiss ephemeris behavior, and
  Vedic engine boundary cases (nakshatra + Vimshottari totals).

## G2 — Ephemeris Accuracy Validation

```
npm run validate:accuracy
```

- Validates against **15 reference charts** with Swiss Ephemeris comparison (sidereal / Lahiri
  ayanamsa), extended with house cusps and antardasha validation.
- **Artifacts:** `dist/accuracy-report.txt`, `dist/accuracy-summary.json`.
- **Pass:** no regression versus the previous day's summary. Any drift in planetary longitudes,
  house cusps, or dasha dates is **STOP-THE-LAUNCH** until explained.

## G3 — Accessibility

```
npm run test:a11y
```

- **Pass:** 0 failures (a11y gap suite).

## G4 — Production Build

```
npm run build
```

- **Pass:** Vite build succeeds with no errors; bundle emitted to `dist/`.
- **Fail:** build error, missing asset, or Tailwind v4 / PostCSS regression.

## G5 — Live-Browser Robustness (Random Birth Data + Multidimensional Questions)

This is the core "real user" stress test. It drives the actual app in a real browser with
**deterministic pseudo-random birth data** and a fixed matrix of **17 multidimensional Prashna
questions**, asserting the UI never crashes and records **zero uncaught page errors**.

### Run

```
# 1) Start the dev server (separate terminal), or let the Playwright webServer do it
npm run dev -- --host 127.0.0.1

# 2) Run the robustness sweep (clears CI so it reuses the existing server)
$env:CI=$null; npx playwright test --config=playwright.robustness.config.ts
```

### What it exercises

- **Random birth data** — seeded PRNG (`mulberry32`) generating name, gender, date (1930–2024),
  time, and one of 8 real Indian places with coordinates. Reproducible via the seed.
- **Horoscope leg** — submits the birth form on `/horoscope` and asserts a result renders.
- **Prashna leg** — 17 multidimensional questions spanning:

  `career · business · marriage · partner-timing · education · foreign-study · finance · property ·
  health · legal · children · spiritual · …` plus edge cases:

  - **Hindi (Devanagari)** input,
  - **emoji / mixed-script** input,
  - **oversized** input (long text repeated 3×),
  - **numeric-garbage** input.

### Assertions / pass criteria

- Every question renders a verdict region
  (`[aria-label="Prashna analysis result"]` / `"प्रश्न विश्लेषण परिणाम"`).
- `pageErrors` is **empty for all cases** (zero uncaught exceptions).
- **Zero NEW console errors.** Known-acceptable baseline: none (the two defects previously observed
  — `this.getTargetHouse is not a function` and a `validateDOMNesting` warning — were fixed on
  2026-10-17 and must not reappear).
- No HTTP 404s for app resources.

### Artifacts

- `reports/robustness/report.json` — per-case record: birth data, question, verdict, console/page
  errors, timings.
- Screenshots on failure under the Playwright output dir.

### Windows / sandbox notes

- If a run aborts with `ENOTEMPTY: directory not empty, rmdir '…test-results…'`, rename the stale
  output dir aside and re-run with a fresh `--output=` path (file-lock workaround).
- If the dev server fails to start with `ENOTEMPTY … node_modules\.vite\deps`, rename
  `node_modules\.vite` → `.vite_bak_<timestamp>` and restart.

## G6 — Performance (Periodic)

```
npm run test:perf
```

- Target: **Lighthouse mobile score > 90** (see `.lighthouserc.json`). Ads/analytics should not
  regress the mobile budget.

---

## Verdict & Evidence Format

Emit exactly this table, then a one-line verdict.

| Gate | Result | Evidence |
| ---- | ------ | -------- |
| G0 Static | PASS / FAIL | typecheck exit 0; N new lint errors |
| G1 Unit/Integration | PASS / FAIL | X passed / Y failed |
| G2 Accuracy | PASS / FAIL | `dist/accuracy-summary.json` |
| G3 A11y | PASS / FAIL | 0 failures |
| G4 Build | PASS / FAIL | `dist/` emitted |
| G5 Robustness | PASS / FAIL | `reports/robustness/report.json` — 23/23, 0 page errors |
| G6 Perf (optional) | PASS / FAIL / N/A | Lighthouse score |

**Verdict:** `GO — all mandatory gates green` **or** `NO-GO — <gate(s)> red; disposition required`.

---

## STOP-THE-LAUNCH Conditions

Any of the following blocks launch until fixed or a written `RISK_ACCEPTED` disposition is recorded:

1. Non-empty `pageErrors` in the robustness report.
2. New console error type not present in the previous day's baseline.
3. Any accuracy regression in planetary positions, house cusps, or dasha dates.
4. `npm run build` failure.
5. Any failing unit/integration test.
6. A type error in code changed since the last green run.

---

## Change Log

- **2026-10-17** — Initial global daily pre-launch prompt. Introduced alongside the G5 live-browser
  robustness harness (`tests/e2e/robustness-random-birth.spec.ts`) and the fixes for the two
  defects it surfaced (missing `getTargetHouse()` in the subjective analysis engine; invalid
  `Badge`-inside-`<p>` DOM nesting on the Question page).
