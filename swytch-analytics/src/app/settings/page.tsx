"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Bell, User, Check } from "lucide-react";

const frequencies = ["Daily", "Weekly", "Biweekly", "Monthly"];

export default function SettingsPage() {
    const [email, setEmail] = useState("user@example.com");
    const [name, setName] = useState("John Doe");
    const [frequency, setFrequency] = useState("Weekly");
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="min-h-screen bg-[#F7F5F0]">
            <Navbar />
            <main className="pt-24 pb-16 px-6">
                <div className="max-w-2xl mx-auto">

                    <div className="mb-8">
                        <h1 className="text-3xl text-[#1A1814] mb-1" style={{ fontFamily: "var(--font-display)" }}>
                            Settings
                        </h1>
                        <p className="text-sm text-[#8C8578]">Manage your profile and alert preferences</p>
                    </div>

                    {/* Profile */}
                    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 mb-4 card-hover">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-7 h-7 rounded-lg bg-[#EDE8E0] flex items-center justify-center">
                                <User size={14} className="text-[#C4956A]" />
                            </div>
                            <h2 className="text-sm font-semibold text-[#1A1814]">Profile</h2>
                        </div>
                        <div className="space-y-4">
                            <Input label="Full Name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                            <Input label="Email Address" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                        </div>
                    </div>

                    {/* Alert Frequency */}
                    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 mb-6 card-hover">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-[#EDE8E0] flex items-center justify-center">
                                <Bell size={14} className="text-[#C4956A]" />
                            </div>
                            <h2 className="text-sm font-semibold text-[#1A1814]">Alert Frequency</h2>
                        </div>
                        <p className="text-xs text-[#8C8578] mb-5 ml-9">
                            Choose how often you want to receive analytics reports by email.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {frequencies.map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFrequency(f)}
                                    className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition-all duration-300 cursor-pointer ${frequency === f
                                            ? "bg-[#1B3A6B] text-white border-[#1B3A6B] shadow-md shadow-[#1B3A6B]/15"
                                            : "bg-white text-[#8C8578] border-[#E5E0D8] hover:border-[#C4956A] hover:text-[#1A1814]"
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 p-3 rounded-xl bg-[#F7F5F0] border border-[#E5E0D8]">
                            <p className="text-xs text-[#8C8578]">
                                📬 With <span className="font-semibold text-[#C4956A]">{frequency}</span> alerts,
                                your next report will be sent to{" "}
                                <span className="font-semibold text-[#1A1814]">{email}</span>
                            </p>
                        </div>
                    </div>

                    {/* Save */}
                    <div className="flex items-center gap-3">
                        <Button onClick={handleSave} size="md" className="min-w-[140px]">
                            {saved ? (
                                <span className="flex items-center gap-2">
                                    <Check size={15} /> Saved!
                                </span>
                            ) : "Save Changes"}
                        </Button>
                        {saved && <span className="text-sm text-[#C4956A] animate-pulse">Settings updated successfully</span>}
                    </div>

                </div>
            </main>
        </div>
    );
}