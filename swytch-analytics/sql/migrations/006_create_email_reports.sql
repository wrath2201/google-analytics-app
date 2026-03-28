-- ============================================================
-- MIGRATION 006: Create email_reports table
-- Depends on: users (001)
-- One report config per user (not per app)
-- ============================================================

CREATE TABLE IF NOT EXISTS email_reports (
  id           INT                        NOT NULL AUTO_INCREMENT,
  user_id      INT                        NOT NULL,
  frequency    ENUM('weekly', 'monthly')  NOT NULL DEFAULT 'weekly',
  enabled      TINYINT(1)                 NOT NULL DEFAULT 1,
  last_sent_at TIMESTAMP                  NULL,
  created_at   TIMESTAMP                  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP                  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_email_reports_user (user_id),
  CONSTRAINT fk_email_reports_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;