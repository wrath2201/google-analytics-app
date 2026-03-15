import { ChevronDown } from "lucide-react";

type SelectProps = {
    label?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    error?: string;
    className?: string;
    disabled?: boolean;
};

export default function Select({
    label,
    value,
    onChange,
    options,
    placeholder,
    error,
    className = "",
    disabled = false,
}: SelectProps) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-[#1A1814]">{label}</label>
            )}
            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`
                        w-full appearance-none px-4 py-2.5 pr-10 rounded-lg border text-sm
                        bg-white text-[#1A1814]
                        outline-none transition-all duration-200 cursor-pointer
                        ${error
                            ? "border-[#C44B2B] focus:ring-2 focus:ring-[#C44B2B]/20"
                            : "border-[#E5E0D8] focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/20"
                        }
                        ${disabled ? "opacity-50 cursor-not-allowed bg-[#F7F5F0]" : ""}
                    `}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8578] pointer-events-none"
                />
            </div>
            {error && <span className="text-xs text-[#C44B2B]">{error}</span>}
        </div>
    );
}
