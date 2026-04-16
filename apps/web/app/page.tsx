"use client";

import { motion } from "framer-motion";
import {
    Terminal, Activity, UserPlus, Search, TrendingUp,
    Globe, Zap, Award, Code2, Check, Star, Crown, Shield, Sparkles, ArrowRight
} from "lucide-react";
import { Hero } from "../components/Hero";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { getProviderLogo } from "@/lib/provider-logos";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  }
};

const creditPackages = [
    {
        name: "Starter",
        amount: "$10",
        credits: "10,000",
        creditsDisplay: "10K Credits",
        bonus: "",
        description: "Perfect for testing and small projects.",
        features: [
            "~1M tokens (varies by model)",
            "Access to 100+ models",
            "Pay only for what you use",
            "Credits never expire"
        ],
        icon: Code2,
        color: "text-blue-400",
        cta: "Add $10 Credits",
        popular: false,
        gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
        name: "Popular",
        amount: "$50",
        credits: "55,000",
        creditsDisplay: "55K Credits",
        bonus: "+10% Bonus",
        description: "Best value for growing applications.",
        features: [
            "~5.5M tokens (varies by model)",
            "Access to 100+ models",
            "10% bonus credits included",
            "Priority email support",
            "Real-time analytics",
            "Credits never expire"
        ],
        icon: Crown,
        color: "text-yellow-400",
        cta: "Add $50 Credits",
        popular: true,
        gradient: "from-yellow-500/20 to-orange-500/20"
    },
    {
        name: "Pro",
        amount: "$100",
        credits: "120,000",
        creditsDisplay: "120K Credits",
        bonus: "+20% Bonus",
        description: "For production applications at scale.",
        features: [
            "~12M tokens (varies by model)",
            "Access to 100+ models",
            "20% bonus credits included",
            "Priority support",
            "Advanced analytics",
            "Custom rate limits",
            "Credits never expire"
        ],
        icon: Shield,
        color: "text-purple-400",
        cta: "Add $100 Credits",
        popular: false,
        gradient: "from-purple-500/20 to-pink-500/20"
    }
];

