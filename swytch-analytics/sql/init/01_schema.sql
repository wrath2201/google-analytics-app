-- ============================================================
-- TABLE: users
-- Stores user accounts, synced from Firebase Google Auth.
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id                    INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  firebase_uid          VARCHAR(128)  NOT NULL,
  email                 VARCHAR(255)  NOT NULL,
  display_name          VARCHAR(255)  NULL,
  photo_url             TEXT          NULL,
  google_refresh_token  TEXT          NULL,
  created_at            TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_firebase_uid (firebase_uid),
  UNIQUE KEY uq_users_email        (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ============================================================
-- TABLE: subscriptions
-- Manages user plan, limits, and Stripe billing state.
-- apps_allowed is the ceiling checked in backend before
-- allowing a user to add a new app.
-- ============================================================
 
CREATE TABLE IF NOT EXISTS subscriptions (
  id                       INT UNSIGNED                                NOT NULL AUTO_INCREMENT,
  user_id                  INT UNSIGNED                                NOT NULL,
  plan                     ENUM('free', 'starter', 'growth')          NOT NULL DEFAULT 'free',
  status                   ENUM('active', 'cancelled', 'past_due',
                                'trialing', 'incomplete')              NOT NULL DEFAULT 'active',
  apps_allowed             TINYINT UNSIGNED                           NOT NULL DEFAULT 1,
  payment_provider         VARCHAR(50)                                NULL,        -- 'stripe' | NULL for free
  provider_subscription_id VARCHAR(255)                               NULL,        -- Stripe subscription ID
  created_at               DATETIME                                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at               DATETIME                                   NULL,        -- NULL = no expiry (free plan)
 
  PRIMARY KEY (id),
  UNIQUE KEY uq_subscriptions_user (user_id),
  CONSTRAINT fk_subscriptions_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
-- ──────────────────────────────────────────────────────────
-- Plan limits (enforced in Fastify backend route):
--
--   free     → apps_allowed = 1
--   starter  → apps_allowed = 5
--   growth   → apps_allowed = 20
--
-- Backend check before INSERT into apps:
--
--   SELECT COUNT(*) AS app_count FROM apps WHERE user_id = ?
--   SELECT apps_allowed FROM subscriptions WHERE user_id = ?
--
--   IF app_count >= apps_allowed → return 403 "Upgrade required"
--
-- Stripe webhook updates: plan, status, apps_allowed, expires_at
-- ──────────────────────────────────────────────────────────
-- ============================================================
-- TABLE: apps
-- Each website/app a user connects to analytics is an "app".
-- One user can have multiple apps (limited by subscription plan).
-- ============================================================
 
CREATE TABLE IF NOT EXISTS apps (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED  NOT NULL,
  app_name        VARCHAR(255)  NOT NULL,
  website_url     VARCHAR(500)  NOT NULL,
  business_type   VARCHAR(100)  NULL,
  primary_goal    VARCHAR(255)  NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
  PRIMARY KEY (id),
  CONSTRAINT fk_apps_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ============================================================
-- TABLE: ga_connections
-- Stores the Google Analytics property linked to an app.
-- access_token and refresh_token are encrypted at rest
-- using AES-256 via MySQL's AES_ENCRYPT / AES_DECRYPT.
-- The encryption key lives in the backend .env — never in DB.
-- ============================================================
 
CREATE TABLE IF NOT EXISTS ga_connections (
  id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  app_id              INT UNSIGNED  NOT NULL,
  ga_property_id      VARCHAR(100)  NOT NULL,
  ga_account_id       VARCHAR(100)  NULL,
  ga_property_name    VARCHAR(255)  NULL,
  access_token        BLOB          NOT NULL,   -- AES_ENCRYPT output (binary)
  refresh_token       BLOB          NOT NULL,   -- AES_ENCRYPT output (binary)
  token_expiry        DATETIME      NOT NULL,
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 
  PRIMARY KEY (id),
  UNIQUE KEY uq_ga_app_property (app_id, ga_property_id),
  CONSTRAINT fk_ga_connections_app_id
    FOREIGN KEY (app_id) REFERENCES apps(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
-- ──────────────────────────────────────────────────────────
-- HOW TO USE ENCRYPTION (in Fastify backend):
--
-- INSERT (encrypt before storing):
--   INSERT INTO ga_connections (id, app_id, ..., access_token, refresh_token, ...)
--   VALUES (UUID(), ?, ..., AES_ENCRYPT(?, UNHEX(SHA2(?, 256))), AES_ENCRYPT(?, UNHEX(SHA2(?, 256))), ...)
--   -- The ? for the key comes from process.env.DB_ENCRYPTION_KEY
--
-- SELECT (decrypt on read):
--   SELECT id, app_id, AES_DECRYPT(access_token, UNHEX(SHA2(?, 256))) AS access_token, ...
--   FROM ga_connections WHERE app_id = ?
-- ──────────────────────────────────────────────────────────
-- ============================================================
-- TABLE: daily_analytics
-- Stores daily aggregated Google Analytics data fetched by cron
-- ============================================================
 
CREATE TABLE IF NOT EXISTS daily_analytics (
  id                INT           NOT NULL AUTO_INCREMENT,
  property_id       VARCHAR(255)  NOT NULL,
  record_date       DATE          NOT NULL,
  
  -- Core Metrics
  users             INT           NOT NULL DEFAULT 0,
  new_users         INT           NOT NULL DEFAULT 0,
  sessions          INT           NOT NULL DEFAULT 0,
  page_views        INT           NOT NULL DEFAULT 0,
  bounce_rate       DECIMAL(5,4)  NOT NULL DEFAULT 0.0000,
  avg_session_duration DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  customer_actions  INT           NOT NULL DEFAULT 0,

  -- JSON Breakdown Data
  device_data       JSON          NULL,
  source_data       JSON          NULL,
  page_data         JSON          NULL,
  event_data        JSON          NULL,
  location_data     JSON          NULL,
  hourly_data       JSON          NULL,

  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 
  PRIMARY KEY (id),
  -- A property can only have one set of data per specific date
  UNIQUE KEY uq_property_date (property_id, record_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ============================================================
-- TABLE: email_reports
-- Stores email report settings per app.
-- The scheduler queries this table to decide when to send.
-- ============================================================
 
CREATE TABLE IF NOT EXISTS email_reports (
  id               INT UNSIGNED                    NOT NULL AUTO_INCREMENT,
  app_id           INT UNSIGNED                    NOT NULL,
  enabled          BOOLEAN                         NOT NULL DEFAULT TRUE,
  frequency        ENUM('weekly', 'monthly')       NOT NULL DEFAULT 'weekly',
  last_sent_at     DATETIME                        NULL,
  recipient_email  VARCHAR(255)                    NOT NULL,
  created_at       DATETIME                        NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
  PRIMARY KEY (id),
  UNIQUE KEY uq_email_reports_app (app_id),
  CONSTRAINT fk_email_reports_app_id
    FOREIGN KEY (app_id) REFERENCES apps(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
-- ──────────────────────────────────────────────────────────
-- Scheduler query (runs on cron):
--
--   SELECT * FROM email_reports
--   WHERE enabled = TRUE
--   AND (
--     last_sent_at IS NULL
--     OR (frequency = 'weekly'  AND last_sent_at < NOW() - INTERVAL 7 DAY)
--     OR (frequency = 'monthly' AND last_sent_at < NOW() - INTERVAL 1 MONTH)
-- ============================================================
-- TABLE: metrics_preferences
-- Optional per-app customization of which GA metrics to show.
-- If no rows exist for an app, the dashboard shows all defaults.
-- ============================================================
 
CREATE TABLE IF NOT EXISTS metrics_preferences (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  app_id      INT UNSIGNED  NOT NULL,
  metric_key  VARCHAR(100)  NOT NULL,
  enabled     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
  PRIMARY KEY (id),
  UNIQUE KEY uq_metrics_app_key (app_id, metric_key),
  CONSTRAINT fk_metrics_app_id
    FOREIGN KEY (app_id) REFERENCES apps(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
-- ──────────────────────────────────────────────────────────
-- Example metric_key values:
--   'sessions', 'pageviews', 'activeUsers',
--   'bounceRate', 'avgSessionDuration', 'newUsers'
-- ──────────────────────────────────────────────────────────
 
-- ============================================================
-- TABLE: insights_alerts
-- Stores midnight AI pre-computed intelligence and tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS insights_alerts (
  id                INT           NOT NULL AUTO_INCREMENT,
  property_id       VARCHAR(255)  NOT NULL,
  record_date       DATE          NOT NULL,
  
  -- Generative AI Payloads
  insights_json     JSON          NOT NULL,
  alerts_json       JSON          NOT NULL,
  
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
  PRIMARY KEY (id),
  -- A property can only have one explicit AI summary per day to prevent duplicated overnight cron hits
  UNIQUE KEY uq_property_date (property_id, record_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
