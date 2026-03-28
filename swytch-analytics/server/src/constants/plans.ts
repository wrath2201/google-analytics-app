// ============================================================
// PLAN CONSTANTS
// Single source of truth for plan limits.
// ============================================================

export const PLAN_LIMITS: Record<string, number> = {
    free: 1,
    pro: 999, // effectively unlimited
};

export const PLAN_NAMES = ["free", "pro"] as const;
export type PlanName = typeof PLAN_NAMES[number];