const featuredModels = [
    {
        id: "openai/gpt-5.4",
        name: "GPT-5.4",
        provider: "OpenAI",
        inputPrice: "$0.015",
        outputPrice: "$0.045",
        context: "256K",
        icon: Sparkles,
        color: "text-green-400",
        logo: getProviderLogo("openai/gpt-5.4")
    },
    {
        id: "anthropic/claude-opus-4.6-fast",
        name: "Claude Opus 4.6 Fast",
        provider: "Anthropic",
        inputPrice: "$0.008",
        outputPrice: "$0.024",
        context: "200K",
        icon: Zap,
        color: "text-orange-400",
        logo: getProviderLogo("anthropic/claude-opus-4.6-fast")
    },
    {
        id: "google/gemini-3-flash-preview",
        name: "Gemini 3 Flash Preview",
        provider: "Google",
        inputPrice: "$0.0002",
        outputPrice: "$0.0008",
        context: "2M",
        icon: Star,
        color: "text-blue-400",
        logo: getProviderLogo("google/gemini-3-flash-preview")
    },
    {
        id: "moonshotai/kimi-k2.5",
        name: "Kimi K2.5",
        provider: "Moonshot AI",
        inputPrice: "$0.0003",
        outputPrice: "$0.0009",
        context: "256K",
        icon: Activity,
        color: "text-purple-400",
        logo: getProviderLogo("moonshotai/kimi-k2.5")
    }
];

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full overflow-hidden bg-[#000000] text-foreground selection:bg-primary/30 selection:text-white">
      
      {/* --- HERO SECTION --- */}
      <Hero />

      {/* --- FEATURES SECTION --- */}
      <section className="w-full py-32 px-4 relative z-20 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-5xl bg-primary/5 rounded-full blur-[120px] -z-10" />
          
          <div className="max-w-7xl mx-auto">
             <div className="mb-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-block mb-4 px-4 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono font-bold tracking-widest uppercase"
                >
                    Gateway Features
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight"
                >
                    One API, Every Model
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground text-lg max-w-2xl mx-auto"
                >
                    Route requests to GPT-4, Claude, Gemini, Llama, and 100+ models through a single unified interface.
                </motion.p>
             </div>

             <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
             >
                {/* API Gateway Card */}
                <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 row-span-2 glass-card rounded-[32px] p-1 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="h-full bg-[#0A0A0A] rounded-[28px] p-8 flex flex-col justify-between border border-white/5 relative z-10">
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 text-primary ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-500">
                                <Terminal className="w-7 h-7" />
                            </div>
                            <h3 className="text-3xl font-bold mb-3 text-white">Unified API</h3>
                            <p className="text-muted-foreground text-lg">One endpoint for all models. Switch between GPT-4, Claude, Gemini instantly without code changes.</p>
                        </div>
                        <div className="w-full mt-8 rounded-xl bg-black border border-white/10 p-5 font-mono text-sm text-green-400 shadow-2xl">
                            <div className="flex gap-2 mb-4 opacity-50">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="space-y-2">
                                <p className="flex"><span className="text-blue-400 mr-2">$</span> curl https://api.shinmen-takzo.ai/v1/chat</p>
                                <p className="text-gray-500">Routing to optimal model...</p>
                                <p className="text-green-400">✓ Response from claude-opus-4</p>
                                <p className="animate-pulse flex"><span className="text-blue-400 mr-2">$</span> _</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Card */}
                <motion.div variants={itemVariants} className="col-span-1 row-span-2 glass-card rounded-[32px] p-1 group">
                     <div className="h-full bg-[#0A0A0A] rounded-[28px] p-8 flex flex-col justify-between border border-white/5 relative z-10 overflow-hidden">
                        <div className="relative z-20">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 ring-1 ring-blue-500/20">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Real-time Analytics</h3>
                            <p className="text-muted-foreground text-sm">Monitor usage, costs, and latency.</p>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-48">
                             <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style={{stopColor:'rgb(59, 130, 246)', stopOpacity:0.2}} />
                                        <stop offset="100%" style={{stopColor:'rgb(59, 130, 246)', stopOpacity:0}} />
                                    </linearGradient>
                                </defs>
                                <path d="M0 100 C 20 80, 40 90, 60 60 S 80 20, 100 10 V 100 Z" fill="url(#grad1)" />
                                <path d="M0 100 C 20 80, 40 90, 60 60 S 80 20, 100 10" fill="none" stroke="#3b82f6" strokeWidth="2" className="drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            </svg>
                        </div>
                     </div>
                </motion.div>

                {/* Feature Cards */}
                <motion.div variants={itemVariants} className="col-span-1 glass-card rounded-[32px] p-8 flex flex-col justify-center hover:-translate-y-1 transition-transform bg-[#0A0A0A] border border-white/5">
                    <Globe className="w-10 h-10 mb-6 text-purple-500" />
                    <h3 className="text-xl font-bold mb-2">Global Edge Network</h3>
                    <p className="text-sm text-muted-foreground">Low-latency access from 50+ regions worldwide.</p>
                </motion.div>

                <motion.div variants={itemVariants} className="col-span-1 glass-card rounded-[32px] p-8 flex flex-col justify-center hover:-translate-y-1 transition-transform bg-[#0A0A0A] border border-white/5">
                    <Zap className="w-10 h-10 mb-6 text-yellow-500" />
                    <h3 className="text-xl font-bold mb-2">Smart Routing</h3>
                    <p className="text-sm text-muted-foreground">Auto-route to fastest, cheapest, or best model.</p>
                </motion.div>

                 <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 glass-card rounded-[32px] p-8 flex items-center justify-between relative overflow-hidden group bg-[#0A0A0A] border border-white/5">
                    <div className="relative z-10 max-w-xs">
                        <h3 className="text-2xl font-bold mb-3">Transparent Pricing</h3>
                        <p className="text-muted-foreground">See exact per-token costs for every model. No hidden fees, no surprises.</p>
                    </div>
                    <div className="relative z-10 p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                        <Award className="w-12 h-12 text-emerald-500" />
                    </div>
                    <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full group-hover:bg-emerald-500/10 transition-colors" />
                </motion.div>
             </motion.div>
          </div>
      </section>

      {/* Integration Workflow Section */}
      <section className="w-full py-24 px-4 relative z-20">
        <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center">
                <h2 className="text-3xl md:text-5xl font-mono font-bold mb-6 text-white">Integration Flow</h2>
                <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-8">
                    Get started in minutes. Sign up, grab your API key, and start routing requests to 100+ models through one unified endpoint.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />

                {[
                    {
                        step: "01",
                        title: "Sign Up",
                        desc: "Create account in 30 seconds",
                        icon: UserPlus,
                        color: "text-purple-400",
                        bg: "bg-purple-500/10",
                        border: "border-purple-500/20"
                    },
                    {
                        step: "02",
                        title: "Get API Key",
                        desc: "Generate your credentials",
                        icon: Search,
                        color: "text-blue-400",
                        bg: "bg-blue-500/10",
                        border: "border-blue-500/20"
                    },
                    {
                        step: "03",
                        title: "Integrate",
                        desc: "Drop-in OpenAI replacement",
                        icon: Code2,
                        color: "text-green-400",
                        bg: "bg-green-500/10",
                        border: "border-green-500/20"
                    },
                    {
                        step: "04",
                        title: "Scale",
                        desc: "Monitor usage & optimize costs",
                        icon: TrendingUp,
                        color: "text-yellow-400",
                        bg: "bg-yellow-500/10",
                        border: "border-yellow-500/20"
                    }
                ].map((item, i) => (
                    <motion.div
                        key={item.step}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center text-center group"
                    >
                        <div className="relative mb-6">
                            <div className={`w-24 h-24 rounded-[2rem] ${item.bg} border ${item.border} flex items-center justify-center relative z-10 group-hover:scale-110 transition-all duration-300 shadow-2xl`}>
                                <item.icon className={`w-10 h-10 ${item.color}`} />
                            </div>
                            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-white font-mono font-bold text-xs border border-white/10 z-20 shadow-lg">
                                {item.step}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-primary transition-colors">{item.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed px-4">
                            {item.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* Model Showcase Section */}
      <section className="w-full py-32 px-4 relative z-20 bg-[#000000] overflow-hidden">
        {/* Enhanced Background */}
        <div className="absolute inset-0 -z-10">
            {/* Radial Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }} />

            {/* Moving Grid */}
            <div className="absolute inset-0 perspective-1000">
                <motion.div
                    animate={{ backgroundPosition: ["0px 0px", "0px 40px"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-grid-white opacity-[0.03] transform-gpu rotate-x-12 scale-150 origin-top"
                />
            </div>

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)]" />
        </div>

        <div className="max-w-7xl mx-auto">
            <div className="mb-24 text-center relative">
                {/* Decorative Elements */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 text-emerald-400 text-xs font-mono font-bold tracking-[0.2em] uppercase mb-10 backdrop-blur-md shadow-lg shadow-emerald-500/10"
                >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Transparent Pricing
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black mb-10 text-white tracking-tighter leading-[0.85]"
                >
                    <span className="block mb-4">Pay Per Token,</span>
                    <span className="block relative inline-block">
                        Not Per{" "}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-x">
                                Month
                            </span>
                            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400/0 via-emerald-400/60 to-emerald-400/0" />
                        </span>
                    </span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto font-light leading-relaxed"
                >
                    Access 100+ models with{" "}
                    <span className="text-emerald-400 font-bold relative">
                        transparent, per-token pricing
                        <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent block" />
                    </span>.
                    <br className="hidden md:block" />
                    No subscriptions, no hidden fees.{" "}
                    <span className="text-white font-semibold">Pay only for what you use</span>.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredModels.map((model, i) => (
                    <motion.div
                        key={model.name}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="relative group cursor-pointer"
                    >
                        {/* Glow Effect */}
                        <div className={`absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500 bg-gradient-to-br ${
                            model.color === 'text-green-400' ? 'from-green-500/20 to-emerald-500/20' :
                            model.color === 'text-orange-400' ? 'from-orange-500/20 to-amber-500/20' :
                            model.color === 'text-blue-400' ? 'from-blue-500/20 to-cyan-500/20' :
                            'from-purple-500/20 to-pink-500/20'
                        }`} />

                        {/* Card Container */}
                        <div className="relative flex flex-col h-full p-1 rounded-2xl bg-gradient-to-br from-white/10 to-white/5">
                            {/* Top Accent Line */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary to-transparent blur-sm" />

                            <div className="h-full bg-[#0A0A0A] rounded-xl p-6 flex flex-col relative overflow-hidden border border-white/10 group-hover:border-primary/30 transition-all">
                                {/* Animated Grid Pattern */}
                                <motion.div
                                    className="absolute inset-0 opacity-10"
                                    animate={{
                                        backgroundPosition: ['0% 0%', '100% 100%'],
                                    }}
                                    transition={{
                                        duration: 20,
                                        repeat: Infinity,
                                        repeatType: "reverse"
                                    }}
                                    style={{
                                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                                        backgroundSize: '20px 20px'
                                    }}
                                />

                                <div className="relative z-10">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="relative w-14 h-14 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            {model.logo ? (
                                                <>
                                                    {/* Subtle shadow effect */}
                                                    <div className="absolute inset-0 rounded-xl bg-white/5 blur-md" />
                                                    <div className="relative w-full h-full rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-2.5 shadow-xl backdrop-blur-sm">
                                                        <Image
                                                            src={model.logo}
                                                            alt={`${model.provider} logo`}
                                                            width={32}
                                                            height={32}
                                                            className="object-contain"
                                                            unoptimized
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="absolute inset-0 rounded-xl bg-white/5 blur-md" />
                                                    <div className={`relative w-full h-full rounded-xl bg-white/10 border border-white/20 flex items-center justify-center ${model.color} shadow-xl`}>
                                                        <model.icon className="w-7 h-7" />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider px-2 py-1 bg-white/5 rounded border border-white/10">
                                                {model.context}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Model Info */}
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
                                        {model.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <p className="text-xs text-gray-400 font-mono">{model.provider}</p>
                                    </div>

                                    {/* Pricing with Glowing Dots */}
                                    <div className="space-y-3 pt-4 border-t border-white/10 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                                                <span className="text-sm text-gray-400 font-mono">Input</span>
                                            </div>
                                            <span className="text-emerald-400 font-mono font-bold text-sm">{model.inputPrice}/1K</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
                                                <span className="text-sm text-gray-400 font-mono">Output</span>
                                            </div>
                                            <span className="text-cyan-400 font-mono font-bold text-sm">{model.outputPrice}/1K</span>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        className="relative w-full py-3 font-mono text-sm font-bold tracking-wider transition-all overflow-hidden group/btn text-white mt-auto rounded-lg"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 group-hover/btn:from-primary/20 group-hover/btn:to-cyan-500/20 border border-white/20 group-hover/btn:border-primary/50 transition-all duration-300 rounded-lg" />
                                        <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-30 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            View Details <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-20 text-center"
            >
                <p className="text-gray-400 mb-10 text-lg font-light">
                    And <span className="text-emerald-400 font-bold">96+ more models</span> from OpenAI, Anthropic, Google, Meta, Mistral, and more
                </p>
                <Link href="/models">
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative px-10 py-5 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 hover:from-emerald-500/20 hover:to-cyan-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-2xl text-white font-mono text-sm font-bold transition-all group overflow-hidden shadow-lg shadow-emerald-500/10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative z-10 flex items-center gap-3">
                            View All Models
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </span>
                    </motion.button>
                </Link>
            </motion.div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="w-full py-32 px-4 relative z-20 bg-[#050505] overflow-hidden">
           {/* Subtle Background - Hero Style */}
           <div className="absolute inset-0 -z-10 overflow-hidden">
               {/* Moving Grid */}
               <div className="absolute inset-0 perspective-1000">
                   <motion.div
                       animate={{ backgroundPosition: ["0px 0px", "0px 40px"] }}
                       transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                       className="absolute inset-0 bg-grid-white opacity-[0.08] transform-gpu rotate-x-12 scale-150 origin-top"
                   />
               </div>

               {/* Vignette */}
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)]" />
           </div>

           <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-violet-500/5 border border-violet-500/20 backdrop-blur-sm mb-8"
                    >
                        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-violet-500/20 text-violet-400 text-[10px] font-mono font-bold">
                            <Crown className="w-3 h-3" />
                            CREDITS
                        </div>
                        <span className="text-xs font-mono text-gray-400 tracking-wide uppercase">
                            Add credits anytime • No expiry
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white mb-8"
                    >
                        <span className="block mb-3">Simple</span>
                        <span className="block">
                            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                                Credit Packages
                            </span>
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        Pay only for what you use. Add credits anytime.
                        <br className="hidden md:block" />
                        <span className="text-white font-semibold">No subscriptions</span>, no expiry.
                    </motion.p>
                </div>

                {/* Refined Credit Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {creditPackages.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                delay: i * 0.15,
                                type: "spring",
                                stiffness: 100,
                                damping: 15
                            }}
                            whileHover={{ y: -8 }}
                            className={`relative flex flex-col group ${plan.popular ? 'md:scale-105' : ''}`}
                        >
                            {/* Subtle Glow */}
                            <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Card Border */}
                            <div className={`relative flex flex-col h-full p-[2px] rounded-3xl ${
                                plan.popular
                                ? 'bg-gradient-to-br from-violet-500/50 to-fuchsia-500/50'
                                : 'bg-white/10'
                            }`}>
                                <div className="h-full bg-[#0A0A0A] rounded-[22px] p-10 flex flex-col relative overflow-hidden">
                                    {/* Corner Accents */}
                                    <div className={`absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 ${plan.popular ? 'border-violet-400/50' : 'border-white/20'} transition-colors`} />
                                    <div className={`absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 ${plan.popular ? 'border-violet-400/50' : 'border-white/20'} transition-colors`} />

                                    <div className="relative z-10 flex flex-col h-full">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${plan.color} group-hover:scale-105 transition-transform duration-300`}>
                                                <plan.icon className="w-7 h-7" strokeWidth={2} />
                                            </div>
                                            {plan.popular && (
                                                <span className="px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                                                    Best Value
                                                </span>
                                            )}
                                        </div>

                                        {/* Plan Name */}
                                        <h3 className="text-2xl font-bold mb-3 tracking-tight text-white">
                                            {plan.name}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed mb-8 min-h-[40px]">
                                            {plan.description}
                                        </p>

                                        {/* Pricing */}
                                        <div className="mb-8 pb-8 border-b border-white/10">
                                            <div className="flex items-baseline gap-3 mb-4">
                                                <span className="text-5xl font-black text-white tracking-tighter">
                                                    {plan.amount}
                                                </span>
                                                <span className="text-gray-500 font-mono text-sm">
                                                    one-time
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xl font-bold ${plan.popular ? 'text-violet-400' : 'text-emerald-400'}`}>
                                                    {plan.creditsDisplay}
                                                </span>
                                                {plan.bonus && (
                                                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg font-mono text-xs font-bold border border-emerald-500/30">
                                                        {plan.bonus}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-500 text-xs mt-3 font-mono">
                                                <span className="text-gray-600">{"// "}</span>
                                                Credits never expire
                                            </p>
                                        </div>

                                        {/* Features */}
                                        <ul className="space-y-4 mb-10 flex-1">
                                            {plan.features.map((feature, fIndex) => (
                                                <li
                                                    key={fIndex}
                                                    className="flex items-start gap-3 text-sm text-gray-300"
                                                >
                                                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? 'text-violet-400' : 'text-gray-600'}`} strokeWidth={2.5} />
                                                    <span className="leading-relaxed">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA Button */}
                                        <button
                                            className={`relative w-full py-4 font-mono text-sm font-bold tracking-wider uppercase transition-all overflow-hidden group/btn rounded-xl ${
                                                plan.popular ? 'text-black' : 'text-white'
                                            }`}
                                        >
                                            {/* Background */}
                                            <div className={`absolute inset-0 transition-all duration-300 ${
                                                plan.popular
                                                    ? 'bg-gradient-to-r from-violet-400 to-fuchsia-400 group-hover/btn:from-violet-300 group-hover/btn:to-fuchsia-300'
                                                    : 'bg-white/5 group-hover/btn:bg-white/10 border border-white/10 group-hover/btn:border-white/20'
                                            }`} />

                                            {/* Shine */}
                                            <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />

                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {plan.cta}
                                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
           </div>
      </section>

      <footer className="w-full py-12 border-t border-white/10 bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground relative z-10 font-mono text-sm">
            <p className="flex items-center justify-center gap-2">
                <span>&copy; 2026 Yapapa</span>
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                <span>Universal LLM Gateway</span>
            </p>
        </div>
      </footer>
    </div>
  );
}
