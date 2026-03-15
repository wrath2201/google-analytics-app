"use client";

import { BarChart2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { signInWithGoogle } = useAuth();
    const router = useRouter();

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            router.push("/dashboard");
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <main className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Decorative orbs */}
            <div className="absolute top-[15%] right-[10%] w-[300px] h-[300px] rounded-full bg-[#C4956A]/8 blur-[80px]" />
            <div className="absolute bottom-[20%] left-[5%] w-[250px] h-[250px] rounded-full bg-[#1B3A6B]/6 blur-[60px]" />

            <Link href="/" className="fixed top-6 left-6 text-sm text-[#8C8578] hover:text-[#1A1814] transition-colors duration-300">
                ← Back
            </Link>

            <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-xl shadow-[#1A1814]/5 p-8 w-full max-w-sm text-center relative z-10 card-hover">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-[#1B3A6B] rounded-2xl flex items-center justify-center shadow-lg shadow-[#1B3A6B]/20">
                        <BarChart2 size={24} className="text-white" />
                    </div>
                </div>

                <h1 className="text-2xl text-[#1A1814] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    Welcome back
                </h1>
                <p className="text-sm text-[#8C8578] mb-8">
                    Sign in to access your analytics dashboard
                </p>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-[#E5E0D8] bg-white hover:bg-[#F7F5F0] transition-all duration-300 text-sm font-medium text-[#1A1814] cursor-pointer hover:shadow-md"
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
                        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
                        <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z" />
                        <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" />
                    </svg>
                    Continue with Google
                </button>

                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-[#E5E0D8]" />
                    <span className="text-xs text-[#8C8578]">or</span>
                    <div className="flex-1 h-px bg-[#E5E0D8]" />
                </div>

                <div className="bg-[#EDE8E0] rounded-xl p-3 text-xs text-[#8C8578] text-left">
                    🔒 We use Google Firebase for authentication. We never store your password.
                </div>

                <p className="text-xs text-[#8C8578] mt-5">
                    By signing in, you agree to our{" "}
                    <span className="underline cursor-pointer hover:text-[#1A1814] transition-colors">Terms of Service</span> and{" "}
                    <span className="underline cursor-pointer hover:text-[#1A1814] transition-colors">Privacy Policy</span>.
                </p>
            </div>
        </main>
    );
}