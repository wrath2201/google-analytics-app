import { useAuthContext } from "@/context/AuthContext";

/**
 * Custom hook for consuming auth context.
 * Provides user state, loading status, and auth actions.
 */
export function useAuth() {
    return useAuthContext();
}
