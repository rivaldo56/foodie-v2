"use client";

import ChefStepContainer from "./ChefStepContainer";
import { motion } from "framer-motion";
import { Utensils, Calendar, ChefHat, GraduationCap, Store, Infinity, ArrowRight } from "lucide-react";


interface CulinaryPathStepProps {
    value: string[];
    onChange: (val: string[]) => void;
    onNext: () => void;
    onBack: () => void;
}

const PATHS = [
    { id: "private_dining", label: "Private Dining", icon: Utensils },
    { id: "meal_prep", label: "Meal Prep", icon: Calendar },
    { id: "catering", label: "Catering", icon: ChefHat },
    { id: "cooking_classes", label: "Cooking Classes", icon: GraduationCap },
    { id: "pop_ups", label: "Pop-ups", icon: Store },
    { id: "everything", label: "Open to Everything", icon: Infinity },
];

export default function CulinaryPathStep({ value, onChange, onNext, onBack }: CulinaryPathStepProps) {
    const togglePath = (id: string) => {
        if (id === "everything") {
            if (value.includes("everything")) {
                onChange([]);
            } else {
                onChange(["everything"]);
            }
            return;
        }

        let newValue = [...value];
        if (newValue.includes("everything")) {
            newValue = [];
        }

        if (newValue.includes(id)) {
            newValue = newValue.filter((v) => v !== id);
        } else {
            newValue.push(id);
        }
        onChange(newValue);
    };

    return (
        <ChefStepContainer
            title="Your Culinary Path"
            subtitle="What services do you offer?"
            onBack={onBack}
        >
            <div className="space-y-4 mt-6">
                {PATHS.map((path, index) => {
                    const isSelected = value.includes(path.id);
                    const Icon = path.icon;

                    return (
                        <motion.button
                            key={path.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => togglePath(path.id)}
                            className={`w-full flex items-center p-5 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${isSelected
                                    ? "border-[#ffb703] bg-[#ffb703]/10 text-white shadow-[0_0_20px_rgba(255,183,3,0.1)]"
                                    : "border-white/5 bg-white/5 text-white/50 hover:bg-white/10 hover:border-white/20"
                                }`}
                        >
                            <div className={`p-3 rounded-xl mr-5 transition-colors ${isSelected ? "bg-[#ffb703] text-black" : "bg-white/10 text-white/30 group-hover:text-white"}`}>
                                <Icon size={22} strokeWidth={isSelected ? 2.5 : 1.5} />
                            </div>
                            <span className={`font-semibold text-lg ${isSelected ? "text-white" : "text-white/60 group-hover:text-white"}`}>
                                {path.label}
                            </span>
                            
                            {isSelected && (
                                <motion.div
                                    layoutId="selected-indicator"
                                    className="ml-auto w-2.5 h-2.5 rounded-full bg-[#ffb703] shadow-[0_0_10px_rgba(255,183,3,0.8)]"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            <div className="mt-12 mb-8">
                <motion.button
                    whileHover={value.length > 0 ? { scale: 1.02 } : {}}
                    whileTap={value.length > 0 ? { scale: 0.98 } : {}}
                    onClick={onNext}
                    disabled={value.length === 0}
                    className={`w-full py-5 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${value.length > 0
                            ? "bg-gradient-to-r from-[#ffb703] to-[#ff9500] text-black shadow-xl shadow-yellow-500/10"
                            : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                        }`}
                >
                    Continue
                    <ArrowRight size={20} className={value.length > 0 ? "opacity-100" : "opacity-0"} />
                </motion.button>

            </div>

        </ChefStepContainer>
    );
}
