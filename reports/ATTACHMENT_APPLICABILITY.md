# ATTACHMENT APPLICABILITY — MASTER ENRICHMENT DIRECTIVE (2026-11-16)

Sources reconciled: `CODE-JUNCTION/GITHUB_REACH_MAXIMUM.md`,
`CODE-JUNCTION/MASTER-APP-TESTER.md`, `CODE-JUNCTION/0 test by senior AI software testing.txt`,
plus `CODE-JUNCTION/ENRICH REPOSITORY GUIDE.txt`.
Prior matrix: `reports/ATTACHMENT_APPLICABILITY_MATRIX.md` (2026-11-15) — still valid;
this file maps the same guides onto the current directive's nine priority areas.

| #   | Guide requirement                                                | Applicability       | Status / evidence                                                                                                                                                                 |
| --- | ---------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Repository discoverability & README quality (GITHUB_REACH)       | APPLICABLE          | README exists (436 lines); hero/tagline/topics refresh done in Phase 5 of this run — see `docs/` + README diff                                                                    |
| 2   | Complete route & navigation coverage (MASTER-APP-TESTER 2.3)     | APPLICABLE          | `src/routes/index.tsx` audited; persona suite covers nav; deep-link refresh test PASS                                                                                             |
| 3   | Functional interaction testing (MASTER-APP-TESTER Phase 4)       | APPLICABLE          | `tests/e2e/persona-users.spec.ts` (22 tests) — forms, keyboard, dropdown, rapid submit                                                                                            |
| 4   | Orphaned asset identification (1.3, 3.1)                         | APPLICABLE          | Build emits 223 precache entries; asset audit folded into `reports/SECURITY_REVIEW.md` §assets; no orphaned public assets found in prior audit (`reports/LATEST_COMMIT_AUDIT.md`) |
| 5   | Realistic robotic persona tests (senior-AI txt §User Simulation) | ALREADY SATISFIED   | Deterministic 3-tier persona suite (basic 5 / intermediate 5 / advanced 12) — exceeds the 90%-coverage intent for the audited journeys                                            |
| 6   | Accessibility & responsive layouts (6.1, MASTER 6.1)             | APPLICABLE          | `src/tests/week5/accessibilityGaps.test.tsx` + persona keyboard-only test; audit in `reports/ACCESSIBILITY_AUDIT.md`                                                              |
| 7   | Security & privacy (MASTER 1.4, 6, AGENTS.md rules 1–6)          | APPLICABLE          | `reports/SECURITY_REVIEW.md`; confidentiality order honoured — no seed data added to `public/`                                                                                    |
| 8   | Performance optimization (MASTER 6.2)                            | APPLICABLE          | Lazy routes + workers + PWA precache; measurements in `reports/SECURITY_REVIEW.md` §performance; Lighthouse CI config exists (`.lighthouserc.json`)                               |
| 9   | Netlify deployment readiness (MASTER Phase 7)                    | PARTIALLY SATISFIED | `netlify.toml`/SPA fallback verified previously; production preview verified offline; no deploy performed (not authorized)                                                        |
| —   | `SaraswatiMascot` fix (senior-AI txt)                            | APPLICABLE — exists | `src/components/SaraswatiMascot.tsx` renders on Index hero; covered by `src/tests/components/SaraswatiMascot.test.tsx`                                                            |
| —   | Learning-app-specific items (lessons/quizzes/progress)           | NOT APPLICABLE      | This is a Jyotish app, not a course platform — no lesson engine exists or should be invented                                                                                      |
| —   | Kiro PR workflow / new branch `kiro-max-reach-polish`            | NOT APPLICABLE      | Work continues on `fix/robotic-failure-remediation` per standing orders; no PR created without authorization                                                                      |
| —   | PWD Tools repo edits / PWD token injection                       | NOT APPLICABLE      | Directive forbids editing the PWD repo; tokens documented only                                                                                                                    |
| —   | Badges/stats/testimonials in README                              | NOT APPLICABLE      | Forbidden by directive — none invented                                                                                                                                            |

**Net new work triggered by this directive:** vedic design tokens + hero restyle
(`src/index.css`, `src/pages/Index.tsx`), TDZ regression fix in `Index.tsx`
auto-load effect, `vitest.config.ts` worker cap, eslint `tests/e2e` override,
this report set.
