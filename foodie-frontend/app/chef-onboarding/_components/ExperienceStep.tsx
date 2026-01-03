"use client";

import ChefStepContainer from "./ChefStepContainer";
import { motion } from "framer-motion";
import { Sprout, ChefHat, Award, Briefcase } from "lucide-react";

interface ExperienceStepProps {
    value: string;
    onChange: (val: string) => void;
    onNext: () => void;
    onBack: () => void;
}

const LEVELS = [
    { id: "growing", label: "Growing Talent", desc: "Building my portfolio.", icon: Sprout },
    { id: "experienced", label: "Experienced Pro", desc: "Solid culinary background.", icon: ChefHat },
    { id: "executive", label: "Executive Level", desc: "Head chef / Verified expertise.", icon: Briefcase },
    { id: "entrepreneur", label: "Culinary Entrepreneur", desc: "Running my own brand.", icon: Award },
];

export default function ExperienceStep({ value, onChange, onNext, onBack }: ExperienceStepProps) {
    return (
        <ChefStepContainer
            title="Experience Level"
            subtitle="This helps us match opportunities."
            onBack={onBack}
        >
            <div className="grid grid-cols-1 gap-4 mt-4">
                {LEVELS.map((level, index) => {
                    const isSelected = value === level.id;
                    const Icon = level.icon;

                    return (
                        <motion.button
                            key={level.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onChange(level.id)}
                            className={`w-full flex items-center p-5 rounded-2xl border transition-all duration-300 text-left ${isSelected
                                    ? "border-[#ffb703] bg-[#ffb703]/10 ring-1 ring-[#ffb703]"
                                    : "border-white/5 bg-white/5 hover:bg-white/10"
                                }`}
                        >
                            <div className={`p-3 rounded-full mr-5 ${isSelected ? "bg-[#ffb703] text-black" : "bg-zinc-800 text-neutral-400"}`}>
                                <Icon size={24} />
                            </div>
                            <div className="flex-1">
                                <div className={`text-lg font-medium ${isSelected ? "text-white" : "text-neutral-200"}`}>
                                    {level.label}
                                </div>
                                <div className={`text-sm ${isSelected ? "text-white/80" : "text-neutral-500"}`}>
                                    {level.desc}
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
                    className={`w-full py-4 rounded-full font-semibold text-lg transition-all ${value
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
