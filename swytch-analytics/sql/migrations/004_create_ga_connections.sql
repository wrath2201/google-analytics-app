-- ============================================================
-- MIGRATION 004: Create ga_connections table
-- Depends on: apps (003)
-- access_token and refresh_token stored as BLOB (AES-256 encrypted)
-- ============================================================

CREATE TABLE IF NOT EXISTS ga_connections (
  id             INT             NOT NULL AUTO_INCREMENT,
  app_id         INT             NOT NULL,
  property_id    VARCHAR(100)    NOT NULL,
  property_name  VARCHAR(255)    NULL,
  access_token   BLOB            NOT NULL,
  refresh_token  BLOB            NOT NULL,
  created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_ga_app_property (app_id, property_id),
  CONSTRAINT fk_ga_connections_app_id
    FOREIGN KEY (app_id) REFERENCES apps(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;