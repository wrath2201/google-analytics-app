"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type GAKeyModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (keys: string[]) => void;
    blurBackground?: boolean;
};

export default function GAKeyModal({
    isOpen,
    onClose,
    onSubmit,
    blurBackground,
}: GAKeyModalProps) {

    const [keys, setKeys] = useState<string[]>([""]);

    const handleChange = (index: number, value: string) => {
        const updated = [...keys];
        updated[index] = value;
        setKeys(updated);
    };

    const addInput = () => {
        if (keys.length < 10) {
            setKeys([...keys, ""]);
        }
    };

    const removeInput = (index: number) => {
        const updated = keys.filter((_, i) => i !== index);
        setKeys(updated.length ? updated : [""]);
    };

    const handleSubmit = () => {
        const validKeys = keys.map(k => k.trim()).filter(Boolean);

        if (validKeys.length && onSubmit) {
            onSubmit(validKeys);
            setKeys([""]);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add GA Properties"
            blurBackground={blurBackground}
        >
            <div className="space-y-4">

                {keys.map((key, index) => (
                    <div key={index} className="flex gap-2">
                        <Input
                            label={index === 0 ? "Measurement ID" : undefined}
                            placeholder="G-XXXXXXXXXX"
                            value={key}
                            onChange={(e) => handleChange(index, e.target.value)}
                        />

                        {keys.length > 1 && (
                            <Button
                                variant="ghost"
                                onClick={() => removeInput(index)}
                            >
                                ✕
                            </Button>
                        )}
                    </div>
                ))}

                <div className="flex justify-between pt-2">

                    <Button variant="outline" onClick={addInput}>
                        + Add another
                    </Button>

                    <Button onClick={handleSubmit}>
                        Add Properties
                    </Button>

                </div>
            </div>
        </Modal>
    );
}