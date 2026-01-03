"use client";

import ChefStepContainer from "./ChefStepContainer";
import { motion } from "framer-motion";
import { ScanFace, CheckCircle2, Shield } from "lucide-react";

interface IdentityStepProps {
    verified: boolean;
    onVerify: () => void;
    onNext: () => void;
    onBack: () => void;
}

export default function IdentityStep({ verified, onVerify, onNext, onBack }: IdentityStepProps) {
    return (
        <ChefStepContainer
            title="Identity Check"
            subtitle="This keeps bookings safe for everyone."
            onBack={onBack}
        >
            <div className="flex flex-col items-center mt-10 mb-10">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative mb-8"
                >
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${verified ? "bg-[#4ade80]/10 border-2 border-[#4ade80]" : "bg-white/5 border border-white/10"
                        }`}>
                        {verified ? <CheckCircle2 size={48} className="text-[#4ade80]" /> : <ScanFace size={48} className="text-neutral-500" />}
                    </div>

                    {verified && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -bottom-2 -right-2 bg-white rounded-full p-2"
                        >
                            <Shield size={20} className="text-[#4ade80] fill-current" />
                        </motion.div>
                    )}
                </motion.div>

                {!verified ? (
                    <div className="text-center max-w-xs">
                        <h3 className="text-xl font-medium text-white mb-2">Verify your identity</h3>
                        <p className="text-neutral-400 text-sm mb-8">
                            We need a quick photo of your ID and a selfie to confirm it's really you.
                        </p>
                        <button
                            onClick={onVerify}
                            className="w-full py-3 px-6 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
                        >
                            Start Verification
                        </button>
                    </div>
                ) : (
                    <div className="text-center max-w-xs">
                        <h3 className="text-xl font-medium text-white mb-2">You're Verified!</h3>
                        <p className="text-[#4ade80] text-sm mb-8">
                            Thanks for helping us keep Foodie safe.
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-auto">
                <button
                    onClick={onNext}
                    disabled={!verified}
                    className={`w-full py-4 rounded-full font-semibold text-lg transition-all ${verified
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
