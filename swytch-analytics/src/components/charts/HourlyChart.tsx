"use client";

import ReactECharts from "echarts-for-react";

interface ChartProps {
    data: any;
}

export default function HourlyChart({ data }: ChartProps) {

    // Usually GA hour comes as "00" through "23" string
    const formattedData =
        data?.labels?.map((label: string, i: number) => ({
            name: `${label}:00`,
            value: data.values[i]
        })) || [];

    const isEmpty = formattedData.length === 0;

    // Sort by hour to ensure correct chronological order
    const sortedData = [...formattedData].sort((a, b) => {
        const hourA = parseInt(a.name);
        const hourB = parseInt(b.name);
        return hourA - hourB;
    });

    const xAxisData = isEmpty ? ['No Data'] : sortedData.map(item => item.name);
    const seriesData = isEmpty ? [0] : sortedData.map(item => item.value);

    const option = {
        title: {
            text: isEmpty ? 'No Data' : 'Peak Visit Time (Hourly)',
            textStyle: {
                color: '#8C8578',
                fontSize: 14,
                fontWeight: 'normal'
            },
            left: 'center',
            top: 10
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '5%',
            top: 60,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            axisLine: { lineStyle: { color: '#E5E1D8' } },
            axisTick: { show: false },
            axisLabel: { color: '#8C8578', margin: 10, interval: 3 } // show every 3rd hour to avoid crowding
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#F0EBE1', type: 'dashed' } },
            axisLabel: { color: '#8C8578' }
        },
        series: [
            {
                name: 'Sessions',
                type: 'bar',
                data: seriesData,
                itemStyle: {
                    color: '#3b82f6', // Blue color
                    borderRadius: [4, 4, 0, 0]
                },
                barWidth: '60%',
            }
        ]
    };

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E5E1D8]">
            <ReactECharts option={option} style={{ height: 350, width: '100%' }} />
        </div>
    );
}
