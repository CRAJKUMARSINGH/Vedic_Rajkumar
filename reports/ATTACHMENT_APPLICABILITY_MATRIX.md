# ATTACHMENT APPLICABILITY MATRIX — Vedic Rajkumar & PWD Tools

**Program:** MASTER DIRECTIVE — VEDIC RAJKUMAR & PWD TOOLS EXCELLENCE PROGRAM
**Phase:** 1 — Apply the three attached guides intelligently
**Source SHA (Track A):** `21a4a55a48ab50f7f2b5a254f6376bebac26a120`
**Executed:** 2026-11-15
**Classification vocabulary:** `APPLICABLE` · `ALREADY SATISFIED` · `PARTIALLY SATISFIED` · `NOT APPLICABLE` · `BLOCKED`

---

## 1. Attachment inventory

All four inputs were read in full from `CODE-JUNCTION/` (untracked source material):

| File                                       | Kind                                              | Relevance                             |
| ------------------------------------------ | ------------------------------------------------- | ------------------------------------- |
| `ENRICH REPOSITORY GUIDE.txt`              | Master directive (Phases 0–10)                    | Governs both tracks                   |
| `GITHUB_REACH_MAXIMUM.md`                  | README/discoverability spec                       | Track A                               |
| `MASTER-APP-TESTER.md`                     | Universal testing/integration prompt (Phases 0–8) | Track A (Track B where source exists) |
| `0 test by senior AI software testing.txt` | Ultra-strict QA prompt                            | Track A                               |

> **Important scope guard.** `0 test by senior AI software testing.txt` is written for a _learning platform_ ("learning flow", "sections", "lessons"). `MASTER-APP-TESTER.md` explicitly instructs adapting personas/scope to the app type. The master directive states: _"Do not add learning-app functionality to a Jyotish application … merely because a generic testing guide mentions it."_ Learning-platform-specific clauses are therefore reclassified against what this repository actually is: a **hybrid content/tool web application** (Jyotish calculators + reference content + auth + PDF export + PWA).

---

## 2. Track A — Vedic Rajkumar

### 2.1 Master directive table (Phase 0.2 / Phase 1)

| Requirement                   | Classification               | Evidence / Notes                                                                                                 |
| ----------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Latest commit verification    | **ALREADY SATISFIED**        | `HEAD == origin/main == 21a4a55a48ab…`; see `LATEST_COMMIT_AUDIT.md`                                             |
| README and discoverability    | **PARTIALLY SATISFIED**      | README already has hero, badges, live demo, features, screenshots, accuracy. Two factual drifts found — see §2.6 |
| Typecheck, lint, build        | **APPLICABLE**               | `typecheck` PASS; `lint`/`build` executed in baseline                                                            |
| Route and navigation testing  | **APPLICABLE**               | 2 route tables exist — see §2.5                                                                                  |
| Orphaned assets/data          | **APPLICABLE**               | Not yet audited                                                                                                  |
| User simulation               | **APPLICABLE**               | Playwright present (`test:e2e`, `playwright.robustness.config.ts`)                                               |
| Accessibility                 | **APPLICABLE**               | `test:a11y` script present                                                                                       |
| Performance                   | **APPLICABLE**               | `test:perf` (LHCI) + `.lighthouserc.json` present                                                                |
| Netlify smoke testing         | **APPLICABLE**               | `netlify.toml` verified; requires network/auth for live smoke                                                    |
| SaraswatiMascot               | **ALREADY SATISFIED**        | Present and integrated — see §2.4                                                                                |
| Jyotish accuracy tests        | **APPLICABLE**               | `validate:accuracy`, `test:accuracy:full`, `test:accuracy:fast` present                                          |
| Engineering tool calculations | **NOT APPLICABLE**           | Track B only                                                                                                     |
| Landing-page redesign         | **NOT APPLICABLE** (Track A) | Track A keeps its own "Royal Indigo & Saffron" system                                                            |

### 2.2 `GITHUB_REACH_MAXIMUM.md`

