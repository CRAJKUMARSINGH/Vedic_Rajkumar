-- ============================================================
-- Week 3 Comprehensive RLS Enhancement
--
-- This migration ensures all reading tables have complete RLS policies
-- following the principle of least privilege. It adds missing policies
-- and ensures consistency across all user-owned data tables.
-- ============================================================

-- Ensure RLS is enabled on all personal data tables
ALTER TABLE public.transit_readings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prashna_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horoscope_analyses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_readings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles       ENABLE ROW LEVEL SECURITY;

-- ── knowledge_entries: Ensure public read access only ─────────────────────
-- Knowledge entries should be publicly readable but only writable by authenticated users

DROP POLICY IF EXISTS "Allow public read knowledge" ON public.knowledge_entries;
DROP POLICY IF EXISTS "Allow authenticated read knowledge" ON public.knowledge_entries;
DROP POLICY IF EXISTS "Allow public write knowledge" ON public.knowledge_entries;
DROP POLICY IF EXISTS "Authenticated users insert knowledge" ON public.knowledge_entries;

CREATE POLICY "knowledge_entries_public_select"
  ON public.knowledge_entries
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "knowledge_entries_authenticated_insert"
  ON public.knowledge_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "knowledge_entries_authenticated_update"
  ON public.knowledge_entries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "knowledge_entries_authenticated_delete"
  ON public.knowledge_entries
  FOR DELETE
  TO authenticated
  USING (true);

-- ── transit_readings: Ensure complete owner-scoped policies ────────────────
-- These policies should already exist from previous migrations, but we ensure they're complete

DROP POLICY IF EXISTS "Anyone can insert readings" ON public.transit_readings;
DROP POLICY IF EXISTS "Anyone can read readings" ON public.transit_readings;

CREATE POLICY IF NOT EXISTS "transit_readings_authenticated_insert"
  ON public.transit_readings
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "transit_readings_authenticated_select"
  ON public.transit_readings
  FOR SELECT
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "transit_readings_authenticated_update"
  ON public.transit_readings
  FOR UPDATE
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'))
  WITH CHECK (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "transit_readings_authenticated_delete"
  ON public.transit_readings
  FOR DELETE
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

-- ── prashna_sessions: Ensure complete owner-scoped policies ────────────────

DROP POLICY IF EXISTS "Allow public read/write sessions" ON public.prashna_sessions;

CREATE POLICY IF NOT EXISTS "prashna_sessions_authenticated_insert"
  ON public.prashna_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "prashna_sessions_authenticated_select"
  ON public.prashna_sessions
  FOR SELECT
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "prashna_sessions_authenticated_update"
  ON public.prashna_sessions
  FOR UPDATE
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'))
  WITH CHECK (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "prashna_sessions_authenticated_delete"
  ON public.prashna_sessions
  FOR DELETE
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

-- ── horoscope_analyses: Ensure complete owner-scoped policies ──────────────

DROP POLICY IF EXISTS "Allow public read/write analyses" ON public.horoscope_analyses;

CREATE POLICY IF NOT EXISTS "horoscope_analyses_authenticated_insert"
  ON public.horoscope_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "horoscope_analyses_authenticated_select"
  ON public.horoscope_analyses
  FOR SELECT
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "horoscope_analyses_authenticated_update"
  ON public.horoscope_analyses
  FOR UPDATE
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'))
  WITH CHECK (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "horoscope_analyses_authenticated_delete"
  ON public.horoscope_analyses
  FOR DELETE
  TO authenticated
  USING (owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

-- ── saved_readings: Ensure complete owner-scoped policies ────────────────────

CREATE POLICY IF NOT EXISTS "saved_readings_insert_own"
  ON public.saved_readings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "saved_readings_select_own"
  ON public.saved_readings
  FOR SELECT
  TO authenticated
  USING (user_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "saved_readings_update_own"
  ON public.saved_readings
  FOR UPDATE
  TO authenticated
  USING (user_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'))
  WITH CHECK (user_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "saved_readings_delete_own"
  ON public.saved_readings
  FOR DELETE
  TO authenticated
  USING (user_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

-- ── user_profiles: Ensure complete owner-scoped policies ────────────────────

CREATE POLICY IF NOT EXISTS "user_profiles_select_own"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "user_profiles_insert_own"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "user_profiles_update_own"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'))
  WITH CHECK (id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

CREATE POLICY IF NOT EXISTS "user_profiles_delete_own"
  ON public.user_profiles
  FOR DELETE
  TO authenticated
  USING (id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

-- ── Add helpful comments for documentation ───────────────────────────────────

COMMENT ON TABLE public.transit_readings IS 
  'User transit readings with RLS - users can only access their own data via owner_id column';

COMMENT ON TABLE public.prashna_sessions IS 
  'Prashna (question) sessions with RLS - users can only access their own data via owner_id column';

COMMENT ON TABLE public.horoscope_analyses IS 
  'Horoscope analyses with RLS - users can only access their own data via owner_id column';

COMMENT ON TABLE public.saved_readings IS 
  'User-saved readings with RLS - users can only access their own data via user_id column';

COMMENT ON TABLE public.user_profiles IS 
  'User profile settings with RLS - users can only access their own profile via id column';

COMMENT ON TABLE public.knowledge_entries IS 
  'Public knowledge base - readable by all, writable only by authenticated users';

COMMENT ON TABLE public.rate_limit_log IS 
  'Rate limiting log for edge functions - only accessible by service role';

-- ── Verification query to check all policies are in place ────────────────────
-- This can be run manually to verify the migration was successful

DO $$
DECLARE
  table_name TEXT;
  policy_count INTEGER;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    AND tablename IN ('transit_readings', 'prashna_sessions', 'horoscope_analyses', 'saved_readings', 'user_profiles', 'knowledge_entries', 'rate_limit_log')
  LOOP
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = table_name;
    
    RAISE NOTICE 'Table % has % RLS policies', table_name, policy_count;
  END LOOP;
END $$;
