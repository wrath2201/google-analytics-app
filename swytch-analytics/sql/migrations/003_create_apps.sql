-- ============================================================
-- MIGRATION 003: Create apps table
-- Depends on: users (001), subscriptions (002)
-- ============================================================

CREATE TABLE IF NOT EXISTS apps (
  id          INT             NOT NULL AUTO_INCREMENT,
  user_id     INT             NOT NULL,
  name        VARCHAR(255)    NOT NULL,
  url         VARCHAR(500)    NOT NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_apps_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;