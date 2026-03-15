-- ============================================================
-- TABLE: users
-- Stores user accounts, synced from Firebase Google Auth.
-- ============================================================
 
CREATE TABLE IF NOT EXISTS users (
  id                CHAR(36)      NOT NULL DEFAULT (UUID()),
  email             VARCHAR(255)  NOT NULL,
  name              VARCHAR(255)  NULL,
  google_id         VARCHAR(128)  NOT NULL,
  profile_picture   TEXT          NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email     (email),
  UNIQUE KEY uq_users_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 