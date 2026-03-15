-- ============================================================
-- TABLE: ga_connections
-- Stores the Google Analytics property linked to an app.
-- access_token and refresh_token are encrypted at rest
-- using AES-256 via MySQL's AES_ENCRYPT / AES_DECRYPT.
-- The encryption key lives in the backend .env — never in DB.
-- ============================================================
 
CREATE TABLE IF NOT EXISTS ga_connections (
  id                  CHAR(36)      NOT NULL DEFAULT (UUID()),
  app_id              CHAR(36)      NOT NULL,
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