# Incident Log

Append-only. One entry per incident. Never edit a past entry.

## Template

    ### [YYYY-MM-DDTHH:MM:SS+05:30] — <SEV> — <one-line title>
    - Detected by: monitoring | user | self
    - Detection gap: <time from first impact to first human awareness>
    - Mitigation lever: kill flag | frontend rollback | edge rollback | forward fix
    - Time to mitigate: <min>
    - Time to resolve: <min>
    - Data impact: none | N subjects | erasure re-applied: yes/no
    - Root cause: <one line>
    - DEF-: <ids>
    - Post-incident doc: <link or "not required (S2/S3)">

## Log

### [2026-11-21T14:12:00+05:30] — S2 — PDF export produced an empty file for Hindi locale

- Detected by: user
- Detection gap: 3h (no alert on export size)
- Mitigation lever: kill flag (`kill_pdf_export`)
- Time to mitigate: 40s
- Time to resolve: 3h 20m (font subsetting bug in the Devanagari path)
- Data impact: none
- Root cause: font subset dropped all glyphs when the locale was `hi`
- DEF-041 (fix), DEF-042 (alert on export byte size)
- Post-incident doc: not required

### [2026-11-24T09:02:00+05:30] — S1 — Checkout returned 500 for INR customers

- Detected by: monitoring (error rate alert, 4 min)
- Detection gap: 4 min
- Mitigation lever: kill flag (`kill_checkout`)
- Time to mitigate: 12 min (incl. triage)
- Time to resolve: 1h 05m
- Data impact: none (no double charges; reconciliation confirmed)
- Root cause: a Stripe price lookup used a USD-only key on the INR path
- DEF-044 (fix), DEF-045 (per-currency checkout spec)
- Post-incident doc: docs/audit/postmortems/2026-11-24-checkout-inr.md
