"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import GAKeyModal from "@/components/dashboard/GAKeyModal";
import MetricCard from "@/components/dashboard/MetricCard";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import MetricsModal from "@/components/dashboard/MetricsModal";

const STORAGE_KEY = "ga_properties";
const SELECTED_KEY = "ga_selected_property";
const METRICS_KEY = "dashboard_metrics";

const METRIC_LABELS: Record<string, string> = {
    users: "Users",
    sessions: "Sessions",
    pageViews: "Page Views",
    bounceRate: "Bounce Rate",
    avgSessionDuration: "Avg Session Duration",
    newUsers: "New Users",
};

export default function DashboardPage() {
    const [properties, setProperties] = useState<string[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<string>("");
    const [modalOpen, setModalOpen] = useState(false);
    const [metricsModalOpen, setMetricsModalOpen] = useState(false);
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

    useEffect(() => {
        const storedProperties = localStorage.getItem(STORAGE_KEY);
        const storedSelected = localStorage.getItem(SELECTED_KEY);
        const storedMetrics = localStorage.getItem(METRICS_KEY);

        if (!storedProperties) {
            setModalOpen(true);
            return;
        }

        const parsed = JSON.parse(storedProperties);
        setProperties(parsed);

        let propertyToUse: string | null = storedSelected;

        if (!propertyToUse && parsed.length > 0) {
            propertyToUse = parsed[0];
            localStorage.setItem(SELECTED_KEY, parsed[0]);
        }

        if (propertyToUse) setSelectedProperty(propertyToUse);

        if (storedMetrics && propertyToUse) {
            const metricsMap = JSON.parse(storedMetrics);
            if (metricsMap[propertyToUse]) {
                setSelectedMetrics(metricsMap[propertyToUse]);
            } else {
                setSelectedMetrics([]);
                setMetricsModalOpen(true);
            }
        } else {
            setSelectedMetrics([]);
            setMetricsModalOpen(true);
        }
    }, []);

    const handleSaveMetrics = (metrics: string[]) => {
        const stored = localStorage.getItem(METRICS_KEY);
        const metricsMap = stored ? JSON.parse(stored) : {};
        metricsMap[selectedProperty] = metrics;
        localStorage.setItem(METRICS_KEY, JSON.stringify(metricsMap));
        setSelectedMetrics(metrics);
    };

    const handleAddProperty = (id: string) => {
        const updated = [...properties, id];
        setProperties(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        const newProperty = id;
        setSelectedProperty(newProperty);
        localStorage.setItem(SELECTED_KEY, newProperty);
        setSelectedMetrics([]);
        setMetricsModalOpen(true);
    };

    const handleSelectProperty = (value: string) => {
        setSelectedProperty(value);
        localStorage.setItem(SELECTED_KEY, value);
        const storedMetrics = localStorage.getItem(METRICS_KEY);
        if (!storedMetrics) {
            setSelectedMetrics([]);
            setMetricsModalOpen(true);
            return;
        }
        const metricsMap = JSON.parse(storedMetrics);
        if (metricsMap[value]) {
            setSelectedMetrics(metricsMap[value]);
        } else {
            setSelectedMetrics([]);
            setMetricsModalOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F5F0]">
            <Navbar />
            <main className="pt-24 px-6 pb-16 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl text-[#1A1814] mb-1" style={{ fontFamily: "var(--font-display)" }}>
                            Dashboard
                        </h1>
                        <p className="text-sm text-[#8C8578]">Monitor your Google Analytics metrics</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {properties.length > 0 && (
                            <Select
                                value={selectedProperty}
                                onChange={(e) => handleSelectProperty(e.target.value)}
                                options={properties.map((p) => ({ value: p, label: p }))}
                            />
                        )}
                        <Button variant="outline" onClick={() => setModalOpen(true)}>+ Add Property</Button>
                        <Button variant="ghost" onClick={() => setMetricsModalOpen(true)}>Customize Metrics</Button>
                    </div>
                </div>

                {selectedProperty && selectedMetrics.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                            {selectedMetrics.map((metric) => (
                                <MetricCard key={metric} title={METRIC_LABELS[metric] || metric} value="—" />
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AnalyticsChart title="Traffic Overview" />
                            <AnalyticsChart title="User Engagement" />
                        </div>
                    </>
                )}

                {!selectedProperty && (
                    <p className="text-sm text-[#8C8578]">Add a Google Analytics property to start viewing metrics.</p>
                )}
            </main>

            <GAKeyModal isOpen={modalOpen} onCloseAction={() => setModalOpen(false)} onSubmitAction={handleAddProperty} blurBackground />
            <MetricsModal isOpen={metricsModalOpen} onCloseAction={() => setMetricsModalOpen(false)} onSaveAction={handleSaveMetrics} />
        </div>
    );
}