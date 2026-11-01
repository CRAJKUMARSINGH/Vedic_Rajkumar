# Disaster Recovery Plan

**Owner:** Platform · **Drill cadence:** monthly · **Last drill:** see `dr-drill-log.md`

## 1. The honest starting point

Before this dose, the repo said "backups: 30 days rolling". Nobody had restored
one. A backup that has never been restored is a **hypothesis**, and this document
does not treat it as more than that.

## 2. Targets (numbers, not adjectives)

| Metric                     | Target                              | Measured by                    |
| -------------------------- | ----------------------------------- | ------------------------------ |
| RTO (restore to queryable) | 60 min                              | `dr-restore-drill.mjs`         |
| RPO (max data loss)        | 15 min                              | backup freshness at drill time |
| Drill success rate (90d)   | ≥ 90%                               | `dr_readiness()`               |
| Restore fidelity           | exact row counts on critical tables | drill check                    |

Measured values are read from `public.dr_readiness()`. If the drill has never
passed, `ever_tested` is `false` and every claim is provisional.

## 3. Scope: what "restore" covers

In: Postgres data, RLS policies, functions, triggers, extensions.

**Not** in: Supabase Storage objects (separate bucket backup), Auth users (Clerk
and `auth.users` — Clerk is the source of truth for identity), edge function code
(in git), secrets (in the vault).

An auditor will ask about each. Say "not covered" rather than implying otherwise.

## 4. The trap this dose closes

Restoring a 30-day-old backup resurrects subjects deleted after the backup date.
Meanwhile the processors (PostHog, Sentry, Clerk) already forgot them. Left alone,
the restore silently breaks GDPR Art 17 and makes the erasure ledger a lie.

`reopen_erasure_after_restore(restored_to)` re-opens those requests; the normal
sweep finishes them again and the ledger records `reopened_after_restore`. **This
step is not optional and is asserted by the drill.**

## 5. Restore runbook

See `runbooks/restore.md`. The short version: dump → restore into scratch → verify
counts → verify RLS → **re-apply erasure** → verify a ledger chain → promote.

## 6. Failover

See `FAILOVER.md`. Today we are single-region (`ap-south-1`) by decision, not by
accident — see ADR-010.

## 7. Comms

See `INCIDENT_COMMS.md`. Status page is generated from `/functions/v1/status`
(dose 6), so the public page and the internal view cannot disagree.

## 8. STOP-THE-LAUNCH conditions

1. `dr_readiness().ever_tested = false` — never restored successfully.
2. Measured RTO or RPO outside target on the last drill.
3. A drill whose `erasure-reapplied` check did not run.
4. Backup freshness over 24h with no alert.
5. Two consecutive failed drills.

## 9. What is still not covered

- Point-in-time recovery to an arbitrary second (Supabase PITR is plan-dependent).
- Cross-region failover (single region today).
- Storage bucket restore automation.

## Change log

- **2026-11-04** — First drill, targets as numbers, erasure re-apply.
