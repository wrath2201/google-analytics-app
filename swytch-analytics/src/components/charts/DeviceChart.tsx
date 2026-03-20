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

    const option = {
        title: {
            text: isEmpty ? 'No Data' : 'Device Categories',
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
                name: 'Users',
                type: 'pie',
                radius: '70%',
                data: isEmpty
                    ? [{ value: 0, name: 'No Data' }]
                    : formattedData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                itemStyle: {
                    borderRadius: 5,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    color: '#8C8578'
                }
            }
        ]
    };

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E5E1D8]">
            <ReactECharts option={option} style={{ height: 350, width: '100%' }} />
        </div>
    );
}