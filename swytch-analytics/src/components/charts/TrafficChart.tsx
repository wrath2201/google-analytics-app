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
            textStyle: {
                color: '#8C8578',
                fontSize: 14,
                fontWeight: 'normal'
            },
            left: 'center',
            top: 10
        },
        tooltip: {
            trigger: "axis"
        },
        xAxis: {
            type: "category",
            data: xData,
            axisLine: { lineStyle: { color: '#E5E1D8' } },
            axisLabel: { color: '#8C8578' }
        },
        yAxis: {
            type: "value",
            splitLine: { lineStyle: { color: '#F0EBE1', type: 'dashed' } },
            axisLabel: { color: '#8C8578' }
        },
        series: [
            {
                name: "Users",
                type: "line",
                smooth: true,
                data: yData,
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(59, 130, 246, 0.2)' // Light blue
                        }, {
                            offset: 1, color: 'rgba(59, 130, 246, 0)'
                        }]
                    }
                },
                itemStyle: { color: '#3b82f6' },
                lineStyle: { width: 3 }
            }
        ]
    };

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E5E1D8]">
            <ReactECharts option={option} style={{ height: 350, width: '100%' }} />
        </div>
    );
}