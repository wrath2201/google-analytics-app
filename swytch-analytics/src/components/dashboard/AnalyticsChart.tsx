"use client";

import React from "react";
import ReactECharts from "echarts-for-react";

type AnalyticsChartProps = {
    title?: string;
    data?: { name: string; value: number }[];
};

export default function AnalyticsChart({ title, data = [] }: AnalyticsChartProps) {

    const option = {
        tooltip: {
            trigger: "axis"
        },

        xAxis: {
            type: "category",
            data: data.map((d) => d.name),
            axisLine: { lineStyle: { color: "#8C8578" } }
        },

        yAxis: {
            type: "value",
            axisLine: { lineStyle: { color: "#8C8578" } }
        },

        series: [
            {
                data: data.map((d) => d.value),
                type: "line",
                smooth: true,
                lineStyle: {
                    color: "#1B3A6B",
                    width: 3
                },
                areaStyle: {
                    color: "rgba(27,58,107,0.15)"
                }
            }
        ]
    };

    return (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 card-hover">

            {title && (
                <h3 className="text-sm font-semibold text-[#1A1814] mb-4">
                    {title}
                </h3>
            )}

            <ReactECharts option={option} style={{ height: "300px" }} />

        </div>
    );
}