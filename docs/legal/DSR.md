# Data Subject Request (DSR) Runbook

**Owner:** Privacy Lead · **SLA:** 1 month (GDPR Art 12), 30 days (DPDP)

## Request types

| Right                 | Mechanism                        | SLA       | Automated?  |
| --------------------- | -------------------------------- | --------- | ----------- |
| Access                | `export-user-data` edge fn       | 30 days   | ✅          |
| Portability           | same, JSON bundle                | 30 days   | ✅          |
| Erasure               | `user-erasure` → `erasure-sweep` | 30 days   | ✅ (ledger) |
| Rectification         | profile edit / operator          | 30 days   | partial     |
| Restriction           | `status = 'restricted'` flag     | 30 days   | manual      |
| Objection (analytics) | consent withdrawal               | immediate | ✅          |

## Erasure walkthrough

1. Subject calls `POST /functions/v1/user-erasure` (or an operator opens a row via
   `select open_erasure_request(...)`).
2. A `grace_until` of 30 days is set. Until then the account is restorable.
3. After grace, `erasure-sweep` claims steps in ordinal order — analytics and
   monitoring first, auth last (deleting auth cascades our own rows).
4. Each step records `evidence` (HTTP status, counts) into `erasure_steps` and an
   append-only, hash-chained entry into `erasure_ledger`.
5. `finalize_erasure_request` marks `completed` only when no step is pending and
   none failed. Otherwise `partial`.

## Proving it

    select verify_erasure_chain('<request-id>');   -- must be true
    select processor, status, attempts, evidence, last_error
      from erasure_steps where request_id = '<request-id>' order by ordinal;

The chain is `sha256(prev_hash || payload)`. Any edit to a historical row breaks
verification — that is the point.

## A `partial` request is not a failure to hide

If a processor is down for a day, the request stays `partial` and the step retries
with exponential backoff (15s → 1h cap). `partial` means "we have not finished",
which is honest. `completed` with a `failed` step would be a lie.

## `skipped` vs `ok`

`skipped` = no credentials configured, so we genuinely did not talk to the
processor. `ok` = we called it and it confirmed. Collapsing these two is the most
common way an erasure claim becomes false.

## Access request walkthrough

1. `export-user-data` emits a JSON bundle (SHA-256 checksummed) to the exports bucket.
2. Bundle includes our own tables. It does **not** include processor-held data —
   state that in the response rather than implying completeness.
3. Signed URL valid 7 days.

## Logging

Every DSR gets an `audit_logs` entry (actor, subject_ref, type, outcome) via the
existing `auditService`. Retention 365 days.