| Requirement                                                     | Classification          | Evidence / Notes                                                                                                                                                                     |
| --------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Deep codebase analysis                                          | **APPLICABLE**          | Ongoing (Phase 0–2)                                                                                                                                                                  |
| Rewritten README with prescribed structure                      | **PARTIALLY SATISFIED** | Existing README is strong and predates this spec; needs targeted corrections, not replacement (directive: _"Do not replace established files merely to satisfy a generic template"_) |
| Repo metadata: keyword-rich description                         | **BLOCKED**             | Set in GitHub UI/API, not in-repo. Directive already supplies proposed text (§7 of directive). Requires maintainer action or token                                                   |
| GitHub Topics (8–12)                                            | **BLOCKED**             | Same as above; directive supplies 10 proposed topics                                                                                                                                 |
| `CONTRIBUTING.md`                                               | **ALREADY SATISFIED**   | Present at repo root                                                                                                                                                                 |
| `CODE_OF_CONDUCT.md` (Contributor Covenant)                     | **ALREADY SATISFIED**   | Present at repo root                                                                                                                                                                 |
| `.github/ISSUE_TEMPLATE/bug_report.yml` + `feature_request.yml` | **ALREADY SATISFIED**   | Both present                                                                                                                                                                         |
| `SECURITY.md`                                                   | **ALREADY SATISFIED**   | Present at repo root                                                                                                                                                                 |
| PR titled "🚀 Kiro Max-Reach Polish…"                           | **BLOCKED**             | Requires authorization to open a PR (directive: _"Do not push or deploy without authorization"_)                                                                                     |

### 2.3 `MASTER-APP-TESTER.md` (Phases 0–8)

| Phase                                  | Classification                | Notes                                                                                                                                                                        |
| -------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 — Application fingerprinting         | **ALREADY SATISFIED**         | App type = `hybrid` (tool + content-reader + PWA). Stack: React 18 + TS strict + Vite 7 + Tailwind 4 + Radix/shadcn + TanStack Query + Vitest + Playwright. Deploy = Netlify |
| 1.1 Dependency audit                   | **APPLICABLE**                | `typecheck` PASS (0 errors)                                                                                                                                                  |
| 1.2 Build verification                 | **APPLICABLE**                | `build` in baseline                                                                                                                                                          |
| 1.3 Asset integrity                    | **APPLICABLE**                | Includes `docs/assets/screenshots/*` (present)                                                                                                                               |
| 1.4 Environment variables              | **APPLICABLE**                | `.env.example` present; Zod fail-fast in `src/config/env.ts` (per prior enrichment)                                                                                          |
| 2.1 Entry-point chain                  | **ALREADY SATISFIED**         | `src/main.tsx` → `src/App.tsx` → `src/routes/index.tsx`                                                                                                                      |
| 2.2 Component audit                    | **APPLICABLE**                | ~150 components under `src/components/`                                                                                                                                      |
| 2.3 Navigation & routing               | **APPLICABLE**                | `*` → `NotFound` present; many legacy redirects mapped                                                                                                                       |
| 2.4 Mascot & special components        | **ALREADY SATISFIED**         | See §2.4                                                                                                                                                                     |
| 3.x Data & content integrity           | **APPLICABLE**                | `src/data/*` (18 modules), `public/answers/**`, `public/supplements/*`                                                                                                       |
| 4.x Functional testing (UI)            | **APPLICABLE**                | Playwright e2e                                                                                                                                                               |
| 5.x Simulated user testing (125/75/51) | **APPLICABLE (configurable)** | Directive: use the 125/75/51 distribution as a _configurable stress scenario, not an unconditional requirement_                                                              |
| 6.1 Accessibility (WCAG 2.1 AA)        | **APPLICABLE**                | `test:a11y` present                                                                                                                                                          |
| 6.2 Performance (LCP/CLS)              | **APPLICABLE**                | `test:perf` + `.lighthouserc.json`                                                                                                                                           |
| 7.x Netlify readiness                  | **APPLICABLE**                | `netlify.toml` present with SPA fallback, cache + security headers                                                                                                           |
| 8.x Final report & remediation         | **APPLICABLE**                | `reports/` deliverables                                                                                                                                                      |

### 2.4 Mascot & root-component clauses (verified, not assumed)

