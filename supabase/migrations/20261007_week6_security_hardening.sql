-- Week 6: Security Hardening (Audit Retention & API Rate Limits)

-- 1. Replace immutable RULE with TRIGGER to allow system pruning
DROP RULE IF EXISTS prevent_audit_delete ON public.audit_logs;

CREATE OR REPLACE FUNCTION public.prevent_unauthorized_audit_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF current_user NOT IN ('postgres', 'supabase_admin') THEN
    RAISE EXCEPTION 'Audit logs are immutable and cannot be deleted except by system jobs.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_audit_delete ON public.audit_logs;
CREATE TRIGGER trg_prevent_audit_delete
  BEFORE DELETE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_unauthorized_audit_delete();

-- Enable pg_cron if available
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Schedule 90-day retention prune job
DO $$
BEGIN
  -- Catch exception if pg_cron is restricted in this environment
  BEGIN
    PERFORM cron.schedule(
      'prune-audit-logs',
      '0 0 * * *',
      $$ DELETE FROM public.audit_logs WHERE created_at < NOW() - INTERVAL '90 days'; $$
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron not available or schedule failed: %', SQLERRM;
  END;
END $$;

-- 2. API Rate Limiting Setup
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  ip_address TEXT,
  endpoint TEXT,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (ip_address, endpoint)
);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  client_ip TEXT,
  target_endpoint TEXT,
  max_requests INTEGER,
  window_seconds INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  window_time TIMESTAMPTZ;
BEGIN
  SELECT request_count, window_start INTO current_count, window_time
  FROM public.api_rate_limits
  WHERE ip_address = client_ip AND endpoint = target_endpoint;

  IF NOT FOUND THEN
    INSERT INTO public.api_rate_limits (ip_address, endpoint, request_count, window_start)
    VALUES (client_ip, target_endpoint, 1, NOW());
    RETURN TRUE;
  END IF;

  IF NOW() > window_time + (window_seconds || ' seconds')::interval THEN
    UPDATE public.api_rate_limits
    SET request_count = 1, window_start = NOW()
    WHERE ip_address = client_ip AND endpoint = target_endpoint;
    RETURN TRUE;
  END IF;

  IF current_count < max_requests THEN
    UPDATE public.api_rate_limits
    SET request_count = request_count + 1
    WHERE ip_address = client_ip AND endpoint = target_endpoint;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO anon, authenticated;
