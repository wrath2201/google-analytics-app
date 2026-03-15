type BadgeProps = {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "error" | "info";
    size?: "sm" | "md";
    className?: string;
};

export default function Badge({
    children,
    variant = "default",
    size = "sm",
    className = "",
}: BadgeProps) {
    const variants = {
        default: "bg-[#EDE8E0] text-[#8C8578]",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        error: "bg-red-50 text-red-700 border-red-200",
        info: "bg-[#EDE8E0] text-[#1B3A6B]",
    };

    const sizes = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
    };

    return (
        <span
            className={`inline-flex items-center font-medium rounded-full border border-transparent ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </span>
    );
}
