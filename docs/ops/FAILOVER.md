# Failover

**Owner:** Platform · **Status:** single-region, by decision

## 1. What we actually have

One Supabase project, region `ap-south-1` (Mumbai). Chosen for latency to the
primary market and because India data residency is simpler to explain to a
customer's legal team than a US region with SCCs.

## 2. What we do NOT have (say it plainly)

- No active-active multi-region.
- No automatic regional failover. A region outage is a **manual** recovery.
- No cross-region read replica today.

Supabase's read replicas and PITR are plan-dependent. Neither is a failover
strategy on its own — a read replica promotes, but nothing routes to it
automatically.

## 3. Failure taxonomy and response

| Failure            | Blast radius | Response                         | RTO     |
| ------------------ | ------------ | -------------------------------- | ------- |
| Edge function bug  | one route    | roll back the deploy             | minutes |
| Bad migration      | DB writes    | restore, forward-fix             | 1 h     |
| Region degradation | everything   | manual promote to a warm project | 2–4 h   |
| Vendor outage      | everything   | wait or promote                  | hours   |
| Data corruption    | data         | restore + erasure re-apply       | 1 h     |

## 4. Manual failover (region) — the honest procedure

1. Confirm it is the region, not us (Supabase status + a direct `psql` from
   outside our infra).
2. Provision a project in the secondary region.
3. Run the restore drill against it (`scripts/dr-restore-drill.mjs`).
4. Point `VITE_SUPABASE_URL` + edge secrets at it. Redeploy edge functions.
5. Expect stale data up to the RPO. Accept it explicitly, in writing.

## 5. Measuring failover (not guessing)

A failover that has never been rehearsed is a plan, not a capability. The drill
records `kind = 'failover'` runs into `dr_drill_runs`, and `dr_readiness()`
reports them. Target: one rehearsal per quarter.

## 6. What would justify multi-region

Not "it sounds safer". The triggers are:

1. A paying enterprise contract with a stated availability SLA we cannot meet
   single-region.
2. Measured latency pain from a region we do not serve from.
3. A second market with a residency requirement we cannot satisfy from Mumbai.

Until one of those is true, multi-region is cost without a customer.
