// Provider logo URLs - using local SVG files from public/logos directory
export const providerLogos: Record<string, string> = {
    // OpenAI - Local SVG logo
    openai: "/logos/openai.svg",
    
    // Anthropic - Local SVG logo
    anthropic: "/logos/anthropic.svg",
    
    // Google - Local SVG logo
    google: "/logos/google.svg",
    
    // Moonshot AI - Local PNG logo
    moonshotai: "/logos/moonshot.png",
};

export function getProviderLogo(modelId: string): string | null {
    const provider = modelId.split('/')[0].toLowerCase();
    return providerLogos[provider] || null;
}

export function getProviderName(modelId: string): string {
    const provider = modelId.split('/')[0];
    const nameMap: Record<string, string> = {
        openai: "OpenAI",
        anthropic: "Anthropic",
        google: "Google",
        moonshotai: "Moonshot AI",
    };
    return nameMap[provider.toLowerCase()] || provider;
}
