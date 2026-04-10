"use client";

import { Lightbulb, AlertTriangle } from "lucide-react";
import UpgradeOverlay from "../ui/UpgradeOverlay";

interface InsightsProps {
    data: {
        insights: string[];
        alerts: string[];
    };
    hideCard?: boolean;
}

export default function InsightsPanel({ data, hideCard }: InsightsProps) {
    
    if ((data as any)?.locked) {
        return (
            <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1D8] min-h-[250px] overflow-hidden flex items-center justify-center">
                <UpgradeOverlay />
            </div>
        );
    }

    if ((!data.insights || data.insights.length === 0) && (!data.alerts || data.alerts.length === 0)) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Critical Alerts Block */}
            {data.alerts && data.alerts.length > 0 && (
                <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-200">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h3 className="text-lg font-semibold text-red-800">Critical Anomalies Detected</h3>
                    </div>
                    <ul className="space-y-4 text-red-700">
                        {data.alerts.map((alert, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <span className="text-base font-medium">{alert}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Standard Insights Block */}
            {data.insights && data.insights.length > 0 && (
                <div className={hideCard ? "" : "bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#E5E1D8]"}>
                    {!hideCard && (
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Lightbulb className="w-5 h-5 text-[#3864FF]" />
                            </div>
                            <h3 className="text-lg font-bold text-[#1A1814] tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Overnight AI Intelligence</h3>
                        </div>
                    )}
                    <ul className="space-y-4 text-[#4A453E]">
                        {data.insights.map((insight, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <span className="text-base leading-relaxed bg-gray-50 px-4 py-3 rounded-xl w-full border border-gray-100">{insight}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
