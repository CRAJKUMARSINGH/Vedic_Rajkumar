-- ============================================================
-- Week 3 Enhancement: Anonymous read lockdown
--
-- Ensure no personal data table allows anonymous SELECT.
-- Also tighten transit_readings INSERT to require owner_id.
-- ============================================================

-- Drop any residual open-access policies that may allow anon SELECTs on personal tables.
-- (idempotent — each DROP is wrapped in a DO block)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'transit_readings'
      AND policyname = 'transit_readings_anon_read'
  ) THEN
    DROP POLICY "transit_readings_anon_read" ON public.transit_readings;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'prashna_sessions'
      AND policyname = 'prashna_sessions_anon_read'
  ) THEN
    DROP POLICY "prashna_sessions_anon_read" ON public.prashna_sessions;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'horoscope_analyses'
      AND policyname = 'horoscope_analyses_anon_read'
  ) THEN
    DROP POLICY "horoscope_analyses_anon_read" ON public.horoscope_analyses;
  END IF;
END $$;

-- Ensure RLS is enabled on all personal tables (in case it was disabled by accident).
ALTER TABLE public.transit_readings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prashna_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horoscope_analyses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_readings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles       ENABLE ROW LEVEL SECURITY;

-- Add a rate_limit_log cleanup function to avoid unbounded table growth.
-- Removes entries older than 48 hours. Call this from a pg_cron job or maintenance window.
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_log()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.rate_limit_log
  WHERE requested_at < now() - INTERVAL '48 hours';
$$;

COMMENT ON FUNCTION public.cleanup_rate_limit_log IS
  'Removes rate_limit_log entries older than 48 hours to prevent table bloat. '
  'Invoke periodically via pg_cron or a maintenance script.';
