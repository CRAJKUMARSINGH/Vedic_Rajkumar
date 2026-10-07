# Secrets Management

## Storage tiers
| Secret | Where | Rotation |
|--------|-------|----------|
| Supabase service role | Supabase + CI secrets | 90d |
| Sentry DSN | Public (client) | on compromise |
| PostHog key | Public (client) | on compromise |
| Logtail token | Supabase env | 90d |
| Webhook secrets | DB (per-endpoint) | 180d |
| API key pepper | Supabase env | annual |

## Rules
- NEVER commit real secrets — `.env.example` only.
- All CI secrets live in GitHub Actions encrypted secrets.
- Server secrets live only in Supabase function env (`supabase secrets set`).
- Rotate the service-role key on any suspected leak.
- Audit access quarterly.

## Rotation procedure
1. Generate new secret in provider.
2. `supabase secrets set KEY=value`
3. Deploy functions.
4. Verify health endpoint + a smoke test.
5. Revoke the old secret after 24h soak.
