"use client";

import ReactECharts from "echarts-for-react";

interface ChartProps {
    data: any; // accept raw backend format
}

export default function PageChart({ data }: ChartProps) {

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
            bottom: '3%',
            top: 60,
            containLabel: true
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01],
            splitLine: { lineStyle: { color: '#F0EBE1', type: 'dashed' } },
            axisLabel: { show: false }
        },
        yAxis: {
            type: 'category',
            data: yAxisData.map(truncate),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#1A1814', fontWeight: 500, margin: 15 }
        },
        series: [
            {
                name: 'Page Views',
                type: 'bar',
                data: seriesData,
                itemStyle: {
                    color: '#f59e0b',
                    borderRadius: [0, 4, 4, 0]
                },
                barWidth: '50%',
                label: {
                    show: true,
                    position: 'right',
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