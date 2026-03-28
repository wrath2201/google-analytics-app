-- ============================================================
-- DEV SEED — LOCAL DEVELOPMENT ONLY
-- NEVER run on staging or production
-- ============================================================

-- ── Users ──
INSERT INTO users (firebase_uid, email, display_name, photo_url) VALUES
  ('firebase_uid_lakshay',   'lakshay@dev.local',   'Lakshay',   NULL),
  ('firebase_uid_teammate',  'teammate@dev.local',  'Teammate',  NULL);

-- ── Subscriptions ──
INSERT INTO subscriptions (user_id, plan, apps_allowed, status) VALUES
  (1, 'growth', 20, 'active'),
  (2, 'free',    1, 'active');

-- ── Apps ──
INSERT INTO apps (user_id, name, url) VALUES
  (1, 'My Blog',       'https://blog.example.com'),
  (1, 'E-commerce',    'https://shop.example.com'),
  (2, 'Teammate Site', 'https://teammate.example.com');

-- ── Email Reports ──
INSERT INTO email_reports (user_id, frequency, enabled) VALUES
  (1, 'weekly',  1),
  (2, 'monthly', 1);

-- ── Metrics Preferences ──
INSERT INTO metrics_preferences (user_id, metrics) VALUES
  (1, '["activeUsers","sessions","pageViews","bounceRate"]'),
  (2, '["activeUsers","sessions"]');