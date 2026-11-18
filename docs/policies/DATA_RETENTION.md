# Data Retention Policy

**Owner:** Privacy Lead · **Enforced by:** `public.apply_retention()` (hourly cron)

Retention is data, not prose: `public.retention_policies` drives the pruning, so
this document and the code cannot drift.

| Data                   | Retention       | Basis                           |
| ---------------------- | --------------- | ------------------------------- |
| `edge_request_samples` | 14 days         | operational                     |
| `rum_samples`          | 14 days         | operational                     |
| `slo_snapshots`        | 90 days         | operational                     |
| `api_usage`            | 400 days        | billing dispute window          |
| `audit_logs`           | 365 days        | SOC 2 CC7                       |
| `rate_limit_buckets`   | 1 day           | operational                     |
| `client_logs`          | 30 days         | operational                     |
| `erasure_ledger`       | **indefinite**  | proof; must outlive the subject |
| birth data (hard)      | until erasure   | contract                        |
| backups                | 30 days rolling | DR                              |

## Why the erasure ledger never expires

It holds `subject_ref` (a hash, not PII) and exists precisely to answer "is this
person gone?" years later. Deleting it destroys the answer.

## Backups are the honest gap

Erasure reaches live systems. A 30-day-old backup still contains the deleted
subject. The policy is therefore: **state the backup window in the erasure
response**, and do not claim point-in-time erasure from backups. Restoring a
backup and expecting the deletion to persist is a documented trap — the restore
runbook must re-apply erasure for subjects deleted after the backup date.

## Review

Quarterly. Any new table must either appear here or be explicitly operational
and pruned.
