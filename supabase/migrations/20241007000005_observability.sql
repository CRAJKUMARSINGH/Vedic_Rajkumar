-- Client-side log sink (warn+ only, high volume)
CREATE TABLE IF NOT EXISTS client_logs (
  id BIGSERIAL PRIMARY KEY,
  level TEXT NOT NULL,
  message TEXT,
  correlation_id TEXT,
  request_id TEXT,
  user_id UUID,
  service TEXT,
  url TEXT,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_client_logs_created_at ON client_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_logs_level ON client_logs (level);
CREATE INDEX IF NOT EXISTS idx_client_logs_correlation ON client_logs (correlation_id);

-- Retention: keep 30 days of client logs
CREATE OR REPLACE FUNCTION prune_client_logs() RETURNS void AS $$
  DELETE FROM client_logs WHERE created_at < NOW() - INTERVAL '30 days';
$$ LANGUAGE sql;

-- SLO / health samples for dashboards
CREATE TABLE IF NOT EXISTS health_samples (
  id BIGSERIAL PRIMARY KEY,
  status TEXT NOT NULL,
  version TEXT,
  region TEXT,
  checks JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_health_samples_created ON health_samples (created_at DESC);

ALTER TABLE client_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert client logs" ON client_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Users read own logs" ON client_logs FOR SELECT USING (true);
CREATE POLICY "Anyone reads health" ON health_samples FOR SELECT USING (true);
