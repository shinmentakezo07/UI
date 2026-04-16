import { ModelShowcase } from "@/components/pricing/ModelShowcase";
import { CreditPackages } from "@/components/pricing/CreditPackages";

export default function PricingPage() {
    return (
        <div className="flex flex-col items-center w-full overflow-hidden bg-[#000000] text-foreground selection:bg-primary/30 selection:text-white">
            <ModelShowcase />
            <CreditPackages />
        </div>
    );
}
