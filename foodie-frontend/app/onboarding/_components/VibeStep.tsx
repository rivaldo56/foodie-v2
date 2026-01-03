"use client";

import StepContainer from "./StepContainer";
import { motion } from "framer-motion";

interface VibeStepProps {
    value: string[];
    onChange: (val: string[]) => void;
    onNext: () => void;
    onBack: () => void;
}

const VIBES = [
    "Romantic ❤️",
    "Family-friendly 👨‍👩‍👧‍👦",
    "Minimal cleanup ✨",
    "Instagrammable 📸",
    "Fast & Simple ⚡",
    "Cozy 🛋️",
    "Healthy 🥗",
    "Indulgent 🍰",
    "Quiet 🤫",
    "Interactive 🍳"
];

export default function VibeStep({ value, onChange, onNext, onBack }: VibeStepProps) {
    const toggleVibe = (vibe: string) => {
        if (value.includes(vibe)) {
            onChange(value.filter((v) => v !== vibe));
        } else {
            onChange([...value, vibe]);
        }
    };

    return (
        <StepContainer
            title="What’s the vibe?"
            subtitle="Select styles you like."
            onBack={onBack}
        >
            <div className="flex flex-wrap gap-3 mt-6">
                {VIBES.map((vibe, index) => {
                    const isSelected = value.includes(vibe);

                    return (
                        <motion.button
                            key={vibe}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.04 }}
                            onClick={() => toggleVibe(vibe)}
                            className={`px-5 py-3 rounded-full text-base font-medium border transition-all ${isSelected
                                    ? "border-[#ff7642] bg-[#ff7642] text-white shadow-lg shadow-orange-500/20"
                                    : "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10"
                                }`}
                        >
                            {vibe}
                        </motion.button>
                    );
                })}
            </div>

            <div className="mt-12">
                <button
                    onClick={onNext}
                    className="w-full py-4 rounded-full font-medium text-lg bg-[#ff7642] text-white shadow-lg hover:shadow-orange-500/25 transition-all"
                >
                    {value.length > 0 ? "Finish" : "Skip & Finish"}
                </button>
            </div>
        </StepContainer>
    );
}
