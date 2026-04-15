"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, DollarSign, Zap, Activity, Calendar } from "lucide-react";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { MetricCard } from "@/components/dashboard/MetricCard";

// Mock data - replace with real API calls
const mockStats = {
  totalRequests: 12847,
  totalCost: 45.32,
  avgLatency: 892,
  successRate: 98.7,
};

const mockUsageByModel = [
  { model: "GPT-4", requests: 4523, cost: 18.45, percentage: 35, fill: "#8b5cf6" },
  { model: "Claude Opus", requests: 3821, cost: 15.23, percentage: 30, fill: "#ec4899" },
  { model: "Gemini Flash", requests: 2456, cost: 2.89, percentage: 19, fill: "#3b82f6" },
  { model: "Llama 3.3", requests: 2047, cost: 8.75, percentage: 16, fill: "#10b981" },
];

const mockDailyUsage = [
  { date: "Apr 09", requests: 1234, cost: 4.56, latency: 920 },
  { date: "Apr 10", requests: 1456, cost: 5.23, latency: 880 },
  { date: "Apr 11", requests: 1678, cost: 6.12, latency: 850 },
  { date: "Apr 12", requests: 1890, cost: 6.89, latency: 910 },
  { date: "Apr 13", requests: 2123, cost: 7.45, latency: 870 },
  { date: "Apr 14", requests: 2345, cost: 8.34, latency: 890 },
  { date: "Apr 15", requests: 2121, cost: 6.73, latency: 860 },
];

const mockHourlyRequests = [
  { hour: "00:00", requests: 145 },
  { hour: "03:00", requests: 89 },
  { hour: "06:00", requests: 234 },
  { hour: "09:00", requests: 456 },
  { hour: "12:00", requests: 678 },
  { hour: "15:00", requests: 789 },
  { hour: "18:00", requests: 567 },
  { hour: "21:00", requests: 345 },
];

export default function AnalyticsClient() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  const maxRequests = Math.max(...mockDailyUsage.map((d) => d.requests));

  return (
    <div className="min-h-screen pt-6 pb-12 px-4 sm:px-6 lg:px-8 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-white">Analytics</h1>
            </div>
            <p className="text-gray-400">Track your API usage and spending</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === "7d"
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-[#0A0A0A] text-gray-400 border border-white/10 hover:text-white"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === "30d"
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-[#0A0A0A] text-gray-400 border border-white/10 hover:text-white"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange("90d")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === "90d"
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-[#0A0A0A] text-gray-400 border border-white/10 hover:text-white"
              }`}
            >
              90 Days
            </button>
          </div>
        </div>

        {/* Stats Grid */}
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
            title="Avg Latency"
            value={`${mockStats.avgLatency}ms`}
            change="-5.2%"
            changeType="positive"
            icon={Zap}
            iconColor="text-yellow-400"
            iconBg="bg-yellow-500/10"
          />
          <MetricCard
            title="Success Rate"
            value={`${mockStats.successRate}%`}
            change="+0.3%"
            changeType="positive"
            icon={TrendingUp}
            iconColor="text-green-400"
            iconBg="bg-green-500/10"
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Requests & Cost */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Daily Requests & Cost
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockDailyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="left" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0A0A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="requests" fill="#3b82f6" name="Requests" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="cost" fill="#10b981" name="Cost ($)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Model Usage Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Usage by Model
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockUsageByModel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.model} ${entry.percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="requests"
                >
                  {mockUsageByModel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0A0A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hourly Request Pattern */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Hourly Request Pattern
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={mockHourlyRequests}>
                <defs>
                  <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="hour" stroke="#6b7280" style={{ fontSize: '12px' }} />
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
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorHourly)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Latency Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Latency Trend (7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockDailyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
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
                  strokeWidth={3}
                  dot={{ fill: '#eab308', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Model Breakdown Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-[#0A0A0A] border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-6">Model Performance Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-mono font-bold text-gray-400 uppercase">Model</th>
                  <th className="px-6 py-4 text-left text-xs font-mono font-bold text-gray-400 uppercase">Requests</th>
                  <th className="px-6 py-4 text-left text-xs font-mono font-bold text-gray-400 uppercase">Cost</th>
                  <th className="px-6 py-4 text-left text-xs font-mono font-bold text-gray-400 uppercase">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockUsageByModel.map((model, index) => (
                  <motion.tr
                    key={model.model}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: model.fill }} />
                        <span className="text-white font-medium">{model.model}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-mono">{model.requests.toLocaleString()}</td>
                    <td className="px-6 py-4 text-emerald-400 font-mono">${model.cost.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden max-w-[200px]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${model.percentage}%`, backgroundColor: model.fill }}
                          />
                        </div>
                        <span className="text-gray-400 text-sm font-mono">{model.percentage}%</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
