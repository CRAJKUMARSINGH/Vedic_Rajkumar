-- Week 5 GDPR/DPDP: Soft-delete columns + hard-delete scheduler
-- Adds deleted_at to all user-owned tables.
-- A scheduled Supabase cron job (configured in Dashboard → Cron Jobs) runs
-- the cleanup function daily to hard-delete rows marked > 30 days ago.

-- ── 1. Add deleted_at columns ────────────────────────────────────────────────

ALTER TABLE saved_readings       ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE prashna_sessions     ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE horoscope_analyses   ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE transit_readings     ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE user_profiles        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE charts               ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE audit_logs           ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ── 2. Indexes for efficient soft-delete queries ──────────────────────────────

CREATE INDEX IF NOT EXISTS idx_saved_readings_deleted_at     ON saved_readings(deleted_at)     WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prashna_sessions_deleted_at   ON prashna_sessions(deleted_at)   WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_horoscope_analyses_deleted_at ON horoscope_analyses(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transit_readings_deleted_at   ON transit_readings(deleted_at)   WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_charts_deleted_at             ON charts(deleted_at)             WHERE deleted_at IS NOT NULL;

-- ── 3. Update existing RLS policies to exclude soft-deleted rows ──────────────

-- Recreate saved_readings visibility policy
DROP POLICY IF EXISTS "Users can view own saved readings"   ON saved_readings;
CREATE POLICY "Users can view own saved readings" ON saved_readings
  FOR SELECT USING (user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can view own charts" ON charts;
CREATE POLICY "Users can view own charts" ON charts
  FOR SELECT USING (user_id = auth.uid() AND deleted_at IS NULL);

-- ── 4. Soft-delete helper function (marks rows, does NOT delete) ─────────────

CREATE OR REPLACE FUNCTION soft_delete_user_data(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
BEGIN
  UPDATE saved_readings     SET deleted_at = v_now WHERE user_id = p_user_id  AND deleted_at IS NULL;
  UPDATE prashna_sessions   SET deleted_at = v_now WHERE owner_id = p_user_id AND deleted_at IS NULL;
  UPDATE horoscope_analyses SET deleted_at = v_now WHERE owner_id = p_user_id AND deleted_at IS NULL;
  UPDATE transit_readings   SET deleted_at = v_now WHERE owner_id = p_user_id AND deleted_at IS NULL;
  UPDATE charts             SET deleted_at = v_now WHERE user_id = p_user_id  AND deleted_at IS NULL;
  UPDATE user_profiles      SET deleted_at = v_now WHERE id = p_user_id       AND deleted_at IS NULL;
END;
$$;

-- ── 5. Hard-delete cleanup function (runs on cron after 30-day grace period) ──

CREATE OR REPLACE FUNCTION purge_expired_soft_deletes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cutoff TIMESTAMPTZ := NOW() - INTERVAL '30 days';
BEGIN
  DELETE FROM saved_readings     WHERE deleted_at IS NOT NULL AND deleted_at < v_cutoff;
  DELETE FROM prashna_sessions   WHERE deleted_at IS NOT NULL AND deleted_at < v_cutoff;
  DELETE FROM horoscope_analyses WHERE deleted_at IS NOT NULL AND deleted_at < v_cutoff;
  DELETE FROM transit_readings   WHERE deleted_at IS NOT NULL AND deleted_at < v_cutoff;
  DELETE FROM charts             WHERE deleted_at IS NOT NULL AND deleted_at < v_cutoff;
  DELETE FROM user_profiles      WHERE deleted_at IS NOT NULL AND deleted_at < v_cutoff;

  -- Log the purge in audit_logs
  INSERT INTO audit_logs (action, resource_type, changes)
  VALUES (
    'purge',
    'soft_deletes',
    jsonb_build_object('cutoff', v_cutoff, 'purged_at', NOW())
  );
END;
$$;

-- ── 6. Cron schedule (Supabase pg_cron — enable in Dashboard → Extensions) ───
-- Run daily at 02:00 UTC. Uncomment after enabling pg_cron extension.
-- SELECT cron.schedule('purge-soft-deletes', '0 2 * * *', 'SELECT purge_expired_soft_deletes()');

COMMENT ON FUNCTION soft_delete_user_data(UUID) IS
  'Marks all user-owned rows as deleted (GDPR right to erasure, 30-day grace period).';
COMMENT ON FUNCTION purge_expired_soft_deletes() IS
  'Hard-deletes rows marked for deletion > 30 days ago. Run via pg_cron daily.';
