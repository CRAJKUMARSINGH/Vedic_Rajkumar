# Quarterly Restore Drill

Goal: prove you can recover from total data loss in < 1 hour.

- [ ] Spin up a scratch Supabase project
- [ ] Restore latest nightly backup into it
- [ ] Point a local build at the scratch project
- [ ] Verify: login works, a chart loads, an export runs
- [ ] Record RTO (time to restore) and RPO (data age at restore)
- [ ] File gaps; fix them

Target: RTO ≤ 60 min, RPO ≤ 24h.
