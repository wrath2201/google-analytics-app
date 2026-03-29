"use client";

import ReactECharts from "echarts-for-react";
import UpgradeOverlay from "../ui/UpgradeOverlay";

interface ChartProps {
    data: any; // accept raw backend format
}

export default function PageChart({ data }: ChartProps) {

    if (data?.locked) {
        return (
            <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-[#E5E1D8] min-h-[350px] overflow-hidden">
                <UpgradeOverlay />
            </div>
        );
    }

    // 🔥 Convert backend → chart format
    const formattedData =
        data?.labels?.map((label: string, i: number) => ({
            name: label,
            value: data.values[i]
        })) || [];

    const isEmpty = formattedData.length === 0;

    // Reverse for top-to-bottom display
    const yAxisData = isEmpty
        ? ['No Data']
        : [...formattedData].reverse().map(item => item.name);

    const seriesData = isEmpty
        ? [0]
        : [...formattedData].reverse().map(item => item.value);

    // Truncate long paths
    const truncate = (str: string) =>
        str.length > 25 ? str.substring(0, 22) + "..." : str;

    const option = {
        title: {
            text: isEmpty ? 'No Data' : 'Most Popular Pages',
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
                name: 'Page Views',
                type: 'bar',
                data: seriesData,
                itemStyle: {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
                        colorStops: [
                            { offset: 0, color: '#F59E0B' },
                            { offset: 1, color: '#FCD34D' }
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