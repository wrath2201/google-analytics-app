-- ============================================================
-- MIGRATION 006: Create email_reports table
-- Depends on: apps (003)
-- ============================================================
 
CREATE TABLE IF NOT EXISTS email_reports (
  id               CHAR(36)                   NOT NULL DEFAULT (UUID()),
  app_id           CHAR(36)                   NOT NULL,
  enabled          BOOLEAN                    NOT NULL DEFAULT TRUE,
  frequency        ENUM('weekly', 'monthly')  NOT NULL DEFAULT 'weekly',
  last_sent_at     DATETIME                   NULL,
  recipient_email  VARCHAR(255)               NOT NULL,
  created_at       DATETIME                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
  PRIMARY KEY (id),
  UNIQUE KEY uq_email_reports_app (app_id),
  CONSTRAINT fk_email_reports_app_id
    FOREIGN KEY (app_id) REFERENCES apps(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;