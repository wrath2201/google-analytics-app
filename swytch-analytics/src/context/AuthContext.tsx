"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// TODO: Import Firebase auth when ready
// import { auth } from "@/lib/firebase";

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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Subscribe to Firebase auth state changes
        // const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => { ... });
        setLoading(false);
        // return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        // TODO: Implement Google sign-in via Firebase
        console.log("Google sign-in — not yet implemented");
    };

    const signOut = async () => {
        // TODO: Implement sign-out
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
