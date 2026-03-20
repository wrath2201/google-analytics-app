"use client";

import ReactECharts from "echarts-for-react";

interface ChartProps {
    data: any;
}

export default function LocationChart({ data }: ChartProps) {

    const formattedData =
        data?.labels?.map((label: string, i: number) => ({
            name: label,
            value: data.values[i]
        })) || [];

    const isEmpty = formattedData.length === 0;

    // Use top 10 locations to keep it clean
    const topData = [...formattedData].sort((a, b) => b.value - a.value).slice(0, 10).reverse();

    const yAxisData = isEmpty ? ['No Data'] : topData.map(item => item.name);
    const seriesData = isEmpty ? [0] : topData.map(item => item.value);

    const truncate = (str: string) =>
        str.length > 20 ? str.substring(0, 17) + "..." : str;

    const option = {
        title: {
            text: isEmpty ? 'No Data' : 'Visitor Location (Top 10)',
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
                name: 'Sessions',
                type: 'bar',
                data: seriesData,
                itemStyle: {
                    color: '#10b981', // Emerald color
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
