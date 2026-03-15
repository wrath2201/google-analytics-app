import { useState, useCallback } from "react";

// TODO: Import types when defined
// import type { AnalyticsData } from "@/types";

/**
 * Custom hook for fetching and managing analytics data.
 */
export function useAnalytics(propertyId?: string) {
    const [data, setData] = useState<unknown>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        if (!propertyId) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/analytics?propertyId=${propertyId}`);
            if (!res.ok) throw new Error("Failed to fetch analytics");
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, [propertyId]);

    return { data, loading, error, fetchAnalytics };
}
