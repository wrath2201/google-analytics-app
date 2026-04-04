"use client";

import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

function DashboardBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none bg-gradient-to-b from-[#FFFDF8] to-[#F5F2EB] flex flex-col blur-[8px] opacity-[0.85]" aria-hidden="true">
            {/* Navbar mockup */}
            <div className="h-14 bg-white border-b border-[#E5E0D8] flex items-center px-8 gap-8 justify-between opacity-90">
                <div className="flex items-center gap-10">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <Logo iconOnly iconSize="h-6" />
                    </div>
                    <div className="flex gap-8 text-[13px] font-semibold text-[#8C8578]">
                        <span className="text-[#1A1814] border-b-2 border-[#1A1814] pb-5 translate-y-[10px]">Dashboard</span>
                        <span>Invoices</span>
                        <span>Measurements</span>
                        <span>Client Base</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full border border-[#E5E0D8] bg-[#F7F5F0]" />
                    <div className="w-8 h-8 rounded-full bg-[#E5E0D8]" />
                </div>
            </div>

            {/* Top Hero Section */}
            <div className="px-12 py-10 bg-gradient-to-br from-[#FDF0D9] via-[#FCF5E8] to-[#FFFDF8] border-b border-[#E8DDD0]">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-[28px] font-black text-[#1A1814] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Analytics</h2>
                    <div className="flex gap-2">
                        <div className="px-3.5 py-1.5 bg-white rounded-md text-[11px] font-extrabold text-[#1A1814] border border-[#E5E0D8] shadow-sm">Yearly</div>
                        <div className="px-3.5 py-1.5 bg-white rounded-md text-[11px] font-extrabold text-[#1A1814] border border-[#E5E0D8] shadow-sm">Export</div>
                        <div className="px-3.5 py-1.5 bg-white rounded-md text-[11px] font-extrabold text-[#1A1814] border border-[#E5E0D8] shadow-sm">Filter</div>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-8 mb-8">
                    <div>
                        <p className="text-[12px] font-bold text-[#8C8578] mb-1.5">Total Mortgage Portfolio Value</p>
                        <p className="text-[44px] tracking-tight font-black text-[#1A1814] leading-none">$250,000M</p>
                    </div>
                    <div>
                        <p className="text-[12px] font-bold text-[#8C8578] mb-1.5">Avg Loan Size</p>
                        <p className="text-[44px] tracking-tight font-black text-[#1A1814] leading-none">$167K</p>
                    </div>
                    <div>
                        <p className="text-[12px] font-bold text-[#8C8578] mb-1.5">Monthly Operating Costs</p>
                        <p className="text-[44px] tracking-tight font-black text-[#1A1814] leading-none">$780M</p>
                    </div>
                    <div>
                        <p className="text-[12px] font-bold text-[#8C8578] mb-1.5">Revenue Growth (YoY)</p>
                        <p className="text-[44px] tracking-tight font-black text-[#1A1814] leading-none">+7.5%</p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-12 text-[11px] font-bold text-[#8C8578] pt-6 border-t border-[#E8DDD0]">
                    <div>
                        <div className="flex justify-between mb-2"><span>Monthly Revenue</span><span className="font-bold text-[#1A1814]">$1,200M</span></div>
                        <div className="flex justify-between border-t border-dashed border-[#E5E0D8] pt-2"><span>Average Interest Rate</span><span className="font-bold text-[#1A1814]">4.5%</span></div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2"><span>Top 10% Customers Cont</span><span className="font-bold text-[#1A1814]">$100,000M</span></div>
                        <div className="flex justify-between border-t border-dashed border-[#E5E0D8] pt-2"><span>Defaulted Loan Amount</span><span className="font-bold text-[#1A1814]">4,500MM</span></div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2"><span>Net Monthly Profit</span><span className="font-bold text-[#1A1814]">$420M</span></div>
                        <div className="flex justify-between border-t border-dashed border-[#E5E0D8] pt-2"><span>Year-to-Date Profit</span><span className="font-bold text-[#1A1814]">$5,000M</span></div>
                    </div>
                </div>
            </div>

            {/* Main Charts Area */}
            <div className="flex-1 p-10 grid grid-cols-12 gap-6 items-start overflow-hidden">
                {/* Left dial chart */}
                <div className="col-span-5 bg-white rounded-3xl p-8 border border-[#E5E0D8] shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-[380px] flex flex-col">
                    <p className="text-xl font-black text-[#1A1814] mb-1">Customer Satisfaction</p>
                    <p className="text-[13px] font-semibold text-[#8C8578] mb-10">Top Positive Feedback</p>

                    <div className="flex-1 flex flex-col items-center justify-center relative mt-4">
                        <svg width="240" height="120" viewBox="0 0 200 100" className="overflow-visible">
                            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#E5E0D8" strokeWidth="24" strokeLinecap="round" strokeDasharray="10 10" />
                            <path d="M 20 100 A 80 80 0 0 1 140 30" fill="none" stroke="#0E4E42" strokeWidth="24" strokeLinecap="round" strokeDasharray="14 10" />
                        </svg>
                        <div className="absolute bottom-2 text-center pointer-events-none">
                            <p className="text-[40px] tracking-tight font-black text-[#1A1814] leading-none mb-2">5.7K</p>
                            <p className="text-[11px] text-[#8C8578] uppercase font-bold tracking-widest">Responses this month</p>
                        </div>

                        <div className="w-full mt-10 space-y-3 px-4">
                            <div className="flex items-center text-[11px] font-bold text-[#8C8578]">
                                <span className="text-[#1A1814] font-black text-[13px] w-12 flex items-center gap-1"><span className="text-xl leading-none">↗</span> +12%</span>
                                <span className="flex-1 ml-4">Customer Satisfaction (CSAT): 4.7/5</span>
                            </div>
                            <div className="flex items-center text-[11px] font-bold text-[#8C8578]">
                                <span className="text-[#1A1814] font-black text-[13px] w-12 flex items-center gap-1"><span className="text-xl leading-none">↗</span> +20%</span>
                                <span className="flex-1 ml-4">Responses Received vs Last Month</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right bar chart */}
                <div className="col-span-7 bg-white rounded-3xl p-8 border border-[#E5E0D8] shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-[380px] flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <p className="text-xl font-black text-[#1A1814]">Statistics</p>
                        <div className="flex gap-2">
                            <div className="px-3.5 py-1.5 bg-white rounded-md text-[11px] font-extrabold text-[#1A1814] border border-[#E5E0D8] shadow-sm">Yearly</div>
                            <div className="px-3.5 py-1.5 bg-white rounded-md text-[11px] font-extrabold text-[#1A1814] border border-[#E5E0D8] shadow-sm">Summary</div>
                            <div className="px-3.5 py-1.5 bg-white rounded-md text-[11px] font-extrabold text-[#1A1814] border border-[#E5E0D8] shadow-sm">Filter</div>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-5 relative pb-6 h-full pl-16">
                        {/* Y axis lines */}
                        <div className="absolute inset-y-0 left-0 right-0 flex flex-col justify-between text-[10px] text-[#8C8578] font-bold font-mono pb-6 z-0 border-t border-[#E5E0D8] pt-1">
                            <div className="w-full border-b border-dashed border-[#E5E0D8] relative"><span className="absolute -top-3 left-0">$250,000MM</span></div>
                            <div className="w-full border-b border-dashed border-[#E5E0D8] relative"><span className="absolute -top-3 left-0">$200,000MM</span></div>
                            <div className="w-full border-b border-dashed border-[#E5E0D8] relative"><span className="absolute -top-3 left-0">$150,000MM</span></div>
                            <div className="w-full border-b border-dashed border-[#E5E0D8] relative"><span className="absolute -top-3 left-0">$100,000MM</span></div>
                            <div className="w-full border-b border-dashed border-[#E5E0D8] relative"><span className="absolute -top-3 left-0">$50,000MM</span></div>
                            <div className="w-full border-b border-[#E5E0D8] relative"><span className="absolute -top-3 left-0">$25,000MM</span></div>
                            <div className="text-transparent">0</div>
                        </div>

                        {/* Fake bars */}
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => {
                            const hs = [15, 10, 30, 10, 45, 60, 65, 60, 75, 50, 40, 60];
                            const h2 = hs[i];
                            const h1 = h2 + 5;
                            const col = (i === 2 || i === 5 || i === 9) ? '#0E4E42' : '#A46828';
                            return (
                                <div key={m} className="flex flex-col items-center justify-end z-10 w-full h-[220px]">
                                    <div className="w-full max-w-[16px] flex flex-col justify-end h-full relative group">
                                        <div className="absolute bottom-0 w-full rounded-t-[4px]" style={{ height: `${h1}%`, background: '#F0EBE1' }} />
                                        <div className="absolute bottom-0 w-full rounded-[4px]" style={{ height: `${h2}%`, background: col }} />
                                    </div>
                                    <span className="text-[11px] font-extrabold text-[#8C8578] mt-4">{m}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

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
            <DashboardBackground />

            <Link href="/" className="fixed top-8 left-8 z-50 hover:scale-110 active:scale-95 transition-transform duration-200">
                <div className="w-[64px] h-[64px] rounded-full bg-black shadow-[0_4px_24px_rgba(0,0,0,0.28)] flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="21" y1="12" x2="3" y2="12"/>
                        <polyline points="10 19 3 12 10 5"/>
                    </svg>
                </div>
            </Link>

            {/* ── Card ── */}
            <div className="
              relative overflow-hidden
              w-full max-w-[460px] md:max-w-[480px]
              bg-gradient-to-br from-white via-[#FDFAF5] to-[#FAF5EC]
              rounded-[32px]
              border-[1.5px] border-[#E8C97A]
              shadow-[0_0_0_4px_rgba(242,222,176,0.18),0_20px_60px_rgba(27,58,107,0.10),0_4px_16px_rgba(0,0,0,0.06)]
              px-[40px] py-[44px] md:px-[48px] md:py-[52px]
              z-10
              fade-up
            " style={{ fontFamily: "'Inter', sans-serif" }}>

                {/* top edge gold line */}
                <span className="absolute inset-x-[8%] top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#E8C97A] to-transparent pointer-events-none rounded-full" />

                {/* ── Logo ── */}
                <div className="flex justify-center mb-6">
                    <Logo iconSize="h-16 md:h-20" textSize="text-4xl md:text-5xl" className="flex-col gap-6" />
                </div>

                {/* brand name */}
                <p className="text-[12px] md:text-[13px] font-extrabold tracking-[0.12em] uppercase text-[#8C8578] text-center mb-4">
                    Statsy
                </p>

                {/* gold divider */}
                <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-[#E8C97A] to-transparent rounded-full mx-auto mb-6" />

                {/* heading */}
                <h1 className="text-[28px] md:text-[32px] font-extrabold text-[#1A1814] text-center tracking-tight leading-tight mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Welcome back
                </h1>
                <p className="text-[14px] md:text-[15px] font-medium text-[#8C8578] text-center leading-relaxed mb-6">
                    Sign in to access your analytics dashboard<br className="hidden md:block" />
                    and start making data-driven decisions.
                </p>

                {/* feature trust row */}
                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-8">
                    {["Real-time data", "Auto properties", "Weekly reports"].map((f) => (
                        <div key={f} className="flex items-center gap-1.5 text-[11px] md:text-[12px] text-[#8C8578] font-bold">
                            <div className="w-[16px] h-[16px] rounded-full bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="3.5" strokeLinecap="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            {f}
                        </div>
                    ))}
                </div>

                {/* Google button */}
                <button
                    onClick={handleGoogleLogin}
                    className="
                  relative overflow-hidden w-full
                  flex items-center justify-center gap-3
                  px-6 py-[16px] md:py-[18px] rounded-[18px]
                  bg-gradient-to-b from-white to-[#FDF8F0]
                  border-[2.5px] border-[#E8C97A]
                  shadow-[0_0_0_4px_rgba(242,222,176,0.18),0_0_18px_5px_rgba(232,198,145,0.28),0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]
                  hover:shadow-[0_0_0_6px_rgba(242,222,176,0.30),0_0_32px_10px_rgba(232,198,145,0.45),0_8px_24px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]
                  hover:border-[#D4A84B] hover:-translate-y-0.5 hover:scale-[1.02]
                  active:translate-y-px active:scale-[0.99]
                  transition-all duration-300 ease-out
                  cursor-pointer
                "
                >
                    <span className="absolute inset-x-[10%] top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent pointer-events-none" />
                    <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
                        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
                        <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z" />
                        <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" />
                    </svg>
                    <span className="text-[15px] md:text-[16px] font-black text-[#1A1814]">Continue with Google</span>
                </button>

                {/* divider */}
                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E8DDD0] to-[#E8DDD0]" />
                    <span className="text-[11px] md:text-[12px] font-bold text-[#B0A898] tracking-[0.05em] uppercase">secured by firebase</span>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#E8DDD0] to-[#E8DDD0]" />
                </div>

                {/* trust box */}
                <div className="
                relative overflow-hidden
                bg-gradient-to-br from-[#F7F3EC] to-[#F2EDE3]
                border border-[#E8DDD0] rounded-[16px]
                px-4 py-4 md:px-5 md:py-5 mb-5
                flex items-start gap-3
              ">
                    <span className="absolute inset-x-[5%] top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
                    <div className="
                  w-[28px] h-[28px] md:w-[32px] md:h-[32px] rounded-[10px] flex-shrink-0
                  bg-gradient-to-br from-[#1B3A6B] to-[#2A5298]
                  flex items-center justify-center
                  shadow-[0_3px_8px_rgba(27,58,107,0.25)]
                ">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[12px] md:text-[13px] font-black text-[#5C4A32] mb-1 tracking-tight">Your data is safe with us</p>
                        <p className="text-[11px] md:text-[12px] font-medium text-[#8C7A65] leading-relaxed">
                            Google Firebase handles all authentication. We never store your password or access data without permission.
                        </p>
                    </div>
                </div>

                {/* legal */}
                <p className="text-[10px] md:text-[11px] font-semibold text-[#B0A898] text-center leading-relaxed">
                    By signing in, you agree to our{" "}
                    <Link href="/terms" className="underline cursor-pointer hover:text-[#8C8578] transition-colors">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="underline cursor-pointer hover:text-[#8C8578] transition-colors">Privacy Policy</Link>.
                </p>

            </div>
        </main>
    );
}