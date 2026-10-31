"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  X,
  FileArchive,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Cloud,
  Server,
  Database,
  Lock,
} from "lucide-react";
import confetti from "canvas-confetti";
import { parseTakeoutTextClient } from "../lib/clientParser";
import { DashboardData } from "../lib/types";
import { SAMPLE_EXECUTIVE_DATA } from "../lib/sampleData";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (data: DashboardData) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<"client" | "gcs">("client");

  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgressPercent(10);
    setProgressMessage(`Reading file: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(1)} MB)...`);
    setErrorMessage(null);

    try {
      if (uploadMode === "gcs") {
        // Backend Cloud Run / GCS upload pathway
        setProgressMessage("Requesting GCS Direct Signed Upload URL...");
        const urlRes = await fetch("/api/server/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: selectedFile.name,
            contentType: selectedFile.type || "application/octet-stream",
          }),
        });

        if (!urlRes.ok) {
          throw new Error("Could not acquire GCS upload URL from server");
        }

        const urlData = await urlRes.json();
        setProgressPercent(35);
        setProgressMessage("Streaming data to Cloud Storage...");

        if (urlData.isDirectUpload) {
          // Direct server parse route
          const formData = new FormData();
          formData.append("file", selectedFile);
          const parseRes = await fetch(urlData.uploadUrl, {
            method: "POST",
            body: formData,
          });
          const parseData = await parseRes.json();
          if (parseData.dashboard) {
            setProgressPercent(100);
            setProgressMessage("Aggregation complete!");
            triggerConfetti();
            onDataLoaded(parseData.dashboard);
            onClose();
            return;
          }
        } else {
          // Direct GCS PUT
          await fetch(urlData.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": selectedFile.type || "application/octet-stream" },
            body: selectedFile,
          });

          setProgressPercent(75);
          setProgressMessage("Triggering Cloud Run background worker...");

          const procRes = await fetch("/api/server/process-gcs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ objectPath: urlData.objectPath }),
          });
          const procData = await procRes.json();
          if (procData.dashboard) {
            setProgressPercent(100);
            setProgressMessage("Dashboard aggregated!");
            triggerConfetti();
            onDataLoaded(procData.dashboard);
            onClose();
            return;
          }
        }
      }

      // Client-side instant parser pathway (supports HTML & JSON & Server ZIP stream)
      if (selectedFile.name.endsWith(".zip")) {
        setProgressMessage("Streaming ZIP archive to streaming parser...");
        const formData = new FormData();
        formData.append("file", selectedFile);
        const res = await fetch("/api/server/parse-direct", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.dashboard) {
          setProgressPercent(100);
          setProgressMessage("Aggregation finished!");
          triggerConfetti();
          onDataLoaded(data.dashboard);
          onClose();
          return;
        } else {
          throw new Error(data.error || "Failed to parse Takeout zip");
        }
      }

      // Read text for HTML / JSON
      const text = await selectedFile.text();
      setProgressPercent(30);
      setProgressMessage("Streaming parser active: categorizing query events...");

      const dashboard = await parseTakeoutTextClient(text, (pct, count) => {
        setProgressPercent(30 + Math.round((pct * 0.7)));
        setProgressMessage(`Streaming records: ${count.toLocaleString()} events categorized...`);
      });

      setProgressPercent(100);
      setProgressMessage("Audit complete!");
      triggerConfetti();
      onDataLoaded(dashboard);
      onClose();
    } catch (err: any) {
      console.error("Ingestion failed:", err);
      setErrorMessage(err.message || "Failed to process Takeout archive.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = () => {
    triggerConfetti();
    onDataLoaded(SAMPLE_EXECUTIVE_DATA);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Takeout Search Activity Ingestion Engine
              </h3>
              <p className="text-xs text-slate-400">
                Choose your processing pipeline based on export size and privacy preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Distinct Mode Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-4 shrink-0">
          <button
            onClick={() => setUploadMode("client")}
            className={`p-3 rounded-xl border text-left transition-all ${
              uploadMode === "client"
                ? "bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-500/10"
                : "bg-slate-950/50 border-slate-800 hover:border-slate-700 opacity-70"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Cpu className={`w-4 h-4 ${uploadMode === "client" ? "text-cyan-400" : "text-slate-400"}`} />
              <span className={`text-xs font-semibold ${uploadMode === "client" ? "text-cyan-300" : "text-slate-300"}`}>
                Instant Streaming Parser
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Direct in-browser & local worker stream • Zero cloud cost
            </p>
          </button>

          <button
            onClick={() => setUploadMode("gcs")}
            className={`p-3 rounded-xl border text-left transition-all ${
              uploadMode === "gcs"
                ? "bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10"
                : "bg-slate-950/50 border-slate-800 hover:border-slate-700 opacity-70"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Cloud className={`w-4 h-4 ${uploadMode === "gcs" ? "text-indigo-400" : "text-slate-400"}`} />
              <span className={`text-xs font-semibold ${uploadMode === "gcs" ? "text-indigo-300" : "text-slate-300"}`}>
                Cloud Run + GCS Signed URL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Direct GCS PUT upload • Eventarc worker & Firestore
            </p>
          </button>
        </div>

        {/* Distinct Pipeline Context Banners */}
        {uploadMode === "client" ? (
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 mb-4 shrink-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                Local Privacy & Rapid Streaming
              </span>
              <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                O(1) Memory Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Files are streamed chunk-by-chunk directly into memory without persistent storage. Ideal for quickly parsing <code className="text-cyan-300 font-mono">MyActivity.html</code> or <code className="text-cyan-300 font-mono">MyActivity.json</code> on your machine.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 mb-4 shrink-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                Enterprise Scalable Pipeline (Multi-GB ZIPs)
              </span>
              <span className="text-[10px] font-mono text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30">
                Signed URL + TTL
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
              Bypasses web server memory bottlenecks via a direct Signed PUT URL into Google Cloud Storage. Eventarc triggers an asynchronous Cloud Run worker to batch-write aggregates into Firestore.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">1. Sign URL</span>
              <span>→</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">2. Direct GCS Stream</span>
              <span>→</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">3. Eventarc Worker</span>
              <span>→</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">4. Firestore Batch</span>
            </div>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-blue-500 bg-blue-500/10"
              : uploadMode === "client"
              ? "border-cyan-900/60 hover:border-cyan-600 bg-slate-950/50"
              : "border-indigo-900/60 hover:border-indigo-600 bg-slate-950/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".zip,.html,.htm,.json"
            onChange={handleChange}
            className="hidden"
          />

          <div
            className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-inner ${
              uploadMode === "client" ? "bg-cyan-950/50 text-cyan-400" : "bg-indigo-950/50 text-indigo-400"
            }`}
          >
            {selectedFile?.name.endsWith(".zip") ? (
              <FileArchive className="w-6 h-6" />
            ) : selectedFile ? (
              <FileCode className="w-6 h-6" />
            ) : uploadMode === "client" ? (
              <Cpu className="w-6 h-6" />
            ) : (
              <Cloud className="w-6 h-6" />
            )}
          </div>

          {selectedFile ? (
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-sm mx-auto">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
              </p>
            </div>
          ) : uploadMode === "client" ? (
            <div>
              <p className="text-sm font-medium text-slate-200">
                Drop <span className="text-cyan-400 font-semibold">MyActivity.html</span> or{" "}
                <span className="text-cyan-400 font-semibold">MyActivity.json</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Also accepts standalone search logs or local ZIP files
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-200">
                Drop <span className="text-indigo-400 font-semibold">Takeout.zip</span> for Cloud Storage Ingestion
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Streams directly to GCS bucket with auto-applied 24-hr TTL lifecycle
              </p>
            </div>
          )}
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Progress bar */}
        {isProcessing && (
          <div className="mt-4 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                {progressMessage}
              </span>
              <span className="text-blue-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800 shrink-0">
          <button
            onClick={handleLoadSample}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Reference POC (70,023 records)</span>
          </button>

          <button
            onClick={handleProcessFile}
            disabled={!selectedFile || isProcessing}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Begin Parsing & Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
