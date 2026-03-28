-- ============================================================
-- MIGRATION 005: Create metrics_preferences table
-- Depends on: users (001)
-- Stores per-user dashboard metric preferences as JSON
-- ============================================================

CREATE TABLE IF NOT EXISTS metrics_preferences (
  id          INT             NOT NULL AUTO_INCREMENT,
  user_id     INT             NOT NULL,
  metrics     JSON            NOT NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_metrics_user (user_id),
  CONSTRAINT fk_metrics_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;