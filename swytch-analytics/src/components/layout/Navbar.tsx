"use client";

import { LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
    const pathname = usePathname();
    const { signOut, user } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut();
            router.push("/");
        } catch (error) {
            console.error("Logout failed:", error);
            router.push("/"); // Fallback
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-30 glass border-b border-[#E5E0D8]/60">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Left — Logo */}
                <Link href="/" className="flex items-center">
                    <Logo iconSize="h-7" textSize="text-lg" />
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
                    <div className="w-8 h-8 rounded-full bg-[#EDE8E0] flex items-center justify-center text-sm font-semibold text-[#1A1814] select-none">
                        {user?.displayName?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                        border border-[#E5E0D8] bg-transparent
                        text-[13px] font-semibold text-[#8C8578]
                        hover:text-[#7A3A2E] hover:bg-[#FDF5F3] hover:border-[#E0A89A]/70 hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]
                        active:scale-[0.97]
                        transition-all duration-200 cursor-pointer"
                    >
                        <LogOut size={13} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                        <span>Sign out</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}