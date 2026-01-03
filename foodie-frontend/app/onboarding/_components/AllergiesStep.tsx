"use client";

import StepContainer from "./StepContainer";
import { motion } from "framer-motion";
import { ShieldCheck, Check } from "lucide-react";

interface AllergiesStepProps {
    value: string[];
    details: string;
    onChange: (val: string[]) => void;
    onDetailsChange: (val: string) => void;
    onNext: () => void;
    onBack: () => void;
}

const ALLERGIES = [
    "No Restrictions",
    "Nuts",
    "Shellfish",
    "Dairy",
    "Gluten",
    "Eggs",
    "Soy",
];

export default function AllergiesStep({ value, details, onChange, onDetailsChange, onNext, onBack }: AllergiesStepProps) {
    const toggleAllergy = (item: string) => {
        if (item === "No Restrictions") {
            onChange(["No Restrictions"]);
            return;
        }

        let newValue = [...value];
        if (newValue.includes("No Restrictions")) {
            newValue = [];
        }

        if (newValue.includes(item)) {
            newValue = newValue.filter((v) => v !== item);
        } else {
            newValue.push(item);
        }

        onChange(newValue);
    };

    return (
        <StepContainer
            title="Any food restrictions?"
            subtitle="We’ll make sure chefs design menus safely."
            onBack={onBack}
        >
            <div className="space-y-3 mt-4">
                {ALLERGIES.map((allergy, index) => {
                    const isSelected = value.includes(allergy);
                    return (
                        <motion.button
                            key={allergy}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => toggleAllergy(allergy)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected
                                    ? "border-[#ff7642] bg-[#ff7642]/10"
                                    : "border-white/5 bg-white/5 hover:bg-white/10"
                                }`}
                        >
                            <span className={`text-lg ${isSelected ? "text-white font-medium" : "text-neutral-300"}`}>
                                {allergy}
                            </span>
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "bg-[#ff7642] border-[#ff7642]" : "border-neutral-600"
                                }`}>
                                {isSelected && <Check size={14} className="text-white" />}
                            </div>
                        </motion.button>
                    );
                })}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="pt-2"
                >
                    <label className="block text-sm text-neutral-400 mb-2 pl-1">Other / Details (Optional)</label>
                    <textarea
                        value={details}
                        onChange={(e) => onDetailsChange(e.target.value)}
                        placeholder="e.g. Cilantro aversion, mild lactose intolerance..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ff7642] transition-colors resize-none h-24"
                    />
                </motion.div>
            </div>

            <div className="mt-8 flex items-center gap-3 bg-[#4ade80]/10 p-4 rounded-xl border border-[#4ade80]/20">
                <ShieldCheck className="text-[#4ade80] shrink-0" size={24} />
                <p className="text-sm text-[#4ade80]">Your safety is our priority. Allergies are highlighted to all chefs.</p>
            </div>

            <div className="mt-8">
                <button
                    onClick={onNext}
                    className="w-full py-4 rounded-full font-medium text-lg bg-[#ff7642] text-white shadow-lg hover:shadow-orange-500/25 transition-all"
                >
                    Continue
                </button>
            </div>
        </StepContainer>
    );
}
