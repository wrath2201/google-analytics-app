"use client";

import ReactECharts from "echarts-for-react";
import UpgradeOverlay from "../ui/UpgradeOverlay";

interface ChartProps {
    data: any;
}

export default function EventChart({ data }: ChartProps) {

    if (data?.locked) {
        return (
            <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-[#E5E1D8] min-h-[350px] overflow-hidden">
                <UpgradeOverlay />
            </div>
        );
    }

    const formattedData =
        data?.labels?.map((label: string, i: number) => ({
            name: label,
            value: data.values[i]
        })) || [];

    const isEmpty = formattedData.length === 0;

    // Filter out common automatic events if desired, or just show top 5
    const topData = [...formattedData]
        .sort((a, b) => b.value - a.value)
        .filter(item => item.name !== 'page_view' && item.name !== 'session_start' && item.name !== 'user_engagement')
        .slice(0, 5)
        .reverse();
    
    // If filtering removed everything, just show whatever was there
    const finalData = topData.length > 0 ? topData : [...formattedData].sort((a, b) => b.value - a.value).slice(0, 5).reverse();

    const yAxisData = isEmpty ? ['No Data'] : finalData.map(item => item.name);
    const seriesData = isEmpty ? [0] : finalData.map(item => item.value);

    const truncate = (str: string) =>
        str.length > 20 ? str.substring(0, 17) + "..." : str;

    const option = {
        title: {
            text: isEmpty ? 'No Data' : 'Top Customer Actions',
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
        grid: { left: '2%', right: '6%', bottom: '2%', top: 60, containLabel: true },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.05],
            splitLine: { lineStyle: { color: '#F5F2EC', type: 'dashed' } },
            axisLabel: { show: false }
        },
        yAxis: {
            type: 'category',
            data: yAxisData.map(truncate),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#8C8578', fontWeight: 500, fontSize: 13, margin: 16 }
        },
        series: [
            {
                name: 'Events',
                type: 'bar',
                data: seriesData,
                itemStyle: {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
                        colorStops: [
                            { offset: 0, color: '#8B5CF6' },
                            { offset: 1, color: '#A78BFA' }
                        ]
                    },
                    borderRadius: [0, 6, 6, 0]
                },
                barWidth: 16,
                label: {
                    show: true,
                    position: 'right',
                    color: '#1A1814',
                    fontFamily: 'system-ui',
                    fontWeight: 600,
                    fontSize: 12,
                    distance: 10
                }
            }
        ]
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#E5E1D8]">
            <ReactECharts option={option} style={{ height: 380, width: '100%' }} />
        </div>
    );
}
