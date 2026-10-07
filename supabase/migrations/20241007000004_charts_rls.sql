-- Add org_id to charts if not exists
ALTER TABLE charts ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);
ALTER TABLE charts ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'org', 'public'));

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own charts" ON charts;
DROP POLICY IF EXISTS "Users can insert own charts" ON charts;
DROP POLICY IF EXISTS "Users can update own charts" ON charts;
DROP POLICY IF EXISTS "Users can delete own charts" ON charts;

-- New comprehensive policies
CREATE POLICY "Users can view charts they have access to" ON charts
  FOR SELECT USING (
    user_id = auth.uid() -- Own charts
    OR visibility = 'public' -- Public charts
    OR (visibility = 'org' AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.org_id = charts.org_id
      AND user_roles.user_id = auth.uid()
    ))
    OR EXISTS (
      -- Astrologers can view client charts
      SELECT 1 FROM user_roles ur
      JOIN user_roles client_ur ON client_ur.org_id = ur.org_id
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'astrologer'
      AND client_ur.user_id = charts.user_id
      AND client_ur.role = 'client'
    )
  );

CREATE POLICY "Users can insert charts in their orgs" ON charts
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND (org_id IS NULL OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.org_id = charts.org_id
      AND user_roles.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can update their own charts" ON charts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own charts" ON charts
  FOR DELETE USING (user_id = auth.uid());
