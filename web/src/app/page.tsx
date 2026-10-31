"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { ExecutiveScorecards } from "../components/ExecutiveScorecards";
import { DecadeComparisonTable } from "../components/DecadeComparisonTable";
import { LongitudinalCharts } from "../components/LongitudinalCharts";
import { QualitativeInsights } from "../components/QualitativeInsights";
import { FileUploadModal } from "../components/FileUploadModal";
import { ActivityLogModal } from "../components/ActivityLogModal";
import { SAMPLE_EXECUTIVE_DATA } from "../lib/sampleData";
import { DashboardData } from "../lib/types";

export default function ExecutiveDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData>(SAMPLE_EXECUTIVE_DATA);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);

  useEffect(() => {
    // Optionally fetch dashboard from backend if available
    fetch("/api/server/dashboard/sample")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.summary) {
          setDashboard(data);
        }
      })
      .catch(() => {
        // Fallback to local sample data
      });
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        dashboard={dashboard}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenLogs={() => setIsLogsOpen(true)}
        onResetSample={() => setDashboard(SAMPLE_EXECUTIVE_DATA)}
      />

      {/* Main Dashboard Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Subtitle description matching Google Sheets audit */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800/60 text-slate-400 text-xs">
          <p>
            Comprehensive audit and timeline analysis of user search records, visited URLs, and account activity (2007 – 2026).
          </p>
          <p className="font-mono text-slate-500 mt-1 sm:mt-0">
            Engineered with Next.js • Cloud Run • Firestore Aggregations
          </p>
        </div>

        {/* 1. Executive Scorecard */}
        <ExecutiveScorecards summary={dashboard.summary} />

        {/* 2. Longitudinal Charts (Annual Volume Trends, Donut Modality Share, Query Clusters) */}
        <LongitudinalCharts
          yearlyTrends={dashboard.yearlyTrends}
          queryClusters={dashboard.queryClusters}
          summary={dashboard.summary}
        />

        {/* 3. Decade-over-Decade Activity & Behavioral Comparison Table */}
        <DecadeComparisonTable comparison={dashboard.decadeComparison} />

        {/* 4. Qualitative Behavioral Shifts & Strategic Insights */}
        <QualitativeInsights insights={dashboard.qualitativeInsights} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-navy-950/60 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Google Takeout Search Activity Ingestion Engine & Dashboard</span>
          <span>Google Cloud Run • Google Cloud Storage • Cloud Firestore</span>
        </div>
      </footer>

      {/* File Upload Ingestion Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={(newData) => setDashboard(newData)}
      />

      {/* Activity Logs Modal */}
      <ActivityLogModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        activities={dashboard.recentActivities || []}
      />
    </div>
  );
}
