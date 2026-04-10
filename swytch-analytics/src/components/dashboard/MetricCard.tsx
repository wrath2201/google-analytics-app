"use client";

import { useEffect, useRef, useState } from "react";

type MetricCardProps = {
    title: string;
    value: string | number;
    change?: string;
    icon?: React.ReactNode;
    accent?: "navy" | "warm" | "green" | "default";
};

const ACCENT_COLORS = {
    navy: "border-l-[#1B3A6B]",
    warm: "border-l-[#C4956A]",
    green: "border-l-emerald-500",
    default: "border-l-[#8C8578]",
};

const ACCENT_ICON_BG = {
    navy: "bg-[#1B3A6B]/10 text-[#1B3A6B]",
    warm: "bg-[#C4956A]/10 text-[#C4956A]",
    green: "bg-emerald-50 text-emerald-600",
    default: "bg-[#EDE8E0] text-[#8C8578]",
};

function useAnimatedNumber(target: number, duration = 800) {
    const [display, setDisplay] = useState(0);
    const prev = useRef(0);

    useEffect(() => {
        if (isNaN(target) || target === 0) {
            setDisplay(target);
            prev.current = target;
            return;
        }

        const start = prev.current;
        const diff = target - start;
        const startTime = performance.now();

        const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + diff * eased;
            setDisplay(current);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                prev.current = target;
            }
        };

        requestAnimationFrame(step);
    }, [target, duration]);

    return display;
}

function formatAnimatedValue(raw: string | number, animated: number): string {
    if (typeof raw === "string") {
        // If it ends in %, animate the number part
        if (raw.endsWith("%")) {
            const num = parseFloat(raw);
            if (!isNaN(num)) return animated.toFixed(2) + "%";
        }
        // Duration format like "2m 30s"
        if (raw.includes("m ") && raw.includes("s")) {
            const mins = Math.floor(animated / 60);
            const secs = Math.floor(animated % 60);
            return `${mins}m ${secs}s`;
        }
        return raw;
    }
    // Large integers
    if (Number.isInteger(raw)) {
        return Math.round(animated).toLocaleString();
    }
    return animated.toFixed(2);
}

function getNumericValue(value: string | number): number {
    if (typeof value === "number") return value;
    if (value === "—" || value === "...") return 0;
    // "12.34%"
    if (value.endsWith("%")) return parseFloat(value) || 0;
    // "2m 30s" → total seconds
    const durationMatch = value.match(/(\d+)m\s+(\d+)s/);
    if (durationMatch) return parseInt(durationMatch[1]) * 60 + parseInt(durationMatch[2]);
    // "1,234"
    return parseFloat(value.replace(/,/g, "")) || 0;
}

export default function MetricCard({ title, value, change, icon, accent = "default" }: MetricCardProps) {
    const numericTarget = getNumericValue(value);
    const animated = useAnimatedNumber(numericTarget);
    const isLoading = value === "..." || value === "—";

    return (
        <div className={`
            bg-white rounded-2xl border border-[#E5E0D8] border-l-4 ${ACCENT_COLORS[accent]}
            p-5 shadow-sm card-hover flex flex-col justify-between h-[120px]
            transition-all duration-300
        `}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#8C8578] uppercase tracking-wider">{title}</span>
                {icon && (
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${ACCENT_ICON_BG[accent]}`}>
                        {icon}
                    </span>
                )}
            </div>
            <div className="flex items-end justify-between mt-auto">
                <p className="text-3xl font-bold text-[#1A1814] tracking-tight tabular-nums" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
                    {isLoading ? value : formatAnimatedValue(value, animated)}
                </p>
                {change && <span className="text-sm font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">{change}</span>}
            </div>
        </div>
    );
}
