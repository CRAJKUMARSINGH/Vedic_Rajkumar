# DR Drill Log

Append-only. One entry per drill. Never edit a past entry.

## Template

    ### [YYYY-MM-DDTHH:MM:SS+05:30] — <kind> drill
    - Result: passed | failed
    - Backup taken at: <ts> (RPO clock)
    - Measured RTO: <min> (target 60)
    - Rows: <restored>/<expected> on critical tables
    - RLS policies restored: <n>
    - Erasure requests re-applied: <n>
    - Ledger chain verified: yes | no
    - Failure: <reason if any>
    - Run: <workflow run id>

## Log

### [2026-11-04T02:00:00+05:30] — restore drill

- Result: passed
- Backup taken at: 2026-11-04T01:52:00+05:30 (RPO 8 min, target 15)
- Measured RTO: 41 min (target 60)
- Erasure requests re-applied: 3
- Ledger chain verified: yes
