# Tier Robotic Testing — mechanism & runbook

**Owner:** Quality / Pre-Launch · **Cadence:** every PR + daily pre-launch · **Status:** active

## 1. Purpose

Drive the live app as three different **grades** of user (Free · Pro · Enterprise)
in a real browser and prove that every gate, quota and upgrade path behaves per
`docs/testing/TIER_MATRIX.md`. Human QA checks one grade by accident; the robot
checks all three on every push.

## 2. Non-goals

- Not an accuracy test — that is `npm run validate:accuracy` / `test:accuracy:corpus`.
- Not a load test — that is `ops/load/*` (k6).
- Not an auth test — Clerk is stubbed via seeded storage state.
- Not an RLS test — the robot runs client-side. See §7.

## 3. Architecture

One **setup** project materialises three storage states; three **parallel** grade
projects each run the same parameterised spec.

| Stage     | File                                      | Output                                  |
| --------- | ----------------------------------------- | --------------------------------------- |
| personas  | `tests/e2e/fixtures/tierSessions.ts`      | 3 `GradePersona` objects                |
| setup     | `tests/e2e/tier-matrix.setup.ts`          | `reports/tiers/.auth-{grade}.json`      |
| robot     | `tests/e2e/tier-matrix.spec.ts`           | `reports/tiers/{grade}.json`            |
| aggregate | `scripts/tier-report.mjs`                 | `reports/tiers/report.json` + exit code |
| config    | `playwright.tiers.config.ts`              | 4 projects, serial, 1 worker            |
| gate      | `.github/workflows/ci.yml` → `tier-robot` | blocks merge                            |

Why storage-state projects instead of one browser doing three logins: a failure
names the grade in the report, grades run independently, and a Free-grade
regression cannot mask an Enterprise-grade one.

## 4. Harness contract

The app must expose the `data-testid` attributes in `docs/testing/TIER_MATRIX.md`.
Additionally the harness writes two keys the app must honour when resolving tier:

    vr_tier      -> internal UserTier   ('registered' | 'premium' | 'practitioner' | 'anonymous')
    vr_api_tier  -> API tier            ('free' | 'developer' | 'enterprise')

The single resolver is `src/features/tier/resolveTier.ts`:

    import { resolveTier } from '@/features/tier/resolveTier';
    const tier = resolveTier(sessionTier); // server > seeded 'vr_tier' > 'free'

## 5. Running

    # local — reuses system Edge, no Chromium download
    npm run dev -- --host 127.0.0.1
    npm run test:tiers

    # headed, single grade
    npx playwright test --config playwright.tiers.config.ts --project=pro --headed

    # aggregate + verdict (exit 1 on NO-GO)
    npm run test:tiers:report

## 6. Pass criteria

- Every check for every grade is `pass`.
- `report.json` verdict is `GO`.
- Zero uncaught `pageerror` in any grade.
- No `MISSING` grade — a grade that did not run is a failure, not a skip.

## 7. STOP-THE-LAUNCH conditions

1. Any grade reports `FAIL`.
2. A paid grade (B/C) sees a gate a free grade should also see, or vice versa.
3. `upgrade-banner` visible on B or C (upsell leaking to paying users).
4. Weekly allowance is `-1` for a free grade, or finite for a paid grade.
5. `pageErrors` non-empty in any grade.
6. Any new console error not in the previous baseline.

## 8. Evidence & logbook

Per `app-robustness-testing.md` (standing instruction, append-only, 15-minute
cadence), append an entry for every robot run:

    ### [YYYY-MM-DDTHH:MM:SS+05:30] — Tier robot sweep
    - Session: <chat_session_id>
    - Agents: main agent (run)
    - Executed: npm run test:tiers && npm run test:tiers:report
    - Result: GO / NO-GO — free:PASS pro:PASS enterprise:PASS
    - Findings: <DEF-0NN — severity — reports/tiers/{grade}.json>
    - Actions: <fix / RISK_ACCEPTED>
    - Next: <open items>

Cite `reports/tiers/report.json` and the per-grade JSON as artifacts.

## 9. Extending

- **New grade:** add a `GradePersona` to `GRADES`, add a project to the config. Nothing else.
- **New assertion:** add a test to `tier-matrix.spec.ts` reading `p().expect.*`, and a row to `TIER_MATRIX.md`.
- **New gated feature:** add the flag to `FEATURE_FLAGS`, a row to the matrix, and `data-testid="feature-gate"` with `data-feature`.

## 10. Known limitation

`PARITY-001` — the robot validates the UI contract while enforcement is
client-side. A user can edit localStorage and exceed their plan. Add a
server-side parity spec once gating moves behind an edge function
(see `tests/e2e/tier-parity.spec.ts`).

## Change log

- **2026-10-27** — Initial. Harness, matrix, personas, CI gate.
