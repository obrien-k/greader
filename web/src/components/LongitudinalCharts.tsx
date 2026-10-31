"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart3, PieChart as PieIcon, Layers, Filter } from "lucide-react";
import { YearlyTrend, QueryCluster, ExecutiveSummary } from "../lib/types";

interface LongitudinalChartsProps {
  yearlyTrends: YearlyTrend[];
  queryClusters: QueryCluster[];
  summary: ExecutiveSummary;
}

export const LongitudinalCharts: React.FC<LongitudinalChartsProps> = ({
  yearlyTrends,
  queryClusters,
  summary,
}) => {
  const [yearFilter, setYearFilter] = useState<"ALL" | "DECADE1" | "DECADE2" | "RECENT">("ALL");

  const filteredYearlyData = useMemo(() => {
    switch (yearFilter) {
      case "DECADE1":
        return yearlyTrends.filter((d) => d.year >= 2007 && d.year <= 2016);
      case "DECADE2":
        return yearlyTrends.filter((d) => d.year >= 2017 && d.year <= 2026);
      case "RECENT":
        return yearlyTrends.filter((d) => d.year >= 2021 && d.year <= 2026);
      default:
        return yearlyTrends;
    }
  }, [yearlyTrends, yearFilter]);

  // Donut chart activity breakdown data
  const activityPieData = useMemo(() => {
    return [
      { name: "Google Searches", value: summary.googleSearches, color: "#6366f1" },
      { name: "Visited Web Pages", value: summary.visitedWebPages, color: "#06b6d4" },
      { name: "Account Notifications", value: summary.accountNotifications, color: "#f59e0b" },
      { name: "Viewed Cards / Modalities", value: summary.viewedEntities, color: "#10b981" },
    ];
  }, [summary]);

  // Top 10 Clusters for horizontal bar chart
  const topClusters = useMemo(() => {
    return queryClusters.slice(0, 10).map((c) => ({
      name: c.subject.length > 28 ? c.subject.slice(0, 26) + "..." : c.subject,
      fullName: c.subject,
      category: c.category,
      count: c.occurrences,
      share: `${c.sharePercent}%`,
    }));
  }, [queryClusters]);

  const clusterColors = [
    "#3b82f6",
    "#6366f1",
    "#06b6d4",
    "#8b5cf6",
    "#ec4899",
    "#10b981",
    "#f59e0b",
    "#14b8a6",
    "#f97316",
    "#64748b",
  ];

  return (
    <section className="w-full space-y-4">
      {/* Chart 1: Longitudinal Annual Trend Multi-Bar Chart */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-md p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Annual Activity Volume Trend by Modality (2007 – 2026)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical distribution of Google Searches vs. Outbound Visited Web Pages.
            </p>
          </div>

          {/* Time range selector */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setYearFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                yearFilter === "ALL"
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All (2007–2026)
            </button>
            <button
              onClick={() => setYearFilter("DECADE1")}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                yearFilter === "DECADE1"
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Decade 1
            </button>
            <button
              onClick={() => setYearFilter("DECADE2")}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                yearFilter === "DECADE2"
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Decade 2
            </button>
            <button
              onClick={() => setYearFilter("RECENT")}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                yearFilter === "RECENT"
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Recent (2021+)
            </button>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredYearlyData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="year"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                fontFamily="monospace"
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                fontFamily="monospace"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0b1120",
                  borderColor: "#1e293b",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                }}
                labelStyle={{ color: "#f8fafc", fontWeight: "bold", fontFamily: "monospace" }}
                formatter={(value: any, name: any) => [
                  Number(value).toLocaleString(),
                  name,
                ]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: "11px" }}
              />
              <Bar
                name="Google Searches"
                dataKey="searches"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                name="Visited Web Pages"
                dataKey="visitedPages"
                fill="#06b6d4"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                name="Modern Cards & Notifications"
                dataKey="cardsAndNotifications"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid of Chart 2 (Donut) & Chart 3 (Top Search Clusters) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Activity Breakdown Donut Chart */}
        <div className="lg:col-span-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-md p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              Activity Modality Share
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cumulative lifetime distribution by event type.
            </p>
          </div>

          <div className="w-full h-[220px] my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {activityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b1120",
                    borderColor: "#1e293b",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [
                    `${Number(val).toLocaleString()} (${(
                      (Number(val) / summary.totalLoggedItems) *
                      100
                    ).toFixed(1)}%)`,
                    "Count",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend items */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800/60">
            {activityPieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-300 truncate text-[11px]">
                  {item.name}:{" "}
                  <strong className="text-white font-mono">
                    {((item.value / summary.totalLoggedItems) * 100).toFixed(1)}%
                  </strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Search Topics & Clusters Horizontal Bar Chart */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-md p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Identified Query Clusters & Subject Distribution
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Top Thematic Clusters
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              High-frequency subjects categorized via rule-based keyword matching and semantic clustering.
            </p>
          </div>

          {/* Cluster List with Custom Bars */}
          <div className="space-y-2.5 my-3">
            {topClusters.map((cluster, idx) => {
              const maxCount = topClusters[0]?.count || 1;
              const widthPct = Math.max(Math.round((cluster.count / maxCount) * 100), 5);
              const color = clusterColors[idx % clusterColors.length];

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate pr-2">
                      {idx + 1}. {cluster.fullName}
                    </span>
                    <div className="flex items-center gap-2 font-mono shrink-0">
                      <span className="text-slate-400 text-[11px]">{cluster.category}</span>
                      <span className="text-white font-bold">{cluster.count.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 font-mono text-right pt-2 border-t border-slate-800/60">
            Identified Query Clusters Total: 16,777 High-Frequency Occurrences
          </div>
        </div>
      </div>
    </section>
  );
};
