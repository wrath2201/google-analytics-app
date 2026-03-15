-- ============================================================
-- MIGRATION 005: Create metrics_preferences table
-- Depends on: apps (003)
-- ============================================================
 
CREATE TABLE IF NOT EXISTS metrics_preferences (
  id          CHAR(36)      NOT NULL DEFAULT (UUID()),
  app_id      CHAR(36)      NOT NULL,
  metric_key  VARCHAR(100)  NOT NULL,
  enabled     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
  PRIMARY KEY (id),
  UNIQUE KEY uq_metrics_app_key (app_id, metric_key),
  CONSTRAINT fk_metrics_app_id
    FOREIGN KEY (app_id) REFERENCES apps(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 