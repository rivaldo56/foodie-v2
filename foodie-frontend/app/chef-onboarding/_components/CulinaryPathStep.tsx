"use client";

import ChefStepContainer from "./ChefStepContainer";
import { motion } from "framer-motion";
import { Utensils, Calendar, ChefHat, GraduationCap, Store, Infinity } from "lucide-react";

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
            <div className="space-y-3 mt-4">
                {PATHS.map((path, index) => {
                    const isSelected = value.includes(path.id);
                    const Icon = path.icon;

                    return (
                        <motion.button
                            key={path.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => togglePath(path.id)}
                            className={`w-full flex items-center p-4 rounded-xl border text-left transition-all duration-200 group ${isSelected
                                    ? "border-[#ffb703] bg-[#ffb703]/10 text-white"
                                    : "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10"
                                }`}
                        >
                            <div className={`p-2 rounded-lg mr-4 ${isSelected ? "bg-[#ffb703] text-black" : "bg-white/10 text-neutral-400 group-hover:text-white"}`}>
                                <Icon size={20} />
                            </div>
                            <span className="font-medium text-lg">{path.label}</span>
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="ml-auto w-3 h-3 rounded-full bg-[#ffb703]"
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
                            ? "bg-[#ffb703] text-black shadow-lg hover:shadow-yellow-500/25"
                            : "bg-white/10 text-white/40 cursor-not-allowed"
                        }`}
                >
                    Continue
                </button>
            </div>
        </ChefStepContainer>
    );
}
