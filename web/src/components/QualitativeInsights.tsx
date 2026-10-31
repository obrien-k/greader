"use client";

import React, { useState } from "react";
import {
  Lightbulb,
  Home,
  Briefcase,
  Compass,
  Film,
  Smartphone,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { QualitativeInsight } from "../lib/types";

interface QualitativeInsightsProps {
  insights: QualitativeInsight[];
}

export const QualitativeInsights: React.FC<QualitativeInsightsProps> = ({
  insights,
}) => {
  const [activeTab, setActiveTab] = useState<number>(1);

  const getDimensionIcon = (num: number) => {
    switch (num) {
      case 1:
        return Home;
      case 2:
        return Briefcase;
      case 3:
        return Compass;
      case 4:
        return Film;
      case 5:
        return Smartphone;
      default:
        return Lightbulb;
    }
  };

  return (
    <section className="w-full space-y-4">
      {/* Executive Key Finding Callout Box */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-blue-950/80 via-indigo-950/60 to-purple-950/80 border border-blue-500/30 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-widest text-blue-400 font-bold">
                Executive Synthesis & Strategic Finding
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-blue-500/20 text-blue-300">
                20-Year Longitudinal Synthesis
              </span>
            </div>
            <p className="text-sm text-slate-200 mt-2 leading-relaxed">
              The 20-year longitudinal activity log reveals a definitive transition
              from an expansive, exploratory{" "}
              <strong className="text-blue-300">
                &ldquo;Discovery Era&rdquo; (2007–2016: 58,661 events, 61.4%
                click-through)
              </strong>{" "}
              centered on settlement, media acquisition, and general knowledge, to
              a streamlined{" "}
              <strong className="text-cyan-300">
                &ldquo;Technical Utility Era&rdquo; (2017–2026: 11,077 events,
                32.8% click-through)
              </strong>{" "}
              defined by professional software engineering, developer syntax
              validation, zero-click answer resolution, and diversified digital
              ecosystems.
            </p>

            <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Validated: 100% of Search & Browsing Records
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Source: Google Takeout Parsed_Activity!A1:F69739
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Thematic Qualitative Shift Cards */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-md p-5 shadow-xl">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            Qualitative Behavioral Shifts & Longitudinal Search Evolution
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            5 Core Thematic Dimensions tracking the evolution across both decades (2007–2016 Exploration Era vs. 2017–2026 Specialization Era).
          </p>
        </div>

        {/* Dimension Pill Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-4">
          {insights.map((item) => {
            const Icon = getDimensionIcon(item.number);
            const isSelected = activeTab === item.number;
            return (
              <button
                key={item.number}
                onClick={() => setActiveTab(item.number)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-blue-600/20 border-blue-500/50 text-white shadow-md shadow-blue-500/10"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div className="text-[10px] font-mono text-slate-400">
                    Dimension {item.number}
                  </div>
                  <div className="text-xs font-medium truncate">
                    {item.title.split(" to ")[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Dimension Detail Card */}
        {insights
          .filter((item) => item.number === activeTab)
          .map((item) => {
            const Icon = getDimensionIcon(item.number);
            return (
              <div
                key={item.number}
                className="rounded-xl p-5 bg-slate-950/80 border border-slate-800/80 space-y-4 animate-in fade-in duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-semibold text-white">
                    {item.number}. {item.title}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Era 1 Column */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-xs font-mono font-semibold text-blue-300">
                        2007 – 2016 Exploration Era (Baseline)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.era1Baseline}
                    </p>
                  </div>

                  {/* Era 2 Column */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-indigo-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="text-xs font-mono font-semibold text-cyan-300">
                        2017 – 2026 Specialization Era (Shift)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.era2Shift}
                    </p>
                  </div>
                </div>

                {/* Strategic Impact Box */}
                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-bold block mb-0.5">
                      Strategic Behavioral Insight & User Lifecycle Impact
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {item.strategicImpact}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
};
