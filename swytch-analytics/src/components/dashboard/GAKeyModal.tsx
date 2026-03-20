"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

type Property = {
    propertyId: string;
    displayName: string;
};

type GAKeyModalProps = {
    isOpen: boolean;
    onCloseAction: () => void;
    onSubmitAction?: (property: { propertyId: string; displayName: string }) => void;
    blurBackground?: boolean;
};

export default function GAKeyModal({
    isOpen,
    onCloseAction,
    onSubmitAction,
    blurBackground
}: GAKeyModalProps) {

    const [properties, setProperties] = useState<Property[]>([]);
    const [selected, setSelected] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        if (!isOpen) return;

        const fetchProperties = async () => {

            try {

                setLoading(true);

                const res = await fetch(
                    "http://localhost:4000/api/ga/properties",
                    { credentials: "include" }
                );

                const data = await res.json();

                setProperties(data.properties || []);

                if (data.properties?.length) {
                    setSelected(data.properties[0].propertyId);
                }

            } catch (err) {
                console.error("Failed to fetch GA properties", err);
            } finally {
                setLoading(false);
            }

        };

        fetchProperties();

    }, [isOpen]);

    const handleSubmit = () => {

        if (selected && onSubmitAction) {
            const selectedProp = properties.find(p => p.propertyId === selected);
            if (selectedProp) {
                onSubmitAction(selectedProp);
            } else {
                onSubmitAction({ propertyId: selected, displayName: selected });
            }
            onCloseAction();
        }

    };

    return (
        <Modal isOpen={isOpen} onClose={onCloseAction} title="Select Google Analytics Property" blurBackground={blurBackground}>

            {loading && (
                <p className="text-sm text-[#8C8578]">Loading properties...</p>
            )}

            {!loading && properties.length === 0 && (
                <p className="text-sm text-[#8C8578]">
                    No Google Analytics properties found.
                </p>
            )}

            {!loading && properties.length > 0 && (
                <div className="space-y-4">

                    <Select
                        label="Google Analytics Property"
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                        options={properties.map((p) => ({
                            value: p.propertyId,
                            label: p.displayName
                        }))}
                    />

                    <div className="flex justify-end gap-2">

                        <Button variant="outline" onClick={onCloseAction}>
                            Cancel
                        </Button>

                        <Button onClick={handleSubmit}>
                            Connect Property
                        </Button>

                    </div>

                </div>
            )}

        </Modal>
    );
}