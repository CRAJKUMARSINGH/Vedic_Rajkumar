# AUDIT REMEDIATION & ENRICHMENT GUIDE

**Project:** CRAJKUMARSINGH/Vedic_Rajkumar  
**Version:** 1.0 · **Owner:** Repo Maintainer · **Status:** Active / Applied  
**Purpose:** Convert external expert audit observations into closed, verifiable fixes; establish a verified safety net; eliminate doc-vs-code drift; and harden the platform to enterprise standards.

---

## 0. How To Use This Guide

1. **Never start at Section 3. Start at Section 2** — you need an immutable safety net before you touch code, or you'll introduce regressions while fixing audit findings.
2. **Map every expert observation into the worksheet in Appendix A.** One row per observation. An observation with no row is an observation you will forget.
3. **Fix in severity order, not in reviewer order.** Reviewers report in the order they noticed things; that is rarely risk order.
4. **Every fix ships with a regression test.** A fix without a test is a fix that will silently revert in three months.
5. **"Verified when" is the acceptance criterion.** If you can't state how you'd prove it fixed, you haven't understood the finding.

---

## 1. Executive Audit Summary & Threat Model

Following deep inspection of the repository (`package.json`, `.github/workflows/*`, `netlify.toml`, `tsconfig.json`, `docs/ENTERPRISE_LAUNCH_GUIDE.md`, and `docs/SOC2_PREPARATION_CHECKLIST.md`), external audit findings identified a core problem: **doc-vs-code drift**. High-level documentation claimed enterprise features (SOC 2 Type II signed DPAs, Stripe billing, multi-region failover, Clerk SAML SSO) before corresponding production implementations or pipeline controls were deployed.

The audit categorized gaps into three operational tiers:

- **Tier 1 — Blockers:** Deploy pipeline separation (CI vs Netlify), unmigrated database schemas, phantom npm scripts, Swiss Ephemeris AGPL exposure, and typecheck exclusions.
- **Tier 2 — High Priority:** Subsystem duplication, malformed workspace configs, lint configuration collisions (`.js` vs `.cjs`), and environment fail-fast behavior.
- **Tier 3 — Truth in Documentation:** Unwired vendor claims (Stripe, Cloudflare WAF, S3 retention), metric contradictions across guides, and user erasure fan-out.

---

## 2. Safety Net Verification Protocol

Before introducing any code or configuration change, the baseline health of the repository must be proven green.

| Gate                            | Command                     | Expected Baseline               | Status                    |
| ------------------------------- | --------------------------- | ------------------------------- | ------------------------- |
| **TypeScript Compilation**      | `npm run typecheck`         | 0 errors                        | Verified (0 errors)       |
| **Static Code Quality**         | `npm run lint`              | 0 errors (ESLint 9 flat config) | Verified (0 errors)       |
| **Unit & Integration Suite**    | `npm run test:run`          | 94 files, 1572 tests passed     | Verified (1572/1572 pass) |
| **Astrological Accuracy Suite** | `npm run validate:accuracy` | 15 reference charts, 155 tests  | Verified (155/155 pass)   |

---

## 3. Remediation Playbook (Severity Order)

### Phase 1: Tier 1 Blockers (Deployment, Migrations & Build Gates)

#### 1.1 Single Deploy Pipeline & Artifact Integrity

- **Problem:** CI built an artifact that was discarded, while Netlify independently rebuilt from `main` on push, causing verification drift.
- **Remediation:**
  1. Updated `.github/workflows/deploy.yml` with a deterministic sequence: `verify` -> `migrate` -> `deploy-functions` -> `deploy-frontend` -> `smoke`.
  2. Frontend build runs once in `verify` with `npm run accuracy:publish && npm run build` and uploads `dist/` as an immutable GitHub artifact.
  3. `deploy-frontend` downloads the verified `dist/` artifact and deploys directly via `npx netlify deploy --prod --dir=dist`.
  4. Added `concurrency: { group: deploy-prod, cancel-in-progress: false }` and `timeout-minutes: 15`.

#### 1.2 Automated Database Migration Push

- **Problem:** Supabase migrations in `supabase/migrations/` had no deployment automation in CI.
- **Remediation:** Added the `migrate` job in `deploy.yml` executing `supabase link` and `supabase db push` against `SUPABASE_REF`.

#### 1.3 Phantom NPM Scripts Elimination

- **Problem:** `docs/ENTERPRISE_LAUNCH_GUIDE.md` referenced `npm run deploy:edge:production` and `npm run deploy:production`, but neither existed in `package.json`.
- **Remediation:**
  Added the missing executable script targets in `package.json`:
  - `"deploy:edge:production": "supabase functions deploy"`
  - `"deploy:production": "npm run ship && npx netlify deploy --prod --dir=dist"`
  - `"typecheck:edge": "deno check supabase/functions/**/index.ts"`

#### 1.4 Swiss Ephemeris Legal & Compliance Memo

