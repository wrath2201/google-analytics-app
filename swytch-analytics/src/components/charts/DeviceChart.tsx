"use client";

import ReactECharts from "echarts-for-react";

interface ChartProps {
    data: any; // accept raw backend data
}

export default function DeviceChart({ data }: ChartProps) {

    // 🔥 Convert backend format → chart format
    const formattedData =
        data?.labels?.map((label: string, i: number) => ({
            name: label,
            value: data.values[i]
        })) || [];

    const isEmpty = formattedData.length === 0;

    const mockData = [
        { name: 'Mobile', value: 6500 },
        { name: 'Desktop', value: 3000 },
        { name: 'Tablet', value: 500 }
    ];

    const option = {
        color: isEmpty ? ['#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280'] : ['#1B3A6B', '#C4956A', '#D4C5B0', '#E5E0D8'],
        title: {
            text: 'Device Categories',
            textStyle: { color: '#1A1814', fontSize: 16, fontWeight: 600, fontFamily: 'system-ui, -apple-system, sans-serif' },
            left: 0, top: 0
        },
        tooltip: {
            trigger: 'item',
            backgroundColor: '#1A1814',
            textStyle: { color: '#F9F8F6', fontSize: 13, fontFamily: 'system-ui' },
            borderWidth: 0,
            borderRadius: 8,
            padding: [10, 14]
        },
        legend: {
            bottom: 0,
            left: 'center',
            icon: 'circle',
            itemWidth: 8,
            textStyle: { color: '#8C8578', fontSize: 13, padding: [0, 0, 0, -4] },
            itemGap: 24
        },
        series: [
            {
                name: 'Users',
                type: 'pie',
                radius: '75%',
                center: ['50%', '45%'],
                data: isEmpty
                    ? mockData
                    : formattedData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.15)'
                    }
                },
                itemStyle: {
                    borderRadius: 4,
                    borderColor: '#ffffff',
                    borderWidth: 2
                },
                label: {
                    color: '#8C8578',
                    fontFamily: 'system-ui',
                    fontSize: 13
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