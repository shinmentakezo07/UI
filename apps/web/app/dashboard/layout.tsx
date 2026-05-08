"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Key, Activity, BarChart3, Menu, X, Home, Settings, LogOut, ChevronLeft, Zap, Cpu, Scan } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signOutAction } from "@/app/lib/auth-actions";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/logs", label: "Logs", icon: Activity },
  { href: "/dashboard/keys", label: "API Keys", icon: Key },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

function DashboardLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 group select-none">
      {/* Icon Container */}
      <div className="relative w-10 h-10 flex items-center justify-center bg-black border border-[#3b82f6]/30 rounded-lg overflow-hidden shrink-0">
        {/* Scanline */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7c3aed]/20 to-transparent h-[30%]"
          animate={{ top: ["-30%", "130%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        {/* Tech Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f610_1px,transparent_1px),linear-gradient(to_bottom,#3b82f610_1px,transparent_1px)] bg-[size:4px_4px]" />
        {/* Rotating Tech Rings */}
        <motion.div
          className="absolute inset-1 border border-[#3b82f6]/50 rounded border-t-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 border border-[#a855f7]/50 rounded border-b-transparent border-r-transparent"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        {/* Center Logo Image */}
        <div className="relative z-10">
          <Image src="/nervous-cat.jpg" alt="Yapapa Logo" width={32} height={32} className="rounded object-cover" />
        </div>
        {/* Corner accents */}
        <div className="absolute top-1 left-1 w-1.5 h-[1px] bg-[#a855f7] opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-1 right-1 w-2 h-[1px] bg-[#3b82f6] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Text Section */}
      <div className="flex flex-col relative">
        <div className="relative">
          <h1
            className="text-xl font-black tracking-tighter text-white uppercase italic leading-none"
            style={{ textShadow: "2px 2px 0px rgba(59, 130, 246, 0.3)" }}
          >
            YAPAPA
          </h1>
          {/* Glitch Layers on hover */}
          <motion.h1
            className="absolute top-0 left-0 text-xl font-black tracking-tighter text-[#a855f7] opacity-0 group-hover:opacity-70 mix-blend-screen uppercase italic leading-none"
            animate={{ x: [-2, 2, -1, 0], y: [1, -1, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 0.5 }}
          >
            YAPAPA
          </motion.h1>
          <motion.h1
            className="absolute top-0 left-0 text-xl font-black tracking-tighter text-[#3b82f6] opacity-0 group-hover:opacity-70 mix-blend-screen uppercase italic leading-none"
            animate={{ x: [2, -2, 1, 0], y: [-1, 1, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 0.3 }}
          >
            YAPAPA
          </motion.h1>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="h-1 w-1 bg-[#3b82f6] rounded-sm animate-pulse" />
          <div className="h-[1px] w-8 bg-gradient-to-r from-[#3b82f6] via-[#7c3aed] to-transparent" />
          <span className="text-[9px] font-mono text-[#7c3aed] tracking-widest uppercase">
            Netrunner
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#000000] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#0A0A0A] border-r border-white/10">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/10">
          <DashboardLogo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "text-white bg-primary/10 border border-primary/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button
            onClick={() => signOutAction()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Sidebar Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring" as const, damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 bg-[#0A0A0A] border-r border-white/10 z-50 flex flex-col"
            >
              {/* Logo */}
              <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
                <DashboardLogo />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "text-white bg-primary/10 border border-primary/20"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom Actions */}
              <div className="p-4 border-t border-white/10 space-y-2">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>
                <button
                  onClick={() => signOutAction()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 h-16 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/10 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-4 flex items-center gap-2">
            <div className="relative w-7 h-7 flex items-center justify-center bg-black border border-[#3b82f6]/30 rounded overflow-hidden shrink-0">
              <Image src="/nervous-cat.jpg" alt="Yapapa Logo" width={24} height={24} className="rounded object-cover" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Dashboard</span>
          </div>
        </div>

        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
