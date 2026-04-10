import { Lock } from "lucide-react";
import Link from "next/link";

export default function UpgradeOverlay() {
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[3px] rounded-2xl border border-white/50">
            <div className="bg-white/90 shadow-xl border border-[#E5E0D8] rounded-xl px-6 py-5 flex flex-col items-center max-w-[260px] text-center transform transition-transform hover:scale-105">
                <div className="bg-amber-100 text-amber-600 p-2.5 rounded-full mb-3">
                    <Lock size={20} strokeWidth={2.5} />
                </div>
                <h3 className="text-[#1A1814] font-bold text-sm mb-1.5">Pro Feature Locked</h3>
                <p className="text-[#8C8578] text-xs mb-4 leading-relaxed">
                    Upgrade to the Pro tier to immediately unlock advanced AI insights and deep metric charts.
                </p>
                <Link 
                    href="/billing"
                    className="w-full py-2 px-4 bg-[#1B3A6B] text-white text-xs font-semibold rounded-lg shadow-sm hover:opacity-90 transition-all text-center"
                >
                    Upgrade Now
                </Link>
            </div>
        </div>
    );
}
