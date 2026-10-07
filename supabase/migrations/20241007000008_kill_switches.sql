CREATE TABLE IF NOT EXISTS kill_switches (
  feature TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  reason TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

INSERT INTO kill_switches (feature, enabled) VALUES
  ('kill_kundli', FALSE),
  ('kill_match', FALSE),
  ('kill_pdf', FALSE),
  ('kill_api', FALSE),
  ('kill_transits', FALSE)
ON CONFLICT (feature) DO NOTHING;

ALTER TABLE kill_switches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read kill switches" ON kill_switches;
CREATE POLICY "Anyone can read kill switches" ON kill_switches
  FOR SELECT USING (true);
