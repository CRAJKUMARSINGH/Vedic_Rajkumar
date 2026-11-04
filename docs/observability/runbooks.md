# Incident Runbooks

## High Error Rate

1. Open Sentry → filter by `release:latest`
2. Check last deploy; if within 30 min → **rollback** (`git revert` + redeploy)
3. Inspect correlation-id trail in log drain
4. Confirm DB health at `/health`
5. Post status update; open incident channel

## Chart Accuracy Degradation

1. Run `npm run validate:accuracy` against Swiss Ephemeris fixtures
2. Compare ayanamsa config (Lahiri / Chitra Paksha) in kundli calculation
3. If regression → disable via feature flag, rollback edge function
4. Notify practitioners (accuracy is trust-critical)

## Database Down

1. Check Supabase status page
2. Verify RLS didn't block service role
3. Failover to read replica if available
4. Degrade gracefully: serve cached charts

## Error Budget Burn (Fast)

1. Burn rate > 14.4 = budget gone in ~2 days
2. Freeze non-critical deploys
3. Root-cause and remediate before resuming

## Budget: Supabase compute

1. Supabase dashboard → Reports → Compute; confirm the burn is real, not a metric gap
2. Attribute the spend: slow queries (`pg_stat_statements`), runaway edge invocations, or a hot loop in a cron
3. Mitigate: add the missing index, cap the cron, or trip the relevant `killswitch.*` flag
4. If the budget is genuinely too small for the traffic, raise it deliberately and record why

**Observe it firing:** in a non-production project, run a synthetic load against
`/calculate-kundli` until `supabase_compute_hours_month` crosses `warn_at`. The
alarm must appear in the channel named in `budgets.yml` before you trust it.

## Budget: Netlify build minutes

1. Netlify → Site → Usage → Build minutes
2. Common cause: a workflow that builds on every push (path filters missing)
3. Mitigate: tighten `paths:` filters, cache `node_modules`, or stop rebuilding on doc-only changes

**Observe it firing:** temporarily remove the `paths:` filter from a workflow on a
branch and push twice; the minute counter must move and warn.

## Budget: Sentry quota

1. Sentry → Stats → confirm the spike is a new error, not a duplicated one
2. Group noisy events and mute/ignore them at the source
3. If quota is exhausted, `killswitch.telemetry` stops client log forwarding so the
   quota can refill without losing the error pages

**Observe it firing:** send a burst of synthetic events from a staging DSN until the
quota percentage crosses `warn_at`.

## Budget: PostHog event volume

1. PostHog → Activity → find the event with the highest volume
2. Check for a tracking call inside a render loop or a per-keystroke handler
3. Mitigate: debounce or move the event to a coarser trigger; if needed, gate
   analytics behind a feature flag

**Observe it firing:** replay a synthetic batch to the capture endpoint until the
volume crosses `warn_at`.

## Kill switch

Three flags, mirrored between Flagsmith (UI) and the `kill_switches` table (edge):

| Flag                   | Effect                                                   |
| ---------------------- | -------------------------------------------------------- |
| `killswitch.api`       | Public API surfaces return 503 with a bilingual body     |
| `killswitch.edge`      | Every edge function short-circuits before doing work     |
| `killswitch.telemetry` | Client log forwarding stops (`/ingest-logs` returns 503) |

1. Flip the flag in Flagsmith **and** set `enabled=true` for the row in `kill_switches`
2. Confirm the affected surface returns 503 and the body carries both `hi` and `en`
3. Flip it back; **always** flip back in the same session so a drill does not become an outage
4. Record the drill in `reports/drills/killswitch-<date>.md` (`npm run drill:killswitch`)
