"use client";

import ChefStepContainer from "./ChefStepContainer";
import { motion } from "framer-motion";
import { Pizza, Soup, Beef, Carrot, Flame, CakeSlice, Sparkles } from "lucide-react";

interface SkillsStepProps {
    value: string[];
    signature: string;
    onChange: (val: string[]) => void;
    onSignatureChange: (val: string) => void;
    onNext: () => void;
    onBack: () => void;
}

const SKILLS = [
    { id: "african", label: "African", icon: Soup },
    { id: "italian", label: "Italian", icon: Pizza },
    { id: "pastry", label: "Pastry & Desserts", icon: CakeSlice },
    { id: "grill", label: "Grill & Meats", icon: Beef },
    { id: "vegan", label: "Plant-based", icon: Carrot },
    { id: "fusion", label: "Fusion", icon: Flame },
];

export default function SkillsStep({ value, signature, onChange, onSignatureChange, onNext, onBack }: SkillsStepProps) {
    const toggleSkill = (id: string) => {
        if (value.includes(id)) {
            onChange(value.filter((v) => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    return (
        <ChefStepContainer
            title="Skills & Specialties"
            subtitle="Show off your strengths."
            onBack={onBack}
        >
            <div className="grid grid-cols-2 gap-4 mt-6 mb-8">
                {SKILLS.map((skill, index) => {
                    const isSelected = value.includes(skill.id);
                    const Icon = skill.icon;

                    return (
                        <motion.button
                            key={skill.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => toggleSkill(skill.id)}
                            className={`flex flex-col items-center justify-center p-5 h-32 rounded-3xl border transition-all duration-400 group ${isSelected
                                    ? "border-[#ffb703] bg-[#ffb703]/10 shadow-[0_0_25px_rgba(255,183,3,0.08)]"
                                    : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20"
                                }`}
                        >
                            <div className={`mb-3 p-3 rounded-2xl transition-all duration-300 ${isSelected ? "bg-[#ffb703] text-black scale-110 shadow-lg shadow-yellow-500/20" : "bg-white/5 text-white/30 group-hover:text-white"}`}>
                                <Icon size={24} strokeWidth={1.5} />
                            </div>
                            <span className={`text-sm font-semibold tracking-wide ${isSelected ? "text-white" : "text-white/40 group-hover:text-white/70"}`}>
                                {skill.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            <div className="space-y-3 px-1">
                <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Signature Style</label>
                <textarea
                    value={signature}
                    onChange={(e) => onSignatureChange(e.target.value)}
                    placeholder="e.g. Modern French with Japanese techniques..."
                    className="w-full h-28 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#ffb703]/50 focus:bg-[#ffb703]/5 transition-all resize-none font-light leading-relaxed"
                />
            </div>

            <div className="mt-10 mb-6">
                <motion.button
                    whileHover={value.length > 0 ? { scale: 1.02 } : {}}
                    whileTap={value.length > 0 ? { scale: 0.98 } : {}}
                    onClick={onNext}
                    disabled={value.length === 0}
                    className={`w-full py-5 rounded-full font-bold text-lg transition-all duration-500 ${value.length > 0
                            ? "bg-gradient-to-r from-[#ffb703] to-[#ff9500] text-black shadow-2xl shadow-yellow-500/10 hover:shadow-yellow-500/20"
                            : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                        }`}
                >
                    Continue
                </motion.button>
            </div>

        </ChefStepContainer>
    );
}
