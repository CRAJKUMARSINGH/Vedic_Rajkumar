-- Month-partitioned sink for high-volume client logs (Week 13).
-- Existing client_logs remains the default insert target until dual-write is enabled.

CREATE TABLE IF NOT EXISTS client_logs_monthly (
  id BIGSERIAL,
  level TEXT NOT NULL,
  message TEXT,
  correlation_id TEXT,
  request_id TEXT,
  user_id UUID,
  service TEXT,
  url TEXT,
  context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS client_logs_monthly_2026_10
  PARTITION OF client_logs_monthly
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE TABLE IF NOT EXISTS client_logs_monthly_2026_11
  PARTITION OF client_logs_monthly
  FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

CREATE TABLE IF NOT EXISTS client_logs_monthly_default
  PARTITION OF client_logs_monthly DEFAULT;

CREATE INDEX IF NOT EXISTS idx_client_logs_monthly_created
  ON client_logs_monthly (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_usage_created
  ON api_usage (created_at);

ALTER TABLE client_logs_monthly ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert monthly logs" ON client_logs_monthly
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read monthly logs" ON client_logs_monthly
  FOR SELECT USING (true);
