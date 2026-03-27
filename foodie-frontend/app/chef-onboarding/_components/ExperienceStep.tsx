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
            <div className="grid grid-cols-1 gap-4 mt-8">
                {LEVELS.map((level, index) => {
                    const isSelected = value === level.id;
                    const Icon = level.icon;

                    return (
                        <motion.button
                            key={level.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            onClick={() => onChange(level.id)}
                            className={`w-full flex items-center p-6 rounded-[2rem] border transition-all duration-500 text-left relative overflow-hidden group ${isSelected
                                    ? "border-[#ffb703]/60 bg-gradient-to-br from-[#ffb703]/10 to-transparent shadow-[0_0_40px_rgba(255,183,3,0.05)]"
                                    : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20"
                                }`}
                        >
                            <div className={`p-4 rounded-2xl mr-6 transition-all duration-500 ${isSelected ? "bg-[#ffb703] text-black scale-110 rotate-3 shadow-xl shadow-yellow-500/30" : "bg-white/5 text-white/30 group-hover:text-white"}`}>
                                <Icon size={26} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1">
                                <div className={`text-xl font-bold mb-1 tracking-tight ${isSelected ? "text-white" : "text-white/80 group-hover:text-white"}`}>
                                    {level.label}
                                </div>
                                <div className={`text-base font-light ${isSelected ? "text-white/60" : "text-white/30"}`}>
                                    {level.desc}
                                </div>
                            </div>
                            
                            {isSelected && (
                                <motion.div 
                                    layoutId="experience-ring"
                                    className="absolute inset-0 border-2 border-[#ffb703]/40 rounded-[2rem] pointer-events-none"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            <div className="mt-12 mb-8">
                <motion.button
                    whileHover={value ? { scale: 1.02 } : {}}
                    whileTap={value ? { scale: 0.98 } : {}}
                    onClick={onNext}
                    disabled={!value}
                    className={`w-full py-5 rounded-full font-bold text-lg transition-all duration-500 ${value
                            ? "bg-gradient-to-r from-[#ffb703] to-[#ff9500] text-black shadow-2xl shadow-yellow-500/20"
                            : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                        }`}
                >
                    Continue
                </motion.button>
            </div>

        </ChefStepContainer>
    );
}
