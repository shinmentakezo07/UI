"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowLeft, Zap, DollarSign, Clock, Database, Code, Info, Sparkles, Star, Activity, Brain, Cpu, TrendingUp, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import openRouterModels from "../openrouter-models-2026.json";
import { getProviderLogo } from "@/lib/provider-logos";

const providerConfig: Record<string, { icon: any; color: string; gradient: string }> = {
    openai: { icon: Sparkles, color: "text-green-400", gradient: "from-green-500/20 to-emerald-500/20" },
    anthropic: { icon: Zap, color: "text-orange-400", gradient: "from-orange-500/20 to-amber-500/20" },
    google: { icon: Star, color: "text-blue-400", gradient: "from-blue-500/20 to-cyan-500/20" },
    moonshotai: { icon: Brain, color: "text-purple-400", gradient: "from-purple-500/20 to-pink-500/20" },
    zhipu: { icon: Activity, color: "text-cyan-400", gradient: "from-cyan-500/20 to-teal-500/20" },
};

function ModelBackground() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        function handleMouseMove({ clientX, clientY }: { clientX: number, clientY: number }) {
            mouseX.set(clientX);
            mouseY.set(clientY);
        }

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#050505]">
            <div className="absolute inset-0 perspective-1000">
                <motion.div
                    animate={{ backgroundPosition: ["0px 0px", "0px 40px"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-grid-white opacity-[0.15] transform-gpu rotate-x-12 scale-150 origin-top"
                />
            </div>
            <motion.div
                className="absolute inset-0 opacity-40"
                style={{
                    background: useTransform(
                        [mouseX, mouseY],
                        ([x, y]) => `radial-gradient(800px circle at ${x}px ${y}px, rgba(59, 130, 246, 0.08), transparent 80%)`
                    )
                }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)]" />
        </div>
    );
}

