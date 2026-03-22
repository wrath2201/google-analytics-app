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

    const option = {
        title: {
            text: isEmpty ? 'No Data' : 'Traffic Sources',
            textStyle: {
                color: '#8C8578',
                fontSize: 14,
                fontWeight: 'normal'
            },
            left: 'center',
            top: 10
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            bottom: 10,
            left: 'center',
            textStyle: { color: '#8C8578' }
        },
        series: [
            {
                name: 'Sessions',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: { show: false, position: 'center' },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#1A1814'
                    }
                },
                labelLine: { show: false },
                data: isEmpty
                    ? [{ value: 0, name: 'No Data' }]
                    : formattedData
            }
        ]
    };

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E5E1D8]">
            <ReactECharts option={option} style={{ height: 350, width: '100%' }} />
        </div>
    );
}