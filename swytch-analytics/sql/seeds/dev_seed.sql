-- ============================================================
-- DEV SEED — LOCAL DEVELOPMENT ONLY
-- NEVER run on staging or production.
-- ============================================================
 
-- ── Users ──
INSERT INTO users (id, email, name, google_id, profile_picture) VALUES
  ('u-0001-0000-0000-000000000001', 'lakshay@dev.local',  'Lakshay',  'google_uid_lakshay',  NULL),
  ('u-0001-0000-0000-000000000002', 'teammate@dev.local', 'Teammate', 'google_uid_teammate', NULL);
 
-- ── Subscriptions ──
INSERT INTO subscriptions (id, user_id, plan, status, apps_allowed) VALUES
  ('s-0001-0000-0000-000000000001', 'u-0001-0000-0000-000000000001', 'growth',  'active', 20),
  ('s-0001-0000-0000-000000000002', 'u-0001-0000-0000-000000000002', 'free',    'active',  1);
 
-- ── Apps ──
INSERT INTO apps (id, user_id, app_name, website_url, business_type, primary_goal) VALUES
  ('a-0001-0000-0000-000000000001', 'u-0001-0000-0000-000000000001', 'My Blog',       'https://blog.example.com',   'media',     'increase_traffic'),
  ('a-0001-0000-0000-000000000002', 'u-0001-0000-0000-000000000001', 'E-commerce',    'https://shop.example.com',   'ecommerce', 'increase_revenue'),
  ('a-0001-0000-0000-000000000003', 'u-0001-0000-0000-000000000002', 'Teammate Site', 'https://teammate.example.com','saas',     'signups');
 
-- ── GA Connections (tokens are fake — AES_ENCRYPT with dev key 'dev_secret_key_32chars__________') ──
INSERT INTO ga_connections (id, app_id, ga_property_id, ga_account_id, ga_property_name, access_token, refresh_token, token_expiry) VALUES
  (
    'g-0001-0000-0000-000000000001',
    'a-0001-0000-0000-000000000001',
    'G-ABC123DEF4',
    '123456789',
    'My Blog GA Property',
    AES_ENCRYPT('fake_access_token_blog',     UNHEX(SHA2('dev_secret_key_32chars__________', 256))),
    AES_ENCRYPT('fake_refresh_token_blog',    UNHEX(SHA2('dev_secret_key_32chars__________', 256))),
    DATE_ADD(NOW(), INTERVAL 1 HOUR)
  ),
  (
    'g-0001-0000-0000-000000000002',
    'a-0001-0000-0000-000000000002',
    'G-XYZ789GHI0',
    '987654321',
    'E-commerce GA Property',
    AES_ENCRYPT('fake_access_token_shop',     UNHEX(SHA2('dev_secret_key_32chars__________', 256))),
    AES_ENCRYPT('fake_refresh_token_shop',    UNHEX(SHA2('dev_secret_key_32chars__________', 256))),
    DATE_ADD(NOW(), INTERVAL 1 HOUR)
  );
 
-- ── Metrics Preferences ──
INSERT INTO metrics_preferences (id, app_id, metric_key, enabled) VALUES
  ('m-0001-0000-0000-000000000001', 'a-0001-0000-0000-000000000001', 'sessions',           TRUE),
  ('m-0001-0000-0000-000000000002', 'a-0001-0000-0000-000000000001', 'pageviews',          TRUE),
  ('m-0001-0000-0000-000000000003', 'a-0001-0000-0000-000000000001', 'bounceRate',         TRUE),
  ('m-0001-0000-0000-000000000004', 'a-0001-0000-0000-000000000001', 'avgSessionDuration', FALSE);
 
-- ── Email Reports ──
INSERT INTO email_reports (id, app_id, enabled, frequency, recipient_email) VALUES
  ('e-0001-0000-0000-000000000001', 'a-0001-0000-0000-000000000001', TRUE,  'weekly',  'lakshay@dev.local'),
  ('e-0001-0000-0000-000000000002', 'a-0001-0000-0000-000000000002', TRUE,  'monthly', 'lakshay@dev.local');
 
-- ──────────────────────────────────────────────────────────
-- CLEANUP — run this to remove all seed data:
--
-- DELETE FROM email_reports      WHERE id LIKE 'e-0001%';
-- DELETE FROM metrics_preferences WHERE id LIKE 'm-0001%';
-- DELETE FROM ga_connections      WHERE id LIKE 'g-0001%';
-- DELETE FROM apps                WHERE id LIKE 'a-0001%';
-- DELETE FROM subscriptions       WHERE id LIKE 's-0001%';
-- DELETE FROM users               WHERE id LIKE 'u-0001%';
-- ──────────────────────────────────────────────────────────