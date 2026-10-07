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