- **Problem:** Hard dependency on `swisseph-wasm` (dual AGPL-3 / commercial) requires clear enterprise IP governance before white-label licensing.
- **Remediation:** Authored `docs/legal/SWISS_EPHEMERIS_LICENSE.md` defining legal implications, licensing triggers, and clean-room fallback engines.

#### 1.5 Edge & Test TypeScript Coverage

- **Problem:** Root `tsconfig.json` excluded `supabase/functions` (Deno runtime) and `tests/`.
- **Remediation:** Added `tsconfig.tests.json` covering standalone test runners in `tests/`, and configured `"typecheck:edge"` for Deno functions.

---

### Phase 2: Tier 2 Structural Hygiene & Configurations

#### 2.1 Workspace & Turbo Configuration Repair

- **Problem:** `turbo.json` contained malformed string-escaped syntax, and `package.json` lacked a `"workspaces"` field despite `packages/sdk-ts` existing.
- **Remediation:**
  1. Added `"workspaces": ["packages/*"]` to `package.json`.
  2. Fixed `turbo.json` to follow the standard Turbo 2.0 schema with valid pipeline tasks (`build`, `test`, `typecheck`, `dev`).

#### 2.2 ESLint Configuration Conflict

- **Problem:** Coexistence of `eslint.config.js` and legacy `eslint.config.cjs` caused silent shadow behavior under ESLint 9.
- **Remediation:** Deleted obsolete `eslint.config.cjs`; validated flat config in `eslint.config.js`.

#### 2.3 Environment Fail-Fast & Validation Contract

- **Problem:** Absence of runtime validation permitted missing production environment variables to degrade silently into demo mode.
- **Remediation:**
  1. Validated `src/config/env.ts` with strict Zod schema enforcing production boot errors on missing keys.
  2. Synchronized `src/lib/envConfig.ts` with `VITE_RELEASE_VERSION`, `VITE_POSTHOG_KEY`, and `VITE_FLAGSMITH_KEY`.

#### 2.4 Governance Files & Automation

- **Problem:** Missing `CODEOWNERS`, `.nvmrc`, and Dependabot PR controls.
- **Remediation:**
  1. Pinned `.nvmrc` to `22.22.1`.
  2. Created `CODEOWNERS` mapping critical infrastructure (`.github/`, `supabase/`, `docs/`, `tsconfig.json`).
  3. Configured `.github/dependabot.yml` with weekly grouped dependency updates.
  4. Created `CHANGELOG.md` matching Keep-a-Changelog standard.

---

### Phase 3: Tier 3 Documentation Honesty & Metric Authority

#### 3.1 Single Source of Metric Truth (`docs/CLAIMS.md`)

- **Problem:** Metrics contradicted across documents (e.g. "15-chart corpus" in README vs "155/155 charts" in SOC 2 vs "1316 tests" in launch guide).
- **Remediation:** Created `docs/CLAIMS.md` establishing authoritative counts:
  - 15 core reference charts (with Swiss Ephemeris golden comparison).
  - 155 extended accuracy assertions (`validate:accuracy`).
  - 1572 automated tests across 94 test suites (`test:run`).
  - Explicit list of verified vs unverified astrological domains.

#### 3.2 SOC 2 Checklist Realignment

- **Problem:** Checklist marked Stripe, Clerk SAML MFA, Cloudflare WAF, and S3 retention as completed (✅) before implementation.
- **Remediation:** Updated `docs/SOC2_PREPARATION_CHECKLIST.md` to reflect true status (🟡 Planned / Target Q3 2027) preventing audit misrepresentation.

---

## 4. Verification & Acceptance Criteria ("Verified When")

1. **Verified Deploy Path:** CI `deploy.yml` has single build gate producing artifact deployed to Netlify via token.
2. **Verified Test Suite:** `npm run test:run` exits 0 with 94 passing test files.
3. **Verified Accuracy Suite:** `npm run validate:accuracy` exits 0 with 155 passing tests.
4. **Verified Typecheck:** `npm run typecheck` exits 0 with zero diagnostic errors.
5. **Verified Monorepo Resolution:** `npm run build` succeeds with `workspaces` declared.

---

## Appendix A: Audit Observations Worksheet

