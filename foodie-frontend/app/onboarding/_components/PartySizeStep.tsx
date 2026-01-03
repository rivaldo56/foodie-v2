"use client";

import StepContainer from "./StepContainer";
import { motion } from "framer-motion";
import { User, Users, UsersRound, PartyPopper } from "lucide-react";

interface PartySizeStepProps {
    value: string;
    onChange: (val: string) => void;
    onNext: () => void;
    onBack: () => void;
}

const SIZES = [
    { id: "1", label: "Just Me", desc: "Self care", icon: User },
    { id: "2-4", label: "2 – 4", desc: "Intimate", icon: Users },
    { id: "5-8", label: "5 – 8", desc: "Dinner Party", icon: UsersRound },
    { id: "9+", label: "Big Event", desc: "Celebration", icon: PartyPopper },
];

export default function PartySizeStep({ value, onChange, onNext, onBack }: PartySizeStepProps) {
    return (
        <StepContainer
            title="Who’s eating?"
            subtitle="Typical party size."
            onBack={onBack}
        >
            <div className="grid grid-cols-1 gap-4 mt-4">
                {SIZES.map((size, index) => {
                    const isSelected = value === size.id;
                    const Icon = size.icon;

                    return (
                        <motion.button
                            key={size.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onChange(size.id)}
                            className={`w-full flex items-center p-5 rounded-2xl border transition-all duration-300 ${isSelected
                                    ? "border-[#ff7642] bg-[#ff7642]/10 ring-1 ring-[#ff7642]"
                                    : "border-white/5 bg-white/5 hover:bg-white/10"
                                }`}
                        >
                            <div className={`p-3 rounded-full mr-5 ${isSelected ? "bg-[#ff7642] text-white" : "bg-zinc-800 text-neutral-400"}`}>
                                <Icon size={24} />
                            </div>
                            <div className="text-left flex-1">
                                <div className={`text-lg font-medium ${isSelected ? "text-white" : "text-neutral-200"}`}>
                                    {size.label}
                                </div>
                                <div className="text-sm text-neutral-500">
                                    {size.desc}
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-[#ff7642]" : "border-neutral-700"
                                }`}>
                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#ff7642]" />}
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
