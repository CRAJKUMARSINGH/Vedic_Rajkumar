# Threat model

Scope: the deployed product's trust boundaries. Every control named here is
enforced server-side; a client-side check (route guard, hidden button, `isAdmin`
ternary) is UX, **not** authorization — see [AGENTS.md](AGENTS.md).

| Asset                                                                             | Boundary                | Control                                                                                                                                                      |
| --------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Birth data (DOB, TOB, place, coordinates)                                         | client → Supabase       | owner-scoped RLS (`owner_id = COALESCE(auth.uid()::text, auth.jwt() ->> 'sub')`), no anonymous policies, input sanitised at the boundary                     |
| Seed-bank birth data and derived verdicts (`src/data/jataks/`, `public/answers/`) | repo → public           | deny-by-default; verdict-only, redacted cards; admin-only reads; raw birth fields never returned to non-admin                                                |
| Edge functions                                                                    | public → Deno           | Clerk JWT verification, per-user rate limits (`rate_limit_log`), SSRF guard (`supabase/functions/_shared/ssrf.ts`), owner-scoped (BOLA) checks on every read |
| Admin / tier views                                                                | role → data             | server-side role check (`ROLE_DEFINITIONS[role].isAdmin`); the client ternary is UX only                                                                     |
| Feedback screenshots                                                              | client → private bucket | explicit consent, short-lived signed read URLs (`SIGNED_READ_TTL_SECONDS`), author-or-owner/admin only                                                       |

## Explicitly out of scope

- **Ephemeris supply chain** — pinned by version and, for the golden corpus, by a
  recorded corpus hash in `tools/accuracy/golden/manifest.json`.
- **Clerk** — third-party identity provider.
- **Local demo mode** — no server boundary is crossed; data stays in the browser.

## References

- [SECURITY.md](SECURITY.md) — RLS policies, rate limits, response headers.
- [docs/security/PENTEST_SCOPE.md](docs/security/PENTEST_SCOPE.md) — pen-test scope.
- [docs/legal/DSR.md](docs/legal/DSR.md) — data-subject request runbook.
