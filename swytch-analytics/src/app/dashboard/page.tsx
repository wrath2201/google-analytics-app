"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import GAKeyModal from "@/components/dashboard/GAKeyModal";
import BusinessSetupModal, { BusinessSetupData } from "@/components/dashboard/BusinessSetupModal";
import MetricCard from "@/components/dashboard/MetricCard";
import TrafficChart from "@/components/charts/TrafficChart";
import SourceChart from "@/components/charts/SourceChart";
import DeviceChart from "@/components/charts/DeviceChart";
import PageChart from "@/components/charts/PageChart";
import LocationChart from "@/components/charts/LocationChart";
import HourlyChart from "@/components/charts/HourlyChart";
import EventChart from "@/components/charts/EventChart";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import MetricsModal from "@/components/dashboard/MetricsModal";

const STORAGE_KEY = "ga_properties";
const SELECTED_KEY = "ga_selected_property";
const METRICS_KEY = "dashboard_metrics";
const BUSINESS_SETUP_KEY = "business_setup";

const METRIC_LABELS: Record<string, string> = {
    users: "Users",
    sessions: "Sessions",
    pageViews: "Page Views",
    bounceRate: "Bounce Rate",
    avgSessionDuration: "Avg Session Duration",
    newUsers: "New Users",
};

