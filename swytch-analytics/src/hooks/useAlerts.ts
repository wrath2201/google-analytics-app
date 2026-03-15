import { useState, useCallback } from "react";

// TODO: Import types when defined
// import type { Alert } from "@/types";

/**
 * Custom hook for managing alert preferences.
 */
export function useAlerts() {
    const [alerts, setAlerts] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/alerts");
            if (!res.ok) throw new Error("Failed to fetch alerts");
            const json = await res.json();
            setAlerts(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    const saveAlert = useCallback(async (alertData: Record<string, unknown>) => {
        try {
            const res = await fetch("/api/alerts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(alertData),
            });
            if (!res.ok) throw new Error("Failed to save alert");
            await fetchAlerts();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        }
    }, [fetchAlerts]);

    return { alerts, loading, error, fetchAlerts, saveAlert };
}
