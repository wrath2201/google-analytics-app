"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

type ToastProps = {
    message: string;
    variant?: ToastVariant;
    duration?: number;
    onClose: () => void;
};

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
};

const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-[#EDE8E0] border-[#E5E0D8] text-[#1A1814]",
};

export default function Toast({
    message,
    variant = "info",
    duration = 4000,
    onClose,
}: ToastProps) {
    const [visible, setVisible] = useState(true);
    const Icon = icons[variant];

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            className={`
                fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5
                rounded-xl border shadow-lg transition-all duration-300
                ${styles[variant]}
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
        >
            <Icon size={18} />
            <span className="text-sm font-medium">{message}</span>
            <button
                onClick={() => {
                    setVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="ml-2 p-1 rounded-md hover:bg-black/5 transition-colors cursor-pointer"
            >
                <X size={14} />
            </button>
        </div>
    );
}
