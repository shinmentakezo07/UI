"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ArrowLeft,
  Zap,
  DollarSign,
  Clock,
  Database,
  Code,
  Info,
  Sparkles,
  Star,
  Activity,
  Brain,
  Cpu,
  CheckCircle,
  Copy,
  ExternalLink,
  Layers,
  TrendingUp,
  Terminal,
} from "lucide-react";
import openRouterModels from "../openrouter-models-2026.json";
import { getProviderLogo } from "@/lib/provider-logos";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassHeader, GlassTitle, GlassContent } from "@/components/ui/glass-card";

// ─────────────────────────────────────────────────────────────────────────────
// Provider theming
// ─────────────────────────────────────────────────────────────────────────────
const providerConfig: Record<string, { icon: any; color: string; gradient: string; neon: string }> = {
  openai: { icon: Sparkles, color: "text-emerald-400", gradient: "from-emerald-500/20 to-green-500/20", neon: "#34d399" },
  anthropic: { icon: Zap, color: "text-orange-400", gradient: "from-orange-500/20 to-amber-500/20", neon: "#fb923c" },
  google: { icon: Star, color: "text-blue-400", gradient: "from-blue-500/20 to-cyan-500/20", neon: "#60a5fa" },
  moonshotai: { icon: Brain, color: "text-purple-400", gradient: "from-purple-500/20 to-pink-500/20", neon: "#c084fc" },
  zhipu: { icon: Activity, color: "text-cyan-400", gradient: "from-cyan-500/20 to-teal-500/20", neon: "#22d3ee" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Background
// ─────────────────────────────────────────────────────────────────────────────
function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
      {/* Ambient blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-[#00ff9d]/5 rounded-full blur-[120px] animate-pulse-slow delay-500" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)]" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UI Primitives
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label, gradient = "from-blue-500/20 to-transparent" }: { icon: any; label: string; gradient?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} border border-white/10 text-white`}>
        <Icon className="w-4 h-4" />
      </div>
      <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">{label}</h2>
    </div>
  );
}

function DetailCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors shadow-lg ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function GradientBorderCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`group relative p-[1px] rounded-2xl bg-gradient-to-b from-white/10 to-white/5 hover:from-blue-500/50 hover:to-purple-500/50 transition-all duration-300 ${className}`}>
      <div className="relative h-full bg-[#0e0e0e] rounded-[15px] p-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

function StatValue({ value, label, colorClass = "text-white", suffix = "" }: { value: string | number; label: string; colorClass?: string; suffix?: string }) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-br from-white/5 to-transparent rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1">{label}</div>
        <div className={`text-2xl font-bold font-mono ${colorClass}`}>{value}<span className="text-sm text-gray-500 ml-1">{suffix}</span></div>
      </div>
    </div>
  );
}

function Tag({ children, color = "primary" }: { children: React.ReactNode; color?: "primary" | "cyan" | "purple" | "emerald" | "amber" }) {
  const map: Record<string, string> = {
    primary: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  };
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-medium backdrop-blur-sm ${map[color]}`}>
      {children}
    </span>
  );
}

function StatusPing({ color = "green" }: { color?: "green" | "blue" | "amber" }) {
  const cls = color === "green" ? "bg-green-400" : color === "blue" ? "bg-blue-400" : "bg-amber-400";
  return (
    <span className="relative flex h-2 w-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cls} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${cls.replace("bg-", "bg-")}`} />
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ModelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const modelId = decodeURIComponent(params.id as string);
  const [copied, setCopied] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const model = openRouterModels.find((m: any) => m.id === modelId);

  const providerId = model ? model.id.split("/")[0].toLowerCase() : "";
  const config = providerConfig[providerId] || { icon: Cpu, color: "text-gray-400", gradient: "from-gray-500/20 to-gray-500/20", neon: "#9ca3af" };
  const Icon = config.icon;
  const logo = model ? getProviderLogo(model.id) : null;

  useGSAP(
    () => {
      if (!heroRef.current) return;
      gsap.fromTo(
        ".gsap-hero-item",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" }
      );
    },
    { scope: heroRef }
  );

  const copyModelId = () => {
    if (!model) return;
    navigator.clipboard.writeText(model.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!model) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center relative overflow-hidden">
        <AmbientBackground />
        <div className="text-center relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6"
          >
            <Info className="w-12 h-12 text-gray-500" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4">Model Not Found</h1>
          <p className="text-gray-400 mb-8">The model you&apos;re looking for doesn&apos;t exist.</p>
          <Button variant="primary" size="lg" onClick={() => router.push("/models")}>
            Back to Models
          </Button>
        </div>
      </div>
    );
  }

  const inputPrice = model.pricing?.prompt ? (parseFloat(model.pricing.prompt) * 1000000).toFixed(2) : "0.00";
  const outputPrice = model.pricing?.completion ? (parseFloat(model.pricing.completion) * 1000000).toFixed(2) : "0.00";
  const contextTokens = model.context_length ? `${(model.context_length / 1000).toFixed(0)}K` : "N/A";
  const maxOut = model.top_provider?.max_completion_tokens ? `${(model.top_provider.max_completion_tokens / 1000).toFixed(0)}K` : "N/A";
  const modality = model.architecture?.modality || "Text";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <AmbientBackground />

      {/* HUD corners */}
      <div className="absolute top-24 left-10 w-16 h-16 border-l-2 border-t-2 border-white/10 rounded-tl-2xl pointer-events-none z-10 hidden lg:block" />
      <div className="absolute top-24 right-10 w-16 h-16 border-r-2 border-t-2 border-white/10 rounded-tr-2xl pointer-events-none z-10 hidden lg:block" />

      <div className="relative z-10 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/models")}
              className="group border-white/10 hover:border-[#00ff9d]/50 hover:text-[#00ff9d] hover:bg-[#00ff9d]/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-mono text-xs font-bold">Back to Models</span>
            </Button>
          </motion.div>

          {/* Hero */}
          <div ref={heroRef} className="mb-10">
            <GradientBorderCard className="gsap-hero-item">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Logo */}
                <div className="relative w-20 h-20 rounded-xl shrink-0">
                  <div className="absolute inset-0 rounded-xl opacity-50 blur-lg" style={{ backgroundColor: config.neon }} />
                  {logo ? (
                    <div className="relative w-full h-full rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-4 shadow-xl backdrop-blur-sm">
                      <Image src={logo} alt={`${model.name} logo`} width={48} height={48} className="object-contain" unoptimized />
                    </div>
                  ) : (
                    <div className={`relative w-full h-full rounded-xl bg-white/10 border border-white/20 flex items-center justify-center ${config.color} shadow-xl`}>
                      <Icon className="w-10 h-10" />
                    </div>
                  )}
                </div>

                {/* Title & Meta */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight leading-tight gsap-hero-item">
                    {model.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 mb-5 gsap-hero-item">
                    <button
                      onClick={copyModelId}
                      className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00ff9d]/10 to-cyan-500/10 border border-[#00ff9d]/30 hover:border-[#00ff9d]/60 text-[#00ff9d] font-mono font-bold text-xs shadow-[0_0_10px_rgba(0,255,157,0.1)] hover:shadow-[0_0_20px_rgba(0,255,157,0.2)] transition-all hover:scale-105"
                    >
                      <span className="truncate max-w-[200px]">{model.id}</span>
                      {copied ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />}
                    </button>

                    {model.context_length && (
                      <Tag color="cyan">
                        <Database className="w-3 h-3" />
                        {contextTokens}
                      </Tag>
                    )}

                    {model.created_date && (
                      <Tag color="amber">
                        <Sparkles className="w-3 h-3" />
                        {model.created_date}
                      </Tag>
                    )}

                    <Tag color="emerald">
                      <StatusPing color="green" />
                      <span>ACTIVE</span>
                    </Tag>
                  </div>

                  {/* Quick stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 gsap-hero-item">
                    <div className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-[10px] text-gray-400 font-mono mb-0.5 uppercase">Input</div>
                      <div className="text-base font-bold text-emerald-400 font-mono">${inputPrice}</div>
                      <div className="text-[9px] text-gray-500 font-mono">per 1M</div>
                    </div>
                    <div className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-[10px] text-gray-400 font-mono mb-0.5 uppercase">Output</div>
                      <div className="text-base font-bold text-cyan-400 font-mono">${outputPrice}</div>
                      <div className="text-[9px] text-gray-500 font-mono">per 1M</div>
                    </div>
                    <div className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-[10px] text-gray-400 font-mono mb-0.5 uppercase">Max Out</div>
                      <div className="text-base font-bold text-white font-mono">{maxOut}</div>
                      <div className="text-[9px] text-gray-500 font-mono">tokens</div>
                    </div>
                    <div className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-[10px] text-gray-400 font-mono mb-0.5 uppercase">Type</div>
                      <div className="text-base font-bold text-white font-mono">{modality}</div>
                    </div>
                  </div>
                </div>
              </div>
            </GradientBorderCard>
          </div>

          {/* Main Grid */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              {model.description && (
                <motion.div variants={itemVariants}>
                  <DetailCard>
                    <SectionHeader icon={Info} label="About" gradient="from-[#00ff9d]/20 to-transparent" />
                    <p className="text-gray-300 leading-relaxed text-sm">{model.description}</p>
                  </DetailCard>
                </motion.div>
              )}

              {/* Capabilities */}
              <motion.div variants={itemVariants}>
                <SectionHeader icon={Layers} label="Capabilities" gradient="from-cyan-500/20 to-transparent" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <motion.div whileHover={{ y: -4 }} className="cursor-default">
                    <GlassCard className="h-full border-white/5 hover:border-cyan-500/30 transition-colors">
                      <GlassHeader className="pb-4">
                        <GlassTitle className="text-xs font-mono uppercase tracking-wider text-gray-400">Context</GlassTitle>
                      </GlassHeader>
                      <GlassContent>
                        <div className="text-3xl font-bold text-white font-mono">{contextTokens}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-1">tokens</div>
                        <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: model.context_length ? `${Math.min((model.context_length / 1000000) * 100, 100)}%` : "0%" }} />
                        </div>
                      </GlassContent>
                    </GlassCard>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="cursor-default">
                    <GlassCard className="h-full border-white/5 hover:border-blue-500/30 transition-colors">
                      <GlassHeader className="pb-4">
                        <GlassTitle className="text-xs font-mono uppercase tracking-wider text-gray-400">Max Output</GlassTitle>
                      </GlassHeader>
                      <GlassContent>
                        <div className="text-3xl font-bold text-white font-mono">{maxOut}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-1">tokens</div>
                        <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: model.top_provider?.max_completion_tokens ? `${Math.min((model.top_provider.max_completion_tokens / 100000) * 100, 100)}%` : "0%" }} />
                        </div>
                      </GlassContent>
                    </GlassCard>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="cursor-default">
                    <GlassCard className="h-full border-white/5 hover:border-purple-500/30 transition-colors">
                      <GlassHeader className="pb-4">
                        <GlassTitle className="text-xs font-mono uppercase tracking-wider text-gray-400">Type</GlassTitle>
                      </GlassHeader>
                      <GlassContent>
                        <div className="text-2xl font-bold text-white font-mono">{modality}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-1">modality</div>
                      </GlassContent>
                    </GlassCard>
                  </motion.div>
                </div>
              </motion.div>

              {/* Architecture */}
              {model.architecture && (
                <motion.div variants={itemVariants}>
                  <DetailCard>
                    <SectionHeader icon={Cpu} label="Architecture" gradient="from-purple-500/20 to-transparent" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {model.architecture.input_modalities && (
                        <div>
                          <div className="text-[10px] text-gray-400 font-mono mb-3 uppercase tracking-wider">Input Modalities</div>
                          <div className="flex flex-wrap gap-2">
                            {model.architecture.input_modalities.map((mod: string) => (
                              <span
                                key={mod}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00ff9d]/10 to-cyan-500/10 border border-[#00ff9d]/30 hover:border-[#00ff9d]/60 text-[#00ff9d] font-mono text-xs font-bold shadow-[0_0_10px_rgba(0,255,157,0.1)] transition-all hover:scale-105"
                              >
                                {mod}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {model.architecture.output_modalities && (
                        <div>
                          <div className="text-[10px] text-gray-400 font-mono mb-3 uppercase tracking-wider">Output Modalities</div>
                          <div className="flex flex-wrap gap-2">
                            {model.architecture.output_modalities.map((mod: string) => (
                              <span
                                key={mod}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400 font-mono text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.1)] transition-all hover:scale-105"
                              >
                                {mod}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {model.architecture.tokenizer && (
                        <div>
                          <div className="text-[10px] text-gray-400 font-mono mb-3 uppercase tracking-wider">Tokenizer</div>
                          <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/30 hover:border-white/50 text-white font-mono text-xs font-bold inline-block transition-all hover:scale-105">
                            {model.architecture.tokenizer}
                          </span>
                        </div>
                      )}
                    </div>
                  </DetailCard>
                </motion.div>
              )}

              {/* Parameters */}
              {model.supported_parameters && model.supported_parameters.length > 0 && (
                <motion.div variants={itemVariants}>
                  <DetailCard>
                    <SectionHeader icon={Code} label="Parameters" gradient="from-emerald-500/20 to-transparent" />
                    <div className="flex flex-wrap gap-2">
                      {model.supported_parameters.map((param: string) => (
                        <motion.span
                          key={param}
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-2 rounded-lg bg-white/10 border border-white/30 hover:border-[#00ff9d]/50 hover:bg-white/20 text-gray-200 hover:text-white font-mono text-xs transition-all cursor-default shadow-lg"
                        >
                          {param}
                        </motion.span>
                      ))}
                    </div>
                  </DetailCard>
                </motion.div>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-8">
              {/* Pricing */}
              <motion.div variants={itemVariants}>
                <GlassCard className="border-white/5">
                  <GlassHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <GlassTitle className="text-sm font-mono uppercase tracking-wider">Pricing</GlassTitle>
                    </div>
                  </GlassHeader>
                  <GlassContent className="space-y-4">
                    <StatValue value={`$${inputPrice}`} label="Input" colorClass="text-emerald-400" />
                    <StatValue value={`$${outputPrice}`} label="Output" colorClass="text-cyan-400" />
                    {model.pricing?.input_cache_read && (
                      <StatValue value={`$${(parseFloat(model.pricing.input_cache_read) * 1000000).toFixed(2)}`} label="Cache Read" colorClass="text-blue-400" />
                    )}
                    {model.pricing?.input_cache_write && (
                      <StatValue value={`$${(parseFloat(model.pricing.input_cache_write) * 1000000).toFixed(2)}`} label="Cache Write" colorClass="text-purple-400" />
                    )}
                  </GlassContent>
                </GlassCard>
              </motion.div>

              {/* Knowledge Cutoff */}
              {model.knowledge_cutoff && (
                <motion.div variants={itemVariants}>
                  <GlassCard className="border-white/5">
                    <GlassHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                          <Clock className="w-4 h-4" />
                        </div>
                        <GlassTitle className="text-sm font-mono uppercase tracking-wider">Knowledge Cutoff</GlassTitle>
                      </div>
                    </GlassHeader>
                    <GlassContent>
                      <p className="text-white font-mono text-lg">{model.knowledge_cutoff}</p>
                    </GlassContent>
                  </GlassCard>
                </motion.div>
              )}

              {/* CTA */}
              <motion.div variants={itemVariants}>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00ff9d]/30 to-cyan-500/30 rounded-2xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
                  <div className="relative p-6 rounded-2xl bg-[#0A0A0A] border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Terminal className="w-4 h-4 text-[#00ff9d]" />
                      <span className="text-sm font-mono font-bold text-white uppercase tracking-wider">Quick Start</span>
                    </div>
                    <p className="text-gray-400 text-xs mb-4">Get your API key and start building in minutes with OpenRouter.</p>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => window.open("https://openrouter.ai/keys", "_blank")}
                    >
                      Start Using {model.name.split(":")[0]}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
