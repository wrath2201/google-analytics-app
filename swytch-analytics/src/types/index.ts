/**
 * Shared TypeScript type definitions for SwytchAnalytics.
 */

/** User profile */
export type User = {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
};

/** Google Analytics property */
export type GAProperty = {
    id: string;
    measurementId: string;
    name?: string;
    isActive: boolean;
};

/** Alert frequency options */
export type AlertFrequency = "Daily" | "Weekly" | "Biweekly" | "Monthly";

/** Alert configuration */
export type AlertConfig = {
    id: string;
    userId: string;
    propertyId: string;
    frequency: AlertFrequency;
    email: string;
    enabled: boolean;
};

/** Analytics metric */
export type Metric = {
    name: string;
    value: number;
    previousValue?: number;
    change?: number;
};

/** Chart data point */
export type ChartDataPoint = {
    name: string;
    value: number;
    [key: string]: string | number;
};

/** API response wrapper */
export type ApiResponse<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
};
