# Enrichment Log

Append-only. One entry per window.

## Template

    ### [YYYY-MM-DD] — <kind> batch
    - Batch: <id>
    - Entries: <n> (en <n> / hi <n>)
    - Canary: <pct> → promoted after <min>
    - Coverage after: <kind> en <n>/<expected>, hi <n>/<expected>
    - Reverted: yes | no
    - Notes: <what changed, and why>

## Log

### [2026-11-25] — festival batch, year 2027

- Batch: 7f2a…
- Entries: 34 (en 17 / hi 17)
- Canary: 100 (date-gated to 2027-01-01)
- `festival_year_health(2027).ready` = true, all entries sourced and verified
- Notes: published ahead of the 30 Nov deadline, per runbook §4

### [2026-12-01] — dasha interpretation batch

- Batch: 91bd…
- Entries: 18 (en 9 / hi 9)
- Coverage after: dasha en 9/9, hi 9/9
- Notes: tightened the antardasha wording; no calc-layer change
