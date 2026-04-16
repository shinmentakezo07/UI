"use client";

import { motion } from "framer-motion";
import { Activity, ArrowRight } from "lucide-react";
import { featuredModels } from "@/lib/pricing-data";
import Image from "next/image";
import Link from "next/link";

export function ModelShowcase() {
    return (
        <section className="w-full py-32 px-4 relative z-20 bg-[#000000] overflow-hidden">
            {/* Enhanced Background */}
            <div className="absolute inset-0 -z-10">
                {/* Radial Gradient Orbs */}
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }} />

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
                <div className="mb-20 text-center relative">
                    {/* Decorative Elements */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-violet-500/10 text-blue-400 text-xs font-mono font-bold tracking-[0.2em] uppercase mb-10 backdrop-blur-md shadow-lg shadow-blue-500/10"
                    >
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        Transparent Pricing
                        <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
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
                                <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-500 bg-clip-text text-transparent animate-gradient-x">
                                    Month
                                </span>
                                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/0 via-violet-400/60 to-purple-500/0" />
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
                        <span className="text-blue-400 font-bold relative">
                            transparent, per-token pricing
                            <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent block" />
                        </span>.
                        <br className="hidden md:block" />
                        No subscriptions, no hidden fees.{" "}
                        <span className="text-white font-semibold">Pay only for what you use</span>.
                    </motion.p>
                </div>

                {/* Visual Pricing Display — No Cards */}
                <div className="relative">
                    {/* Glowing connector line */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent -translate-y-1/2" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Left: Live Model Ticker */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/10 via-violet-500/5 to-purple-500/10 rounded-3xl blur-2xl" />
                            <div className="relative rounded-3xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-sm p-8 md:p-10 overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Live Rates</h3>
                                            <p className="text-xs text-gray-500 font-mono">Per 1K tokens</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-mono font-bold uppercase">
                                        100+ Models
                                    </span>
                                </div>

                                {/* Model Rows */}
                                <div className="space-y-4">
                                    {featuredModels.map((model, i) => (
                                        <motion.div
                                            key={model.name}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            className="group relative flex items-center justify-between p-4 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all"
                                        >
                                            {/* Subtle gradient bar on hover */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity ${
                                                i === 0 ? 'bg-blue-500' :
                                                i === 1 ? 'bg-violet-500' :
                                                i === 2 ? 'bg-purple-500' :
                                                'bg-fuchsia-500'
                                            }`} />

                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                    {model.logo ? (
                                                        <Image
                                                            src={model.logo}
                                                            alt={`${model.provider} logo`}
                                                            width={28}
                                                            height={28}
                                                            className="object-contain"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <model.icon className={`w-6 h-6 ${model.color}`} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-semibold">{model.name}</h4>
                                                    <p className="text-xs text-gray-500 font-mono">{model.provider}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[10px] text-gray-500 font-mono uppercase">Input</p>
                                                    <p className="text-blue-400 font-mono font-bold">{model.inputPrice}</p>
                                                </div>
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[10px] text-gray-500 font-mono uppercase">Output</p>
                                                    <p className="text-violet-400 font-mono font-bold">{model.outputPrice}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-500 font-mono uppercase">Context</p>
                                                    <p className="text-purple-400 font-mono font-bold">{model.context}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Bottom link */}
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <Link href="/models" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group">
                                        View all 100+ models
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Why Token Pricing */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative space-y-8"
                        >
                            {/* Large typographic stat */}
                            <div className="relative">
                                <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/5 to-violet-500/5 rounded-full blur-3xl" />
                                <div className="relative">
                                    <p className="text-[120px] md:text-[160px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/20">
                                        100+
                                    </p>
                                    <p className="text-2xl md:text-3xl font-bold text-white -mt-4 ml-2">
                                        models, <span className="text-blue-400">one bill</span>
                                    </p>
                                </div>
                            </div>

                            {/* Benefit bullets */}
                            <div className="space-y-5 pt-4">
                                {[
                                    { text: "No monthly minimums or seat fees", color: "bg-blue-500" },
                                    { text: "See exact cost per request in real-time", color: "bg-violet-500" },
                                    { text: "Switch models instantly with zero config", color: "bg-purple-500" },
                                    { text: "Credits never expire", color: "bg-fuchsia-500" },
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.text}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                        className="flex items-center gap-4"
                                    >
                                        <div className={`w-2 h-2 rounded-full ${item.color} shadow-[0_0_12px_currentColor]`} />
                                        <p className="text-gray-300 text-lg">{item.text}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6 }}
                                className="pt-4"
                            >
                                <Link href="/models">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative px-8 py-4 bg-gradient-to-r from-blue-500/10 to-violet-500/10 hover:from-blue-500/20 hover:to-violet-500/20 border border-blue-500/30 hover:border-violet-500/50 rounded-2xl text-white font-mono text-sm font-bold transition-all group overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                        <span className="relative z-10 flex items-center gap-3">
                                            Compare All Models
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                        </span>
                                    </motion.button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
