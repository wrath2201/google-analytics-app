-- ============================================================
-- INDEXES — Run after all migrations
-- ============================================================
 
-- apps: fast lookup of all apps belonging to a user
CREATE INDEX IF NOT EXISTS idx_apps_user_id
  ON apps(user_id);
 
-- ga_connections: fast lookup by app
CREATE INDEX IF NOT EXISTS idx_ga_connections_app_id
  ON ga_connections(app_id);
 
-- ga_connections: token expiry check for refresh logic
CREATE INDEX IF NOT EXISTS idx_ga_connections_token_expiry
  ON ga_connections(token_expiry);
 
-- metrics_preferences: fast lookup of preferences per app
CREATE INDEX IF NOT EXISTS idx_metrics_app_id
  ON metrics_preferences(app_id);
 
-- email_reports: scheduler queries enabled reports by last_sent_at
CREATE INDEX IF NOT EXISTS idx_email_reports_last_sent
  ON email_reports(last_sent_at);
 
-- subscriptions: plan + status lookup (used in billing checks)
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_status
  ON subscriptions(plan, status);