# RELEASE CONDITIONS — reviewer items disposition (2026-11-16)

Branch `chore/safe-redundancy-cleanup` @ `ae65ff3`. Push/merge/deploy NOT authorized.

## 1. npm-audit vulnerability triage

`npm audit --omit=dev` (production deps): **1 moderate** — `hono ≤4.13.15`
(transitive; middleware-mount/multipart-validation advisories). Not reachable
from the client bundle — hono is used by Supabase edge tooling, not shipped JS.
Mitigation: bump hono via `npm audit fix` at next dep refresh; no runtime
exposure in the Vite bundle.

`npm audit` (all): **39** (5 low / 24 moderate / 10 high) — dominated by
dev-only tooling (sharp/libvips CVEs in the lhci chain, vitest/playwright
tree). DevDeps do not ship to production. Action: schedule `npm audit fix`
(non-force) + Dependabot; the 10 "high" are dev-chain only.

**Disposition:** documented, non-blocking for launch; production runtime
surface = 1 moderate transitive dep.

## 2. swisseph-wasm AGPL — decision required (owner)

Facts: `swisseph-wasm@^0.1.0` is a runtime dependency; `swissEphemerisService`
dynamic-imports it **only when `VITE_USE_SWISS_EPHEMERIS=true`**
(`answerCardBuilder.ts:159`). Vite still emits it as an async chunk in `dist/`,
so the binary ships to browsers regardless of the flag.

Options:

- **A (recommended for open-source launch):** keep it — AGPL-3 is compatible
  with publishing the whole app under AGPL/open-source; add license note +
  offer commercial Swiss Ephemeris license if white-labeling.
- **B:** exclude the chunk from production builds (env-gated dynamic import +
  build alias) so AGPL code never distributes — then the flag can't be enabled
  in prod without a rebuild.
- **C:** purchase commercial Swiss Ephemeris license for proprietary use.

**Disposition:** BLOCKED on owner decision — cannot be resolved in code alone.

## 3. Full accuracy validation

`npm run validate:accuracy` executed this session — result recorded in
`cert-accuracy-full.txt` / `dist/accuracy-report.txt` (see FINAL_LAUNCH_CERTIFICATION
update). Tolerances per `src/tests/validation/accuracySuite.test.ts`.

## 4. Lighthouse CI

`npm run test:perf` requires lhci + Chrome against a preview; not executed —
needs CI runner. Deferred to CI pipeline (non-blocking; bundle sizes already
measured: vendor 1053 kB lazy, entry 135 kB).

## 5. Vitest worker/memory flake → CI guard

Already mitigated in-repo: `vitest.config.ts` `maxWorkers: 4`,
`testTimeout: 60s`. For CI: ensure runners have ≥4 GB free RAM or set
`maxWorkers: 2` via env; document in CONTRIBUTING/CI docs.

## 6. Lint warnings

1273 warnings / 0 errors. Correctness-relevant subset = `react-hooks/
exhaustive-deps` (~13 remaining, all documented/intentional or pre-existing).
Backlog, not launch blockers.

## 7. Deploy sequence (unchanged, awaiting authorization)

push `chore/safe-redundancy-cleanup` → PR → merge to main → Netlify auto-
deploy → post-deploy smoke (Kundli/Prashna/Milan/Panchang/PDF/auth/privacy)
→ tag release.
