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
            <div className="grid grid-cols-2 gap-3 mt-4 mb-6">
                {SKILLS.map((skill, index) => {
                    const isSelected = value.includes(skill.id);
                    const Icon = skill.icon;

                    return (
                        <motion.button
                            key={skill.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => toggleSkill(skill.id)}
                            className={`flex flex-col items-center justify-center p-4 h-28 rounded-2xl border transition-all duration-300 ${isSelected
                                    ? "border-[#ffb703] bg-[#ffb703]/10"
                                    : "border-white/5 bg-white/5 hover:bg-white/10"
                                }`}
                        >
                            <Icon size={24} className={`mb-2 ${isSelected ? "text-[#ffb703]" : "text-neutral-400"}`} />
                            <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-neutral-300"}`}>
                                {skill.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400 ml-1">Signature Style (Optional)</label>
                <textarea
                    value={signature}
                    onChange={(e) => onSignatureChange(e.target.value)}
                    placeholder="e.g. Modern French with Japanese techniques..."
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ffb703] transition-colors resize-none"
                />
            </div>

            <div className="mt-8">
                <button
                    onClick={onNext}
                    disabled={value.length === 0}
                    className={`w-full py-4 rounded-full font-semibold text-lg transition-all ${value.length > 0
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
