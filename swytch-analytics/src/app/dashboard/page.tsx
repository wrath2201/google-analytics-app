"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import GAKeyModal from "@/components/dashboard/GAKeyModal";
import MetricCard from "@/components/dashboard/MetricCard";
import TrafficChart from "@/components/charts/TrafficChart";
import SourceChart from "@/components/charts/SourceChart";
import DeviceChart from "@/components/charts/DeviceChart";
import PageChart from "@/components/charts/PageChart";
import LocationChart from "@/components/charts/LocationChart";
import HourlyChart from "@/components/charts/HourlyChart";
import EventChart from "@/components/charts/EventChart";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import MetricsModal from "@/components/dashboard/MetricsModal";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const STORAGE_KEY = "ga_properties";
const SELECTED_KEY = "ga_selected_property";
const METRICS_KEY = "dashboard_metrics";

const METRIC_LABELS: Record<string, string> = {
    users: "Visitors This Week",
    sessions: "Sessions",
    pageViews: "Page Views",
    bounceRate: "Bounce Rate",
    avgSessionDuration: "Avg Session Duration",
    newUsers: "New Visitors",
    customerActions: "Customer Actions",
    conversionRate: "Conversion Rate"
};

const METRIC_ACCENTS: Record<string, "navy" | "warm" | "green" | "default"> = {
    users: "navy",
    sessions: "navy",
    pageViews: "warm",
    bounceRate: "warm",
    avgSessionDuration: "warm",
    newUsers: "green",
    customerActions: "green",
    conversionRate: "green"
};

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

