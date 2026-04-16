"use client";

import { motion } from "framer-motion";
import { Check, Crown, ArrowRight } from "lucide-react";
import { creditPackages } from "@/lib/pricing-data";
import Link from "next/link";

export function CreditPackages() {
    return (
        <section id="credits" className="w-full py-32 px-4 relative z-20 bg-[#050505] overflow-hidden">
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
    );
}
