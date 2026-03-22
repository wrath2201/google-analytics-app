"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export type BusinessSetupData = {
    websiteUrl: string;
    businessType: string;
    location: string;
    primaryGoal: string;
};

type BusinessSetupModalProps = {
    isOpen: boolean;
    onCloseAction: () => void;
    onSubmitAction: (data: BusinessSetupData) => void;
    blurBackground?: boolean;
};

const BUSINESS_TYPES = [
    { value: "", label: "Select business type..." },
    { value: "Flower shop", label: "Flower shop" },
    { value: "Restaurant", label: "Restaurant" },
    { value: "Salon", label: "Salon" },
    { value: "Ecommerce", label: "Ecommerce" },
    { value: "Other", label: "Other" }
];

const PRIMARY_GOALS = [
    { value: "", label: "Select primary goal..." },
    { value: "Phone calls", label: "Phone calls" },
    { value: "Contact form leads", label: "Contact form leads" },
    { value: "Online orders", label: "Online orders" },
    { value: "Bookings", label: "Bookings" }
];

export default function BusinessSetupModal({
    isOpen,
    onCloseAction,
    onSubmitAction,
    blurBackground
}: BusinessSetupModalProps) {

    const [websiteUrl, setWebsiteUrl] = useState("");
    const [businessType, setBusinessType] = useState("");
    const [location, setLocation] = useState("");
    const [primaryGoal, setPrimaryGoal] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        if (!websiteUrl || !businessType || !location || !primaryGoal) {
            setError("Please fill in all fields.");
            return;
        }

        setError("");
        
        onSubmitAction({
            websiteUrl,
            businessType,
            location,
            primaryGoal
        });
        
        // Don't close immediately here. The parent component will handle closing 
        // to manage the onboarding flow correctly.
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onCloseAction} 
            title="Business Setup" 
            blurBackground={blurBackground}
        >
            <div className="space-y-4">
                <p className="text-sm text-[#8C8578] mb-4">
                    Tell us a bit about your business so we can configure your analytics insights.
                </p>

                <Input 
                    label="Website URL" 
                    placeholder="e.g. bloomgarden.com" 
                    value={websiteUrl} 
                    onChange={(e) => setWebsiteUrl(e.target.value)} 
                />

                <Select
                    label="Business Type"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    options={BUSINESS_TYPES}
                />

                <Input 
                    label="Business Location" 
                    placeholder="e.g. New York, NY" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                />

                <Select
                    label="Primary Goal"
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value)}
                    options={PRIMARY_GOALS}
                />

                {error && (
                    <p className="text-xs text-red-500 font-medium">{error}</p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <Button onClick={handleSubmit}>
                        Continue
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
