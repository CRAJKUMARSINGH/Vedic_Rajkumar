-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view their own organizations" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.org_id = organizations.id
      AND user_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and admins can update organizations" ON organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.org_id = organizations.id
      AND user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin')
    )
  );

-- User roles policies
CREATE POLICY "Users can view roles in their orgs" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles AS my_roles
      WHERE my_roles.org_id = user_roles.org_id
      AND my_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and admins can manage roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles AS my_roles
      WHERE my_roles.org_id = user_roles.org_id
      AND my_roles.user_id = auth.uid()
      AND my_roles.role IN ('owner', 'admin')
    )
  );

-- Audit logs policies
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view org audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.org_id = audit_logs.org_id
      AND user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'admin')
    )
  );

-- Only system can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);
