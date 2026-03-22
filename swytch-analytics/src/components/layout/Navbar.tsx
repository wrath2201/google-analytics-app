"use client";

import { BarChart2, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
    const pathname = usePathname();
    const { signOut } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:4000/api/auth", {
                method: "DELETE",
                credentials: "include",
            });
        } catch (e) {
            console.error("Failed to call backend logout", e);
        } finally {
            try {
                await signOut();
            } catch (authErr) {
                console.error("Firebase signout failed", authErr);
            }
            router.push("/login");
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-30 glass border-b border-[#E5E0D8]/60">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Left — Logo */}
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#1B3A6B] rounded-lg flex items-center justify-center">
                        <BarChart2 size={15} className="text-white" />
                    </div>
                    <span className="text-lg font-semibold text-[#1A1814]" style={{ fontFamily: "var(--font-display)" }}>
                        SwytchAnalytics
                    </span>
                </Link>

                {/* Center — Nav links */}
                <div className="hidden md:flex items-center gap-1">
                    <Link
                        href="/dashboard"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${pathname === "/dashboard"
                                ? "bg-[#EDE8E0] text-[#1A1814]"
                                : "text-[#8C8578] hover:bg-[#EDE8E0] hover:text-[#1A1814]"
                            }`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/settings"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${pathname === "/settings"
                                ? "bg-[#EDE8E0] text-[#1A1814]"
                                : "text-[#8C8578] hover:bg-[#EDE8E0] hover:text-[#1A1814]"
                            }`}
                    >
                        Settings
                    </Link>
                    <Link
                        href="/billing"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${pathname === "/billing"
                                ? "bg-[#EDE8E0] text-[#1A1814]"
                                : "text-[#8C8578] hover:bg-[#EDE8E0] hover:text-[#1A1814]"
                            }`}
                    >
                        Billing
                    </Link>
                </div>

                {/* Right — User + Logout */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EDE8E0] flex items-center justify-center text-sm font-medium text-[#1A1814]">
                        U
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg hover:bg-[#EDE8E0] transition-all duration-300 cursor-pointer"
                    >
                        <LogOut size={16} className="text-[#8C8578]" />
                    </button>
                </div>
            </div>
        </nav>
    );
}