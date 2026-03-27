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
            <div className="my-8 px-1">
                {/* Vertical Tiers Visualized as a spectrum */}
                <div className="flex flex-col gap-4">
                    {TIERS.map((tier, index) => {
                        const isSelected = value === tier.id;
                        return (
                            <motion.button
                                key={tier.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => onChange(tier.id)}
                                className={`relative w-full p-6 text-left rounded-3xl border transition-all duration-500 overflow-hidden group ${isSelected 
                                    ? "border-[#ffb703] bg-gradient-to-br from-[#ffb703] to-[#ff9500] text-black shadow-xl shadow-yellow-500/20" 
                                    : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10 hover:border-white/20"
                                    }`}
                                whileHover={{ scale: 1.02, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex flex-col">
                                        <span className={`text-2xl font-bold tracking-tight ${isSelected ? "text-black" : "text-white/80 group-hover:text-white"}`}>{tier.label}</span>
                                        <span className={`text-sm font-medium ${isSelected ? "text-black/60" : "text-white/30"}`}>Est. {tier.range}</span>
                                    </div>
                                    {isSelected ? (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md"
                                        >
                                            <div className="w-4 h-4 rounded-full bg-black shadow-inner" />
                                        </motion.div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center group-hover:border-white/20 transition-all">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white/40 group-hover:scale-150 transition-all" />
                                        </div>
                                    )}
                                </div>
                                {isSelected && (
                                    <motion.div 
                                        className="absolute inset-0 bg-white/10 blur-3xl opacity-30"
                                        animate={{ x: [-200, 400] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                <p className="mt-10 text-center text-sm text-white/30 font-light leading-relaxed max-w-xs mx-auto">
                    You can set exact prices for each menu later. <br />This just helps with initial client matching.
                </p>
            </div>

            <div className="mt-10 mb-8">
                <motion.button
                    whileHover={value ? { scale: 1.02 } : {}}
                    whileTap={value ? { scale: 0.98 } : {}}
                    onClick={onNext}
                    disabled={!value}
                    className={`w-full py-5 rounded-full font-extrabold text-lg transition-all duration-500 shadow-2xl ${value
                            ? "bg-gradient-to-r from-[#ffb703] to-[#ff9500] text-black shadow-yellow-500/10"
                            : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                        }`}
                >
                    Continue
                </motion.button>
            </div>

        </ChefStepContainer>
    );
}
