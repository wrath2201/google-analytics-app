"use client";

import { useState, useEffect } from "react";
import { Check, Download, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const PLANS = [
    {
        name: "Free",
        price: 0,
        key: "free",
        features: ["1 website", "Basic analytics dashboard", "Weekly email report"],
        highlight: false,
    },
    {
        name: "Pro",
        price: 19,
        key: "pro",
        features: ["Unlimited websites", "Advanced insights", "Weekly + monthly reports", "Priority support"],
        highlight: true,
    },
];


export default function BillingPage() {
    const { user } = useAuth();

    const [subscription, setSubscription] = useState<any>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const load = async () => {
            try {
                const [subRes, invRes] = await Promise.all([
                    fetch("/api/subscriptions/me", { credentials: "include" }),
                    fetch("/api/stripe/invoices", { credentials: "include" }),
                ]);

                if (subRes.ok) setSubscription(await subRes.json());
                if (invRes.ok) {
                    const data = await invRes.json();
                    setInvoices(data.invoices ?? []);
                }
            } catch (err) {
                setError("Failed to load billing information.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const handleUpgrade = async () => {
        if (!user?.email) return;
        setUpgrading(true);
        setError(null);
        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email: user.email,
                    name: user.displayName || user.email,
                }),
            });
            if (!res.ok) throw new Error("Failed to create checkout session");
            const { url } = await res.json();
            window.location.href = url;
        } catch (err) {
            setError("Failed to start upgrade. Please try again.");
            setUpgrading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel your Pro subscription?")) return;
        setCancelling(true);
        setError(null);
        try {
            const res = await fetch("/api/stripe/cancel", {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to cancel subscription");
            const subRes = await fetch("/api/subscriptions/me", { credentials: "include" });
            if (subRes.ok) setSubscription(await subRes.json());
        } catch (err) {
            setError("Failed to cancel subscription. Please try again.");
        } finally {
            setCancelling(false);
        }
    };

    const handleDownload = async (invoiceId: string) => {
        try {
            const res = await fetch(`/api/stripe/invoice/${invoiceId}`, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch invoice");
            const { pdf, url } = await res.json();
            window.open(pdf || url, "_blank");
        } catch (err) {
            setError("Failed to download invoice.");
        }
    };

    const currentPlan = subscription?.plan ?? "free";
    const appsUsed = subscription?.appsUsed ?? 0;
    const appsAllowed = subscription?.appsAllowed ?? 1;
    const usagePct = appsAllowed >= 999 ? 5 : Math.min((appsUsed / appsAllowed) * 100, 100);

    return (
        <div className="min-h-screen bg-[#F7F5F0]">
            <Navbar />
            <div className="pt-24 pb-16 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-4xl mx-auto space-y-6"
                >
                    {/* Page Header */}
                    <div className="mb-2">
                        <p className="text-xs font-medium text-[#8C8578] uppercase tracking-widest mb-1">Account</p>
                        <h1 className="text-3xl text-[#1A1814]" style={{ fontFamily: "var(--font-display)" }}>
                            Billing & Subscription
                        </h1>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Current Plan */}
                    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6">
                        <p className="text-xs font-medium text-[#8C8578] uppercase tracking-widest mb-4">Current plan</p>
                        {loading ? (
                            <div className="h-20 animate-pulse bg-[#F7F5F0] rounded-xl" />
                        ) : (
                            <>
                                <div className="flex items-start justify-between flex-wrap gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-xl font-semibold text-[#1A1814] capitalize">{currentPlan}</h2>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${subscription?.status === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                                {subscription?.status ?? "active"}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <p className="text-3xl font-semibold text-[#1A1814]">{currentPlan === "pro" ? "$19" : "$0"}</p>
                                            <span className="text-base font-normal text-[#8C8578]">/month</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap items-start">
                                        {currentPlan === "free" ? (
                                            <Button onClick={handleUpgrade} disabled={upgrading}>
                                                {upgrading ? "Redirecting..." : "Upgrade to Pro"}
                                            </Button>
                                        ) : (
                                            <button
                                                onClick={handleCancel}
                                                disabled={cancelling}
                                                className="px-4 py-2 text-sm font-medium text-red-500 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-50 cursor-pointer"
                                            >
                                                {cancelling ? "Cancelling..." : "Cancel plan"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <hr className="border-[#E5E0D8] my-5" />
                                <div className="flex items-center gap-5">
                                    {/* SVG Ring Chart */}
                                    <div className="relative w-16 h-16 shrink-0">
                                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                            <circle cx="18" cy="18" r="15" fill="none" stroke="#EDE8E0" strokeWidth="3" />
                                            <motion.circle
                                                cx="18" cy="18" r="15" fill="none"
                                                stroke="url(#ringGrad)" strokeWidth="3" strokeLinecap="round"
                                                strokeDasharray={`${usagePct * 0.9425} 94.25`}
                                                initial={{ strokeDasharray: "0 94.25" }}
                                                animate={{ strokeDasharray: `${usagePct * 0.9425} 94.25` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                            />
                                            <defs>
                                                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#1B3A6B" />
                                                    <stop offset="100%" stopColor="#3A64A8" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-bold text-[#1A1814]">{appsUsed}/{appsAllowed >= 999 ? "∞" : appsAllowed}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#1A1814]">Websites connected</p>
                                        <p className="text-xs text-[#8C8578] mt-0.5">
                                            {appsAllowed >= 999
                                                ? "Unlimited websites on your current plan"
                                                : `${appsAllowed - appsUsed} website${appsAllowed - appsUsed !== 1 ? "s" : ""} remaining`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Pricing Plans */}
                    <div id="plans" className="bg-white border border-[#E5E0D8] rounded-2xl p-6">
                        <p className="text-xs font-medium text-[#8C8578] uppercase tracking-widest mb-5">Choose a plan</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PLANS.map((plan) => (
                                <div key={plan.name} className={`relative rounded-xl p-5 border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${plan.highlight ? "border-[#1B3A6B] border-2 shadow-[0_0_20px_-4px_rgba(27,58,107,0.2)]" : "border-[#E5E0D8]"}`}>
                                    {plan.highlight && (
                                        <div className="absolute -top-[13px] left-1/2 -translate-x-1/2">
                                            <span className="bg-[#1B3A6B] text-white text-xs font-medium px-3 py-1 rounded-b-lg rounded-t-sm shadow-sm">Recommended</span>
                                        </div>
                                    )}
                                    <p className={`font-semibold text-base mt-2 ${plan.highlight ? "text-[#1B3A6B]" : "text-[#1A1814]"}`}>{plan.name}</p>
                                    <div className="flex items-baseline gap-1 mt-1 mb-3">
                                        <p className="text-2xl font-semibold text-[#1A1814]">{plan.price === 0 ? "$0" : `$${plan.price}`}</p>
                                        <span className="text-sm text-[#8C8578]">/mo</span>
                                    </div>
                                    <ul className="space-y-2 mb-5">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-start gap-2 text-sm text-[#6B6760]">
                                                <Check size={14} className="text-green-600 mt-0.5 shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    {currentPlan === plan.key ? (
                                        <button disabled className="w-full py-2 text-sm rounded-lg bg-[#EDE8E0] text-[#8C8578] cursor-default">Current plan</button>
                                    ) : plan.key === "free" ? (
                                        <button disabled className="w-full py-2 text-sm rounded-lg border border-[#E5E0D8] text-[#8C8578] cursor-default">Downgrade</button>
                                    ) : (
                                        <button onClick={handleUpgrade} disabled={upgrading} className="relative overflow-hidden w-full py-2.5 text-sm font-medium rounded-lg bg-[#1B3A6B] text-white hover:opacity-90 transition-all disabled:opacity-50 btn-shimmer cursor-pointer">
                                            {upgrading ? "Redirecting..." : "Upgrade to Pro"}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Invoices */}
                    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6">
                        <p className="text-xs font-medium text-[#8C8578] uppercase tracking-widest mb-5">Invoices &amp; payment history</p>
                        {loading ? (
                            <div className="h-20 animate-pulse bg-[#F7F5F0] rounded-xl" />
                        ) : invoices.length === 0 ? (
                            <p className="text-sm text-[#8C8578]">No invoices yet.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-[#8C8578] border-b border-[#E5E0D8]">
                                        <th className="pb-3 font-medium">Invoice</th>
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Amount</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv: any) => (
                                        <tr key={inv.id} className="border-b border-[#E5E0D8] last:border-0 hover:bg-[#FDFCFB] border-l-2 border-l-transparent hover:border-l-[#1B3A6B] transition-all">
                                            <td className="py-3 font-medium text-[#1A1814]">{inv.number ?? inv.id}</td>
                                            <td className="py-3 text-[#6B6760]">{new Date(inv.created * 1000).toLocaleDateString()}</td>
                                            <td className="py-3 text-[#1A1814]">${((inv.amount_paid ?? 0) / 100).toFixed(2)}</td>
                                            <td className="py-3">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${inv.status === "paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${inv.status === "paid" ? "bg-green-500" : "bg-amber-500"}`} />
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <button onClick={() => handleDownload(inv.id)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-transparent rounded-lg hover:bg-[#EDE8E0] transition-all ml-auto cursor-pointer">
                                                    <Download size={13} />
                                                    Download
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