export default function ModelDetailPage() {
    const params = useParams();
    const router = useRouter();
    const modelId = decodeURIComponent(params.id as string);
    const [copied, setCopied] = useState(false);
    
    const model = openRouterModels.find((m: any) => m.id === modelId);
    
    if (!model) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <ModelBackground />
                <div className="text-center relative z-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6"
                    >
                        <Info className="w-12 h-12 text-gray-500" />
                    </motion.div>
                    <h1 className="text-4xl font-bold mb-4">Model Not Found</h1>
                    <p className="text-gray-400 mb-8">The model you're looking for doesn't exist.</p>
                    <button
                        onClick={() => router.push('/models')}
                        className="px-8 py-4 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white font-mono font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
                    >
                        Back to Models
                    </button>
                </div>
            </div>
        );
    }

    const providerId = model.id.split('/')[0].toLowerCase();
    const config = providerConfig[providerId] || { icon: Cpu, color: "text-gray-400", gradient: "from-gray-500/20 to-gray-500/20" };
    const Icon = config.icon;
    const logo = getProviderLogo(model.id);

    const copyModelId = () => {
        navigator.clipboard.writeText(model.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <ModelBackground />

            {/* Corner Brackets - HUD Style */}
            <div className="absolute top-24 left-10 w-16 h-16 border-l-2 border-t-2 border-white/10 rounded-tl-2xl pointer-events-none z-10 hidden lg:block" />
            <div className="absolute top-24 right-10 w-16 h-16 border-r-2 border-t-2 border-white/10 rounded-tr-2xl pointer-events-none z-10 hidden lg:block" />

            <div className="relative z-10 pt-32 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Back Button */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.push('/models')}
                        whileHover={{ x: -4 }}
                        className="flex items-center gap-2 mb-8 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 transition-all group shadow-lg backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-mono text-xs font-bold">Back to Models</span>
                    </motion.button>

                    {/* Hero Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="relative">
                            {/* Glow Effect */}
                            <div className={`absolute -inset-4 rounded-3xl blur-3xl opacity-20 bg-gradient-to-br ${config.gradient}`} />
                            
                            <div className="relative bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    {/* Logo */}
                                    <motion.div 
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="relative w-20 h-20 rounded-xl shrink-0"
                                    >
                                        {logo ? (
                                            <>
                                                <div className="absolute inset-0 rounded-xl bg-white/5 blur-lg" />
                                                <div className="relative w-full h-full rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-4 shadow-xl backdrop-blur-sm">
                                                    <Image 
                                                        src={logo} 
                                                        alt={`${model.name} logo`}
                                                        width={48}
                                                        height={48}
                                                        className="object-contain"
                                                        unoptimized
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="absolute inset-0 rounded-xl bg-white/5 blur-lg" />
                                                <div className={`relative w-full h-full rounded-xl bg-white/10 border border-white/20 flex items-center justify-center ${config.color} shadow-xl`}>
                                                    <Icon className="w-10 h-10" />
                                                </div>
                                            </>
                                        )}
                                    </motion.div>

                                    {/* Title & Meta */}
                                    <div className="flex-1 min-w-0">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight leading-tight">
                                                {model.name}
                                            </h1>
                                            
                                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                                <button
                                                    onClick={copyModelId}
                                                    className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/20 to-cyan-500/20 border border-primary/40 hover:border-primary/60 text-primary font-mono font-bold text-xs shadow-lg shadow-primary/20 transition-all hover:scale-105"
                                                >
                                                    <span className="truncate max-w-[200px]">{model.id}</span>
                                                    {copied ? (
                                                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                                                    )}
                                                </button>
                                                
                                                {model.context_length && (
                                                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/20 text-gray-300 font-mono text-xs flex items-center gap-1.5">
                                                        <Database className="w-3.5 h-3.5 text-cyan-400" />
                                                        {(model.context_length / 1000).toFixed(0)}K
                                                    </span>
                                                )}
                                                
                                                {model.created_date && (
                                                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/20 text-gray-300 font-mono text-xs flex items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                                                        {model.created_date}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Quick Stats */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <div className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
                                                    <div className="text-[10px] text-gray-400 font-mono mb-0.5 uppercase">Input</div>
                                                    <div className="text-base font-bold text-emerald-400 font-mono">
                                                        ${model.pricing?.prompt ? (parseFloat(model.pricing.prompt) * 1000000).toFixed(2) : '0.00'}
                                                    </div>
                                                    <div className="text-[9px] text-gray-500 font-mono">per 1M</div>
                                                </div>
                                                <div className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
                                                    <div className="text-[10px] text-gray-400 font-mono mb-0.5 uppercase">Output</div>
                                                    <div className="text-base font-bold text-cyan-400 font-mono">
                                                        ${model.pricing?.completion ? (parseFloat(model.pricing.completion) * 1000000).toFixed(2) : '0.00'}
                                                    </div>
                                                    <div className="text-[9px] text-gray-500 font-mono">per 1M</div>
                                                </div>
                                                <div className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
                                                    <div className="text-[10px] text-gray-400 font-mono mb-0.5 uppercase">Max Out</div>
                                                    <div className="text-base font-bold text-white font-mono">
                                                        {model.top_provider?.max_completion_tokens ? (model.top_provider.max_completion_tokens / 1000).toFixed(0) + 'K' : 'N/A'}
                                                    </div>
                                                    <div className="text-[9px] text-gray-500 font-mono">tokens</div>
                                                </div>
                                                <div className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
                                                    <div className="text-[10px] text-gray-400 font-mono mb-0.5 uppercase">Type</div>
                                                    <div className="text-base font-bold text-white font-mono">
                                                        {model.architecture?.modality || 'Text'}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Description */}
                    {model.description && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mb-8"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-cyan-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative p-6 rounded-xl bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 shadow-xl">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                                            <Info className="w-4 h-4 text-primary" />
                                        </div>
                                        <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">About</h2>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed text-sm">{model.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Pricing Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                            </div>
                            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">Pricing</h2>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <motion.div 
                                whileHover={{ y: -2 }}
                                className="relative group"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 shadow-lg hover:border-emerald-500/50 transition-all">
                                    <div className="text-[10px] text-emerald-400 font-mono mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                        Input
                                    </div>
                                    <div className="text-2xl font-bold text-white font-mono mb-1">
                                        ${model.pricing?.prompt ? (parseFloat(model.pricing.prompt) * 1000000).toFixed(2) : '0.00'}
                                    </div>
                                    <div className="text-[9px] text-gray-400 font-mono">per 1M</div>
                                </div>
                            </motion.div>

                            <motion.div 
                                whileHover={{ y: -2 }}
                                className="relative group"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 shadow-lg hover:border-cyan-500/50 transition-all">
                                    <div className="text-[10px] text-cyan-400 font-mono mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                                        Output
                                    </div>
                                    <div className="text-2xl font-bold text-white font-mono mb-1">
                                        ${model.pricing?.completion ? (parseFloat(model.pricing.completion) * 1000000).toFixed(2) : '0.00'}
                                    </div>
                                    <div className="text-[9px] text-gray-400 font-mono">per 1M</div>
                                </div>
                            </motion.div>

                            {model.pricing?.input_cache_read && (
                                <motion.div 
                                    whileHover={{ y: -2 }}
                                    className="relative group"
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="relative p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 shadow-lg hover:border-blue-500/50 transition-all">
                                        <div className="text-[10px] text-blue-400 font-mono mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                            Cache Read
                                        </div>
                                        <div className="text-2xl font-bold text-white font-mono mb-1">
                                            ${(parseFloat(model.pricing.input_cache_read) * 1000000).toFixed(2)}
                                        </div>
                                        <div className="text-[9px] text-gray-400 font-mono">per 1M</div>
                                    </div>
                                </motion.div>
                            )}

                            {model.pricing?.input_cache_write && (
                                <motion.div 
                                    whileHover={{ y: -2 }}
                                    className="relative group"
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="relative p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 shadow-lg hover:border-purple-500/50 transition-all">
                                        <div className="text-[10px] text-purple-400 font-mono mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                                            Cache Write
                                        </div>
                                        <div className="text-2xl font-bold text-white font-mono mb-1">
                                            ${(parseFloat(model.pricing.input_cache_write) * 1000000).toFixed(2)}
                                        </div>
                                        <div className="text-[9px] text-gray-400 font-mono">per 1M</div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Capabilities Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                                <Database className="w-4 h-4 text-cyan-400" />
                            </div>
                            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">Capabilities</h2>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <motion.div 
                                whileHover={{ y: -2 }}
                                className="relative group"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-cyan-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative p-4 rounded-lg bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 hover:border-primary/30 shadow-lg transition-all">
                                    <div className="text-[10px] text-gray-400 font-mono mb-2 uppercase tracking-wider">Context</div>
                                    <div className="text-3xl font-bold text-white font-mono mb-1">
                                        {model.context_length ? (model.context_length / 1000).toFixed(0) + 'K' : 'N/A'}
                                    </div>
                                    <div className="text-[9px] text-gray-500 font-mono">tokens</div>
                                </div>
                            </motion.div>

                            <motion.div 
                                whileHover={{ y: -2 }}
                                className="relative group"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative p-4 rounded-lg bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 shadow-lg transition-all">
                                    <div className="text-[10px] text-gray-400 font-mono mb-2 uppercase tracking-wider">Max Out</div>
                                    <div className="text-3xl font-bold text-white font-mono mb-1">
                                        {model.top_provider?.max_completion_tokens ? (model.top_provider.max_completion_tokens / 1000).toFixed(0) + 'K' : 'N/A'}
                                    </div>
                                    <div className="text-[9px] text-gray-500 font-mono">tokens</div>
                                </div>
                            </motion.div>

                            <motion.div 
                                whileHover={{ y: -2 }}
                                className="relative group"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative p-4 rounded-lg bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 hover:border-blue-500/30 shadow-lg transition-all">
                                    <div className="text-[10px] text-gray-400 font-mono mb-2 uppercase tracking-wider">Type</div>
                                    <div className="text-2xl font-bold text-white font-mono">
                                        {model.architecture?.modality || 'Text'}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Architecture Details */}
                    {model.architecture && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mb-8"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative p-6 rounded-lg bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 shadow-xl">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                                            <Cpu className="w-4 h-4 text-purple-400" />
                                        </div>
                                        <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">Architecture</h2>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {model.architecture.input_modalities && (
                                            <div>
                                                <div className="text-[10px] text-gray-400 font-mono mb-3 uppercase tracking-wider">Input Modalities</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {model.architecture.input_modalities.map((mod: string) => (
                                                        <span key={mod} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/20 to-cyan-500/20 border border-primary/40 hover:border-primary/60 text-primary font-mono text-xs font-bold shadow-lg shadow-primary/10 transition-all hover:scale-105">
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
                                                        <span key={mod} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 hover:border-cyan-500/60 text-cyan-400 font-mono text-xs font-bold shadow-lg shadow-cyan-500/10 transition-all hover:scale-105">
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
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Supported Parameters */}
                    {model.supported_parameters && model.supported_parameters.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mb-8"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative p-6 rounded-lg bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 shadow-xl">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                                            <Code className="w-4 h-4 text-green-400" />
                                        </div>
                                        <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">Parameters</h2>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {model.supported_parameters.map((param: string) => (
                                            <motion.span
                                                key={param}
                                                whileHover={{ scale: 1.05 }}
                                                className="px-3 py-2 rounded-lg bg-white/10 border border-white/30 hover:border-primary/50 hover:bg-white/20 text-gray-200 hover:text-white font-mono text-xs transition-all cursor-default shadow-lg"
                                            >
                                                {param}
                                            </motion.span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Knowledge Cutoff */}
                    {model.knowledge_cutoff && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mb-8"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative p-6 rounded-lg bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 shadow-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-yellow-400" />
                                        </div>
                                        <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">Knowledge Cutoff</h2>
                                    </div>
                                    <p className="text-gray-300 font-mono text-base">{model.knowledge_cutoff}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* CTA Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="text-center"
                    >
                        <div className="relative inline-block">
                            <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-cyan-500/30 rounded-xl blur-xl opacity-50" />
                            <button className="relative px-8 py-3 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white font-mono font-bold text-sm rounded-lg transition-all shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 flex items-center gap-2 mx-auto">
                                Start Using {model.name.split(':')[0]}
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-gray-400 text-xs font-mono mt-4">
                            Get your API key and start building in minutes
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
