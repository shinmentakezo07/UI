import { Code2, Crown, Shield, Sparkles, Zap, Star, Activity } from "lucide-react";
import { getProviderLogo } from "./provider-logos";

export const creditPackages = [
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

export const featuredModels = [
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
