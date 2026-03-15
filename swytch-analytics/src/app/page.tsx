import Link from "next/link";
import LogoLoop from "@/components/ui/LogoLoop";
import type { LogoItem } from "@/components/ui/LogoLoop";
import {
    BarChart2, Bell, Shield, Zap,
    ActivitySquare, Mail, Settings2, ArrowRight,
} from "lucide-react";
import Button from "@/components/ui/Button";
import BlurText from "@/components/ui/BlurText";
const techLogos: LogoItem[] = [
    {
        node: (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5E0D8] text-[#1A1814] text-sm font-medium shadow-sm">
                <svg width="16" height="16" viewBox="0 0 128 128" fill="none"><path d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0z" fill="#000" /><path d="M107 99.3L65.6 38H48v51.8h13.8V57.5l36.5 54.4c2.9-1.9 5.6-4 8.1-6.4l.6-6.2zM80 38h14v52H80z" fill="#fff" /></svg>
                Next.js
            </span>
        ),
    },
    {
        node: (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5E0D8] text-[#3178C6] text-sm font-medium shadow-sm">
                <svg width="16" height="16" viewBox="0 0 128 128"><path fill="#3178C6" d="M0 64v64h128V0H0z" /><path fill="#fff" d="M57.2 82.6V90H36.7V38h13.8v44.6h6.7zm14.4 7.4c-2.4 0-4.5-.4-6.4-1.3l2.2-10.3c1.3.7 2.7 1 4.1 1 2.4 0 3.5-1.5 3.5-4.5V38h13.8v37.3c0 9.6-4.8 14.7-17.2 14.7z" /></svg>
                TypeScript
            </span>
        ),
    },
    {
        node: (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5E0D8] text-[#F7A800] text-sm font-medium shadow-sm">
                <svg width="16" height="16" viewBox="0 0 32 32"><path fill="#FFA000" d="M16 3L1 9.5V16c0 8.3 6.4 16 15 17.4C24.6 32 31 24.3 31 16V9.5L16 3z" /><path fill="#FFCA28" d="M16 3v26.4C24.6 28 31 20.3 31 12V9.5L16 3z" /></svg>
                Firebase
            </span>
        ),
    },
    {
        node: (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5E0D8] text-[#00758F] text-sm font-medium shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00758F" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
                MySQL
            </span>
        ),
    },
    {
        node: (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5E0D8] text-[#1A1814] text-sm font-medium shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                Fastify
            </span>
        ),
    },
    {
        node: (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D0DCF0] border border-[#B0C4E8] text-[#1B3A6B] text-sm font-medium shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                Real-Time Analytics
            </span>
        ),
    },
    {
        node: (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D0DCF0] border border-[#B0C4E8] text-[#1B3A6B] text-sm font-medium shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                Email Alerts
            </span>
        ),
    },
    {
        node: (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D0DCF0] border border-[#B0C4E8] text-[#1B3A6B] text-sm font-medium shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                Google Auth
            </span>
        ),
    },
    {
        node: (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EDE8E0] border border-[#D5CFC6] text-[#8C6A45] text-sm font-medium shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
                SwytchCode CLI
            </span>
        ),
    },
    {
        node: (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EDE8E0] border border-[#D5CFC6] text-[#8C6A45] text-sm font-medium shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                MCP Server
            </span>
        ),
    },
];
const features = [
    { icon: Shield, title: "Secure Authentication", desc: "Sign in with Google via Firebase — enterprise-grade security without the complexity." },
    { icon: ActivitySquare, title: "Real-Time Dashboard", desc: "Visualize your analytics with beautiful charts, metrics, and customizable views." },
    { icon: Mail, title: "Smart Email Alerts", desc: "Receive daily, weekly, or monthly analytics digests straight to your inbox." },
    { icon: Settings2, title: "Customizable Settings", desc: "Fine-tune your dashboard, manage GA properties, and control notification preferences." },
];

