"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode
} from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut as firebaseSignOut,
    User as FirebaseUser,
    GoogleAuthProvider
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

// ── Types ────────────────────────────────────────────────────
type User = {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (firebaseUser: FirebaseUser | null) => {
                if (firebaseUser) {
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                    });
                } else {
                    setUser(null);
                    // Clean up localStorage when Firebase session ends
                    localStorage.removeItem("user_name");
                }
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async (): Promise<void> => {
        const result = await signInWithPopup(auth, googleProvider);

        const idToken = await result.user.getIdToken();

        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken;

        // Firebase stores the identity provider's refresh token here if access_type=offline
        const googleRefreshToken = (result as any)._tokenResponse?.refreshToken || null;

        console.log("Captured Google Refresh Token:", googleRefreshToken ? "YES" : "NO");

        const res = await fetch("http://localhost:4000/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                idToken,
                accessToken: accessToken || null,
                refreshToken: googleRefreshToken
            })
        });

        if (!res.ok) {
            // Backend failed — sign out of Firebase too
            // so both states stay in sync
            await firebaseSignOut(auth);
            throw new Error("Session could not be created. Please try again.");
        }

        // ── Store display name in localStorage ───────────────
        // Only non-sensitive data — never store tokens or uid
        const displayName = result.user.displayName;
        if (displayName) {
            localStorage.setItem("user_name", displayName);
        }
    };

    const signOut = async (): Promise<void> => {
        // ── Clear backend cookie first ────────────────────────
        await fetch(`${BACKEND}/api/auth`, {
            method: "DELETE",
            credentials: "include",
        });

        // ── Then sign out of Firebase ─────────────────────────
        await firebaseSignOut(auth);

        // ── Clean up localStorage ─────────────────────────────
        localStorage.removeItem("user_name");

        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}

export default AuthContext;
