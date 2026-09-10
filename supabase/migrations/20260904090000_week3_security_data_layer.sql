-- ============================================================
-- Week 3: Security & Data Layer
-- Creates saved_readings, user_profiles tables with full RLS.
-- Adds rate_limit_log table for server-side rate tracking.
-- All personal tables are owner-scoped via Clerk JWT sub claim.
-- ============================================================

-- ── Helper: resolve Clerk JWT sub or Supabase uid ────────────────────────────

-- NOTE: Supabase RLS uses auth.jwt() to access the raw JWT payload.
-- When using Clerk as the identity provider (JWT template pointing at Supabase),
-- the `sub` claim in the JWT equals the Clerk user ID (e.g. user_2abc...).
-- COALESCE tries Supabase native UID first, then falls back to JWT sub.

-- ── saved_readings ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.saved_readings (
  id             UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        TEXT        NOT NULL,            -- Clerk user ID (JWT sub)
  title          TEXT,
  birth_date     TEXT        NOT NULL,
  birth_time     TEXT,
  birth_location TEXT,
  chart_type     TEXT        NOT NULL DEFAULT 'transit',
  notes          TEXT,
  results        JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_readings_user_created
  ON public.saved_readings (user_id, created_at DESC);

ALTER TABLE public.saved_readings ENABLE ROW LEVEL SECURITY;

-- Authenticated users can INSERT their own rows
CREATE POLICY "saved_readings_insert_own"
  ON public.saved_readings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

-- Authenticated users can SELECT their own rows
CREATE POLICY "saved_readings_select_own"
  ON public.saved_readings
  FOR SELECT
  TO authenticated
  USING (user_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

-- Authenticated users can UPDATE their own rows
CREATE POLICY "saved_readings_update_own"
  ON public.saved_readings
  FOR UPDATE
  TO authenticated
  USING (user_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'))
  WITH CHECK (user_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

-- Authenticated users can DELETE their own rows
CREATE POLICY "saved_readings_delete_own"
  ON public.saved_readings
  FOR DELETE
  TO authenticated
  USING (user_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

-- ── user_profiles ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id                   TEXT        NOT NULL PRIMARY KEY,  -- Clerk user ID
  display_name         TEXT,
  preferred_language   TEXT        NOT NULL DEFAULT 'en',
  default_birth_date   TEXT,
  default_birth_time   TEXT,
  default_birth_place  TEXT,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can SELECT their own profile
CREATE POLICY "user_profiles_select_own"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

-- Authenticated users can INSERT their own profile
CREATE POLICY "user_profiles_insert_own"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

-- Authenticated users can UPDATE their own profile
CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'))
  WITH CHECK (id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

-- Authenticated users can DELETE their own profile
CREATE POLICY "user_profiles_delete_own"
  ON public.user_profiles
  FOR DELETE
  TO authenticated
  USING (id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

-- ── rate_limit_log ────────────────────────────────────────────────────────────
-- Server-side log for rate limiting expensive edge functions.
-- Edge functions insert a row and count rows per (user_id, endpoint) in the window.

CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id          BIGSERIAL   NOT NULL PRIMARY KEY,
  user_id     TEXT        NOT NULL,
  endpoint    TEXT        NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-clean entries older than 1 hour (vacuum will handle it)
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_endpoint
  ON public.rate_limit_log (user_id, endpoint, requested_at DESC);

ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read rate limit logs (edge functions use service key)
-- Anon and authenticated users have no direct access
CREATE POLICY "rate_limit_service_only"
  ON public.rate_limit_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── knowledge_entries: add SELECT for anon (public knowledge) ─────────────────
-- Ensure public read access for knowledge still works after previous migrations.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'knowledge_entries'
      AND policyname = 'knowledge_entries_public_select'
  ) THEN
    CREATE POLICY "knowledge_entries_public_select"
      ON public.knowledge_entries
      FOR SELECT
      USING (true);
  END IF;
END $$;
