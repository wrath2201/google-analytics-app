-- ============================================================
-- INDEXES — Run after all migrations
-- ============================================================

-- apps: fast lookup of all apps belonging to a user
CREATE INDEX IF NOT EXISTS idx_apps_user_id
  ON apps(user_id);

-- ga_connections: fast lookup by app
CREATE INDEX IF NOT EXISTS idx_ga_connections_app_id
  ON ga_connections(app_id);

-- email_reports: scheduler queries by last_sent_at
CREATE INDEX IF NOT EXISTS idx_email_reports_last_sent
  ON email_reports(last_sent_at);

-- subscriptions: plan + status lookup (used in billing checks)
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_status
  ON subscriptions(plan, status);

-- subscriptions: fast webhook lookup by stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer
  ON subscriptions(stripe_customer_id);