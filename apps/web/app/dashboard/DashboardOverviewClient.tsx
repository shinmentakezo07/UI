"use client";

import { motion } from "framer-motion";
import { Activity, Key, BarChart3, DollarSign, Zap, TrendingUp, ArrowRight, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

// Mock data - replace with real API calls
const mockStats = {
  totalRequests: 12847,
  totalCost: 45.32,
  creditsRemaining: 954.68,
  avgLatency: 892,
  successRate: 98.7,
  requestsPerMin: 24.5,
};

const mockRecentLogs = [
  {
    id: "1",
    timestamp: "2026-04-15T21:10:32.123Z",
    model: "gpt-4",
    provider: "OpenAI",
    cost: 0.0285,
    status: "success",
  },
  {
    id: "2",
    timestamp: "2026-04-15T21:08:15.456Z",
    model: "claude-opus-4",
    provider: "Anthropic",
    cost: 0.0156,
    status: "success",
  },
  {
    id: "3",
    timestamp: "2026-04-15T21:05:42.789Z",
    model: "gemini-2-flash",
    provider: "Google",
    cost: 0.0012,
    status: "error",
  },
];

const mockTopModels = [
  { model: "GPT-4", requests: 4523, percentage: 35 },
  { model: "Claude Opus", requests: 3821, percentage: 30 },
  { model: "Gemini Flash", requests: 2456, percentage: 19 },
];

const mockHourlyData = [
  { time: "12:00", requests: 145, latency: 850 },
  { time: "13:00", requests: 189, latency: 920 },
  { time: "14:00", requests: 234, latency: 780 },
  { time: "15:00", requests: 298, latency: 890 },
  { time: "16:00", requests: 267, latency: 850 },
  { time: "17:00", requests: 312, latency: 920 },
  { time: "18:00", requests: 289, latency: 870 },
  { time: "19:00", requests: 256, latency: 910 },
  { time: "20:00", requests: 223, latency: 880 },
  { time: "21:00", requests: 198, latency: 860 },
];

export default function DashboardOverviewClient() {
  return (
    <div className="min-h-screen pt-6 pb-12 px-4 sm:px-6 lg:px-8 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Monitor your API usage and performance</p>
        </div>

        {/* Stats Grid - Using MetricCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Requests"
            value={mockStats.totalRequests.toLocaleString()}
            change="+12.5%"
            changeType="positive"
            icon={Activity}
            iconColor="text-blue-400"
            iconBg="bg-blue-500/10"
          />
          <MetricCard
            title="Total Spent"
            value={`$${mockStats.totalCost.toFixed(2)}`}
            change="+8.3%"
            changeType="positive"
            icon={DollarSign}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10"
          />
          <MetricCard
            title="Credits Remaining"
            value={`$${mockStats.creditsRemaining.toFixed(2)}`}
            icon={DollarSign}
            iconColor="text-purple-400"
            iconBg="bg-purple-500/10"
          />
          <MetricCard
            title="Avg Latency"
            value={`${mockStats.avgLatency}ms`}
            change="-5.2%"
            changeType="positive"
            icon={Zap}
            iconColor="text-yellow-400"
            iconBg="bg-yellow-500/10"
          />
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Success Rate"
            value={`${mockStats.successRate}%`}
            change="+0.3%"
            changeType="positive"
            icon={CheckCircle}
            iconColor="text-green-400"
            iconBg="bg-green-500/10"
          />
          <MetricCard
            title="Requests/Min"
            value={mockStats.requestsPerMin.toFixed(1)}
            change="+15.2%"
            changeType="positive"
            icon={TrendingUp}
            iconColor="text-cyan-400"
            iconBg="bg-cyan-500/10"
          />
          <MetricCard
            title="Active API Keys"
            value="3"
            icon={Key}
            iconColor="text-purple-400"
            iconBg="bg-purple-500/10"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Requests Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Requests per Hour
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mockHourlyData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0A0A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRequests)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Latency Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Latency Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockHourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0A0A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={{ fill: '#eab308', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Recent Activity
              </h3>
              <Link
                href="/dashboard/logs"
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {mockRecentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{log.model}</span>
                      <span className="text-xs text-gray-500">{log.provider}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-emerald-400">
                      ${log.cost.toFixed(4)}
                    </span>
                    <StatusBadge
                      status={log.status === "success" ? "success" : "error"}
                      label={log.status}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Models */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Top Models
              </h3>
              <Link
                href="/dashboard/analytics"
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-6">
              {mockTopModels.map((model, index) => (
                <div key={model.model} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{model.model}</span>
                    <span className="text-gray-400 text-sm font-mono">{model.percentage}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${model.percentage}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    />
                  </div>
                  <span className="text-xs text-gray-500">{model.requests.toLocaleString()} requests</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Link
            href="/dashboard/keys"
            className="p-6 bg-[#0A0A0A] border border-white/10 rounded-xl hover:border-purple-500/30 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="text-white font-semibold">Manage API Keys</h3>
            </div>
            <p className="text-sm text-gray-400">Create and manage your API keys</p>
          </Link>

          <Link
            href="/dashboard/logs"
            className="p-6 bg-[#0A0A0A] border border-white/10 rounded-xl hover:border-blue-500/30 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-white font-semibold">View Request Logs</h3>
            </div>
            <p className="text-sm text-gray-400">Monitor all API requests</p>
          </Link>

          <Link
            href="/dashboard/analytics"
            className="p-6 bg-[#0A0A0A] border border-white/10 rounded-xl hover:border-emerald-500/30 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-white font-semibold">View Analytics</h3>
            </div>
            <p className="text-sm text-gray-400">Track usage and spending</p>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
