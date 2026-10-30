# Pre-launch safety check

**Read:** before the first production deploy, then every Friday (10 min).
**Owner:** on-call · **Escalation:** any FAIL blocks a deploy.

## A. Uninterrupted service

| #   | Check                                       | Command                                           | Gate        |
| --- | ------------------------------------------- | ------------------------------------------------- | ----------- |
| A1  | Deploy safety passes                        | `npm run deploy:safety -- --production`           | FAIL blocks |
| A2  | Rollback artefact exists                    | `cat .deploy/rollback.json`                       | FAIL blocks |
| A3  | SW cache version bumped when `src/` changed | in `deploy:safety`                                | FAIL blocks |
| A4  | `MIN_CLIENT_VERSION` older than 7 days      | in `deploy:safety`                                | FAIL blocks |
| A5  | No destructive migration in one step        | in `deploy:safety`                                | FAIL blocks |
| A6  | Rollback rehearsed this month               | `docs/ops/rollback-log.md` dated < 30d            | WARN        |
| A7  | Connection count headroom > 50%             | `psql -c "select count(*) from pg_stat_activity"` | WARN        |

## B. Hotfix readiness

| #   | Check                                               | Command                          | Gate        |
| --- | --------------------------------------------------- | -------------------------------- | ----------- |
| B1  | Every shipped surface has a kill flag               | `docs/flags.yaml` vs `src/pages` | FAIL blocks |
| B2  | Flag endpoint healthy                               | `curl -s $EDGE/flags \| jq .`    | FAIL blocks |
| B3  | Kill switch works from a phone                      | open `/?kill=checkout`           | FAIL blocks |
| B4  | `kill_checkout` / `kill_funnel` off in normal state | `psql -c "select * from flags"`  | WARN        |
| B5  | No kill flag left on for > 7 days                   | `flag_changes` query             | WARN        |
| B6  | Incident log has an entry this quarter              | `docs/audit/INCIDENT_LOG.md`     | WARN        |
| B7  | Someone is actually on-call today                   | calendar                         | FAIL blocks |

## C. Enrichment safety

| #   | Check                                  | Command                                  | Gate                     |
| --- | -------------------------------------- | ---------------------------------------- | ------------------------ |
| C1  | Coverage complete, both locales        | `content_coverage` per kind              | FAIL blocks              |
| C2  | Current year festival calendar ready   | `festival_year_health(<year>)`           | FAIL blocks              |
| C3  | Next year's festival calendar ready    | `festival_year_health(<year+1>)`         | WARN (FAIL after 30 Nov) |
| C4  | Golden fixture in sync                 | `npm run content:golden:sync -- --check` | FAIL blocks              |
| C5  | No batch stuck in `validated` > 7 days | `content_batches` query                  | WARN                     |
| C6  | Last enrichment window logged          | `docs/ops/enrichment-log.md`             | WARN                     |

## D. The things that are not about code

| #   | Check                                               | Gate        |
| --- | --------------------------------------------------- | ----------- |
| D1  | `/status` page is reachable and current             | FAIL blocks |
| D2  | A real chart works on a real phone, on mobile data  | FAIL blocks |
| D3  | A real checkout completes (test mode is not enough) | FAIL blocks |
| D4  | Stripe reconciliation ran last night with 0 drift   | WARN        |
| D5  | Last DR drill passed                                | WARN        |
| D6  | At least one real user gave feedback this week      | WARN        |

## E. The Friday 10 minutes

Run A1–A5, B1–B3, C1–C4, D1–D3. That is the set that blocks a deploy. Everything
else is a WARN you record and move on from — a checklist where everything blocks
gets abandoned in three weeks.

    npm run preflight     # runs every FAIL-blocking check above

## F. If something fails

1. A FAIL blocks the deploy, not the fix. You can still ship the _fix_ — the
   difference is that the fix must first resolve the FAIL.
2. Record a FAIL you deliberately accept in `docs/ops/pre-launch-accepted.md` with
   a date and an owner. An accepted FAIL with no date is a forgotten FAIL.
3. If a check has failed three Fridays in a row, it is either wrong or unowned.
   Fix the check or delete it — do not keep it as permanent noise.

## G. Before the very first production deploy

- [ ] All of A and B pass.
- [ ] One DR drill has passed (`docs/ops/dr-drill-log.md`).
- [ ] One rollback has been rehearsed, not just scripted.
- [ ] `ACCESS_INVENTORY.md` has a second holder on GitHub and Supabase.
- [ ] `/status` and the incident comms template exist.
- [ ] You have written down **who you will tell first** if it breaks.
