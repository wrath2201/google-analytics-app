-- ============================================================
-- MIGRATION 002: Create subscriptions table
-- Depends on: users (001)
-- Run before apps — apps limit check reads from subscriptions.
-- ============================================================
 
CREATE TABLE IF NOT EXISTS subscriptions (
  id                       CHAR(36)                                    NOT NULL DEFAULT (UUID()),
  user_id                  CHAR(36)                                    NOT NULL,
  plan                     ENUM('free', 'starter', 'growth')          NOT NULL DEFAULT 'free',
  status                   ENUM('active', 'cancelled', 'past_due',
                                'trialing', 'incomplete')              NOT NULL DEFAULT 'active',
  apps_allowed             TINYINT UNSIGNED                           NOT NULL DEFAULT 1,
  payment_provider         VARCHAR(50)                                NULL,
  provider_subscription_id VARCHAR(255)                               NULL,
  created_at               DATETIME                                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at               DATETIME                                   NULL,
 
  PRIMARY KEY (id),
  UNIQUE KEY uq_subscriptions_user (user_id),
  CONSTRAINT fk_subscriptions_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;