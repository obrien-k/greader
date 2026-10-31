"use client";

import React, { useRef, useState } from "react";
import {
  UploadCloud,
  Sparkles,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  Compass,
  FileCode,
  FileArchive,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { DashboardData } from "../lib/types";
import { SAMPLE_EXECUTIVE_DATA } from "../lib/sampleData";

interface OnboardingHeroProps {
  onSelectSample: () => void;
  onOpenUploadModal: () => void;
}

export const OnboardingHero: React.FC<OnboardingHeroProps> = ({
  onSelectSample,
  onOpenUploadModal,
}) => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleLaunchBenchmark = () => {
    triggerConfetti();
    onSelectSample();
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 py-4">
      {/* Hero Headline */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Longitudinal Search & Browsing Activity Engine (2007 – 2026)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Decode 20 Years of Google Search &{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
            Zero-Click Evolution
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Ingest decades of Google Takeout history, stream-parse 100k+ records with $O(1)$ memory, cluster queries across 11 life domains, and quantify how instant answers transformed your browsing behavior.
        </p>
      </div>

      {/* Two Primary Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Card 1: Upload User Takeout Export */}
        <div className="rounded-2xl p-6 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 hover:border-blue-500/50 shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-lg shadow-blue-500/10">
              <UploadCloud className="w-6 h-6" />
            </div>

            <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
              Option A • Ingest Your Data
            </span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2">
              Upload Your Takeout Export
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Upload your <code className="text-blue-300 font-mono">Takeout.zip</code>,{" "}
              <code className="text-blue-300 font-mono">MyActivity.html</code>, or{" "}
              <code className="text-blue-300 font-mono">MyActivity.json</code> file.
              Choose between client-side streaming or Cloud Run GCS direct uploads.
            </p>

            <div className="space-y-2 text-xs text-slate-400 font-mono mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-cloud client streaming or Cloud Run GCS signed URL</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>11 automated thematic clusters with Gemini AI fallback</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ephemeral privacy (never stores raw zip on servers)</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenUploadModal}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01]"
          >
            <span>Open Ingestion Wizard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 2: Explore 20-Year Benchmark Audit */}
        <div className="rounded-2xl p-6 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 hover:border-cyan-500/50 shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
              <BarChart3 className="w-6 h-6" />
            </div>

            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Option B • Interactive Proof of Concept
            </span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2">
              Explore 20-Year Benchmark Audit
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Don&apos;t have a Takeout export ready? Explore the fully audited 2007–2026 Google Sheets dataset with 70,023 validated records, longitudinal charts, and decade shifts.
            </p>

            {/* Benchmark Preview Scorecards */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Logged Items</span>
                <span className="text-lg font-bold font-mono text-white">70,023</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Google Searches</span>
                <span className="text-lg font-bold font-mono text-indigo-400">44,530</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Visited Clicks</span>
                <span className="text-lg font-bold font-mono text-cyan-400">24,993</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-[10px] text-amber-300 font-mono block">Zero-Click Shift</span>
                <span className="text-lg font-bold font-mono text-amber-300">-46.6%</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLaunchBenchmark}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all hover:scale-[1.01]"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Launch Benchmark Audit Dashboard (70,023 Events)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto pt-4">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white mb-0.5">
              Zero-Click SERP Resolution
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Calculates how search-to-click ratios fell from 0.61 down to 0.33 as Google shifted into an instant answer directory.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white mb-0.5">
              11 Longitudinal Clusters
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Maps query evolutions from local housing settlement into senior software engineering and developer toolchains.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white mb-0.5">
              Privacy-First Architecture
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Stream-parses 100k+ events with constant O(1) memory and automatic 24-hr Cloud Storage TTL deletion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
