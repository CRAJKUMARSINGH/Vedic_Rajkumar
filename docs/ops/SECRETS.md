# Secrets Manifest

**Owner:** Founder · **Checked by:** `scripts/deploy-safety.mjs` (check 6)

Every `Deno.env.get()` in `supabase/functions/**` must have a row here. The check
fails the deploy if code reads a key the manifest does not name — which is how a
secret gets referenced in code, never provisioned, and only discovered at runtime
as a `undefined` string joined into a URL.

**Never put a value in this file.** Only the _location_ where the value lives.

Two store types:

- **edge-secret** — `supabase secrets set`, readable only by the edge runtime.
  These are the ones a function actually needs at request time.
- **repo-variable** — set in the GitHub repo (Actions → Variables). Public by
  policy (a price id, a region name), not a credential.

## Runtime keys

| Key                         | Store                  | Where                                                        | Used by                                                                                                       |
| --------------------------- | ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_URL`              | edge-secret (injected) | Supabase runtime, auto-provisioned                           | every function                                                                                                |
| `SUPABASE_ANON_KEY`         | edge-secret (injected) | Supabase runtime, auto-provisioned                           | `health`, `answer-cards`, `export-user-data`, `user-data-delete`, `_shared/edgeClient`, `_shared/viteEnvShim` |
| `SUPABASE_SERVICE_ROLE_KEY` | edge-secret (injected) | Supabase runtime, auto-provisioned                           | all service-role callers (`_shared/*`, `flags`, `funnel`, `erasure-sweep`, …)                                 |
| `CRON_TOKEN`                | edge-secret            | `supabase secrets set CRON_TOKEN`                            | `slo-evaluator`, `erasure-sweep`                                                                              |
| `ALERT_WEBHOOK_URL`         | edge-secret            | `supabase secrets set ALERT_WEBHOOK_URL`                     | `slo-evaluator`                                                                                               |
| `LOGTAIL_SOURCE_TOKEN`      | edge-secret            | `supabase secrets set LOGTAIL_SOURCE_TOKEN`                  | `ingest-logs` (optional — falls back to `console.log`)                                                        |
| `STRIPE_SECRET_KEY`         | edge-secret            | vault: `stripe/prod/secret-key`                              | `_shared/stripe`                                                                                              |
| `STRIPE_WEBHOOK_SECRET`     | edge-secret            | vault: `stripe/prod/webhook-signing-secret`                  | `stripe-webhook`                                                                                              |
| `OPENAI_API_KEY`            | edge-secret            | vault: `openai/embeddings`                                   | `prashna`, `knowledge`                                                                                        |
| `RESEND_API_KEY`            | edge-secret            | vault: `resend/send-key`                                     | `send-email`                                                                                                  |
| `EPHEMERIS_ENDPOINT`        | edge-secret            | `supabase secrets set EPHEMERIS_ENDPOINT`                    | `transit-calendar`                                                                                            |
| `TRANSIT_SERVICE_URL`       | edge-secret            | `supabase secrets set TRANSIT_SERVICE_URL`                   | `transit-alerts`                                                                                              |
| `POSTHOG_PERSONAL_API_KEY`  | edge-secret            | vault: `posthog/personal-api-key`                            | `_shared/erasure/adapters`                                                                                    |
| `POSTHOG_PROJECT_ID`        | edge-secret            | vault: `posthog/project-id`                                  | `_shared/erasure/adapters`                                                                                    |
| `POSTHOG_HOST`              | edge-secret            | vault: `posthog/host` (defaults to `https://eu.posthog.com`) | `_shared/erasure/adapters`                                                                                    |
| `SENTRY_AUTH_TOKEN`         | edge-secret            | vault: `sentry/auth-token`                                   | `_shared/erasure/adapters`                                                                                    |
| `SENTRY_ORG`                | edge-secret            | vault: `sentry/org`                                          | `_shared/erasure/adapters`                                                                                    |
| `SENTRY_PROJECT`            | edge-secret            | vault: `sentry/project`                                      | `_shared/erasure/adapters`                                                                                    |
| `CLERK_SECRET_KEY`          | edge-secret            | vault: `clerk/secret-key`                                    | `_shared/erasure/adapters`                                                                                    |
| `EXPORT_BUCKET`             | edge-secret            | vault: `storage/export-bucket` (defaults to `user-exports`)  | `_shared/erasure/adapters`                                                                                    |

## Non-secret runtime values

These are read with `Deno.env.get()` but carry no credential. They are provisioned
the same way; the distinction matters only when auditing blast radius.

| Key               | Store                  | Where                                                   | Used by                         |
| ----------------- | ---------------------- | ------------------------------------------------------- | ------------------------------- |
| `RELEASE_VERSION` | edge-secret            | `supabase secrets set RELEASE_VERSION` (set per deploy) | `health`, `_shared/viteEnvShim` |
| `DENO_REGION`     | edge-secret (injected) | Supabase runtime, auto-provisioned                      | `health`                        |
| `DENO_ENV`        | edge-secret (injected) | Supabase runtime, auto-provisioned                      | `_shared/viteEnvShim`           |

## Rotation

| Secret                                        | Rotate when                    | Owner action                                                                       |
| --------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY`                   | quarterly, or on holder change | Supabase dashboard → rotate, update `supabase secrets`, redeploy all functions     |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | on holder change               | Stripe dashboard → roll key, re-run `stripe-webhook` deploy, replay one test event |
| `CRON_TOKEN`                                  | quarterly                      | `supabase secrets set`, then update the `pg_cron` job header                       |
| `CLERK_SECRET_KEY`                            | on holder change               | Clerk dashboard → roll, update vault, redeploy `user-erasure`                      |
| `POSTHOG_*` / `SENTRY_*`                      | on holder change               | provider dashboard → roll, update vault                                            |

A rotation that does not redeploy the reading function is not a rotation — the old
value stays live in the running isolate until the next cold start.
