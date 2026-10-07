-- Cached transit snapshots
CREATE TABLE IF NOT EXISTS transit_snapshots (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chart_id UUID,
  as_of TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transit_snapshots_user ON transit_snapshots (user_id, as_of DESC);

-- Alert subscriptions
CREATE TABLE IF NOT EXISTS transit_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chart_id UUID,
  event_types TEXT[] NOT NULL DEFAULT ARRAY['sade_sati','ingress','major_aspect'],
  grahas TEXT[] NOT NULL DEFAULT ARRAY['Saturn','Jupiter','Rahu'],
  channels TEXT[] NOT NULL DEFAULT ARRAY['push','email'],
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transit_subs_user ON transit_subscriptions (user_id) WHERE active;

-- Fired alerts log (dedupe)
CREATE TABLE IF NOT EXISTS transit_alerts_sent (
  id BIGSERIAL PRIMARY KEY,
  subscription_id UUID REFERENCES transit_subscriptions(id) ON DELETE CASCADE,
  event_key TEXT NOT NULL,
  fired_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (subscription_id, event_key)
);

-- Panchang cache
CREATE TABLE IF NOT EXISTS panchang_cache (
  day DATE PRIMARY KEY,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transit_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE transit_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transit_alerts_sent ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own snapshots" ON transit_snapshots;
CREATE POLICY "Users own snapshots" ON transit_snapshots FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own subscriptions" ON transit_subscriptions;
CREATE POLICY "Users own subscriptions" ON transit_subscriptions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users see own sent alerts" ON transit_alerts_sent;
CREATE POLICY "Users see own sent alerts" ON transit_alerts_sent FOR SELECT
  USING (subscription_id IN (SELECT id FROM transit_subscriptions WHERE user_id = auth.uid()));

-- Daily 06:00 UTC alert dispatcher (pg_cron + pg_net in production).
-- SELECT cron.schedule(
--   'transit-alerts',
--   '0 6 * * *',
--   $$SELECT net.http_post(
--     url := current_setting('app.settings.functions_url') || '/functions/v1/transit-alerts',
--     headers := '{"Content-Type": "application/json"}'::jsonb
--   )$$
-- );
