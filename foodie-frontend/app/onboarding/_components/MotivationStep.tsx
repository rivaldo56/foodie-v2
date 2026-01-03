"use client";

import StepContainer from "./StepContainer";
import { motion } from "framer-motion";
import { Utensils, Calendar, PartyPopper, Briefcase, GraduationCap, Search } from "lucide-react";

interface MotivationStepProps {
    value: string[];
    onChange: (val: string[]) => void;
    onNext: () => void;
}

const OPTIONS = [
    { id: "private_dining", label: "Private Dining", icon: Utensils },
    { id: "meal_prep", label: "Meal Prep", icon: Calendar },
    { id: "special_occasions", label: "Special Occasions", icon: PartyPopper },
    { id: "cooking_classes", label: "Cooking Classes", icon: GraduationCap },
    { id: "corporate_events", label: "Corporate Events", icon: Briefcase },
    { id: "exploring", label: "Just Exploring", icon: Search },
];

export default function MotivationStep({ value, onChange, onNext }: MotivationStepProps) {
    const toggleOption = (id: string) => {
        if (value.includes(id)) {
            onChange(value.filter((v) => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    return (
        <StepContainer
            title="What brings you to Foodie?"
            subtitle="Select all that apply."
        >
            <div className="space-y-3 mt-4">
                {OPTIONS.map((option, index) => {
                    const isSelected = value.includes(option.id);
                    const Icon = option.icon;

                    return (
                        <motion.button
                            key={option.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => toggleOption(option.id)}
                            className={`w-full flex items-center p-4 rounded-xl border text-left transition-all duration-200 group ${isSelected
                                    ? "border-[#ff7642] bg-[#ff7642]/10 text-white"
                                    : "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10"
                                }`}
                        >
                            <div className={`p-2 rounded-lg mr-4 ${isSelected ? "bg-[#ff7642] text-white" : "bg-white/10 text-neutral-400 group-hover:text-white"}`}>
                                <Icon size={20} />
                            </div>
                            <span className="font-medium text-lg">{option.label}</span>
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="ml-auto w-3 h-3 rounded-full bg-[#ff7642]"
                                />
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
