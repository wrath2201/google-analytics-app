"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type GAKeyModalProps = {
    isOpen: boolean;
    onCloseAction: () => void;
    onSubmitAction?: (key: string) => void;
    blurBackground?: boolean;
};

export default function GAKeyModal({ isOpen, onCloseAction, onSubmitAction, blurBackground }: GAKeyModalProps) {
    const [gaKey, setGaKey] = useState("");

    const handleSubmit = () => {
        if (gaKey.trim() && onSubmitAction) {
            onSubmitAction(gaKey.trim());
            setGaKey("");
            onCloseAction();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onCloseAction} title="Add GA Property" blurBackground={blurBackground}>
            <div className="space-y-4">
                <Input
                    label="Measurement ID"
                    placeholder="G-XXXXXXXXXX"
                    value={gaKey}
                    onChange={(e) => setGaKey(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onCloseAction}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!gaKey.trim()}>Add Property</Button>
                </div>
            </div>
        </Modal>
    );
}
