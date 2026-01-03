"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed, ChefHat } from "lucide-react";

interface WelcomeChefStepProps {
    onNext: () => void;
}

export default function WelcomeChefStep({ onNext }: WelcomeChefStepProps) {
    return (
        <motion.div
            className="flex flex-col h-full justify-between pt-10 pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="flex-1 flex flex-col justify-center items-start">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 p-4 bg-[#ffb703]/10 rounded-2xl text-[#ffb703]"
                >
                    <UtensilsCrossed size={48} />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6 leading-[1.1]"
                >
                    Welcome to <br />
                    <span className="text-[#ffb703]">Foodie.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-neutral-300 text-xl leading-relaxed max-w-sm mb-8"
                >
                    A space where talent gets seen, paid, and respected. We're honored to have you here.
                </motion.p>
            </div>

            <div className="space-y-4 w-full">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onNext}
                    className="w-full bg-[#ffb703] text-black font-semibold text-lg py-4 rounded-full shadow-lg hover:shadow-yellow-500/25 transition-all"
                >
                    Start My Journey
                </motion.button>

                <button className="w-full text-neutral-500 text-sm hover:text-white transition-colors py-2">
                    Learn how Foodie works
                </button>
            </div>
        </motion.div>
    );
}
