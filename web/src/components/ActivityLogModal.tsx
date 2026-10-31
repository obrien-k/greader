"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  ExternalLink,
  Layers,
  Calendar,
  Filter,
  Tag,
  Clock,
} from "lucide-react";
import { ParsedActivityRecord } from "../lib/types";

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ParsedActivityRecord[];
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({
  isOpen,
  onClose,
  activities,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  if (!isOpen) return null;

  const filteredList = useMemo(() => {
    return activities.filter((act) => {
      const matchType =
        typeFilter === "ALL" || act.activity_type === typeFilter;
      const matchSearch =
        !searchTerm ||
        act.query_or_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.cluster?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [activities, typeFilter, searchTerm]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Activity Stream & Query Inspector
              </h3>
              <p className="text-xs text-slate-400">
                Parsed records with categorized clusters and exact timestamps
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

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 my-4 shrink-0">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by query, URL or cluster theme..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="ALL">All Activity Types</option>
              <option value="Google Search">Google Searches</option>
              <option value="Visited Web Page">Visited Web Pages</option>
              <option value="Viewed Entity / Card">Viewed Cards</option>
              <option value="Account Notification">Notifications</option>
            </select>
          </div>
        </div>

        {/* Scrollable Records Table */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-950/90 backdrop-blur-sm text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Query / Target URL</th>
                <th className="py-2.5 px-3">Cluster Theme</th>
                <th className="py-2.5 px-3 text-right">Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500 text-xs">
                    No matching activity records found.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const isSearch = item.activity_type === "Google Search";
                  return (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            isSearch
                              ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                              : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20"
                          }`}
                        >
                          {isSearch ? (
                            <Search className="w-2.5 h-2.5" />
                          ) : (
                            <ExternalLink className="w-2.5 h-2.5" />
                          )}
                          {item.activity_type}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-200 font-medium max-w-sm truncate">
                        {item.query_or_url}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 px-2 py-0.5 rounded bg-slate-800/80">
                          <Tag className="w-2.5 h-2.5 text-blue-400" />
                          {item.cluster || "General Exploratory"}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 text-right">
                        {item.timestamp ? item.timestamp.replace("T", " ").slice(0, 19) : "2024-01-01"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between shrink-0">
          <span>Showing {filteredList.length} parsed activity events</span>
          <span>Google Takeout Ingestion Engine</span>
        </div>
      </div>
    </div>
  );
};
