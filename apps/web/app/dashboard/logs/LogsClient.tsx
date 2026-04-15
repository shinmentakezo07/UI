"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Search, CheckCircle, XCircle, Clock, Zap } from "lucide-react";
import { DataTable } from "@/components/dashboard/DataTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

// Mock data - replace with real API calls
const mockLogs = [
  {
    id: "1",
    timestamp: "2026-04-15T21:10:32.123Z",
    model: "gpt-4",
    provider: "OpenAI",
    inputTokens: 1250,
    outputTokens: 450,
    cost: 0.0285,
    latency: 1234,
    status: "success",
  },
  {
    id: "2",
    timestamp: "2026-04-15T21:08:15.456Z",
    model: "claude-opus-4",
    provider: "Anthropic",
    inputTokens: 890,
    outputTokens: 320,
    cost: 0.0156,
    latency: 987,
    status: "success",
  },
  {
    id: "3",
    timestamp: "2026-04-15T21:05:42.789Z",
    model: "gemini-2-flash",
    provider: "Google",
    inputTokens: 2100,
    outputTokens: 780,
    cost: 0.0012,
    latency: 456,
    status: "error",
    errorMessage: "Rate limit exceeded",
  },
  {
    id: "4",
    timestamp: "2026-04-15T21:03:18.234Z",
    model: "llama-3.3-70b",
    provider: "Meta",
    inputTokens: 1500,
    outputTokens: 600,
    cost: 0.0018,
    latency: 678,
    status: "success",
  },
];

export default function LogsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "error">("all");

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch = log.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: "Timestamp",
      accessor: "timestamp",
      width: "180px",
      render: (value: string) => (
        <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
          <Clock className="w-3 h-3" />
          {new Date(value).toLocaleTimeString()}
        </div>
      ),
    },
    {
      header: "Model",
      accessor: "model",
      render: (value: string, row: any) => (
        <div>
          <div className="text-sm font-medium text-white">{value}</div>
          <div className="text-xs text-gray-500">{row.provider}</div>
        </div>
      ),
    },
    {
      header: "Tokens",
      accessor: "inputTokens",
      render: (value: number, row: any) => (
        <div className="text-sm font-mono text-gray-300">
          <span className="text-green-400">{value}</span>
          {" / "}
          <span className="text-cyan-400">{row.outputTokens}</span>
        </div>
      ),
    },
    {
      header: "Cost",
      accessor: "cost",
      render: (value: number) => (
        <div className="text-sm font-mono text-emerald-400">
          ${value.toFixed(4)}
        </div>
      ),
    },
    {
      header: "Latency",
      accessor: "latency",
      render: (value: number) => (
        <div className="flex items-center gap-1 text-sm font-mono text-gray-300">
          <Zap className="w-3 h-3 text-yellow-500" />
          {value}ms
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value: string) => (
        <StatusBadge
          status={value === "success" ? "success" : "error"}
          label={value}
          size="sm"
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen pt-6 pb-12 px-4 sm:px-6 lg:px-8 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Activity className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-white">Request Logs</h1>
          </div>
          <p className="text-gray-400">Monitor all API requests and responses in real-time</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-white font-mono">{filteredLogs.length}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Total Logs</div>
          </div>
          <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400 font-mono">
              {filteredLogs.filter(l => l.status === "success").length}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Successful</div>
          </div>
          <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400 font-mono">
              {filteredLogs.filter(l => l.status === "error").length}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Errors</div>
          </div>
          <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              ${filteredLogs.reduce((sum, log) => sum + log.cost, 0).toFixed(4)}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Total Cost</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by model or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-[#0A0A0A] text-gray-400 border border-white/10 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("success")}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "success"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-[#0A0A0A] text-gray-400 border border-white/10 hover:text-white"
              }`}
            >
              Success
            </button>
            <button
              onClick={() => setStatusFilter("error")}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "error"
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-[#0A0A0A] text-gray-400 border border-white/10 hover:text-white"
              }`}
            >
              Errors
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <DataTable columns={columns} data={filteredLogs} />

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No logs found matching your filters
          </div>
        )}
      </div>
    </div>
  );
}
