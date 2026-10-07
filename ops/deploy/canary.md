# Canary Deploy Procedure

1. Deploy new version to **10%** of traffic.
2. Watch for 15 min:
   - error rate (Sentry) < baseline + 0.5%
   - p95 latency < 1.2× baseline
   - no new fatal issues
3. If healthy → promote to 50% → soak 15 min → 100%.
4. If unhealthy → rollback (see rollback.md).

## Feature-flag gated risky changes
Ship behind a flag first; canary the flag at 1% → 10% → 100%.
