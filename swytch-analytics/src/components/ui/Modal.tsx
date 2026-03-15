"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    blurBackground?: boolean;
};

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    blurBackground = false,
}: ModalProps) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className={`fixed inset-0 z-40 ${blurBackground ? "bg-white/30 backdrop-blur-sm" : "bg-[#1A1814]/30 backdrop-blur-sm"
                            }`}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl shadow-[#1A1814]/10 w-full max-w-md p-6 relative border border-[#E5E0D8]">
                            <div className="flex items-center justify-between mb-5">
                                {title && (
                                    <h2 className="text-lg font-semibold text-[#1A1814]"
                                        style={{ fontFamily: "var(--font-display)" }}>
                                        {title}
                                    </h2>
                                )}
                                <button
                                    onClick={onClose}
                                    className="ml-auto p-1.5 rounded-lg hover:bg-[#EDE8E0] transition-colors duration-300 cursor-pointer"
                                >
                                    <X size={18} className="text-[#8C8578]" />
                                </button>
                            </div>
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}