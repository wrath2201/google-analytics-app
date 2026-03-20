"use client";

import { useMemo } from "react";
import { Lightbulb, TrendingUp, Users, Laptop, Clock } from "lucide-react";

interface InsightsProps {
    metrics: Record<string, number>;
    sources: any;
    devices: any;
    hourly: any;
}

export default function InsightsPanel({ metrics, sources, devices, hourly }: InsightsProps) {
    const insights = useMemo(() => {
        const generated = [];

        // 1. Traffic Insight (Static mock vs current due to lack of historical comparison, but we'll show current week summary)
        if (metrics.users > 0) {
            generated.push({
                icon: <TrendingUp className="w-5 h-5 text-green-600" />,
                text: `You had ${metrics.users} active users this week.`,
            });
        }

        // 2. Sources insight
        if (sources?.labels?.length > 0) {
            let maxSource = sources.labels[0];
            let maxVal = sources.values[0];
            for (let i = 1; i < sources.labels.length; i++) {
                if (sources.values[i] > maxVal) {
                    maxVal = sources.values[i];
                    maxSource = sources.labels[i];
                }
            }
            if (maxVal > 0) {
                generated.push({
                    icon: <Users className="w-5 h-5 text-blue-600" />,
                    text: `Most visitors come from ${maxSource === '(direct)' ? 'Direct Traffic' : maxSource}.`,
                });
            }
        }

        // 3. Devices insight
        if (devices?.labels?.length > 0) {
            let total = 0;
            let mobileSessions = 0;
            let topDevice = devices.labels[0];
            let topVal = devices.values[0];

            for (let i = 0; i < devices.labels.length; i++) {
                total += devices.values[i];
                if (devices.labels[i].toLowerCase() === 'mobile') {
                    mobileSessions += devices.values[i];
                }
                if (devices.values[i] > topVal) {
                    topVal = devices.values[i];
                    topDevice = devices.labels[i];
                }
            }

            if (total > 0) {
                const mobilePct = Math.round((mobileSessions / total) * 100);
                if (mobilePct > 50) {
                    generated.push({
                        icon: <Laptop className="w-5 h-5 text-orange-600" />,
                        text: `${mobilePct}% of visitors use mobile devices.`,
                    });
                } else if (topVal > 0) {
                    const topPct = Math.round((topVal / total) * 100);
                    generated.push({
                        icon: <Laptop className="w-5 h-5 text-orange-600" />,
                        text: `${topPct}% of visitors use ${topDevice}.`,
                    });
                }
            }
        }

        // 4. Hourly insight
        if (hourly?.labels?.length > 0) {
            let maxHour = hourly.labels[0];
            let maxVal = hourly.values[0];
            for (let i = 1; i < hourly.labels.length; i++) {
                if (hourly.values[i] > maxVal) {
                    maxVal = hourly.values[i];
                    maxHour = hourly.labels[i];
                }
            }
            if (maxVal > 0) {
                // Convert 00-23 to 12h format
                const hourNum = parseInt(maxHour);
                const ampm = hourNum >= 12 ? 'PM' : 'AM';
                const formatHour = hourNum % 12 || 12;
                generated.push({
                    icon: <Clock className="w-5 h-5 text-purple-600" />,
                    text: `Peak traffic time is around ${formatHour} ${ampm}.`,
                });
            }
        }

        return generated;
    }, [metrics, sources, devices, hourly]);

    if (insights.length === 0) {
        return null;
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1D8]">
            <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-[#1A1814]">Quick Insights</h3>
            </div>
            <ul className="space-y-4 text-[#4A453E]">
                {insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                        <div className="mt-0.5">{insight.icon}</div>
                        <span className="text-base">{insight.text}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
