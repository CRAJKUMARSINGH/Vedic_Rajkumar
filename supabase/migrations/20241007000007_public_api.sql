CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  env TEXT NOT NULL DEFAULT 'live' CHECK (env IN ('live','test')),
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free','developer','business','enterprise')),
  scopes TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys (key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys (user_id);

CREATE TABLE IF NOT EXISTS api_usage (
  id BIGSERIAL PRIMARY KEY,
  key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status INT NOT NULL,
  latency_ms INT,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_api_usage_key_day ON api_usage (key_id, day);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  status INT NOT NULL,
  response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (key_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id BIGSERIAL PRIMARY KEY,
  endpoint_id UUID REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status INT,
  attempts INT DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_retry ON webhook_deliveries (next_retry_at) WHERE delivered_at IS NULL;

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own keys" ON api_keys FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own webhooks" ON webhook_endpoints FOR ALL USING (auth.uid() = user_id);

-- Usage aggregation view for billing
CREATE OR REPLACE VIEW api_usage_daily AS
  SELECT key_id, day, COUNT(*) AS requests,
         COUNT(*) FILTER (WHERE status >= 400) AS errors,
         ROUND(AVG(latency_ms)) AS avg_latency
  FROM api_usage GROUP BY key_id, day;
