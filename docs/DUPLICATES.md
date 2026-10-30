# Duplicate Subsystems — register

**Owner:** Core Engineering · **Enforced by:** `npm run duplicates:check` + `src/tests/architecture/duplicates.test.ts`

Every row below was a live duplicate. Each one is a coin-flip that eventually
gets resolved the wrong way by accident. The guard fails if any reappears.

## Deleted

| Path                                     | Why it was dead                                                                      | Replacement         |
| ---------------------------------------- | ------------------------------------------------------------------------------------ | ------------------- |
| `eslint.config.cjs`                      | flat-config resolution picks `.js` first, so every edit to `.cjs` was a silent no-op | `eslint.config.js`  |
| `src/lib/envConfig.ts`                   | second env module                                                                    | `src/config/env.ts` |
| `src/test/`                              | second test tree, parallel to `src/tests/`                                           | `src/tests/`        |
| `public/service-worker.js`               | `vite-plugin-pwa`/workbox already registers                                          | `vite.config.ts`    |
| `src/utils/serviceWorkerRegistration.ts` | second registration path                                                             | `vite.config.ts`    |
| `supabase/functions/user-data-export/`   | duplicate of `export-user-data`                                                      | `export-user-data`  |

## Generated, not hand-edited

| Path                    | Emitter                                               |
| ----------------------- | ----------------------------------------------------- |
| `docs/api/openapi.yaml` | `npm run openapi:emit` (from `src/api/v1/openapi.ts`) |

## One owner per concern

| Concern       | Owner                                               | Retired                                                                                   |
| ------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Analytics     | `src/observability/analytics/posthog.ts`            | `VITE_GA_MEASUREMENT_ID` (GA4 removed)                                                    |
| Logging       | `src/observability/logging/logger.ts`               | — (pino is the transport, not a second logger)                                            |
| Consent       | `src/hooks/useConsent.ts` + `user_privacy_consents` | — (`ConsentBanner` renders, `useConsent` decides)                                         |
| Feature flags | `src/features/flags/`                               | — (Flagsmith is the transport; kill-switches are a distinct concern with their own table) |
| Public API    | `supabase/functions/v1` (mounts `src/api/v1`)       | —                                                                                         |

## Still open (needs a human read, not a script)

| Item                            | Why it is not in this dose                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| Four ephemeris engines          | Consolidating them changes numerics; needs the accuracy corpus to stay green per step |
| `src/services/` ~130 flat files | Needs `dependency-cruiser` to define boundaries first                                 |
| Duplicate rate limiters         | Both are in-memory; fixing means shared state (dose 5)                                |

## How to add an entry

1. Delete the path.
2. Add it to `scripts/duplicates.manifest.json` → `banned`.
3. `npm run duplicates:check` must pass.
4. Note it here.
