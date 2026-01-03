"use client";

import ChefStepContainer from "./ChefStepContainer";
import { motion } from "framer-motion";
import { ShieldCheck, Upload, Check } from "lucide-react";

interface CertificationsStepProps {
    value: string[];
    onChange: (val: string[]) => void;
    onNext: () => void;
    onBack: () => void;
}

const CERTS = [
    "Food Handling Certificate",
    "Kitchen Safety Training",
    "First Aid / CPR",
    "Culinary Degree / Diploma",
];

export default function CertificationsStep({ value, onChange, onNext, onBack }: CertificationsStepProps) {
    const toggleCert = (cert: string) => {
        if (value.includes(cert)) {
            onChange(value.filter((v) => v !== cert));
        } else {
            onChange([...value, cert]);
        }
    };

    return (
        <ChefStepContainer
            title="Certifications"
            subtitle="Safety builds trust."
            onBack={onBack}
        >
            <div className="space-y-3 mt-4">
                {CERTS.map((cert, index) => {
                    const isSelected = value.includes(cert);

                    return (
                        <motion.button
                            key={cert}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => toggleCert(cert)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected
                                    ? "border-[#ffb703] bg-[#ffb703]/10"
                                    : "border-white/5 bg-white/5 hover:bg-white/10"
                                }`}
                        >
                            <span className={`text-base font-medium ${isSelected ? "text-white" : "text-neutral-300"}`}>
                                {cert}
                            </span>
                            <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${isSelected ? "bg-[#ffb703] border-[#ffb703]" : "border-neutral-600"
                                }`}>
                                {isSelected && <Check size={16} className="text-black" />}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center text-center">
                <p className="text-sm text-neutral-400 mb-3">Upload proof (Optional for now)</p>
                <button className="flex items-center gap-2 text-[#ffb703] text-sm font-medium border border-[#ffb703]/30 px-4 py-2 rounded-lg hover:bg-[#ffb703]/10 transition-colors">
                    <Upload size={16} />
                    Upload Documents
                </button>
            </div>

            <div className="mt-8">
                <button
                    onClick={onNext}
                    className="w-full py-4 rounded-full font-semibold text-lg bg-[#ffb703] text-black shadow-lg hover:shadow-yellow-500/25 transition-all"
                >
                    {value.length > 0 ? "Continue" : "Skip"}
                </button>
            </div>
        </ChefStepContainer>
    );
}
