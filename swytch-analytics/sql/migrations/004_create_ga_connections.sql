-- ============================================================
-- MIGRATION 004: Create ga_connections table
-- Depends on: apps (003)
-- access_token and refresh_token stored as BLOB (AES-256 encrypted).
-- ============================================================
 
CREATE TABLE IF NOT EXISTS ga_connections (
  id                  CHAR(36)      NOT NULL DEFAULT (UUID()),
  app_id              CHAR(36)      NOT NULL,
  ga_property_id      VARCHAR(100)  NOT NULL,
  ga_account_id       VARCHAR(100)  NULL,
  ga_property_name    VARCHAR(255)  NULL,
  access_token        BLOB          NOT NULL,
  refresh_token       BLOB          NOT NULL,
  token_expiry        DATETIME      NOT NULL,
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 
  PRIMARY KEY (id),
  UNIQUE KEY uq_ga_app_property (app_id, ga_property_id),
  CONSTRAINT fk_ga_connections_app_id
    FOREIGN KEY (app_id) REFERENCES apps(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 