| Clause                                                        | Claim in attachment                           | Verified reality                                                                                                                                                                                                                                                                                                                   | Classification                               |
| ------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| "Fix and correctly integrate the `SaraswatiMascot` component" | assumes broken/unwired                        | [SaraswatiMascot.tsx](file:///e:/Rajkumar/Vedic_Rajkumar/src/components/SaraswatiMascot.tsx) exists, is imported and rendered at [Index.tsx](file:///e:/Rajkumar/Vedic_Rajkumar/src/pages/Index.tsx#L339) (`<SaraswatiMascot isHi={isHi} size={110} />`), and has a dedicated test `src/tests/components/SaraswatiMascot.test.tsx` | **ALREADY SATISFIED**                        |
| "Connect the `Home` component as the root navigation anchor"  | assumes a learning app whose home is the root | There is no `Home` component. Root `/` → `LandingPageV3`; the app shell `Index` is mounted at `/app` ([routes/index.tsx](file:///e:/Rajkumar/Vedic_Rajkumar/src/routes/index.tsx#L146-L147)). This is an intentional product structure (landing → app), not a defect                                                               | **NOT APPLICABLE** (learning-app assumption) |

> These two clauses are precisely the kind of generic-learning-app requirement the directive warns against applying blindly. No change is made on the strength of them.

### 2.5 Route-table duplication (verified observation)

Two route definition modules exist:

- [src/routes/index.tsx](file:///e:/Rajkumar/Vedic_Rajkumar/src/routes/index.tsx) — **active**; `src/App.tsx` imports `{ routes } from '@/routes'` and renders them.
- [src/routes/appRoutes.tsx](file:///e:/Rajkumar/Vedic_Rajkumar/src/routes/appRoutes.tsx) — uses a `route()` helper; `grep` shows **no importer** in `src/`.

Classification: **APPLICABLE** (Phase 2.3 navigation integrity / orphaned-code audit). A second, unreferenced route table is a candidate orphan. This is recorded as a finding to confirm, not yet fixed.

### 2.6 Verified defects found during Phase 0/1 (doc-vs-code drift)

| ID         | Severity | Finding                                                                                                                                                                                                                                | Source                                                                       | Evidence                                                                                                         |
| ---------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `CJ-A-001` | LOW      | README badge claims **Node ≥ 20** while `package.json` `engines.node` and `.nvmrc` require **22.22.1**. Directive Phase 8 explicitly forbids "a generic Node 20 setting when the repository explicitly requires Node 22.22.1 or later" | [README.md](file:///e:/Rajkumar/Vedic_Rajkumar/README.md#L17)                | `package.json` `engines: { node: ">=22.22.1" }`; `.nvmrc` = `22.22.1`; `netlify.toml` `NODE_VERSION = "22.22.1"` |
| `CJ-A-002` | LOW      | README lists stack as **"Tailwind 3"** while the project uses **Tailwind CSS 4.3.3**                                                                                                                                                   | [README.md](file:///e:/Rajkumar/Vedic_Rajkumar/README.md#L59)                | `package.json` devDependencies `tailwindcss ^4.3.3`, `@tailwindcss/vite ^4.3.3`                                  |
| `CJ-A-003` | MEDIUM   | Two route tables; `src/routes/appRoutes.tsx` appears unreferenced                                                                                                                                                                      | [appRoutes.tsx](file:///e:/Rajkumar/Vedic_Rajkumar/src/routes/appRoutes.tsx) | No `import … appRoutes` match in `src/`; `App.tsx` imports from `@/routes`                                       |

---

## 3. Track B — PWD Tools

### 3.1 Source location

The directive requires locating the source _before_ modification. Candidates found on this machine:

| Candidate                                                                | Observed contents                                                              | Status                                                |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| [E:\Rajkumar\PWD-TOOLS-PRIYANKA](file:///e:/Rajkumar/PWD-TOOLS-PRIYANKA) | `Home.py`, `app.py`, `index.html`, `netlify.toml` — Streamlit + static landing | **Likely match** for `pwd-tools-priyanka.netlify.app` |
| [E:\Rajkumar\pwd-tools-monorepo](file:///e:/Rajkumar/pwd-tools-monorepo) | `PWD_TOOLS_FINAL_PRODUCTION_AUDIT.md`, `netlify.toml`, `package.json`          | Alternative monorepo variant                          |

**Classification: BLOCKED** — cannot proceed until the maintainer confirms which directory is the deployed source of `https://pwd-tools-priyanka.netlify.app`. Modifying the wrong copy would violate "Locate the PWD Tools source before attempting modifications."

### 3.2 Track B requirements (pending source confirmation)

| Requirement                                                                  | Classification                         |
| ---------------------------------------------------------------------------- | -------------------------------------- |
| Landing-page redesign (Engineering Sapphire)                                 | **BLOCKED** — source unconfirmed       |
| Navigation / tool functionality preservation                                 | **BLOCKED**                            |
| Engineering calculator validation (formulas, units, ranges, reference cases) | **BLOCKED**                            |
| Accessibility (WCAG 2.2 AA)                                                  | **BLOCKED**                            |
| Netlify smoke testing                                                        | **BLOCKED**                            |
| README / discoverability                                                     | **BLOCKED** (recommended, not primary) |

Track A and Track B are independently validatable and are not blocked by each other.

---

## 4. Classification summary

| Classification        | Track A | Track B |
| --------------------- | ------- | ------- |
| `ALREADY SATISFIED`   | 8       | 0       |
| `APPLICABLE`          | 24      | 0       |
| `PARTIALLY SATISFIED` | 2       | 0       |
| `NOT APPLICABLE`      | 3       | 0       |
| `BLOCKED`             | 4       | 6       |

**Net actionable Track A scope:** baseline verification (Phase 2), route/asset/data integrity (Phases 2–3), accuracy verification (Phase 3), accessibility/performance (Phase 8), security (Phase 8), and targeted documentation corrections (`CJ-A-001`…`003`). Track B is Blocked pending source confirmation.

**No code change has been made in Phase 0–1.**