const steps = [
    { number: "01", title: "Sign In", desc: "Authenticate securely with your Google account via Firebase." },
    { number: "02", title: "Add Your GA Key", desc: "Enter your Google Analytics Measurement ID to connect your property." },
    { number: "03", title: "View & Monitor", desc: "Explore your dashboard and set up automated email alerts." },
];

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-[#F7F5F0]">

            {/* ─── NAVBAR ─── */}
            <nav className="fixed top-0 left-0 right-0 z-30 bg-[#FAF8F4]/90 backdrop-blur-md border-b border-[#E5E0D8]">
                <div className="w-full h-14 flex items-center justify-between">

                    {/* Left — Logo flush to left edge */}
                    <Link href="/">
                        <div className="flex items-center gap-2.5 h-14 px-6 border-r border-[#E5E0D8] hover:bg-[#EDE8E0] transition-all duration-200 cursor-pointer group">
                            <div className="w-7 h-7 bg-[#1B3A6B] rounded-md flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                <BarChart2 size={13} className="text-white" />
                            </div>
                            <span className="text-base tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                                <span className="font-black text-[#1A1814]">SWYTCH</span>
                                <span className="font-light text-[#6B6760] group-hover:text-[#1A1814] transition-colors duration-200">Analytics</span>
                            </span>
                        </div>
                    </Link>

                    {/* Center — Nav links absolutely centered */}
                    <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center h-14">
                        <a href="#features" className="h-full px-8 flex items-center text-xs font-semibold tracking-widest uppercase text-[#6B6760] border-x border-transparent hover:text-[#1A1814] hover:border-[#E5E0D8] hover:bg-[#EDE8E0] transition-all duration-200">
                            Features
                        </a>
                        <a href="#how-it-works" className="h-full px-8 flex items-center text-xs font-semibold tracking-widest uppercase text-[#6B6760] border-x border-transparent hover:text-[#1A1814] hover:border-[#E5E0D8] hover:bg-[#EDE8E0] transition-all duration-200">
                            How It Works
                        </a>
                    </div>

                    {/* Right — CTA flush to right edge */}
                    <Link href="/login">
                        <button className="flex items-center gap-2 h-14 px-6 text-xs font-bold tracking-widest uppercase text-[#1A1814] border-l border-[#E5E0D8] hover:bg-[#1B3A6B] hover:text-white transition-all duration-200 cursor-pointer group">
                            Get Started
                            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
                        </button>
                    </Link>

                </div>
            </nav>

            {/* ─── HERO ─── */}
            <section className="min-h-[77vh] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">

                {/* 3D floating orbs — layered for depth */}
                <div className="absolute top-[10%] right-[8%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#C4956A]/20 to-[#1B3A6B]/10 blur-[120px] float" />
                <div className="absolute bottom-[15%] left-[5%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[#1B3A6B]/15 to-[#C4956A]/10 blur-[100px] float" style={{ animationDelay: "2s" }} />
                <div className="absolute top-[40%] left-[20%] w-[200px] h-[200px] rounded-full bg-[#C4956A]/8 blur-[60px] float" style={{ animationDelay: "4s" }} />

                {/* 3D geometric shapes */}
                <div className="absolute top-[20%] right-[15%] w-16 h-16 border-2 border-[#1B3A6B]/20 rounded-xl rotate-12 float" style={{ animationDelay: "1s" }} />
                <div className="absolute bottom-[25%] left-[12%] w-10 h-10 border-2 border-[#C4956A]/30 rounded-lg rotate-45 float" style={{ animationDelay: "3s" }} />
                <div className="absolute top-[60%] right-[10%] w-8 h-8 bg-[#1B3A6B]/10 rounded-full float" style={{ animationDelay: "1.5s" }} />
                <div className="absolute top-[30%] left-[8%] w-6 h-6 bg-[#C4956A]/20 rotate-12 float" style={{ animationDelay: "2.5s" }} />

                {/* Grid texture overlay for 3D depth feel */}
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: `linear-gradient(#1A1814 1px, transparent 1px), linear-gradient(90deg, #1A1814 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />

                <div className="relative z-10 max-w-3xl mx-auto w-full">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#D5CFC6] bg-[#EDE8E0] text-[#5C4A32] text-sm font-bold mb-10 fade-up tracking-widest uppercase shadow-sm">
                        <Zap size={14} className="text-[#C4956A]" />
                        Powered by SwytchCode CLI
                    </div>

                    {/* Hero heading — BlurText centered */}
                    <div className="w-full flex justify-center mb-6">
                        <BlurText
                            text=" Your Analytics Simplified"
                            animateBy="words"
                            direction="top"
                            delay={150}
                            stepDuration={0.4}
                            className="text-5xl md:text-7xl text-[#1A1814] leading-[1.1] justify-center"
                        />
                    </div>

                    <p className="text-lg md:text-xl text-[#8C8578] max-w-lg mx-auto mb-12 leading-relaxed fade-up fade-up-delay-2">
                        Connect your Google Analytics properties, visualize key metrics,
                        and receive smart alerts — all in one clean dashboard.
                    </p>

                    <div className="flex items-center justify-center gap-4 fade-up fade-up-delay-3">
                        <Link href="/login">
                            <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold bg-[#E8E2D9] text-[#1A1814] border-2 border-[#C8C0B4] hover:bg-[#DDD7CE] hover:border-[#B8B0A4] transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg btn-hover">
                                Start for Free
                                <ArrowRight size={15} />
                            </button>
                        </Link>
                        <a href="#features">
                            <Button size="lg" variant="outline">Explore Features</Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* ─── LOGO LOOP ─── */}
            <section className="py-14 bg-[#F7F5F0] border-b border-[#E5E0D8]">
                <p className="text-center text-xs tracking-[0.2em] uppercase text-[#B0A898] font-medium mb-8">
                    Trusted by leading teams
                </p>
                <LogoLoop
                    logos={techLogos}
                    speed={60}
                    direction="left"
                    logoHeight={40}
                    gap={24}
                    pauseOnHover
                    fadeOut
                    fadeOutColor="#F7F5F0"
                    scaleOnHover
                />
            </section>

            {/* ─── FEATURES ─── */}
            <section id="features" className="min-h-screen flex items-center py-24 px-6 bg-white border-y border-[#E5E0D8]">
                <div className="max-w-5xl mx-auto w-full">
                    <div className="text-center mb-16">
                        <p className="text-xs tracking-[0.2em] uppercase text-[#C4956A] font-medium mb-4">What we offer</p>
                        <h2 className="text-3xl md:text-5xl text-[#1A1814] mb-4" style={{ fontFamily: "var(--font-display)" }}>
                            Everything you need to{" "}
                            <span className="italic text-[#C4956A]">understand your traffic</span>
                        </h2>
                        <p className="text-base text-[#8C8578] max-w-md mx-auto">
                            Powerful features wrapped in a simple, intuitive interface.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="bg-[#F7F5F0] rounded-2xl border border-[#E5E0D8] p-7 card-hover group"
                            >
                                <div className="w-11 h-11 rounded-xl bg-[#EDE8E0] flex items-center justify-center mb-5 group-hover:bg-[#1B3A6B] transition-colors duration-300">
                                    <Icon size={18} className="text-[#C4956A] group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-sm font-semibold text-[#1A1814] mb-2">{title}</h3>
                                <p className="text-xs text-[#8C8578] leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section id="how-it-works" className="min-h-screen flex items-center py-24 px-6">
                <div className="max-w-4xl mx-auto w-full">
                    <div className="text-center mb-16">
                        <p className="text-xs tracking-[0.2em] uppercase text-[#C4956A] font-medium mb-4">Getting started</p>
                        <h2 className="text-3xl md:text-5xl text-[#1A1814] mb-4" style={{ fontFamily: "var(--font-display)" }}>
                            Up and running in{" "}
                            <span className="italic text-[#C4956A]">three steps</span>
                        </h2>
                    </div>

                    <div className="bg-white rounded-3xl border border-[#E5E0D8] p-10 md:p-14">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
                            <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-px bg-[#E5E0D8]" />
                            {steps.map(({ number, title, desc }) => (
                                <div key={number} className="flex flex-col items-center text-center relative">
                                    <div
                                        className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1B3A6B] to-[#2A5298] text-white flex items-center justify-center text-sm font-semibold mb-6 z-10 shadow-lg shadow-[#1B3A6B]/20"
                                        style={{ fontFamily: "var(--font-display)" }}
                                    >
                                        {number}
                                    </div>
                                    <h3 className="text-base font-semibold text-[#1A1814] mb-2">{title}</h3>
                                    <p className="text-sm text-[#8C8578] leading-relaxed max-w-[220px]">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── CTA BANNER ─── */}
            <section className="min-h-[60vh] flex items-center py-24 px-6 bg-[#1B3A6B] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#C4956A]/10 blur-[120px]" />
                <div className="max-w-2xl mx-auto text-center relative z-10">
                    <p className="text-xs tracking-[0.2em] uppercase text-[#C4956A] font-medium mb-6">Ready?</p>
                    <h2 className="text-3xl md:text-5xl text-white mb-5" style={{ fontFamily: "var(--font-display)" }}>
                        Ready to simplify
                        <br />your analytics?
                    </h2>
                    <p className="text-[#B8C7DB] text-base mb-10 max-w-md mx-auto">
                        Join teams already using SwytchAnalytics to make data-driven decisions.
                    </p>
                    <Link href="/login">
                        <button className="px-8 py-3.5 bg-white text-[#1B3A6B] rounded-lg text-sm font-semibold hover:bg-[#F7F5F0] transition-all duration-300 cursor-pointer btn-hover shadow-lg shadow-white/10">
                            Get Started for Free
                            <ArrowRight size={15} className="inline ml-2" />
                        </button>
                    </Link>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="py-10 px-6 border-t border-[#E5E0D8] bg-[#F7F5F0]">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 bg-[#1B3A6B] rounded-md flex items-center justify-center">
                            <BarChart2 size={11} className="text-white" />
                        </div>
                        <span className="text-sm font-medium text-[#8C8578]">SwytchAnalytics</span>
                    </div>
                    <p className="text-xs text-[#8C8578]">Open source · Built with SwytchCode CLI</p>
                </div>
            </footer>

        </main>
    );
}