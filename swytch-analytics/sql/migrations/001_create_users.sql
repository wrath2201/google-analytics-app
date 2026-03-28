-- ============================================================
-- MIGRATION 001: Create users table
-- Run first — all other tables depend on users.id
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id            INT             NOT NULL AUTO_INCREMENT,
  firebase_uid  VARCHAR(128)    NOT NULL,
  email         VARCHAR(255)    NOT NULL,
  display_name  VARCHAR(255)    NULL,
  photo_url     TEXT            NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_firebase_uid (firebase_uid),
  UNIQUE KEY uq_users_email        (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;