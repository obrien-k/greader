"use client";

import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Database,
  Layers,
  Download,
  RotateCcw,
  Activity,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { DashboardData } from "../lib/types";

interface NavbarProps {
  dashboard: DashboardData | null;
  onOpenUpload: () => void;
  onOpenLogs: () => void;
  onResetSample: () => void;
  onBackToOnboarding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  dashboard,
  onOpenUpload,
  onOpenLogs,
  onResetSample,
  onBackToOnboarding,
}) => {
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/server/health")
      .then((res) => (res.ok ? setServerOnline(true) : setServerOnline(false)))
      .catch(() => setServerOnline(false));
  }, []);

  const handleExportData = () => {
    if (!dashboard) return;
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(dashboard, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `Takeout_Audit_Dashboard_${dashboard.summary.activitySpan.replace(/\s+/g, "_")}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-navy-950 rounded-[11px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-slate-100 text-base tracking-tight leading-none">
                Google Search Activity Executive Dashboard
              </h1>
              {dashboard ? (
                dashboard.isDemo ? (
                  <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Reference POC Audit
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Live Ingested Dataset
                  </span>
                )
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  Ready to Ingest
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {dashboard
                ? `Audited Timeline: ${dashboard.summary.activitySpan} • ${dashboard.summary.totalLoggedItems.toLocaleString()} events`
                : "Awaiting Takeout Archive or Benchmark Demo Selection"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Server status indicator */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400"
            title={
              serverOnline
                ? "Cloud Run API server connected (port 8080)"
                : "Cloud Run API in local direct mode"
            }
          >
            <div
              className={`w-2 h-2 rounded-full ${
                serverOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="font-mono text-[11px]">
              {serverOnline ? "Cloud Run: Active" : "Direct Engine: Ready"}
            </span>
          </div>

          {/* If on active dashboard, show switch / onboarding button */}
          {dashboard && onBackToOnboarding && (
            <button
              onClick={onBackToOnboarding}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-medium transition-colors"
              title="Return to Ingestion Welcome & Benchmark Portal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Switch Dataset</span>
            </button>
          )}

          {/* Activity Logs Inspector */}
          {dashboard && (
            <button
              onClick={onOpenLogs}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-medium transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Activity Logs</span>
            </button>
          )}

          {/* Reset / Sample Data */}
          {dashboard && !dashboard.isDemo && (
            <button
              onClick={onResetSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-medium transition-colors"
              title="Reset to 20-year reference analytical model"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">POC Baseline</span>
            </button>
          )}

          {/* Export JSON */}
          {dashboard && (
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-medium transition-colors"
              title="Export complete dashboard analytics to JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* Ingest Button */}
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 border border-blue-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Ingest Takeout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
