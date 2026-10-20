# Vedic Rajkumar — Engineering Review

**Reviewed base:** public `main` at `947454f` (`fix(build): resolve Netlify build failures — vite-plugin-pwa, swisseph, flagsmith`)  
**Review date:** 2026-10-09  
**Working changes:** local branch `feature/enterprise-hardening-947454f`; nothing pushed.

## Executive summary

The latest remote build fix is retained: the PWA continues to use `generateSW`, the Swiss Ephemeris browser aliases remain in place, and `vite-plugin-pwa` is upgraded to `1.3.0`, which supports Vite 7. The full Vitest suite and a clean dependency installation pass. Production dependency audit is clean after upgrading jsPDF and React Router. Apparent personal chart data remains public by the owner's decision; that risk is still open. Production build and browser E2E results were not established in this constrained workspace.

## Findings

### Critical — apparent personal data in public app artifacts

**Status: Open; owner chose to leave the current records unchanged.**

- `src/data/jataks/JATAKS_DATABASE.json` contains records with names, birth dates, birth times, locations, and relationship labels. The file is imported into the client application and is served to browsers.
- `PRIYANSH_JOINING_MUHURAT_GANESH_REPORT.pdf` is also committed at the repository root and appears to contain an identifiable report.
- The repository is public. Treat these as real personal data unless their owner confirms they are synthetic and approved for publication.
- The current patch intentionally leaves these files untouched. Removing present-day copies would not erase public Git history or existing clones; remediation would require synthetic replacements and coordinated history cleanup. No personal values are repeated here.

### High — vulnerable production dependency versions

**Status: Fixed locally; production audit verified.**

The latest remote still used jsPDF `3.0.4` and React Router DOM `6.30.1`, which were within the vulnerable ranges previously identified. The patch upgrades them to jsPDF `4.2.1` and React Router DOM `7.18.4`. It also upgrades Vite to `7.3.7`, the React plugin to `5.2.0`, and the PWA plugin to `1.3.0` so it remains compatible with Vite 7 while preserving the latest remote's `generateSW` approach.

`npm audit --omit=dev --audit-level=moderate` reports **0 production vulnerabilities**. The full audit still reports **9 development-tooling advisories** (5 high, 4 moderate).

### High — clean dependency installation and CI reliability

**Status: Fixed locally.**

The latest remote paired Vitest 4 with Vite 5, even though Vitest 4 requires Vite 6, 7, or 8. The updated lockfile aligns the toolchain and `npm ci` now completes successfully. CI now runs lint, typecheck, the full Vitest suite, and the production build on pull requests. Workflow and Netlify Node versions were raised to `22.22.1` to meet dependency engine requirements.

### High — conditional React Hooks could break renders

**Status: Fixed locally.**

- `src/components/DashboardShell.tsx`: `PsychologyTab` returned before calling `useState` when profile data was missing.
- `src/components/supplements/YogaInsightsPanel.tsx`: the input-view return preceded result-dependent `useMemo` calls.

The hooks now execute unconditionally, so hook order remains stable across data-loading states.

### High — key-shaped demo values in browser code

**Status: Fixed locally.**

The enterprise dashboard mock exposed public/private API-key and webhook-secret-shaped placeholders. It now stores only configured/not-configured metadata booleans. No real credential was verified.

### Medium — bookmark handler could claim success when storage failed

**Status: Fixed locally.**

The handler previously marked a question saved before attempting `localStorage` and silently swallowed errors. It now marks success only after storage succeeds and shows an error toast when storage is unavailable.

### Medium — Playwright discovery selected Vitest files

**Status: Discovery/configuration fixed locally; browser execution unverified.**

Without a Playwright config, `playwright test` discovered tests under `src/`, where Vitest globals were unavailable, and an E2E test imported undeclared `@faker-js/faker`. The patch adds `playwright.config.ts` to scope discovery to `tests/e2e` and start Vite automatically, and replaces the duplicated Faker-based smoke test with deterministic synthetic input. `npx playwright test --list` now finds **95 tests in 3 files**. Browser execution was not verified in this review.

### Medium — lint warning debt

**Status: Open.**

The updated lint command completes with **0 errors and 1,245 warnings**, mostly existing `any` types and unused imports/variables. It targets app code, Supabase functions, tests, and active configuration rather than scratch scripts and generated directories.

### Medium — development dependency advisories

**Status: Open; visible but non-blocking for production.**

The full npm audit reports **5 high and 4 moderate** advisories in development tooling. CI now blocks on moderate-or-higher production advisories and reports the complete dependency audit as non-blocking for triage.

## Validation

| Check | Result |
|---|---|
| `npm ci` | Passed; 929 packages installed |
| `npm run test:run` | **69 test files passed; 1,316 tests passed** |
| `npm run lint` | Passed with 0 errors; 1,245 warnings remain |
| `npm audit --omit=dev --audit-level=moderate` | Passed; 0 production vulnerabilities |
| Full `npm audit --json` | 9 advisories: 5 high, 4 moderate |
| `npx playwright test --list` | Passed; 95 E2E tests discovered |
| Browser E2E execution | Not verified in this review |
| `npm run build` | Inconclusive; timed out at 5 minutes while Vite was still transforming the app in the 1.6 GiB workspace |
| `npm run typecheck` | Inconclusive; process was killed with exit 137 under the 1.6 GiB workspace memory limit |

The local build timeout and typecheck kill are not evidence that the GitHub runner will fail. Run the CI workflow against this patch before deploying.

## Owner decision

The owner chose to keep the current birth-profile records and PDF unchanged. Their public exposure remains an open risk.
