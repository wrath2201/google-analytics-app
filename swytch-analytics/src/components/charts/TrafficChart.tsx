"use client";

import ReactECharts from "echarts-for-react";

export default function TrafficChart({ data }: any) {

    // If GA hasn't finished processing historical data, provide a clean empty state
    const isEmpty = !data?.dates || data.dates.length === 0;
    
    const xData = isEmpty ? ['2 Days Ago', 'Yesterday', 'Today'] : data.dates;
    const yData = isEmpty ? [0, 0, 0] : data.users;

    const option = {
        title: {
            text: isEmpty ? 'Processing Traffic Data...' : 'Users over time',
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
                            { offset: 0, color: 'rgba(56, 100, 255, 0.25)' },
                            { offset: 1, color: 'rgba(56, 100, 255, 0.01)' }
                        ]
                    }
                },
                itemStyle: { color: '#3864FF', borderColor: '#ffffff', borderWidth: 2 },
                lineStyle: { 
                    width: 3, 
                    color: '#3864FF',
                    shadowColor: 'rgba(56, 100, 255, 0.4)',
                    shadowBlur: 10,
                    shadowOffsetY: 8
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