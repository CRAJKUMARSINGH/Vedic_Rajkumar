# Database Scaling Playbook

## Current setup (launch)

- Supabase managed PostgreSQL (ap-south-1 — Mumbai)
- PITR enabled (point-in-time recovery)
- Connection pooling via Supavisor (transaction mode)

---

## Phase 1 — First 10K MAU

### Find slow queries

```sql
SELECT query,
       calls,
       total_exec_time / calls AS mean_exec_ms,
       rows / calls AS mean_rows
FROM pg_stat_statements
ORDER BY mean_exec_ms DESC
LIMIT 20;
```

### Add covering indexes for top patterns

```sql
-- Charts by user + date range (most common)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_charts_user_created
  ON charts (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Transit lookups by chart + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transit_snapshots_chart_date
  ON transit_snapshots (chart_id, as_of DESC);

-- API usage stats (billing)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_usage_key_day_covering
  ON api_usage (key_id, day) INCLUDE (status, latency_ms);
```

### Materialized view for SAV/accuracy stats

```sql
CREATE MATERIALIZED VIEW mv_accuracy_stats AS
SELECT
  DATE_TRUNC('day', created_at) AS day,
  AVG((payload->>'accuracy_score')::float) AS avg_accuracy,
  COUNT(*) AS chart_count
FROM transit_snapshots
GROUP BY 1;

-- Refresh hourly via pg_cron
SELECT cron.schedule('refresh-accuracy-stats', '0 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_accuracy_stats');
```

---

## Phase 2 — 10K–100K MAU

### Add read replica

1. Supabase Dashboard → Database → Replicas → Add Read Replica
2. Route analytics + heavy reads:
   ```typescript
   // src/lib/db.ts
   export const readonlySupabase = createClient(
     import.meta.env.VITE_SUPABASE_REPLICA_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY,
   );
   ```
3. Route: dashboards, reports, accuracy queries → replica

### Partition high-volume tables

```sql
-- Partition client_logs by month (future months auto-created)
CREATE TABLE client_logs_y2026m10 PARTITION OF client_logs
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

-- Drop partitions > 3 months old
DROP TABLE IF EXISTS client_logs_y2026m06;
```

### Connection pool tuning

```toml
# supabase/config.toml
[db.pooler]
enabled = true
mode = "transaction"
default_pool_size = 20
max_client_conn = 200
```

---

## Phase 3 — 100K+ MAU

- Multi-region Supabase projects (read: ap-south-1 Mumbai, us-east-1 Virginia)
- Dedicated Supabase project per enterprise tenant
- Redis/Upstash for hot-path caching (SAV scores, panchang, transits)
- Consider TimescaleDB extension for time-series metrics

---

## Emergency procedures

### Identify blocking queries

```sql
SELECT pid, query, state, wait_event_type, wait_event, now() - query_start AS duration
FROM pg_stat_activity
WHERE state != 'idle' AND query_start < now() - INTERVAL '30 seconds'
ORDER BY duration DESC;
```

### Kill long-running query

```sql
SELECT pg_cancel_backend(<pid>);       -- graceful
SELECT pg_terminate_backend(<pid>);    -- force
```

### Vacuum / analyze after bulk operations

```sql
VACUUM ANALYZE charts;
VACUUM ANALYZE transit_snapshots;
```
