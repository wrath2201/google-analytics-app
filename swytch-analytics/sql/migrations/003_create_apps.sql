-- ============================================================
-- MIGRATION 003: Create apps table
-- Depends on: users (001), subscriptions (002)
-- ============================================================
 
CREATE TABLE IF NOT EXISTS apps (
  id              CHAR(36)      NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)      NOT NULL,
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
 