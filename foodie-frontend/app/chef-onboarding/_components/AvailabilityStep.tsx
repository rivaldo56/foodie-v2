"use client";

import ChefStepContainer from "./ChefStepContainer";
import { motion } from "framer-motion";
import { Calendar, Moon, Sun, Snowflake } from "lucide-react";

interface AvailabilityStepProps {
    value: string[];
    onChange: (val: string[]) => void;
    onNext: () => void;
    onBack: () => void;
}

const TIMES = [
    { id: "weekdays", label: "Weekdays", icon: Sun },
    { id: "weekends", label: "Weekends", icon: Calendar },
    { id: "evenings", label: "Evenings", icon: Moon },
    { id: "holidays", label: "Holidays / Seasonal", icon: Snowflake },
];

export default function AvailabilityStep({ value, onChange, onNext, onBack }: AvailabilityStepProps) {
    const toggleTime = (id: string) => {
        if (value.includes(id)) {
            onChange(value.filter((v) => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    return (
        <ChefStepContainer
            title="When do you cook?"
            subtitle="General availability."
            onBack={onBack}
        >
            <div className="space-y-4 mt-6">
                {TIMES.map((time, index) => {
                    const isSelected = value.includes(time.id);
                    const Icon = time.icon;

                    return (
                        <motion.div
                            key={time.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${isSelected ? "border-[#ffb703]/50 bg-[#ffb703]/5" : "border-white/5 bg-white/5"
                                }`}
                        >
                            <div className="flex items-center">
                                <div className={`p-2 rounded-lg mr-4 ${isSelected ? "bg-[#ffb703] text-black" : "bg-white/10 text-neutral-400"}`}>
                                    <Icon size={20} />
                                </div>
                                <span className="text-lg font-medium text-white">{time.label}</span>
                            </div>

                            {/* Toggle Switch */}
                            <button
                                onClick={() => toggleTime(time.id)}
                                className={`w-14 h-8 rounded-full p-1 transition-colors ${isSelected ? "bg-[#ffb703]" : "bg-neutral-700"
                                    }`}
                            >
                                <motion.div
                                    layout
                                    className="w-6 h-6 rounded-full bg-white shadow-sm"
                                    animate={{ x: isSelected ? 24 : 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </button>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-8">
                <button
                    onClick={onNext}
                    className="w-full py-4 rounded-full font-semibold text-lg bg-[#ffb703] text-black shadow-lg hover:shadow-yellow-500/25 transition-all"
                >
                    Continue
                </button>
            </div>
        </ChefStepContainer>
    );
}
