# Audit state

**Owner:** Core · **Last updated:** 2026-10-30 · **Next re-audit:** 2027-01-30

The one page that keeps the rest of `docs/` from rotting. Everything else in this
repo is a guard; this file is the guard on the guards. Its rule is AD-∞ in
[ANTI_DOSES.md](ANTI_DOSES.md): the most likely post-launch failure is not a
missing control, it is 20 controls nobody re-reads.

If this file's **Last updated** is more than 120 days old, AD-∞ has fired and the
whole anti-dose layer is unverified.

## Early re-audit trigger

Re-audit **before** the next scheduled date if **any** of the following is true:

- Any single tripwire in the table below has fired since the last re-audit.
- A dose's guard was bypassed, `--force`d, or deleted in the last quarter.
- A new dose or guard was added without a matching anti-dose in the same PR.

## Tripwires

One line per anti-dose. "Reading" is the most recent measured value; "—" means
**not yet measured**, which is an open item, not a pass.

| Anti-dose | Tripwire                                                        | Owner    | Reading                | Status     |
| --------- | --------------------------------------------------------------- | -------- | ---------------------- | ---------- |
| AD-1      | `week_2_return_after_exhaustion` < 25%                          | Growth   | —                      | unmeasured |
| AD-2      | S2+ ticket containing "paid" + "blocked"                        | Support  | —                      | unmeasured |
| AD-3      | entitlement recon drift > 0 rows, two nights running            | Billing  | —                      | unmeasured |
| AD-4      | one file in > 40% of the last 50 PRs                            | Core     | —                      | unmeasured |
| AD-5      | `admit_request` p95 > 40ms, or limiter timeout > 1%             | Platform | —                      | unmeasured |
| AD-6      | > 5 paging alerts / 7 days, or > 1 alert with no owner          | Platform | —                      | unmeasured |
| AD-7      | any DPA register row > 120 days, or VPAT claim with no test     | Security | —                      | unmeasured |
| AD-8      | median time-to-first-review > 8 working hours, or PR open > 48h | Core     | —                      | unmeasured |
| AD-9      | perf baseline raised > 3× without a deletion                    | Frontend | —                      | unmeasured |
| AD-10     | DR drill `rows_restored` < 10% of production rows               | Platform | —                      | unmeasured |
| AD-11     | a claim in `CLAIMS.md` with no `demo:` path                     | Founder  | —                      | unmeasured |
| AD-∞      | this file older than 120 days                                   | Core     | 0 days (created today) | ok         |

## Quarterly checklist

1. Fill the **Reading** column for every tripwire above, or write "not measured
   yet" and mark it as an open item. Do not leave a row blank.
2. For each fired tripwire, decide: **act** (open a DEF- and fix) or
   **explicitly accept** (write the acceptance and the reason inline).
3. Bump **Last updated** and **Next re-audit** (quarterly) in the header.
4. Confirm any dose added in the last quarter has a matching anti-dose entry.

## Notes

- An unmeasured tripwire is a debt, not a green light. The rows above start
  unmeasured because the funnel, alerting, and DR paths are not yet producing
  readings; they become measurable once real traffic and one real DR drill exist.
- This file mirrors the dashboard at the foot of [ANTI_DOSES.md](ANTI_DOSES.md).
  If the two disagree, `ANTI_DOSES.md` is authoritative.
