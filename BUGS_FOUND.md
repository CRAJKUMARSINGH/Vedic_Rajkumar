# Vedic Rajkumar — Engineering Review

**Audit snapshot:** public repository at `08d3433` (`main`), reviewed 2026-10-08  
**Working changes:** local branch `feature/enterprise-hardening`; no GitHub write access was used.

## Executive summary

The application test suite passes, the production dependency audit is clean after dependency upgrades, and several runtime, CI, and test-runner defects were fixed in the working tree. The most serious remaining issue is apparent personal birth-profile data in publicly served source data and a committed PDF. The build/typecheck and browser E2E results remain inconclusive in this restricted environment.

## Findings

### Critical — apparent personal data is exposed by the public repository

**Status: Open; owner chose to leave the current records unchanged in this review.**

- `src/data/jataks/JATAKS_DATABASE.json` contains records with names, birth dates, birth times, locations, and relationship labels. The file is imported by the client application, so this information is included in data served to browsers.
- `PRIYANSH_JOINING_MUHURAT_GANESH_REPORT.pdf` is also committed at the repository root and appears to contain an identifiable report.
- The repository is public. Treat these as real personal data unless their owner confirms they are synthetic and approved for publication.
- Removing the current files would not remove prior copies from public Git history or existing clones. A safe remediation needs synthetic replacement data, removal of the report, and coordinated history cleanup. No personal values are repeated here.

### High — clean dependency installation was broken

**Status: Fixed locally.**

The lockfile combined Vitest 4 with an incompatible Vite 5 root dependency, resolving a nested Vite 8 without the esbuild platform packages required by `npm ci`. CI installation failed before tests could run. Vite and its React plugin were aligned to compatible Vite 7 releases and the lockfile was regenerated. A clean `npm ci` then completed successfully.

### High — vulnerable production dependency versions

**Status: Fixed locally; production audit verified.**

The prior dependency tree included vulnerable jsPDF 3.x and React Router 6.x versions. They were upgraded to jsPDF `4.2.1` and React Router DOM `7.18.4`; Vite was upgraded to `7.3.7`. The previous security documentation incorrectly described PDF generation as server-only; it now acknowledges browser-side use.

`npm audit --omit=dev --audit-level=moderate` now reports **0 production vulnerabilities**. A separate full-tree audit still reports **9 development-tooling advisories** (5 high, 4 moderate); see the open dependency debt below.

### High — conditional React Hooks could break component renders

**Status: Fixed locally.**

- `src/components/DashboardShell.tsx`: `PsychologyTab` returned before calling `useState` when profile data was absent.
- `src/components/supplements/YogaInsightsPanel.tsx`: the input-state return came before result-dependent `useMemo` calls.

The hooks now execute unconditionally, preserving hook order when data changes between renders.

### High — key-shaped demo values were shipped in browser code

**Status: Fixed locally.**

`EnterpriseDashboard` included public/private API-key and webhook-secret-shaped placeholder values in client-side mock data. They were replaced with configured/not-configured metadata booleans. The scan did not verify any real credential value.

### Medium — bookmark UI could report success when storage failed

**Status: Fixed locally.**

The question bookmark handler marked a question saved before attempting `localStorage` and silently ignored storage exceptions. It now marks success only after the storage operation completes and shows an error toast when browser storage is unavailable.

### Medium — Playwright's default test discovery was misconfigured

**Status: Discovery/configuration fixed locally; browser execution not verified.**

Without a Playwright config, `playwright test` discovered Vitest tests under `src/`, failed because Vitest globals were unavailable, and also reached an E2E file importing undeclared `@faker-js/faker`. Added `playwright.config.ts` to scope discovery to `tests/e2e`, start Vite automatically, and configure Chromium. The duplicated Faker-based smoke test was replaced with deterministic synthetic input. `npx playwright test --list` now discovers **95 tests across 3 E2E files**.

The E2E run could not be completed here: Chromium initially lacked system libraries; after installing them, the page fixture timed out at 30 seconds and the separate Vite dev-server process reported that its esbuild dependency-optimization service stopped. This is **not** a passing E2E result.

### Medium — lint debt remains large

**Status: Open.**

The app/source lint command now completes with **0 errors and 1,245 warnings**. Most warnings are existing `any` types and unused imports/variables across application and test files. The repo-wide lint command previously also traversed scratch scripts and other non-application files; the maintained lint command now targets application code, Supabase functions, tests, and active config files.

### Medium — development dependency advisories remain

**Status: Open; made visible without blocking production releases.**

The full npm audit reports **5 high and 4 moderate** advisories in development-only tooling. The production-only audit is clean. CI now blocks on moderate-or-higher production advisories and records the full dependency audit as non-blocking so these dev-tool findings remain visible while they are triaged.

## Validation results

| Check | Result |
|---|---|
| `npm ci` | Passed after Vite/Vitest lockfile alignment |
| `npm run test:run` | **69 test files passed; 1,316 tests passed** |
| `npm run lint` | Passed with 0 errors; 1,245 warnings remain |
| `npm audit --omit=dev --audit-level=moderate` | Passed; 0 production vulnerabilities |
| `npx playwright test --list` | Passed; 95 E2E tests discovered |
| Browser E2E execution | Inconclusive; page fixture timed out and Vite/esbuild stopped in this environment |
| `npm run build` | Inconclusive; process exited 137 under the workspace's 1.6 GiB memory limit |
| `npm run typecheck` | Inconclusive; did not finish within the 5-minute command limit; no TypeScript diagnostics were produced |

The build/typecheck outcomes are environment limitations, not evidence that either check passes or fails on the target CI runner. The CI workflow was strengthened to run lint, typecheck, the full Vitest suite, and the production build on pull requests.

## Follow-up

The apparent personal chart records and committed report remain unchanged by decision. The public exposure risk therefore remains; if remediation is approved later, replace them with synthetic fixtures and coordinate a public Git-history cleanup.
