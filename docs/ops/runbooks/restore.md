# Runbook — Restore

**Trigger:** data loss, corruption, or a drill · **Target RTO:** 60 min

## 0. Before you touch anything

    # what do we think is true?
    psql "$PROD_DB_URL" -c "select * from public.dr_readiness();"
    psql "$PROD_DB_URL" -c "select * from public.backup_health();"

Record the start time. **That is the RTO clock.** Announce in the incident channel
before the first command, not after.

## 1. Decide the restore point

| Situation                           | Restore to                |
| ----------------------------------- | ------------------------- |
| Accidental `DELETE` / bad migration | just before the migration |
| Corruption spreading                | last known-good backup    |
| Region loss                         | latest backup, accept RPO |

## 2. Restore into a scratch DB first

Never restore over production directly. Prove it on the side, then promote.

    pg_dump --format=custom --no-owner --no-acl --file drill.dump "$PROD_DB_URL"
    psql "$SCRATCH_DB_URL" -c "drop schema public cascade; create schema public;"
    pg_restore --no-owner --no-acl --clean --if-exists --dbname "$SCRATCH_DB_URL" drill.dump

## 3. Verify (do not skip)

    # row counts against the source, on the tables that matter
    # RLS survived
    psql "$SCRATCH_DB_URL" -c "select count(*) from pg_policies where schemaname='public';"
    # a ledger chain still verifies
    psql "$SCRATCH_DB_URL" -c "select public.verify_erasure_chain('<request-id>');"

## 4. THE STEP PEOPLE FORGET — re-apply erasure

    psql "$SCRATCH_DB_URL" -c \
      "select public.reopen_erasure_after_restore('<backup-taken-at>'::timestamptz);"

Then let `erasure-sweep` run (or trigger it). Subjects deleted after the backup
date are alive again in the restored data but forgotten by the processors — this
step re-runs their erasure so both sides agree again.

**Skipping this makes the erasure ledger a lie.** It is the single most likely
post-restore compliance failure.

## 5. Promote

Point the app at the restored DB (or restore over production in a maintenance
window), then:

    psql "$PROD_DB_URL" -c "select public.record_dr_drill('restore','passed', ...);"

## 6. After

1. Append to `docs/ops/dr-drill-log.md`: time, duration, rows, erasure reopened.
2. Check `dr_readiness()` — is RTO inside target?
3. If a runbook step was wrong, fix the runbook **in the same PR**, not later.

## Failure modes to expect

- **`pg_restore` permission errors** — extensions (`pg_cron`, `pg_net`) may need
  creating first on a fresh target.
- **`onblocked`/long restore** — indexes rebuild slowly on a cold target.
- **Storage 404s after promote** — objects are not in the dump. Bucket restore is
  a separate step (see `DR_PLAN.md` §3).
