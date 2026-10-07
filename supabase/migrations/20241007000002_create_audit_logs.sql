-- Audit logs table (immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  org_id UUID,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'view', 'export'
  resource_type TEXT NOT NULL, -- 'chart', 'profile', 'consultation', etc.
  resource_id UUID,
  changes JSONB, -- old and new values for updates
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
) WITH (fillfactor=100);

-- Prevent updates and deletes (immutable)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_rules WHERE rulename = 'prevent_audit_update') THEN
    CREATE RULE prevent_audit_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_rules WHERE rulename = 'prevent_audit_delete') THEN
    CREATE RULE prevent_audit_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;
  END IF;
END $$;

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
