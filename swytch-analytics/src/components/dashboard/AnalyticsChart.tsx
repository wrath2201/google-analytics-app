"use client";

// TODO: Implement AnalyticsChart component using Recharts
type AnalyticsChartProps = {
    title?: string;
    data?: { name: string; value: number }[];
};

export default function AnalyticsChart({ title, data }: AnalyticsChartProps) {
    return (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 card-hover">
            {title && (
                <h3 className="text-sm font-semibold text-[#1A1814] mb-4">{title}</h3>
            )}
            <div className="h-48 flex items-center justify-center">
                <p className="text-xs text-[#8C8578]">Chart placeholder — connect your GA property</p>
            </div>
        </div>
    );
}
