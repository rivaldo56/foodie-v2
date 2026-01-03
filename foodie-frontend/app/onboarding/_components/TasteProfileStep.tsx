"use client";

import StepContainer from "./StepContainer";
import { motion } from "framer-motion";
import { Pizza, Coffee, Beef, Carrot, Gift, Soup, AArrowUp, Apple } from "lucide-react";

interface TasteProfileStepProps {
    value: string[];
    onChange: (val: string[]) => void;
    onNext: () => void;
    onBack: () => void;
}

const TASTES = [
    { id: "african", label: "African", icon: Soup },
    { id: "italian", label: "Italian", icon: Pizza },
    { id: "asian", label: "Asian Fusion", icon: Coffee }, // Approximation
    { id: "vegan", label: "Vegan", icon: Carrot },
    { id: "steak", label: "Steak & Grill", icon: Beef },
    { id: "desserts", label: "Desserts", icon: Apple },
    { id: "surprise", label: "Surprise Me", icon: Gift },
];

export default function TasteProfileStep({ value, onChange, onNext, onBack }: TasteProfileStepProps) {
    const toggleTaste = (id: string) => {
        if (value.includes(id)) {
            onChange(value.filter((v) => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    return (
        <StepContainer
            title="What are you into?"
            subtitle="Pick your favorites."
            onBack={onBack}
        >
            <div className="grid grid-cols-2 gap-3 mt-4">
                {TASTES.map((taste, index) => {
                    const isSelected = value.includes(taste.id);
                    const Icon = taste.icon;
                    const isSpecial = taste.id === "surprise";

                    return (
                        <motion.button
                            key={taste.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => toggleTaste(taste.id)}
                            className={`relative flex flex-col items-center justify-center p-4 h-32 rounded-2xl border transition-all duration-300 ${isSelected
                                    ? "border-[#ff7642] bg-[#ff7642]/10"
                                    : "border-white/5 bg-white/5 hover:bg-white/10"
                                } ${isSpecial && !isSelected ? "border-[#ff7642]/30" : ""}`}
                        >
                            <div className={`p-3 rounded-full mb-2 ${isSelected ? "bg-[#ff7642] text-white" : "bg-white/5 text-neutral-400"}`}>
                                <Icon size={24} />
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-neutral-300"}`}>
                                {taste.label}
                            </span>

                            {isSelected && (
                                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#ff7642]" />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            <div className="mt-8">
                <button
                    onClick={onNext}
                    disabled={value.length === 0}
                    className={`w-full py-4 rounded-full font-medium text-lg transition-all ${value.length > 0
                            ? "bg-[#ff7642] text-white shadow-lg hover:shadow-orange-500/25"
                            : "bg-white/10 text-white/40 cursor-not-allowed"
                        }`}
                >
                    Continue
                </button>
            </div>
        </StepContainer>
    );
}
