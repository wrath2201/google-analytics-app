"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const TIME_ZONES = [
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Asia/Calcutta", label: "India (IST)" },
    { value: "Australia/Sydney", label: "Sydney (AEST)" },
    { value: "UTC", label: "UTC" }
];

type Property = {
    propertyId: string;
    displayName: string;
};

type Account = {
    id: string;
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
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selected, setSelected] = useState("");
    const [loading, setLoading] = useState(false);
    const [needsAuth, setNeedsAuth] = useState(false);

    const [activeTab, setActiveTab] = useState<"select" | "create">("select");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    const [createdMeasurementId, setCreatedMeasurementId] = useState("");
    const [createdPropertyInfo, setCreatedPropertyInfo] = useState<{ id: string, name: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const [createForm, setCreateForm] = useState({
        accountId: "",
        propertyName: "",
        websiteUrl: "",
        timeZone: "America/Los_Angeles"
    });

    useEffect(() => {

        if (!isOpen) return;

        // Reset auth state so stale flags from a previous open don't stick
        setNeedsAuth(false);

        const fetchProperties = async () => {

            try {

                setLoading(true);

                const res = await fetch(
                    "/api/ga/properties",
                    { credentials: "include" }
                );

                if (res.status === 401) {
                    setNeedsAuth(true);
                    return;
                }

                const data = await res.json();

                setProperties(data.properties || []);
                setAccounts(data.accounts || []);

                if (data.properties?.length) {
                    setSelected(data.properties[0].propertyId);
                }

                if (data.accounts?.length) {
                    setCreateForm(prev => ({ ...prev, accountId: data.accounts[0].id }));
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

    const handleOAuthConnect = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/ga/oauth/url", { credentials: "include" });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error("Failed to get OAuth URL", err);
            setLoading(false);
        }
    };

    const handleCreateProperty = async () => {
        if (!createForm.accountId || !createForm.propertyName) {
            setCreateError("Account and Property Name are required.");
            return;
        }

        try {
            setCreating(true);
            setCreateError("");

            const res = await fetch("/api/ga/properties/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    parent: createForm.accountId,
                    displayName: createForm.propertyName,
                    websiteUrl: createForm.websiteUrl,
                    timeZone: createForm.timeZone
                })
            });

            const data = await res.json();

            if (!res.ok) {
                const detailedError = data.details ? `\nDetails: ${data.details}` : "";
                throw new Error(`${data.error || "Failed to create property"}${detailedError}`);
            }

            if (data.stream?.webStreamData?.measurementId) {
                setCreatedMeasurementId(data.stream.webStreamData.measurementId);
                setCreatedPropertyInfo({ id: data.property.propertyId, name: data.property.displayName });
            } else {
                if (onSubmitAction) {
                    onSubmitAction({
                        propertyId: data.property.propertyId,
                        displayName: data.property.displayName
                    });
                }
                onCloseAction();
            }

        } catch (err: any) {
            setCreateError(err.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onCloseAction} title={createdMeasurementId ? "Installation Complete!" : "Google Analytics Setup"} blurBackground={blurBackground}>

            {createdMeasurementId ? (
                <div className="space-y-4">
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-start gap-3 text-sm border border-green-100 mb-6">
                        <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                            <p className="font-semibold mb-1">Property Created Successfully!</p>
                            <p>To start collecting data, copy this script and paste it immediately after the <code className="bg-green-100 px-1 rounded">&lt;head&gt;</code> tag on every page of your website.</p>
                        </div>
                    </div>

                    <div className="relative font-mono text-xs">
                        <pre className="bg-[#1A1814] text-[#F9F8F6] p-4 pt-5 pb-5 rounded-lg overflow-x-auto shadow-inner leading-relaxed border border-[#2A2824]">
                            {`<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${createdMeasurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${createdMeasurementId}');
</script>`}
                        </pre>
                        <button
                            className={`absolute top-2 right-2 p-1.5 px-3 rounded text-white transition-all flex items-center gap-1.5 text-xs font-medium ${
                                copied
                                    ? "bg-green-500/80 hover:bg-green-500"
                                    : "bg-white/10 hover:bg-white/20"
                            }`}
                            onClick={() => handleCopy(`<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=${createdMeasurementId}"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n\n  gtag('config', '${createdMeasurementId}');\n</script>`)}
                        >
                            {copied ? (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    Copy
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={() => {
                            if (onSubmitAction && createdPropertyInfo) {
                                onSubmitAction({ propertyId: createdPropertyInfo.id, displayName: createdPropertyInfo.name });
                            }
                            setCreatedMeasurementId("");
                            onCloseAction();
                        }}>I've Added The Code</Button>
                    </div>
                </div>
            ) : needsAuth ? (
                <div className="text-center py-6 px-4">
                    <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1A1814] mb-2">Connect Google Analytics</h3>
                    <p className="text-sm text-[#8C8578] mb-8 max-w-sm mx-auto">
                        To automatically generate your dashboard and securely keep it synced overnight, authorize our platform to view your Google Analytics.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button onClick={handleOAuthConnect} disabled={loading}>
                            {loading ? "Connecting..." : "Authorize with Google"}
                        </Button>
                        <Button variant="outline" onClick={onCloseAction}>Cancel</Button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex border-b border-[#E5E1D8] mb-6">
                        <button
                            className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "select" ? "border-[#1A1814] text-[#1A1814]" : "border-transparent text-[#8C8578] hover:text-[#1A1814]"}`}
                            onClick={() => setActiveTab("select")}
                        >
                            Select Existing Property
                        </button>
                        <button
                            className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "create" ? "border-[#1A1814] text-[#1A1814]" : "border-transparent text-[#8C8578] hover:text-[#1A1814]"}`}
                            onClick={() => setActiveTab("create")}
                        >
                            Create New Property
                        </button>
                    </div>

                    {activeTab === "select" ? (
                        <div>
                            {loading && (
                                <p className="text-sm text-[#8C8578] text-center py-4">Loading properties...</p>
                            )}

                            {!loading && properties.length === 0 && (
                                <p className="text-sm text-[#8C8578] text-center py-4">
                                    No Google Analytics properties found. Create one to get started!
                                </p>
                            )}

                            {!loading && properties.length > 0 && (
                                <div className="space-y-6">
                                    <Select
                                        label="Google Analytics Property"
                                        value={selected}
                                        onChange={(e) => setSelected(e.target.value)}
                                        options={properties.map((p) => ({
                                            value: p.propertyId,
                                            label: p.displayName
                                        }))}
                                    />

                                    <div className="flex justify-end gap-3 pt-2">
                                        <Button variant="outline" onClick={onCloseAction}>Cancel</Button>
                                        <Button onClick={handleSubmit}>Connect Property</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-5">

                            {createError && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    {createError}
                                </div>
                            )}

                            {accounts.length === 0 ? (
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800 text-center space-y-2 mb-4">
                                    <p className="font-semibold text-base">No Google Analytics Account Found</p>
                                    <p>Your Google profile doesn't have a Root Analytics Account yet! Google requires you to accept their Terms of Service directly on their website before third-party apps can generate properties for you.</p>
                                    <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-4 py-2 bg-white border border-amber-300 rounded-md font-medium text-amber-900 transition-colors hover:bg-amber-100">
                                        Open analytics.google.com
                                    </a>
                                </div>
                            ) : (
                                <>
                                    <Select
                                        label="Google Account"
                                        value={createForm.accountId}
                                        onChange={(e) => setCreateForm(f => ({ ...f, accountId: e.target.value }))}
                                        options={accounts.map(a => ({ value: a.id, label: a.displayName }))}
                                    />

                            <Input
                                label="Property Name *"
                                placeholder="e.g. My Website"
                                value={createForm.propertyName}
                                onChange={(e) => setCreateForm(f => ({ ...f, propertyName: e.target.value }))}
                                required
                            />

                            <Input
                                label="Website URL"
                                placeholder="https://example.com"
                                value={createForm.websiteUrl}
                                onChange={(e) => setCreateForm(f => ({ ...f, websiteUrl: e.target.value }))}
                                type="url"
                            />

                            <Select
                                label="Analytics Data Time Zone"
                                value={createForm.timeZone}
                                onChange={(e) => setCreateForm(f => ({ ...f, timeZone: e.target.value }))}
                                options={TIME_ZONES}
                            />
                        </>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={onCloseAction} disabled={creating}>Cancel</Button>
                        <Button onClick={handleCreateProperty} disabled={creating || accounts.length === 0}>
                            {creating ? "Creating..." : "Create Property"}
                        </Button>
                    </div>
                </div>
                    )}
        </>
    )
}

        </Modal >
    );
}