-- Enable RLS on all tenant-scoped tables.
-- These tables are filtered by org_id using the app.current_org_id session variable.

ALTER TABLE org_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sandbox_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_app_installations ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_isolation ON org_metadata
  USING (org_id = current_setting('app.current_org_id', true));

CREATE POLICY org_isolation ON projects
  USING (org_id = current_setting('app.current_org_id', true));

CREATE POLICY org_isolation ON project_files
  USING (project_id IN (
    SELECT id FROM projects WHERE org_id = current_setting('app.current_org_id', true)
  ));

CREATE POLICY org_isolation ON chat_sessions
  USING (project_id IN (
    SELECT id FROM projects WHERE org_id = current_setting('app.current_org_id', true)
  ));

CREATE POLICY org_isolation ON chat_messages
  USING (session_id IN (
    SELECT cs.id FROM chat_sessions cs
    JOIN projects p ON cs.project_id = p.id
    WHERE p.org_id = current_setting('app.current_org_id', true)
  ));

CREATE POLICY org_isolation ON api_keys
  USING (org_id = current_setting('app.current_org_id', true));

CREATE POLICY org_isolation ON billing_events
  USING (org_id = current_setting('app.current_org_id', true));

CREATE POLICY org_isolation ON sandbox_instances
  USING (project_id IN (
    SELECT id FROM projects WHERE org_id = current_setting('app.current_org_id', true)
  ));

CREATE POLICY org_isolation ON github_app_installations
  USING (org_id = current_setting('app.current_org_id', true));
