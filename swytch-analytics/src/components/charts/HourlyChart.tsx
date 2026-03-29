"use client";

import ReactECharts from "echarts-for-react";
import UpgradeOverlay from "../ui/UpgradeOverlay";

interface ChartProps {
    data: any;
}

export default function HourlyChart({ data }: ChartProps) {

    if (data?.locked) {
        return (
            <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-[#E5E1D8] min-h-[350px] overflow-hidden">
                <UpgradeOverlay />
            </div>
        );
    }

    // Usually GA hour comes as "00" through "23" string
    const formattedData =
        data?.labels?.map((label: string, i: number) => ({
            name: `${label}:00`,
            value: data.values[i]
        })) || [];

    const isEmpty = formattedData.length === 0;

    // Generate 24-hour bell curve peaking at 14:00
    const mockHours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    const mockVisits = Array.from({ length: 24 }, (_, i) => {
        const peakHour = 14; const width = 4; const base = 50; const peak = 800;
        return Math.floor(base + peak * Math.exp(-Math.pow(i - peakHour, 2) / (2 * Math.pow(width, 2))));
    });

    // Sort by hour to ensure correct chronological order
    const sortedData = [...formattedData].sort((a: any, b: any) => {
        const hourA = parseInt(a.name);
        const hourB = parseInt(b.name);
        return hourA - hourB;
    });

    const xAxisData = isEmpty ? mockHours : sortedData.map(item => item.name);
    const seriesData = isEmpty ? mockVisits : sortedData.map(item => item.value);

    const option = {
        title: {
            text: 'Peak Visit Time (Hourly)',
            textStyle: { color: '#1A1814', fontSize: 16, fontWeight: 600, fontFamily: 'system-ui, -apple-system, sans-serif' },
            left: 0, top: 0
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: '#1A1814',
            textStyle: { color: '#F9F8F6', fontSize: 13, fontFamily: 'system-ui' },
            borderWidth: 0,
            borderRadius: 8,
            padding: [12, 16]
        },
        grid: { left: '2%', right: '4%', bottom: '5%', top: 60, containLabel: true },
        xAxis: {
            type: 'category',
            data: xAxisData,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#8C8578', margin: 12, interval: 3, fontSize: 12 }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#F5F2EC', type: 'dashed' } },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#8C8578', fontSize: 12 }
        },
        series: [
            {
                name: 'Sessions',
                type: 'bar',
                data: seriesData,
                itemStyle: {
                    color: isEmpty ? '#D1D5DB' : '#1B3A6B',
                    borderRadius: [6, 6, 0, 0]
                },
                barWidth: '50%',
            }
        ]
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#E5E1D8]">
            <ReactECharts option={option} style={{ height: 380, width: '100%' }} />
        </div>
    );
}
