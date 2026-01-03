"use client";

import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";

interface WelcomeStepProps {
    onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
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
                    className="mb-8 p-4 bg-[#ff7642]/10 rounded-2xl text-[#ff7642]"
                >
                    <ChefHat size={48} />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6 leading-[1.1]"
                >
                    Let’s cook <br />
                    something <br />
                    <span className="text-[#ff7642]">unforgettable.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-neutral-400 text-xl leading-relaxed max-w-sm"
                >
                    Tell us a bit about you so we can match you with the perfect chefs.
                </motion.p>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNext}
                className="w-full bg-[#ff7642] text-white font-medium text-lg py-4 rounded-full shadow-lg hover:shadow-orange-500/25 transition-all"
            >
                Get Started
            </motion.button>
        </motion.div>
    );
}
