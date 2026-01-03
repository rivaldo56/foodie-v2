"use client";

import ChefStepContainer from "./ChefStepContainer";
import { motion } from "framer-motion";

interface PricingStepProps {
    value: string;
    onChange: (val: string) => void;
    onNext: () => void;
    onBack: () => void;
}

const TIERS = [
    { id: "Value", label: "Value", range: "$10 - $50 / hr" },
    { id: "Fair Market", label: "Fair Market", range: "$50 - $100 / hr" },
    { id: "Premium", label: "Premium", range: "$100 - $200 " },
    { id: "Luxury", label: "Luxury", range: "$200+ " },
];

export default function PricingStep({ value, onChange, onNext, onBack }: PricingStepProps) {
    return (
        <ChefStepContainer
            title="Pricing Zone"
            subtitle="Where do you start?"
            onBack={onBack}
        >
            <div className="my-10 px-2">
                {/* Vertical Tiers Visualized as a spectrum */}
                <div className="flex flex-col gap-3">
                    {TIERS.map((tier, index) => {
                        const isSelected = value === tier.id;
                        return (
                            <motion.button
                                key={tier.id}
                                onClick={() => onChange(tier.id)}
                                className={`relative w-full p-6 text-left rounded-2xl border transition-all overflow-hidden ${isSelected ? "border-[#ffb703] bg-[#ffb703] text-black" : "border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex flex-col">
                                        <span className={`text-xl font-bold ${isSelected ? "text-black" : "text-white"}`}>{tier.label}</span>
                                        <span className={`text-sm ${isSelected ? "text-black/70" : "text-neutral-500"}`}>Est. {tier.range}</span>
                                    </div>
                                    {isSelected && (
                                        <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-black" />
                                        </div>
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                <p className="mt-6 text-center text-sm text-neutral-500">
                    You can set exact prices for each menu later. This just helps with initial matching.
                </p>
            </div>

            <div className="mt-auto">
                <button
                    onClick={onNext}
                    className="w-full py-4 rounded-full font-semibold text-lg bg-[#ffb703] text-black shadow-lg hover:shadow-yellow-500/25 transition-all"
                >
                    Continue
                </button>
            </div>
        </ChefStepContainer>
    );
}
