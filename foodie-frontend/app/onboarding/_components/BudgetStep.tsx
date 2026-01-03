"use client";

import StepContainer from "./StepContainer";
import { motion } from "framer-motion";
import { Sparkles, Coins, CreditCard, Gem } from "lucide-react";

interface BudgetStepProps {
    value: string;
    onChange: (val: string) => void;
    onNext: () => void;
    onBack: () => void;
}

const BUDGETS = [
    { id: "value", label: "Value Friendly", desc: "Great food, smart prices.", icon: Coins },
    { id: "balanced", label: "Balanced", desc: "Quality ingredients, fair rate.", icon: CreditCard },
    { id: "premium", label: "Premium", desc: "Top-tier chefs & service.", icon: Sparkles },
    { id: "luxury", label: "Sky’s the Limit", desc: "Ultimate luxury experience.", icon: Gem },
];

export default function BudgetStep({ value, onChange, onNext, onBack }: BudgetStepProps) {
    return (
        <StepContainer
            title="Comfort zone?"
            subtitle="Per person estimate."
            onBack={onBack}
        >
            <div className="space-y-4 mt-4">
                {BUDGETS.map((budget, index) => {
                    const isSelected = value === budget.id;
                    const Icon = budget.icon;

                    return (
                        <motion.button
                            key={budget.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onChange(budget.id)}
                            className={`w-full flex items-center p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${isSelected
                                    ? "border-[#ff7642] bg-[#ff7642]/10"
                                    : "border-white/5 bg-white/5 hover:bg-white/10"
                                }`}
                        >
                            {isSelected && (
                                <motion.div
                                    layoutId="active-budget-glow"
                                    className="absolute inset-0 bg-[#ff7642]/5"
                                />
                            )}

                            <div className={`p-3 rounded-xl mr-5 relative z-10 ${isSelected ? "bg-[#ff7642] text-white" : "bg-white/5 text-neutral-400"}`}>
                                <Icon size={24} strokeWidth={1.5} />
                            </div>

                            <div className="text-left relative z-10">
                                <div className={`text-lg font-medium mb-0.5 ${isSelected ? "text-white" : "text-neutral-200"}`}>
                                    {budget.label}
                                </div>
                                <div className="text-sm text-neutral-500">
                                    {budget.desc}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <div className="mt-8">
                <button
                    onClick={onNext}
                    disabled={!value}
                    className={`w-full py-4 rounded-full font-medium text-lg transition-all ${value
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