export default function DashboardPage() {

    const [properties, setProperties] = useState<Array<{ propertyId: string, displayName: string }>>([]);
    const [selectedProperty, setSelectedProperty] = useState<string>("");

    // Modals
    const [setupModalOpen, setSetupModalOpen] = useState(false);
    const [gaModalOpen, setGaModalOpen] = useState(false);
    const [metricsModalOpen, setMetricsModalOpen] = useState(false);

    const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

    const [metricsData, setMetricsData] = useState<Record<string, number>>({});
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    const [chartData, setChartData] = useState({
        dates: [],
        users: []
    });
    const [sourcesData, setSourcesData] = useState<any>({});
    const [devicesData, setDevicesData] = useState<any>({});
    const [pagesData, setPagesData] = useState<any>({});
    const [eventsData, setEventsData] = useState<any>({});
    const [locationsData, setLocationsData] = useState<any>({});
    const [hourlyData, setHourlyData] = useState<any>({});

    useEffect(() => {

        const storedSetup = localStorage.getItem(BUSINESS_SETUP_KEY);
        const storedSelected = localStorage.getItem(SELECTED_KEY);
        const storedMetrics = localStorage.getItem(METRICS_KEY);

        if (!storedSetup) {
            setSetupModalOpen(true);
            return;
        }

        const fetchAllProperties = async () => {
            try {
                const res = await fetch("http://localhost:4000/api/ga/properties", { credentials: "include" });
                if (res.status === 401) {
                    window.location.href = "/login";
                    return;
                }
                const data = await res.json();
                if (data.properties && data.properties.length > 0) {
                    setProperties(data.properties);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.properties));

                    let propertyToUse = storedSelected;
                    // Ensure the selected property actually exists in the fetched list
                    if (!propertyToUse || !data.properties.find((p: any) => p.propertyId === propertyToUse)) {
                        propertyToUse = data.properties[0].propertyId;
                    }
                    
                    const finalPropertyId = propertyToUse as string;
                    
                    setSelectedProperty(finalPropertyId);
                    localStorage.setItem(SELECTED_KEY, finalPropertyId);

                    fetchAnalytics(finalPropertyId);
                    fetchChartData(finalPropertyId);

                    if (storedMetrics && finalPropertyId) {
                        const metricsMap = JSON.parse(storedMetrics);
                        if (metricsMap[finalPropertyId]) {
                            setSelectedMetrics(metricsMap[finalPropertyId]);
                        }
                    }
                } else {
                    // No properties associated with the Google Account
                    setGaModalOpen(true);
                }
            } catch (err) {
                console.error("Failed to load properties automatically", err);
            }
        };

        fetchAllProperties();

    }, []);

    const fetchAnalytics = async (propertyId: string) => {

        try {

            setLoadingAnalytics(true);

            const cleanId = propertyId.replace("properties/", "");

            const res = await fetch(
                `http://localhost:4000/api/ga/report/${cleanId}`,
                { credentials: "include" }
            );

            if (res.status === 401) {
                window.location.href = "/login";
                return;
            }

            const data = await res.json();

            setMetricsData({
                users: Number(data.users || 0),
                sessions: Number(data.sessions || 0),
                pageViews: Number(data.pageViews || 0),
                bounceRate: Number(data.bounceRate || 0),
                avgSessionDuration: parseFloat(Number(data.avgSessionDuration || 0).toFixed(2)),
                newUsers: Number(data.newUsers || 0)
            });

        } catch (err) {

            console.error("Failed to load analytics", err);

        } finally {

            setLoadingAnalytics(false);

        }

    };

    const fetchChartData = async (propertyId: string) => {

        try {

            const cleanId = propertyId.replace("properties/", "");

            const [trafficRes, sourcesRes, devicesRes, pagesRes, eventsRes, locationsRes, hourlyRes] = await Promise.all([
                fetch(`http://localhost:4000/api/ga/timeseries/${cleanId}`, { credentials: "include" }),
                fetch(`http://localhost:4000/api/ga/sources/${cleanId}`, { credentials: "include" }),
                fetch(`http://localhost:4000/api/ga/devices/${cleanId}`, { credentials: "include" }),
                fetch(`http://localhost:4000/api/ga/pages/${cleanId}`, { credentials: "include" }),
                fetch(`http://localhost:4000/api/ga/events/${cleanId}`, { credentials: "include" }),
                fetch(`http://localhost:4000/api/ga/locations/${cleanId}`, { credentials: "include" }),
                fetch(`http://localhost:4000/api/ga/hourly/${cleanId}`, { credentials: "include" })
            ]);

            if (trafficRes.status === 401) {
                window.location.href = "/login";
                return;
            }

            const [trafficData, sources, devices, pages, events, locations, hourly] = await Promise.all([
                trafficRes.json(),
                sourcesRes.json(),
                devicesRes.json(),
                pagesRes.json(),
                eventsRes.json(),
                locationsRes.json(),
                hourlyRes.json()
            ]);

            setChartData(trafficData);
            setSourcesData(sources);
            setDevicesData(devices);
            setPagesData(pages);
            setEventsData(events);
            setLocationsData(locations);
            setHourlyData(hourly);

        } catch (err) {

            console.error("Failed to fetch chart data", err);

        }

    };

    const handleBusinessSetupSubmit = (data: BusinessSetupData) => {
        localStorage.setItem(BUSINESS_SETUP_KEY, JSON.stringify(data));
        setSetupModalOpen(false);
        setGaModalOpen(true); // Move seamlessly to next step
    };

    // Auto-select metrics based on Primary Goal
    const determineMetricsForGoal = (goal: string): string[] => {
        if (goal === "Online orders") {
            return ["users", "sessions", "pageViews"];
        }
        return ["users", "sessions", "bounceRate", "pageViews"];
    };

    const handleSaveMetrics = (metrics: string[]) => {

        const stored = localStorage.getItem(METRICS_KEY);
        const metricsMap = stored ? JSON.parse(stored) : {};

        metricsMap[selectedProperty] = metrics;

        localStorage.setItem(METRICS_KEY, JSON.stringify(metricsMap));

        setSelectedMetrics(metrics);

    };

    const handleAddProperty = (property: { propertyId: string, displayName: string }) => {

        // check if already exists
        if (properties.find(p => p.propertyId === property.propertyId)) {
            setGaModalOpen(false);
            return;
        }

        const updated = [...properties, property];

        setProperties(updated);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        setSelectedProperty(property.propertyId);
        localStorage.setItem(SELECTED_KEY, property.propertyId);

        fetchAnalytics(property.propertyId);
        fetchChartData(property.propertyId);

        // Retrieve business setup to auto configure the dashboard
        const storedSetupStr = localStorage.getItem(BUSINESS_SETUP_KEY);
        if (storedSetupStr) {
            try {
                const setup = JSON.parse(storedSetupStr);
                const optimalMetrics = determineMetricsForGoal(setup.primaryGoal);

                // Save these auto-selected metrics to storage for this property immediately
                const storedMetricsStr = localStorage.getItem(METRICS_KEY);
                const metricsMap = storedMetricsStr ? JSON.parse(storedMetricsStr) : {};
                metricsMap[property.propertyId] = optimalMetrics;
                localStorage.setItem(METRICS_KEY, JSON.stringify(metricsMap));

                setSelectedMetrics(optimalMetrics);
            } catch (e) {
                console.error("Failed to parse business setup info.");
                setSelectedMetrics(["users", "sessions", "pageViews", "bounceRate"]); // basic fallback
            }
        } else {
            setSelectedMetrics(["users", "sessions", "pageViews", "bounceRate"]); // fallback
        }

    };

    const handleSelectProperty = (value: string) => {

        setSelectedProperty(value);

        localStorage.setItem(SELECTED_KEY, value);

        fetchAnalytics(value);
        fetchChartData(value);

        const storedMetrics = localStorage.getItem(METRICS_KEY);

        if (storedMetrics) {
            const metricsMap = JSON.parse(storedMetrics);
            if (metricsMap[value]) {
                setSelectedMetrics(metricsMap[value]);
            }
        }
    };

    return (

        <div className="min-h-screen bg-[#F7F5F0]">

            <Navbar />

            <main className="pt-24 px-6 pb-16 max-w-7xl mx-auto">

                <div className="flex items-center justify-between mb-8">

                    <div>
                        <h1 className="text-3xl text-[#1A1814] mb-1">
                            Dashboard
                        </h1>
                        <p className="text-sm text-[#8C8578]">
                            Monitor your Google Analytics metrics
                        </p>
                    </div>

                    <div className="flex items-center gap-3">

                        {properties.length > 0 && (
                            <Select
                                value={selectedProperty}
                                onChange={(e) => handleSelectProperty(e.target.value)}
                                options={properties.map((p) => ({
                                    value: p.propertyId,
                                    label: p.displayName || p.propertyId
                                }))}
                            />
                        )}

                        <Button variant="outline" onClick={() => setGaModalOpen(true)}>
                            + Add Property
                        </Button>
                        <Button variant="ghost" onClick={() => setMetricsModalOpen(true)}>
                            Customize Metrics
                        </Button>

                    </div>

                </div>

                {selectedProperty && (

                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

                            <MetricCard
                                title="Visitors This Week"
                                value={loadingAnalytics ? "..." : (metricsData.users ?? "—")}
                            />
                            <MetricCard
                                title="New Visitors"
                                value={loadingAnalytics ? "..." : (metricsData.newUsers ?? "—")}
                            />
                            <MetricCard
                                title="Customer Actions"
                                value={loadingAnalytics ? "..." : (eventsData?.values?.reduce?.((a: number, b: number) => a + b, 0) ?? "—")}
                            />
                            <MetricCard
                                title="Conversion Rate"
                                value={loadingAnalytics ? "..." : (
                                    (metricsData.users && eventsData?.values?.length > 0)
                                        ? ((eventsData.values.reduce((a: number, b: number) => a + b, 0) / metricsData.users) * 100).toFixed(2) + "%"
                                        : "0%"
                                )}
                            />

                        </div>

                        {selectedMetrics.length > 0 && (
                            <div className="mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                    {selectedMetrics.map((metric) => {
                                        let val: any = metricsData[metric as keyof typeof metricsData] ?? "—";
                                        if (metric === "bounceRate" && typeof val === "number") {
                                            val = (val * 100).toFixed(2) + "%";
                                        } else if (metric === "avgSessionDuration" && typeof val === "number") {
                                            const mins = Math.floor(val / 60);
                                            const secs = Math.floor(val % 60);
                                            val = `${mins}m ${secs}s`;
                                        }
                                        return (
                                            <MetricCard
                                                key={metric}
                                                title={METRIC_LABELS[metric] || metric}
                                                value={loadingAnalytics ? "..." : val}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="mb-8">
                            <InsightsPanel metrics={metricsData} sources={sourcesData} devices={devicesData} hourly={hourlyData} />
                        </div>

                        <div className="grid grid-cols-1 gap-6">

                            <TrafficChart data={chartData} />

                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            <SourceChart data={sourcesData} />
                            <DeviceChart data={devicesData} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            <PageChart data={pagesData} />
                            <EventChart data={eventsData} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            <LocationChart data={locationsData} />
                            <HourlyChart data={hourlyData} />
                        </div>
                    </>

                )}

                {!selectedProperty && (
                    <p className="text-sm text-[#8C8578]">
                        Add a Google Analytics property to start viewing metrics.
                    </p>
                )}

            </main>

            <BusinessSetupModal
                isOpen={setupModalOpen}
                onCloseAction={() => setSetupModalOpen(false)}
                onSubmitAction={handleBusinessSetupSubmit}
                blurBackground
            />

            <GAKeyModal
                isOpen={gaModalOpen}
                onCloseAction={() => setGaModalOpen(false)}
                onSubmitAction={handleAddProperty}
                blurBackground
            />

            <MetricsModal
                isOpen={metricsModalOpen}
                onCloseAction={() => setMetricsModalOpen(false)}
                onSaveAction={handleSaveMetrics}
            />

        </div>

    );
}