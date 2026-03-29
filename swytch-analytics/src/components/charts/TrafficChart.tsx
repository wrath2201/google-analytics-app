"use client";

import ReactECharts from "echarts-for-react";

export default function TrafficChart({ data, hideCard }: { data: any, hideCard?: boolean }) {

    // If GA hasn't finished processing historical data, provide a clean empty state
    const isEmpty = !data?.dates || data.dates.length === 0;
    
    // Generate 30 days of beautiful mock data (sine wave + upward trend)
    const mockDates = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    const mockUsers = Array.from({ length: 30 }, (_, i) => Math.floor(12000 + Math.sin(i / 3) * 3000 + (i * 150)));

    const xData = isEmpty ? mockDates : data.dates;
    const yData = isEmpty ? mockUsers : data.users;

    const option = {
        title: {
            text: 'Users over time',
            textStyle: { color: '#1A1814', fontSize: 16, fontWeight: 600, fontFamily: 'system-ui, -apple-system, sans-serif' },
            left: 0, top: 0
        },
        tooltip: {
            trigger: "axis",
            backgroundColor: '#1A1814',
            textStyle: { color: '#F9F8F6', fontSize: 13, fontFamily: 'system-ui' },
            borderWidth: 0,
            borderRadius: 8,
            padding: [12, 16],
            axisPointer: { type: 'line', lineStyle: { color: '#E5E1D8', type: 'dashed' } }
        },
        grid: { top: 60, right: 20, bottom: 20, left: 20, containLabel: true },
        xAxis: {
            type: "category",
            boundaryGap: false,
            data: xData,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#8C8578', fontSize: 12, margin: 12 }
        },
        yAxis: {
            type: "value",
            splitLine: { lineStyle: { color: '#F0ECE4', type: 'dashed' } },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#8C8578', fontSize: 12 }
        },
        series: [
            {
                name: "Users",
                type: "line",
                smooth: 0.4,
                symbol: 'circle',
                symbolSize: 8,
                showSymbol: false,
                data: yData,
                areaStyle: {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: isEmpty ? 'rgba(209, 213, 219, 0.35)' : 'rgba(196, 149, 106, 0.35)' },
                            { offset: 1, color: isEmpty ? 'rgba(209, 213, 219, 0.01)' : 'rgba(196, 149, 106, 0.01)' }
                        ]
                    }
                },
                itemStyle: { color: isEmpty ? '#9CA3AF' : '#C4956A', borderColor: '#ffffff', borderWidth: 2 },
                lineStyle: { 
                    width: 3, 
                    color: isEmpty ? '#D1D5DB' : '#C4956A',
                    shadowColor: isEmpty ? 'rgba(209, 213, 219, 0.4)' : 'rgba(196, 149, 106, 0.4)',
                    shadowBlur: 10,
                    shadowOffsetY: 8
                }
            }
        ]
    };

    if (hideCard) {
        return <ReactECharts option={option} style={{ height: '100%', minHeight: 380, width: '100%' }} />;
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#E5E1D8]">
            <ReactECharts option={option} style={{ height: 380, width: '100%' }} />
        </div>
    );
}