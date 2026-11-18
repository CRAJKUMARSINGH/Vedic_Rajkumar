# Access Inventory & Break-Glass

**Owner:** Security Lead · **Review:** quarterly · **Last reviewed:** 2026-11-02

An auditor's first question after "what do you run" is "who can touch it". Today
the honest answer is "one person" for most rows.

| System           | Access type | Holders | Break-glass                  | Recovery if the holder is gone  |
| ---------------- | ----------- | ------- | ---------------------------- | ------------------------------- |
| GitHub org       | owner       | 1       | ✅ second owner              | GitHub support + verified email |
| Supabase project | owner       | 1       | ✅ service role in 1Password | project recovery key            |
| Stripe account   | admin       | 1       | —                            | support ticket + business docs  |
| Netlify          | admin       | 1       | —                            | DNS + repo access               |
| Domain registrar | admin       | 1       | —                            | registrar account recovery      |
| Sentry / PostHog | admin       | 1       | —                            | email recovery                  |
| Clerk            | admin       | 1       | —                            | email recovery                  |
| 1Password vault  | owner       | 1       | ✅ emergency kit printed     | recovery codes                  |

## Rules

1. Every row must reach **2 holders** before an enterprise contract is signed.
   "Bus factor 1" is the single most common procurement objection.
2. Break-glass credentials live in the vault _and_ on paper. A vault you cannot
   open because the only person who can open it is unavailable is not a vault.
3. Service-role and Stripe secret keys are stored once, in the vault — never in a
   `.env` on a laptop that is also the only copy.
4. Onboarding a second holder is a checklist item on the enterprise track, not a
   "when we have time".

## Quarterly check

1. Is each row still 2 holders?
2. Do the break-glass docs still work? (Actually open the vault with them.)
3. Any orphaned access — a contractor who left?
4. Record the check in `docs/audit/ACCESS_REVIEW.md`.
