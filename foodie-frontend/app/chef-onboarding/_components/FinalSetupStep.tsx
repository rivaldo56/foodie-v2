"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, ArrowRight } from "lucide-react";

interface FinalSetupStepProps {
    onNext?: () => void;
}

export default function FinalSetupStep({ onNext }: FinalSetupStepProps) {
    const router = useRouter();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Delay content to let "confetti" or initial impact play
        const timer = setTimeout(() => setShowContent(true), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            className="flex flex-col h-full justify-center items-center text-center relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="absolute inset-0 pointer-events-none">
                {/* Soft background glow pulse */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#ffb703] rounded-full blur-[100px] opacity-20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                    transition={{ duration: 4, repeat: Infinity }}
                />
            </div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="mb-8 relative z-10"
            >
                <div className="w-24 h-24 rounded-full bg-[#ffb703]/20 flex items-center justify-center border border-[#ffb703]/50">
                    <ChefHat size={40} className="text-[#ffb703]" />
                </div>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-semibold text-white mb-4 relative z-10"
            >
                Your stage is ready.
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-neutral-400 max-w-xs mb-12 relative z-10"
            >
                We’ll help you find clients, build your brand, and grow real financial freedom.
            </motion.p>

            {showContent && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full space-y-4 max-w-sm z-10"
                >
                    <button
                        onClick={onNext}
                        className="w-full bg-[#ffb703] text-black font-semibold text-lg py-4 rounded-full shadow-lg hover:shadow-yellow-500/25 transition-all flex items-center justify-center group"
                    >
                        Go to Dashboard
                        <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
}
