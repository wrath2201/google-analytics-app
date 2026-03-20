"use client";

import ReactECharts from "echarts-for-react";

interface ChartProps {
    data: any;
}

export default function EventChart({ data }: ChartProps) {

    const formattedData =
        data?.labels?.map((label: string, i: number) => ({
            name: label,
            value: data.values[i]
        })) || [];

    const isEmpty = formattedData.length === 0;

    // Filter out common automatic events if desired, or just show top 5
    const topData = [...formattedData]
        .sort((a, b) => b.value - a.value)
        .filter(item => item.name !== 'page_view' && item.name !== 'session_start' && item.name !== 'user_engagement')
        .slice(0, 5)
        .reverse();
    
    // If filtering removed everything, just show whatever was there
    const finalData = topData.length > 0 ? topData : [...formattedData].sort((a, b) => b.value - a.value).slice(0, 5).reverse();

    const yAxisData = isEmpty ? ['No Data'] : finalData.map(item => item.name);
    const seriesData = isEmpty ? [0] : finalData.map(item => item.value);

    const truncate = (str: string) =>
        str.length > 20 ? str.substring(0, 17) + "..." : str;

    const option = {
        title: {
            text: isEmpty ? 'No Data' : 'Top Customer Actions',
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
                name: 'Events',
                type: 'bar',
                data: seriesData,
                itemStyle: {
                    color: '#8b5cf6', // Purple color
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
