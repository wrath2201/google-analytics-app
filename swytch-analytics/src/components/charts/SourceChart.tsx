"use client";

import ReactECharts from "echarts-for-react";

interface ChartProps {
    data: any; // accept backend format
}

export default function SourceChart({ data }: ChartProps) {

    // 🔥 Convert backend → chart format
    const formattedData =
        data?.labels?.map((label: string, i: number) => ({
            name: label,
            value: data.values[i]
        })) || [];

    const isEmpty = formattedData.length === 0;

    const mockData = [
        { name: 'Direct', value: 4500 },
        { name: 'Organic', value: 3000 },
        { name: 'Social', value: 1500 },
        { name: 'Referral', value: 1000 }
    ];

    const option = {
        color: isEmpty ? ['#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280'] : ['#1B3A6B', '#C4956A', '#D4C5B0', '#E5E0D8'],
        title: {
            text: 'Traffic Sources',
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
                name: 'Sessions',
                type: 'pie',
                radius: ['55%', '85%'],
                center: ['50%', '45%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 6,
                    borderColor: '#ffffff',
                    borderWidth: 3
                },
                label: { show: false, position: 'center' },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 22,
                        fontWeight: 'bold',
                        color: '#1A1814'
                    },
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.15)'
                    }
                },
                labelLine: { show: false },
                data: isEmpty
                    ? mockData
                    : formattedData
            }
        ]
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#E5E1D8]">
            <ReactECharts option={option} style={{ height: 380, width: '100%' }} />
        </div>
    );
}