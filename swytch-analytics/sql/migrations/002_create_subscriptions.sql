-- ============================================================
-- MIGRATION 002: Create subscriptions table
-- Depends on: users (001)
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id                      INT             NOT NULL AUTO_INCREMENT,
  user_id                 INT             NOT NULL,
  plan                    ENUM('free', 'starter', 'growth') NOT NULL DEFAULT 'free',
  apps_allowed            INT             NOT NULL DEFAULT 1,
  stripe_customer_id      VARCHAR(255)    NULL,
  stripe_subscription_id  VARCHAR(255)    NULL,
  status                  ENUM('active', 'cancelled', 'past_due', 'trialing', 'incomplete') NOT NULL DEFAULT 'active',
  created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_subscriptions_user          (user_id),
  UNIQUE KEY uq_stripe_customer             (stripe_customer_id),
  UNIQUE KEY uq_stripe_subscription         (stripe_subscription_id),
  CONSTRAINT fk_subscriptions_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;