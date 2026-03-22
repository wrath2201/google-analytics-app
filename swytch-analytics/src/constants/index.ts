/**
 * Application-wide constants.
 */

/** Alert frequency options */
export const ALERT_FREQUENCIES = ["Daily", "Weekly", "Biweekly", "Monthly"] as const;
export type AlertFrequency = (typeof ALERT_FREQUENCIES)[number];

/** Navigation routes */
export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    DASHBOARD: "/dashboard",
    SETTINGS: "/settings",
    BILLING: "/billing",
} as const;

/** API endpoints */
export const API_ROUTES = {
    AUTH: "/api/auth",
    ANALYTICS: "/api/analytics",
    ALERTS: "/api/alerts",
} as const;

/** App metadata */
export const APP_NAME = "SwytchAnalytics";
export const APP_DESCRIPTION = "Google Analytics dashboard powered by SwytchCode CLI";
