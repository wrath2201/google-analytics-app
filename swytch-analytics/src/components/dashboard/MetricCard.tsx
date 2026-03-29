// TODO: Implement MetricCard component for the dashboard
type MetricCardProps = {
    title: string;
    value: string | number;
    change?: string;
    icon?: React.ReactNode;
};

export default function MetricCard({ title, value, change, icon }: MetricCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-[110px]">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#8C8578] uppercase tracking-wide">{title}</span>
                {icon && <span className="text-[#3864FF]">{icon}</span>}
            </div>
            <div className="flex items-end justify-between mt-2">
                <p className="text-3xl font-bold text-[#1A1814] tracking-tight" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
                    {value}
                </p>
                {change && <span className="text-sm font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">{change}</span>}
            </div>
        </div>
    );
}
