-- Week 5 hardening: sensitive birth/prashna/transit data must be owner-scoped.
-- Existing anonymous app flows still fall back to localStorage when no auth token exists.

ALTER TABLE public.transit_readings
  ADD COLUMN IF NOT EXISTS owner_id TEXT DEFAULT COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub');

ALTER TABLE public.prashna_sessions
  ADD COLUMN IF NOT EXISTS owner_id TEXT DEFAULT COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub');

ALTER TABLE public.horoscope_analyses
  ADD COLUMN IF NOT EXISTS owner_id TEXT DEFAULT COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub');

CREATE INDEX IF NOT EXISTS idx_transit_readings_owner_created
  ON public.transit_readings(owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prashna_sessions_owner_created
  ON public.prashna_sessions(owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_horoscope_analyses_owner_created
  ON public.horoscope_analyses(owner_id, created_at DESC);

ALTER TABLE public.transit_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prashna_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horoscope_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert readings" ON public.transit_readings;
DROP POLICY IF EXISTS "Anyone can read readings" ON public.transit_readings;
DROP POLICY IF EXISTS "Allow public read/write sessions" ON public.prashna_sessions;
DROP POLICY IF EXISTS "Allow public read/write analyses" ON public.horoscope_analyses;
DROP POLICY IF EXISTS "Allow public write knowledge" ON public.knowledge_entries;

CREATE POLICY "Authenticated users insert own transit readings"
  ON public.transit_readings
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY "Authenticated users read own transit readings"
  ON public.transit_readings
  FOR SELECT
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY "Authenticated users update own transit readings"
  ON public.transit_readings
  FOR UPDATE
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'))
  WITH CHECK (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY "Authenticated users delete own transit readings"
  ON public.transit_readings
  FOR DELETE
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY "Authenticated users insert own prashna sessions"
  ON public.prashna_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY "Authenticated users read own prashna sessions"
  ON public.prashna_sessions
  FOR SELECT
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY "Authenticated users update own prashna sessions"
  ON public.prashna_sessions
  FOR UPDATE
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'))
  WITH CHECK (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY "Authenticated users delete own prashna sessions"
  ON public.prashna_sessions
  FOR DELETE
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY "Authenticated users insert own horoscope analyses"
  ON public.horoscope_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY "Authenticated users read own horoscope analyses"
  ON public.horoscope_analyses
  FOR SELECT
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY "Authenticated users update own horoscope analyses"
  ON public.horoscope_analyses
  FOR UPDATE
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'))
  WITH CHECK (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY "Authenticated users delete own horoscope analyses"
  ON public.horoscope_analyses
  FOR DELETE
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY "Authenticated users insert knowledge"
  ON public.knowledge_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
