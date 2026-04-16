"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { Search, Sparkles, Zap, Star, Activity, Globe, Cpu, Brain, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import openRouterModels from "./openrouter-models-2026.json";
import { getProviderLogo } from "@/lib/provider-logos";

// Map provider names and assign icons/colors
const providerConfig: Record<string, { icon: any; color: string; gradient: string }> = {
    openai: { icon: Sparkles, color: "text-green-400", gradient: "from-green-500/20 to-emerald-500/20" },
    anthropic: { icon: Zap, color: "text-orange-400", gradient: "from-orange-500/20 to-amber-500/20" },
    google: { icon: Star, color: "text-blue-400", gradient: "from-blue-500/20 to-cyan-500/20" },
    moonshot: { icon: Brain, color: "text-purple-400", gradient: "from-purple-500/20 to-pink-500/20" },
    zhipu: { icon: Activity, color: "text-cyan-400", gradient: "from-cyan-500/20 to-teal-500/20" },
};

// Transform OpenRouter models to our format
const allModels = openRouterModels.map((model: any) => {
    const providerId = model.id.split('/')[0].toLowerCase();
    const config = providerConfig[providerId] || { icon: Cpu, color: "text-gray-400", gradient: "from-gray-500/20 to-gray-500/20" };
    
    const inputPrice = model.pricing?.prompt ? `$${(parseFloat(model.pricing.prompt) * 1000000).toFixed(2)}` : "$0.00";
    const outputPrice = model.pricing?.completion ? `$${(parseFloat(model.pricing.completion) * 1000000).toFixed(2)}` : "$0.00";
    const context = model.context_length ? `${(model.context_length / 1000).toFixed(0)}K` : "N/A";
    const logo = getProviderLogo(model.id);
    
    return {
        ...model,
        provider: model.name.split(':')[0] || providerId,
        inputPrice,
        outputPrice,
        context,
        icon: config.icon,
        color: config.color,
        gradient: config.gradient,
        logo,
        popular: model.created > 1743465600, // After 2026-03-01
        speed: model.context_length > 500000 ? "Fast" : "Very Fast",
    };
});

const providers = ["All", "OpenAI", "Anthropic", "Google", "Moonshot"];

// Background component matching Hero
function ModelsBackground() {
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
            {/* Moving Grid */}
            <div className="absolute inset-0 perspective-1000">
                <motion.div
                    animate={{ backgroundPosition: ["0px 0px", "0px 40px"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-grid-white opacity-[0.15] transform-gpu rotate-x-12 scale-150 origin-top"
                />
            </div>

            {/* Dynamic Spotlights */}
            <motion.div
                className="absolute inset-0 opacity-40"
                style={{
                    background: useTransform(
                        [mouseX, mouseY],
                        ([x, y]) => `radial-gradient(800px circle at ${x}px ${y}px, rgba(59, 130, 246, 0.08), transparent 80%)`
                    )
                }}
            />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)]" />
        </div>
    );
}

