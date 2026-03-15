"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type GAKeyModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (key: string) => void;
};

export default function GAKeyModal({ isOpen, onClose, onSubmit }: GAKeyModalProps) {
    const [gaKey, setGaKey] = useState("");

    const handleSubmit = () => {
        if (gaKey.trim() && onSubmit) {
            onSubmit(gaKey.trim());
            setGaKey("");
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add GA Property">
            <div className="space-y-4">
                <Input
                    label="Measurement ID"
                    placeholder="G-XXXXXXXXXX"
                    value={gaKey}
                    onChange={(e) => setGaKey(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!gaKey.trim()}>Add Property</Button>
                </div>
            </div>
        </Modal>
    );
}
