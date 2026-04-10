type InputProps = {
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: "text" | "email" | "password" | "url" | "number";
    error?: string;
    className?: string;
    disabled?: boolean;
    required?: boolean;
};

export default function Input({
    label,
    placeholder,
    value,
    onChange,
    type = "text",
    error,
    className = "",
    disabled = false,
    required = false,
}: InputProps) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-[#1A1814]">{label}</label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                className={`
                    w-full px-4 py-2.5 rounded-lg border text-sm
                    bg-white text-[#1A1814] placeholder:text-[#8C8578]
                    outline-none transition-all duration-200
                    ${error
                        ? "border-[#C44B2B] focus:ring-2 focus:ring-[#C44B2B]/20"
                        : "border-[#E5E0D8] focus:border-[#1A1814] focus:ring-[3px] focus:ring-[#1A1814]/15 shadow-[0_2px_6px_rgba(0,0,0,0.02)] focus:shadow-[0_4px_12px_rgba(26,24,20,0.08)]"
                    }
                    ${disabled ? "opacity-50 cursor-not-allowed bg-[#F7F5F0]" : ""}
                `}
            />
            {error && <span className="text-xs text-[#C44B2B]">{error}</span>}
        </div>
    );
}