export default function ModelsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProvider, setSelectedProvider] = useState("All");
    const router = useRouter();

    const filteredModels = allModels.filter(model => {
        const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            model.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            model.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesProvider = selectedProvider === "All" || model.provider.toLowerCase().includes(selectedProvider.toLowerCase());
        return matchesSearch && matchesProvider;
    });

    const handleModelClick = (model: any) => {
        router.push(`/models/${encodeURIComponent(model.id)}`);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
            <ModelsBackground />

            {/* Corner Brackets - HUD Style */}
            <div className="absolute top-24 left-10 w-16 h-16 border-l-2 border-t-2 border-white/10 rounded-tl-2xl pointer-events-none z-10 hidden lg:block" />
            <div className="absolute top-24 right-10 w-16 h-16 border-r-2 border-t-2 border-white/10 rounded-tr-2xl pointer-events-none z-10 hidden lg:block" />

            <div className="relative z-10 pt-32 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] text-white mb-6">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="block"
                            >
                                AI Models
                            </motion.span>
                        </h1>
                    </motion.div>

                    {/* Search and Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mb-12 space-y-6"
                    >
                        {/* Search Bar - Cyberpunk Style */}
                        <div className="relative max-w-2xl mx-auto group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-cyan-500/30 to-blue-500/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500" />
                            <div className="relative flex items-center gap-3 px-6 py-4 rounded-xl bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/20 group-hover:border-primary/50 transition-all shadow-2xl">
                                <Search className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search models by name, provider, or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-gray-500 font-mono text-sm"
                                />
                                {searchQuery && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="px-3 py-1.5 bg-primary/30 text-primary text-xs font-mono font-bold rounded-lg border border-primary/50"
                                    >
                                        {filteredModels.length} found
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Provider Filter Pills */}
                        <div className="flex flex-wrap justify-center gap-3">
                            {providers.map((provider) => (
                                <motion.button
                                    key={provider}
                                    onClick={() => setSelectedProvider(provider)}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`relative px-6 py-3 rounded-xl text-sm font-mono font-bold tracking-wider transition-all overflow-hidden shadow-lg ${
                                        selectedProvider === provider
                                            ? "text-black shadow-primary/50"
                                            : "text-gray-300 hover:text-white"
                                    }`}
                                >
                                    <div className={`absolute inset-0 transition-all duration-300 ${
                                        selectedProvider === provider
                                            ? "bg-gradient-to-r from-primary via-cyan-400 to-primary bg-[length:200%_100%] animate-gradient"
                                            : "bg-white/5 hover:bg-white/10 border border-white/20"
                                    }`} />
                                    {selectedProvider === provider && (
                                        <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] animate-shimmer" />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        {selectedProvider === provider && <CheckCircle className="w-4 h-4" />}
                                        {provider}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Models Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredModels.map((model, i) => (
                            <motion.div
                                key={model.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 + i * 0.05 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="relative group cursor-pointer"
                                onClick={() => handleModelClick(model)}
                            >
                                {/* Glow Effect */}
                                <div className={`absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500 bg-gradient-to-br ${model.gradient}`} />

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
                                                    {model.popular && (
                                                        <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-primary/30 to-cyan-500/30 border border-primary/50 text-primary text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-primary/20">
                                                            <TrendingUp className="w-3 h-3" />
                                                            Popular
                                                        </span>
                                                    )}
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
                                                <span className="w-1 h-1 rounded-full bg-gray-600" />
                                                <span className="text-[10px] text-gray-500 font-mono uppercase">{model.speed}</span>
                                            </div>

                                            {/* Pricing */}
                                            <div className="space-y-3 pt-4 border-t border-white/10 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                                                        <span className="text-sm text-gray-400 font-mono">Input</span>
                                                    </div>
                                                    <span className="text-emerald-400 font-mono font-bold text-sm">{model.inputPrice}/1M</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
                                                        <span className="text-sm text-gray-400 font-mono">Output</span>
                                                    </div>
                                                    <span className="text-cyan-400 font-mono font-bold text-sm">{model.outputPrice}/1M</span>
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

                    {/* No Results */}
                    {filteredModels.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-6">
                                <Search className="w-10 h-10 text-gray-600" />
                            </div>
                            <p className="text-gray-400 text-lg font-mono">No models found matching your criteria.</p>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedProvider("All");
                                }}
                                className="mt-6 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-sm font-mono transition-all"
                            >
                                Clear Filters
                            </button>
                        </motion.div>
                    )}

                    {/* Stats Footer */}
                    {filteredModels.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="mt-16 text-center"
                        >
                            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-white/5 to-white/10 border border-white/20 backdrop-blur-sm shadow-lg">
                                <CheckCircle className="w-5 h-5 text-primary" />
                                <p className="text-gray-300 font-mono text-sm">
                                    Showing <span className="text-white font-bold text-primary">{filteredModels.length}</span> of{" "}
                                    <span className="text-white font-bold">{allModels.length}</span> models
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
