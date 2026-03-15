-- ============================================================
-- TABLE: subscriptions
-- Manages user plan, limits, and Stripe billing state.
-- apps_allowed is the ceiling checked in backend before
-- allowing a user to add a new app.
-- ============================================================
 
CREATE TABLE IF NOT EXISTS subscriptions (
  id                       CHAR(36)                                    NOT NULL DEFAULT (UUID()),
  user_id                  CHAR(36)                                    NOT NULL,
  plan                     ENUM('free', 'starter', 'growth')          NOT NULL DEFAULT 'free',
  status                   ENUM('active', 'cancelled', 'past_due',
                                'trialing', 'incomplete')              NOT NULL DEFAULT 'active',
  apps_allowed             TINYINT UNSIGNED                           NOT NULL DEFAULT 1,
  payment_provider         VARCHAR(50)                                NULL,        -- 'stripe' | NULL for free
  provider_subscription_id VARCHAR(255)                               NULL,        -- Stripe subscription ID
  created_at               DATETIME                                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at               DATETIME                                   NULL,        -- NULL = no expiry (free plan)
 
  PRIMARY KEY (id),
  UNIQUE KEY uq_subscriptions_user (user_id),
  CONSTRAINT fk_subscriptions_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
-- ──────────────────────────────────────────────────────────
-- Plan limits (enforced in Fastify backend route):
--
--   free     → apps_allowed = 1
--   starter  → apps_allowed = 5
--   growth   → apps_allowed = 20
--
-- Backend check before INSERT into apps:
--
--   SELECT COUNT(*) AS app_count FROM apps WHERE user_id = ?
--   SELECT apps_allowed FROM subscriptions WHERE user_id = ?
--
--   IF app_count >= apps_allowed → return 403 "Upgrade required"
--
-- Stripe webhook updates: plan, status, apps_allowed, expires_at
-- ──────────────────────────────────────────────────────────