export default function DashboardPage() {
    const { user } = useAuth();
    const firstName = user?.displayName?.split(" ")[0] || "there";

    const [properties, setProperties] = useState<Array<{ propertyId: string, displayName: string }>>([]);
    const [selectedProperty, setSelectedProperty] = useState<string>("");

    // Modals
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
    const [intelligenceData, setIntelligenceData] = useState<{ insights: string[], alerts: string[] }>({ insights: [], alerts: [] });

    useEffect(() => {

        // ── Auto-verify Stripe Checkout Success without Webhooks ──
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        if (sessionId) {
            fetch("/api/stripe/verify-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ sessionId })
            }).then(() => {
                // Strip the session ID from URL and reload natively to unlock UI
                window.history.replaceState({}, document.title, window.location.pathname);
                window.location.reload();
            }).catch(console.error);
            return;
        }

        // ── Clean up OAuth success redirect ──────────────────────
        const oauthConnected = urlParams.get('connected');
        if (oauthConnected === 'true') {
            // Strip ?connected=true from URL without reload
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const storedSelected = localStorage.getItem(SELECTED_KEY);
        const storedMetrics = localStorage.getItem(METRICS_KEY);

        const fetchAllProperties = async () => {
            try {
                const res = await fetch("/api/ga/properties", { credentials: "include" });
                if (res.status === 401) {
                    setProperties([]);
                    setGaModalOpen(true);
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
                `/api/ga/report/${cleanId}`,
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

            const [trafficRes, sourcesRes, devicesRes, pagesRes, eventsRes, locationsRes, hourlyRes, insightsRes] = await Promise.all([
                fetch(`/api/ga/timeseries/${cleanId}`, { credentials: "include" }),
                fetch(`/api/ga/sources/${cleanId}`, { credentials: "include" }),
                fetch(`/api/ga/devices/${cleanId}`, { credentials: "include" }),
                fetch(`/api/ga/pages/${cleanId}`, { credentials: "include" }),
                fetch(`/api/ga/events/${cleanId}`, { credentials: "include" }),
                fetch(`/api/ga/locations/${cleanId}`, { credentials: "include" }),
                fetch(`/api/ga/hourly/${cleanId}`, { credentials: "include" }),
                fetch(`/api/ga/insights/${cleanId}`, { credentials: "include" })
            ]);

            if (trafficRes.status === 401) {
                window.location.href = "/login";
                return;
            }

            const [trafficData, sources, devices, pages, events, locations, hourly, intelligence] = await Promise.all([
                trafficRes.json(),
                sourcesRes.json(),
                devicesRes.json(),
                pagesRes.json(),
                eventsRes.json(),
                locationsRes.json(),
                hourlyRes.json(),
                insightsRes.json()
            ]);

            setChartData(trafficData);
            setSourcesData(sources);
            setDevicesData(devices);
            setPagesData(pages);
            setEventsData(events);
            setLocationsData(locations);
            setHourlyData(hourly);
            setIntelligenceData(intelligence);

        } catch (err) {

            console.error("Failed to fetch chart data", err);

        }

    };

    // Auto-select standard metrics for new properties
    const defaultMetrics = ["users", "newUsers", "customerActions", "conversionRate", "sessions", "bounceRate", "pageViews"];

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

        // Auto configure the default structural dashboard metrics
        const optimalMetrics = defaultMetrics;
        const storedMetricsStr = localStorage.getItem(METRICS_KEY);
        const metricsMap = storedMetricsStr ? JSON.parse(storedMetricsStr) : {};
        metricsMap[property.propertyId] = optimalMetrics;
        localStorage.setItem(METRICS_KEY, JSON.stringify(metricsMap));

        setSelectedMetrics(optimalMetrics);

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
                        <p className="text-xs font-medium text-[#8C8578] uppercase tracking-widest mb-1">Dashboard</p>
                        <h1 className="text-3xl text-[#1A1814] mb-1" style={{ fontFamily: "var(--font-display)" }}>
                            {getGreeting()}, {firstName} 👋
                        </h1>
                        <div className="flex items-center gap-3">
                            <p className="text-sm text-[#8C8578]">
                                Here&apos;s what&apos;s happening with your analytics
                            </p>
                            <span className="text-xs text-[#B0A99E]">
                                · Last synced {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                        </div>
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
                        {/* Top Row: Metric Cards */}
                        {selectedMetrics.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                {selectedMetrics.map((metric) => {
                                    let val: any = "—";
                                    // Calculate values exactly as before
                                    if (metric === "customerActions") {
                                        val = eventsData?.values?.reduce?.((a: number, b: number) => a + b, 0) ?? "—";
                                    } else if (metric === "conversionRate") {
                                        val = (metricsData.users && eventsData?.values?.length > 0)
                                            ? ((eventsData.values.reduce((a: number, b: number) => a + b, 0) / metricsData.users) * 100).toFixed(2) + "%"
                                            : "0%";
                                    } else {
                                        val = metricsData[metric as keyof typeof metricsData] ?? "—";
                                        if (metric === "bounceRate" && typeof val === "number") {
                                            val = (val * 100).toFixed(2) + "%";
                                        } else if (metric === "avgSessionDuration" && typeof val === "number") {
                                            const mins = Math.floor(val / 60);
                                            const secs = Math.floor(val % 60);
                                            val = `${mins}m ${secs}s`;
                                        }
                                    }
                                    
                                    const ICONS: Record<string, React.ReactNode> = {
                                        users: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
                                        newUsers: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
                                        sessions: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
                                        views: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zM5 12V3L17 0v13M5 12c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2z" /></svg>
                                    };

                                    return (
                                        <MetricCard
                                            key={metric}
                                            title={METRIC_LABELS[metric] || metric}
                                            value={loadingAnalytics ? "..." : val}
                                            icon={ICONS[metric] || <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                                            accent={METRIC_ACCENTS[metric] || "default"}
                                        />
                                    );
                                })}
                            </div>
                        )}

                        {/* Middle Row: Left = Traffic chart (Revenue equivalent), Right = Source chart (Customer donut equivalent) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            <div className="lg:col-span-2">
                                <TrafficChart data={chartData} />
                            </div>
                            <div className="lg:col-span-1">
                                <SourceChart data={sourcesData} />
                            </div>
                        </div>

                        {/* Third Row: Top Pages (Trending items equivalent) & Insights List (Recent reviews equivalent) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            <div className="lg:col-span-2">
                                <PageChart data={pagesData} />
                            </div>
                            <div className="lg:col-span-1 border border-[#E5E1D8] bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col p-6">
                                <h2 className="text-lg font-bold text-[#1A1814] mb-4">Executive Intelligence</h2>
                                <div className="h-full">
                                    <InsightsPanel data={intelligenceData} hideCard={true} />
                                </div>
                            </div>
                        </div>

                        {/* Lower Rows: Hourly, Location, Device in 3-col grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            <HourlyChart data={hourlyData} />
                            <LocationChart data={locationsData} />
                            <DeviceChart data={devicesData} />
                        </div>
                        
                        <div className="mb-8 border border-[#E5E1D8] bg-white rounded-2xl shadow-sm overflow-hidden">
                            <EventChart data={eventsData} />
                        </div>
                    </>

                )}

                {!selectedProperty && (
                    <div className="relative mt-8">
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-2xl">
                            <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center border border-[#E5E0D8] max-w-sm text-center">
                                <div className="w-12 h-12 bg-blue-50 text-[#1B3A6B] rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-[#1A1814] mb-2">No Property Selected</h3>
                                <p className="text-sm text-[#8C8578] mb-6">Connect a Google Analytics property to instantly auto-generate your interactive dashboard and AI intelligence reports.</p>
                                <Button onClick={() => setGaModalOpen(true)}>
                                    + Connect Analytics Property
                                </Button>
                            </div>
                        </div>
                        <div className="select-none pointer-events-none">
                            <DashboardSkeleton />
                        </div>
                    </div>
                )}

            </main>

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
                currentSelection={selectedMetrics}
            />

        </div>

    );
}