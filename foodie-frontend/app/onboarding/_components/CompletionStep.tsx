"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CompletionStepProps {
    onNext?: () => void;
}

export default function CompletionStep({ onNext }: CompletionStepProps) {
    const router = useRouter();
    const [particles, setParticles] = useState<number[]>([]);

    useEffect(() => {
        // Generate particles on mount
        setParticles(Array.from({ length: 30 }, (_, i) => i));
    }, []);

    return (
        <motion.div
            className="flex flex-col h-full justify-center items-center text-center relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Confetti container */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {particles.map((i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: "-10%",
                            backgroundColor: ["#ff7642", "#4ade80", "#facc15", "#3b82f6"][Math.floor(Math.random() * 4)],
                        }}
                        animate={{
                            y: ["0vh", "100vh"],
                            x: [0, Math.random() * 100 - 50],
                            rotate: [0, 360],
                        }}
                        transition={{
                            duration: Math.random() * 2 + 2,
                            delay: Math.random() * 0.5,
                            ease: "linear",
                            repeat: Infinity,
                            repeatDelay: Math.random() * 2
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8 p-6 bg-[#ff7642]/10 rounded-full text-[#ff7642] glass-panel"
            >
                <span className="text-4xl">🎉</span>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-medium text-white mb-4"
            >
                Your Foodie world <br /> is ready.
            </motion.h1>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="w-full space-y-4 mt-8 max-w-sm z-10"
            >
                <button
                    onClick={onNext}
                    className="w-full bg-[#ff7642] text-white font-medium text-lg py-4 rounded-full shadow-lg hover:shadow-orange-500/25 transition-all"
                >
                    Start Exploring
                </button>
            </motion.div>
        </motion.div>
    );
}
