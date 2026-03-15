type ButtonProps = {
    children: React.ReactNode;
    variant?: "primary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    type?: "button" | "submit";
};

export default function Button({
    children,
    variant = "primary",
    size = "md",
    onClick,
    disabled = false,
    className = "",
    type = "button",
}: ButtonProps) {
    const base = "inline-flex items-center justify-center font-medium rounded-lg cursor-pointer btn-hover";

    const variants = {
        primary: "bg-[#1B3A6B] text-white hover:bg-[#152D56] active:scale-[0.98]",
        outline: "border border-[#E5E0D8] text-[#1A1814] hover:bg-[#EDE8E0] active:scale-[0.98]",
        ghost: "text-[#8C8578] hover:bg-[#EDE8E0] active:scale-[0.98]",
    };

    const sizes = {
        sm: "text-sm px-4 py-2",
        md: "text-sm px-5 py-2.5",
        lg: "text-base px-7 py-3.5",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""
                } ${className}`}
        >
            {children}
        </button>
    );
}