// ============================================================
// SUBSCRIPTION SERVICE
// Single source of truth for plan checks across all routes.
// ============================================================

import { getPool } from "../plugins/mysql";
import { PLAN_LIMITS, PlanName } from "../constants/plans";

export interface UserSubscription {
    id: number;
    user_id: number;
    plan: PlanName;
    apps_allowed: number;
    status: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
}

// ── Fetch subscription row for a user ───────────────────────
export async function getUserSubscription(
    userId: number
): Promise<UserSubscription | null> {
    const pool = getPool();

    const [rows] = await pool.execute(
        `SELECT id, user_id, plan, apps_allowed, status,
                stripe_customer_id, stripe_subscription_id
         FROM subscriptions
         WHERE user_id = ?`,
        [userId]
    ) as any;

    return rows[0] ?? null;
}

// ── How many apps does this plan allow ──────────────────────
export function getPlanLimit(plan: PlanName): number {
    return PLAN_LIMITS[plan] ?? 1; // default to 1 if unknown plan
}

// ── Can this user add another app ───────────────────────────
export async function canAddApp(userId: number): Promise<{
    allowed: boolean;
    currentCount: number;
    limit: number;
    plan: PlanName;
}> {
    const pool = getPool();

    // Run both queries in parallel — no need to wait for one before the other
    const [subscriptionResult, countResult] = await Promise.all([
        getUserSubscription(userId),
        pool.execute(
            `SELECT COUNT(*) AS app_count FROM apps WHERE user_id = ?`,
            [userId]
        ) as any,
    ]);

    // If no subscription row exists yet, treat as free plan
    const plan = (subscriptionResult?.plan ?? "free") as PlanName;
    const limit = subscriptionResult?.apps_allowed ?? getPlanLimit(plan);
    const currentCount = Number(countResult[0]?.[0]?.app_count ?? 0);

    return {
        allowed: currentCount < limit,
        currentCount,
        limit,
        plan,
    };
}