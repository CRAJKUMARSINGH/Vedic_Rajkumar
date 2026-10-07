-- Week 13: Kill switches table
-- Provides instant feature disable without code deploy.
-- Used by src/config/kill-switches.ts to gate calculations.

CREATE TABLE IF NOT EXISTS kill_switches (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  feature     TEXT        NOT NULL UNIQUE,
  enabled     BOOLEAN     NOT NULL DEFAULT false,
  reason      TEXT,
  triggered_by UUID,                              -- user who pulled the switch
  triggered_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the known switches (all OFF by default)
INSERT INTO kill_switches (feature, enabled) VALUES
  ('kill_kundli',    false),
  ('kill_match',     false),
  ('kill_pdf',       false),
  ('kill_api',       false),
  ('kill_transits',  false)
ON CONFLICT (feature) DO NOTHING;

-- Index for fast lookup in edge functions
CREATE INDEX IF NOT EXISTS idx_kill_switches_feature ON kill_switches (feature);

-- RLS: only admins can toggle switches
ALTER TABLE kill_switches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read kill switches" ON kill_switches
  FOR SELECT USING (true);

CREATE POLICY "Admins can update kill switches" ON kill_switches
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND   user_roles.role IN ('owner', 'admin')
    )
  );

-- Helper function for edge functions (no RLS bypass needed)
CREATE OR REPLACE FUNCTION is_feature_killed(p_feature TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT enabled FROM kill_switches WHERE feature = p_feature LIMIT 1),
    false
  );
$$;

COMMENT ON TABLE kill_switches IS
  'Emergency feature kill switches. Set enabled=true to instantly disable a feature without deploying code.';
COMMENT ON FUNCTION is_feature_killed(TEXT) IS
  'Used by edge functions to check kill switch state without full RLS context.';
