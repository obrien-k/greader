"use client";

import React from "react";
import {
  Search,
  ExternalLink,
  Bell,
  Sparkles,
  Layers,
  Calendar,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react";
import { ExecutiveSummary } from "../lib/types";

interface ExecutiveScorecardsProps {
  summary: ExecutiveSummary;
}

export const ExecutiveScorecards: React.FC<ExecutiveScorecardsProps> = ({
  summary,
}) => {
  const cards = [
    {
      title: "Total Logged Items",
      value: summary.totalLoggedItems.toLocaleString(),
      subtext: "100% Validated User Activity",
      share: "100.0%",
      icon: Layers,
      accentColor: "from-blue-500 to-indigo-600",
      textColor: "text-blue-400",
      borderColor: "hover:border-blue-500/40",
      glowColor: "rgba(59, 130, 246, 0.15)",
    },
    {
      title: "Google Searches",
      value: summary.googleSearches.toLocaleString(),
      subtext: "Primary Intent Queries",
      share: `${summary.searchSharePercent}%`,
      icon: Search,
      accentColor: "from-indigo-500 to-violet-600",
      textColor: "text-indigo-400",
      borderColor: "hover:border-indigo-500/40",
      glowColor: "rgba(99, 102, 241, 0.15)",
    },
    {
      title: "Visited Web Pages",
      value: summary.visitedWebPages.toLocaleString(),
      subtext: "Outbound SERP Clicks",
      share: `${summary.visitedSharePercent}%`,
      icon: ExternalLink,
      accentColor: "from-cyan-500 to-blue-600",
      textColor: "text-cyan-400",
      borderColor: "hover:border-cyan-500/40",
      glowColor: "rgba(6, 182, 212, 0.15)",
    },
    {
      title: "Account Notifications",
      value: summary.accountNotifications.toLocaleString(),
      subtext: "System & Security Alerts",
      share: `${summary.notificationsPercent}%`,
      icon: Bell,
      accentColor: "from-amber-500 to-orange-600",
      textColor: "text-amber-400",
      borderColor: "hover:border-amber-500/40",
      glowColor: "rgba(245, 158, 11, 0.15)",
    },
    {
      title: "Viewed Entities / Cards",
      value: summary.viewedEntities.toLocaleString(),
      subtext: "Google Feed & Assistant",
      share: `${summary.viewedEntitiesPercent}%`,
      icon: Sparkles,
      accentColor: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-400",
      borderColor: "hover:border-emerald-500/40",
      glowColor: "rgba(16, 185, 129, 0.15)",
    },
    {
      title: "Activity Span",
      value: summary.activitySpan,
      subtext: "2 Decades of Longitudinal Data",
      share: "20 Years",
      icon: Calendar,
      accentColor: "from-purple-500 to-pink-600",
      textColor: "text-purple-400",
      borderColor: "hover:border-purple-500/40",
      glowColor: "rgba(168, 85, 247, 0.15)",
    },
  ];

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Executive Audit Scorecard
        </h2>
        <span className="text-xs text-slate-500 font-mono">
          Methodology: Direct Pivot Table Verification
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`relative group rounded-xl p-4 bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 ${card.borderColor} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}
              style={{
                boxShadow: `0 4px 20px -2px ${card.glowColor}`,
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400 leading-tight">
                  {card.title}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${card.accentColor} p-[1px] shadow-sm flex items-center justify-center shrink-0`}
                >
                  <div className="w-full h-full bg-navy-950 rounded-[7px] flex items-center justify-center">
                    <Icon className={`w-3.5 h-3.5 ${card.textColor}`} />
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
                  {card.value}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/60">
                <span className="text-slate-400 truncate pr-1">{card.subtext}</span>
                <span
                  className={`font-mono font-medium px-1.5 py-0.2 rounded ${card.textColor} bg-slate-800/80 shrink-0`}
                >
                  {card.share}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
