"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { ExecutiveScorecards } from "../components/ExecutiveScorecards";
import { DecadeComparisonTable } from "../components/DecadeComparisonTable";
import { LongitudinalCharts } from "../components/LongitudinalCharts";
import { QualitativeInsights } from "../components/QualitativeInsights";
import { FileUploadModal } from "../components/FileUploadModal";
import { ActivityLogModal } from "../components/ActivityLogModal";
import { OnboardingHero } from "../components/OnboardingHero";
import { SAMPLE_EXECUTIVE_DATA } from "../lib/sampleData";
import { DashboardData } from "../lib/types";

export default function ExecutiveDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState<boolean>(false);

  // Check localStorage for saved session on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("greader_user_dataset");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed && parsed.summary) {
          setDashboard(parsed);
        }
      }
    } catch (err) {
      console.warn("Could not retrieve saved session:", err);
    } finally {
      setHasCheckedStorage(true);
    }
  }, []);

  const handleSetDataset = (data: DashboardData) => {
    setDashboard(data);
    try {
      localStorage.setItem("greader_user_dataset", JSON.stringify(data));
    } catch (e) {
      // Ignore quota errors for very large caches
    }
  };

  const handleResetToBenchmark = () => {
    handleSetDataset(SAMPLE_EXECUTIVE_DATA);
  };

  const handleReturnToOnboarding = () => {
    setDashboard(null);
    try {
      localStorage.removeItem("greader_user_dataset");
    } catch (e) {}
  };

  // Wait until localStorage is checked to prevent initial flash
  if (!hasCheckedStorage) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        dashboard={dashboard}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenLogs={() => setIsLogsOpen(true)}
        onResetSample={handleResetToBenchmark}
        onBackToOnboarding={handleReturnToOnboarding}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {dashboard ? (
          <>
            {/* Subtitle description matching Google Sheets audit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800/60 text-slate-400 text-xs">
              <p>
                Comprehensive audit and timeline analysis of user search records, visited URLs, and account activity ({dashboard.summary.activitySpan}).
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
          </>
        ) : (
          /* First-Time User Experience: High-Impact Onboarding Hero */
          <OnboardingHero
            onSelectSample={handleResetToBenchmark}
            onOpenUploadModal={() => setIsUploadOpen(true)}
          />
        )}
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
        onDataLoaded={handleSetDataset}
      />

      {/* Activity Logs Modal */}
      <ActivityLogModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        activities={dashboard?.recentActivities || []}
      />
    </div>
  );
}
