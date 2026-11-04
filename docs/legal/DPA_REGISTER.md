# Processor & DPA Register

**Owner:** Security Lead · **Review:** quarterly · **Last reviewed:** 2026-11-01

An auditor opens this before any control. Every processor that touches personal
data must appear with its lawful basis, region, DPA status, and — critically — the
erasure mechanism that reaches it.

| Processor      | Purpose               | Data categories             | Region     | DPA        | Erasure mechanism                 |
| -------------- | --------------------- | --------------------------- | ---------- | ---------- | --------------------------------- |
| Supabase       | auth, DB, storage     | birth data, email, charts   | ap-south-1 | ✅         | `supabase_auth` adapter → cascade |
| Clerk          | authentication        | email, name, session        | US/EU      | ✅         | `clerk` adapter                   |
| PostHog        | product analytics     | distinct id, events, path   | EU         | ✅         | `posthog` adapter                 |
| Sentry         | error monitoring      | user id, stack, breadcrumbs | US         | ✅         | `sentry` adapter                  |
| Netlify        | hosting, edge headers | IP, request meta            | global CDN | ✅         | TTL (no durable store)            |
| Stripe         | billing               | email, card (tokenised)     | US/EU      | 🟡 planned | Stripe customer delete            |
| Cloudflare     | WAF, CDN              | IP                          | global     | 🟡 planned | TTL                               |
| Logtail        | log transport         | log lines                   | EU         | 🟡 planned | retention TTL                     |
| GitHub Actions | CI                    | commit metadata             | US         | ✅         | n/a (no end-user data)            |

## Rules

1. No new processor ships without a row here **and** an erasure adapter or a
   documented TTL justification.
2. "TTL" is only acceptable when the processor stores nothing durable about the
   subject — it must be stated as such, not assumed.
3. A 🟡 row is a known gap. It is a gap, not a pass.

## Sub-processors

Supabase (AWS), Clerk (AWS), Sentry (GCP), PostHog (AWS EU). Each vendor's public
sub-processor list is accepted by reference; a change notice is a quarterly review item.

## Transfer mechanism

EU → US transfers rely on the vendor's DPF certification (all three are certified).
EU → India (Supabase ap-south-1) is adequate for DPDP and needs no SCC.

## Evidence an auditor will ask for

1. This register, with the DPA PDFs attached.
2. One completed erasure request, showing `erasure_ledger` and `verify_erasure_chain() = true`.
3. One `skipped` step explained (proves the ledger distinguishes "not configured" from "worked").
