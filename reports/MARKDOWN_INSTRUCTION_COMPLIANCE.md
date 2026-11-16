# MARKDOWN INSTRUCTION COMPLIANCE — 2026-11-16

Scope: all instruction-bearing `.md`/`.txt` under repo (excluding
node_modules/.git/dist). Detailed per-requirement matrix already exists at
`reports/ATTACHMENT_APPLICABILITY_MATRIX.md` (2026-11-15) and
`reports/ATTACHMENT_APPLICABILITY.md` (2026-11-16) — this file records the
final disposition for the cleanup pass.

| Source file                                                                    | Requirements                                                                                                                     | Status                                                                                              | Evidence                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CODE-JUNCTION/GITHUB_REACH_MAXIMUM.md`                                        | README hero/features/screenshots/quick-start/config/topics/Contributing/CoC/issue-templates/SECURITY/honest readiness            | ALREADY SATISFIED                                                                                   | README (badges, features table, real screenshots verified on disk, quick-start), repo description + 9 topics set via gh, CONTRIBUTING/CODE_OF_CONDUCT/SECURITY/LICENSE + ISSUE_TEMPLATE exist, FEATURE_READINESS.md honest |
| `CODE-JUNCTION/MASTER-APP-TESTER.md`                                           | fingerprinting, static analysis, routes/components, data integrity, interactions, personas, a11y/perf, Netlify readiness, report | ALREADY SATISFIED                                                                                   | gates: typecheck/lint/build/unit 1717/core 48/acc-fast 42/e2e 24; persona suite 3 tiers; ACCESSIBILITY_AUDIT + SECURITY_REVIEW + VISUAL_REGRESSION reports; netlify deploy verified historically                           |
| `CODE-JUNCTION/REPOSITORY_WIDE_MD_TXT_COMPLIANCE_GUIDE.md`                     | this cleanup task itself                                                                                                         | APPLIED                                                                                             | this report + FINAL_MARKDOWN_CLEANUP_REPORT.md                                                                                                                                                                             |
| `CODE-JUNCTION/ENRICH REPOSITORY GUIDE.txt` (.txt)                             | master directive phases                                                                                                          | PARTIALLY — enterprise items open (deploy pipeline, licensing)                                      | tracked as backlog in RELEASE_CONDITIONS.md / Tex21 review                                                                                                                                                                 |
| `CODE-JUNCTION/Tex21.txt` (.txt)                                               | enterprise gap list                                                                                                              | BLOCKED items remain (CI deploy split, license gate, engine consolidation)                          | cannot delete — unresolved instructions documented                                                                                                                                                                         |
| `CODE-JUNCTION/0 test by senior AI software testing.txt` (.txt)                | ultra-strict QA                                                                                                                  | ALREADY SATISFIED for applicable parts (personas, SaraswatiMascot exists+tested, Home anchor works) | persona suite + component test                                                                                                                                                                                             |
| `docs/**` guides (ENTERPRISE_LAUNCH_GUIDE, WEEK01, ANSWER_LAYER, ENRICHMENT_*) | project documentation                                                                                                            | RETAIN — project docs, not disposable instruction sources                                           | —                                                                                                                                                                                                                          |
| `reports/**`                                                                   | release evidence                                                                                                                 | RETAIN — never delete                                                                               | —                                                                                                                                                                                                                          |

## Phase 3 verification (GITHUB_REACH outstanding check)

- README hero/tagline/features: present; `D9/D9` fixed; screenshot cells real.
- Live-demo link: HTTP 200 verified.
- Quick-start: present (Prerequisites → clone → install → dev).
- Config docs: `.env.example`, FEATURE_FLAGS_SETUP, docs/ — present.
- Repo description/topics: set via `gh repo edit` (verified earlier).
- CONTRIBUTING/CODE_OF_CONDUCT/SECURITY/issue templates: all exist.
- Honest readiness: `docs/FEATURE_READINESS.md` marks prototype vs ready.

## Phase 4 tests

Full gate suite executed this session on identical code (only docs/md
changed since): typecheck 0 · lint 0 errors · unit 1717/1717 · core 48/48 ·
accuracy-fast 42/42 · build 0 · preview e2e 24/24. Evidence: cert-*.txt,
cert-e2e.txt (untracked local logs).

## Phase 5 deletions

- `git rm CODE-JUNCTION/GITHUB_REACH_MAXIMUM.md`
- `git rm CODE-JUNCTION/MASTER-APP-TESTER.md`

Both fully reconciled; compliance evidence preserved in
`reports/ATTACHMENT_APPLICABILITY*.md` + this file. Retained: all `.txt`
instruction files (open BLOCKED items), the untracked compliance guide
(active governing doc), all project docs/reports/evidence.
