// TODO: Implement MetricCard component for the dashboard
type MetricCardProps = {
    title: string;
    value: string | number;
    change?: string;
    icon?: React.ReactNode;
};

export default function MetricCard({ title, value, change, icon }: MetricCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#8C8578] font-medium">{title}</span>
                {icon && <span className="text-[#C4956A]">{icon}</span>}
            </div>
            <p className="text-2xl font-semibold text-[#1A1814]" style={{ fontFamily: "var(--font-display)" }}>
                {value}
            </p>
            {change && <span className="text-xs text-[#8C8578] mt-1">{change}</span>}
        </div>
    );
}
