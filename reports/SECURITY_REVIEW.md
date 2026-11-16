# SECURITY & PERFORMANCE REVIEW — 2026-11-16

## Security

| Area                                         | Status           | Evidence                                                                                                     |
| -------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------ |
| Seed-bank confidentiality (AGENTS rules 1–6) | PASS             | No seed data added to `public/`; answer cards served owner/admin-only; non-admin responses verdict-only      |
| Auth/session                                 | PASS (structure) | Clerk hooks only inside ClerkProvider; `ClerkGate`/`isClerkConfigured` split verified both modes             |
| Data export/delete                           | PASS             | `dataExportService`/`dataDeleteService` owner-scoped; demo mode never simulates deletion                     |
| API keys                                     | PASS             | `.env` gitignored; only `.env.example` placeholders; no secrets in committed files                           |
| Service worker                               | PASS             | workbox precache of app shell only; no user data cached                                                      |
| Error logging                                | PASS             | `errorMonitoring`/`privacyScrubber` tests in suite; no PII in console paths audited                          |
| Dependencies                                 | PASS             | `zod` pinned 4.6.7 (GHSA-mrhx-c7xc-m3w5); `dompurify` override ^3.4.17; lockfile regenerated for netlify-cli |
| RLS                                          | PASS (declared)  | Supabase migrations + edge functions present; enforcement server-side per AGENTS.md                          |

No CRITICAL/HIGH security findings.

## Performance (measured this run)

- `npm run build`: **exit 0**, ~1m39s, **223 precache entries / 6.66 MB**.
- Largest chunks (minified): `vendor` 1052 kB (gzip 330 kB), `pdf` 369 kB,
  `analytics` 324 kB, `charts` 271 kB — all lazy-loaded routes; main entry
  `index` 135 kB. Chunk-size warning >400 kB is informational (lazy chunks).
- Route-level code splitting: confirmed — page chunks emitted per route.
- Unit suite: 1717 tests / ~145 s with `maxWorkers: 4`.
- Lighthouse CI config present (`.lighthouserc.json`, `npm run test:perf`) —
  not executed this run (requires running preview + Chrome); recommend CI run.

## Bundle note

`vendor` chunk >1 MB minified is the main optimization target (manualChunks
already partially applied). Not a regression — pre-existing.
