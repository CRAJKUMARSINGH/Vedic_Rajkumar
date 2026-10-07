# DB Scaling Playbook

- Enable PITR (already on)
- Add **read replica**; route analytics + heavy reads to it
- Create covering indexes for the top 10 slow queries (`pg_stat_statements`)
- Materialized views for SAV/accuracy; refresh via cron
- Connection pooling via Supavisor (transaction mode) for edge
- Partition `client_logs_monthly` and `api_usage` by month; drop old partitions

Existing `client_logs` stays as the live insert table. New high-volume ingest should target `client_logs_monthly` (see migration `20241007000009_partition_logs.sql`). Convert only after a dual-write soak.

## Find slow queries

```sql
SELECT query, calls, mean_exec_time
FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 20;
```