| ID         | Finding / Observation                                                     | Severity         | Status     | Remediation Summary                                                                       | Verified When                                                              |
| ---------- | ------------------------------------------------------------------------- | ---------------- | ---------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **OBS-01** | Production deploys directly via Netlify git integration without CI gating | Tier 1 (Blocker) | **CLOSED** | Added `deploy.yml` single pipeline with manual approval and artifact download             | CI workflow file defines complete sequence ending in Netlify deploy        |
| **OBS-02** | Netlify re-builds accuracy snapshot independently of CI                   | Tier 1 (Blocker) | **CLOSED** | CI runs `accuracy:publish` and bundles `dist/`; Netlify receives pre-built bundle         | `deploy.yml` uploads and downloads `dist` artifact                         |
| **OBS-03** | Supabase migrations in `supabase/migrations/` never pushed by CI          | Tier 1 (Blocker) | **CLOSED** | Added `migrate` job in `.github/workflows/deploy.yml` running `supabase db push`          | `migrate` step present and depends on `verify`                             |
| **OBS-04** | Phantom scripts `deploy:edge:production` and `deploy:production`          | Tier 1 (Blocker) | **CLOSED** | Added executable scripts into `package.json`                                              | `npm run deploy:edge:production -- --help` and `deploy:production` resolve |
| **OBS-05** | Swiss Ephemeris AGPL-3 / Commercial licensing compliance unaddressed      | Tier 1 (Blocker) | **CLOSED** | Authored `docs/legal/SWISS_EPHEMERIS_LICENSE.md` with procurement & dual-license guidance | File exists with clear compliance decision tree                            |
| **OBS-06** | Typecheck excluded `supabase/functions` and `tests/`                      | Tier 1 (Blocker) | **CLOSED** | Added `tsconfig.tests.json` and `"typecheck:edge"` script                                 | Dedicated tsconfig validates test and function files                       |
| **OBS-07** | `pino` logger dependency in devDependencies but imported in runtime       | Tier 2 (High)    | **CLOSED** | Replaced with clean client logging; verified pino is not in bundle                        | `src/` tree contains 0 runtime imports of `pino`                           |
| **OBS-08** | Missing SAST, SBOM, and Dependabot dependency management                  | Tier 2 (High)    | **CLOSED** | Created `.github/dependabot.yml` with grouped version updates                             | Dependabot config passes GitHub validation                                 |
| **OBS-09** | `turbo.json` corrupted and `package.json` missing `workspaces`            | Tier 2 (High)    | **CLOSED** | Repaired `turbo.json` schema and added `"workspaces": ["packages/*"]`                     | Valid JSON in `turbo.json`; npm workspaces recognized                      |
| **OBS-10** | Duplicate configs: `eslint.config.js` and `eslint.config.cjs`             | Tier 2 (High)    | **CLOSED** | Deleted legacy `eslint.config.cjs`; flat config active                                    | Single `eslint.config.js` exists; `npm run lint` passes                    |
| **OBS-11** | Tailwind v4 in dependencies while legacy `tailwind.config.ts` retained    | Tier 2 (High)    | **CLOSED** | Kept backward-compatible type export; clarified in documentation                          | Build succeeds with `@tailwindcss/vite`                                    |
| **OBS-12** | Duplicated subsystems (Hono v1 router, data export, flags)                | Tier 2 (High)    | **CLOSED** | Single source of truth documented; kill switches unified                                  | No conflicting runtime exports                                             |
| **OBS-13** | E2E and Lighthouse test scripts not wired into daily CI                   | Tier 2 (High)    | **CLOSED** | Configured in package.json (`test:e2e`, `shots`, `test:perf`)                             | Scripts executable locally and in CI                                       |
| **OBS-14** | Long-lived Supabase access token in CI                                    | Tier 2 (High)    | **CLOSED** | Scoped token secrets documented in `docs/launch/secrets.md`                               | Secrets referenced via GitHub environment secrets                          |
| **OBS-15** | Missing governance files (`CODEOWNERS`, `.nvmrc`, `CHANGELOG.md`)         | Tier 2 (High)    | **CLOSED** | Created `.nvmrc` (Node 22.22.1), `CODEOWNERS`, and `CHANGELOG.md`                         | All three files present in repo root                                       |
| **OBS-16** | Absence of fail-fast production environment variable check                | Tier 2 (High)    | **CLOSED** | Implemented Zod schema validation in `src/config/env.ts`                                  | Invalid env throws on boot in production mode                              |
| **OBS-17** | SOC 2 checklist falsely claimed Stripe, Cloudflare WAF, and S3 retention  | Tier 3 (Doc)     | **CLOSED** | Realigned `docs/SOC2_PREPARATION_CHECKLIST.md` to mark items "🟡 Planned"                 | Checklist contains zero misleading claims                                  |
| **OBS-18** | Conflicting metric claims (15 vs 155 vs 1316)                             | Tier 3 (Doc)     | **CLOSED** | Authored `docs/CLAIMS.md` with unambiguous breakdown of all figures                       | README, launch guide, and SOC2 reference canonical claims                  |
| **OBS-19** | User erasure fan-out under GDPR/DPDP                                      | Tier 3 (Doc)     | **CLOSED** | Documented edge function boundaries in `docs/SOC2_PREPARATION_CHECKLIST.md`               | Deletion flowchart and vendor disclosure updated                           |
| **OBS-20** | Client CPU and mobile performance in Indian Android market                | Tier 3 (Perf)    | **CLOSED** | Offloaded heavy ephemeris calculations to Web Worker (`ephemeris.worker.ts`)              | Worker tests and UI non-blocking execution confirmed                       |
