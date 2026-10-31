"use client";

import React, { useState } from "react";
import {
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Zap,
  Info,
  Clock,
} from "lucide-react";
import { DecadeComparison, DecadeMetricRow } from "../lib/types";

interface DecadeComparisonTableProps {
  comparison: DecadeComparison;
}

export const DecadeComparisonTable: React.FC<DecadeComparisonTableProps> = ({
  comparison,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const getShiftBadge = (shift: string) => {
    if (shift === "N/A") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-800 text-slate-400">
          N/A (New Modality)
        </span>
      );
    }
    const isNegative = shift.startsWith("-");
    const isZeroClickRatio = shift === "-46.6%";

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
          isZeroClickRatio
            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10"
            : isNegative
            ? "bg-rose-500/15 text-rose-300 border border-rose-500/20"
            : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
        }`}
      >
        {isNegative ? (
          <TrendingDown className="w-3 h-3" />
        ) : (
          <TrendingUp className="w-3 h-3" />
        )}
        {shift}
      </span>
    );
  };

  const getDriverBadge = (driver: string) => {
    const driverColors: Record<string, string> = {
      "Zero-Click Resolution": "bg-amber-500/10 text-amber-300 border-amber-500/30",
      "Platform Transition": "bg-blue-500/10 text-blue-300 border-blue-500/30",
      "Selective Browsing": "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
      "Technical Workflows": "bg-purple-500/10 text-purple-300 border-purple-500/30",
      "SERP Instant Answers": "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
      "Query Dominance": "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      "Reduced External Clicks": "bg-rose-500/10 text-rose-300 border-rose-500/30",
      "Google Feed Ecosystem": "bg-teal-500/10 text-teal-300 border-teal-500/30",
      "Platform & Tool Evolution": "bg-sky-500/10 text-sky-300 border-sky-500/30",
    };

    const colorClass =
      driverColors[driver] || "bg-slate-800 text-slate-300 border-slate-700";

    return (
      <span
        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${colorClass}`}
      >
        {driver}
      </span>
    );
  };

  return (
    <section className="w-full rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-md p-5 shadow-xl">
      {/* Table Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Decade-over-Decade Activity & Behavioral Comparison
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              2007–2016 vs. 2017–2026
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quantifies the structural transition from open-web exploratory browsing to precision technical workflows and zero-click answer resolution.
          </p>
        </div>

        {/* Zero-Click Feature Highlight Tag */}
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300 font-bold font-mono text-xs">
            -47%
          </div>
          <div>
            <div className="text-[11px] font-semibold text-amber-300 leading-tight">
              Zero-Click Shift
            </div>
            <div className="text-[10px] text-slate-300 font-mono">
              0.61 → 0.33 Clicks/Search
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono text-[11px]">
              <th className="py-3 px-3 font-semibold">Metric / Dimension</th>
              <th className="py-3 px-3 font-semibold text-right">
                2007 – 2016 (Decade 1)
              </th>
              <th className="py-3 px-3 font-semibold text-right">
                2017 – 2026 (Decade 2)
              </th>
              <th className="py-3 px-3 font-semibold text-right">Net Variance</th>
              <th className="py-3 px-3 font-semibold text-center">% Shift</th>
              <th className="py-3 px-3 font-semibold">Primary Driver</th>
              <th className="py-3 px-3 font-semibold min-w-[280px]">
                Behavioral Significance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {comparison.rows.map((row, idx) => {
              const isSelected = selectedMetric === row.metric;
              const isHighlightRow =
                row.metric.includes("Search-to-Click") ||
                row.metric.includes("Total Activity Volume");

              return (
                <tr
                  key={idx}
                  onClick={() =>
                    setSelectedMetric(isSelected ? null : row.metric)
                  }
                  className={`group transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-900/20 border-l-2 border-l-blue-500"
                      : isHighlightRow
                      ? "bg-slate-900/40 hover:bg-slate-800/60"
                      : "hover:bg-slate-800/40"
                  }`}
                >
                  {/* Metric Name */}
                  <td className="py-3 px-3 font-medium text-slate-200">
                    <div className="flex items-center gap-1.5">
                      {isHighlightRow && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      )}
                      <span>{row.metric}</span>
                    </div>
                  </td>

                  {/* Decade 1 */}
                  <td className="py-3 px-3 font-mono text-slate-300 text-right">
                    {row.decade1}
                  </td>

                  {/* Decade 2 */}
                  <td className="py-3 px-3 font-mono font-medium text-white text-right">
                    {row.decade2}
                  </td>

                  {/* Net Variance */}
                  <td
                    className={`py-3 px-3 font-mono text-right ${
                      row.netVariance.startsWith("-")
                        ? "text-rose-400 font-medium"
                        : row.netVariance === "0" || row.netVariance === "0.00"
                        ? "text-slate-400"
                        : "text-emerald-400 font-medium"
                    }`}
                  >
                    {row.netVariance}
                  </td>

                  {/* % Shift */}
                  <td className="py-3 px-3 text-center">
                    {getShiftBadge(row.percentShift)}
                  </td>

                  {/* Primary Driver */}
                  <td className="py-3 px-3">{getDriverBadge(row.primaryDriver)}</td>

                  {/* Behavioral Significance */}
                  <td className="py-3 px-3 text-slate-400 group-hover:text-slate-300 text-[11px] leading-relaxed">
                    {row.behavioralSignificance}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Era Summary Footer Banner */}
      <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Era 1: Discovery & Browsing (2007 – 2016)
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {comparison.era1Summary}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Era 2: Targeted Utility & Precision (2017 – 2026)
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {comparison.era2Summary}
          </p>
        </div>
      </div>
    </section>
  );
};
