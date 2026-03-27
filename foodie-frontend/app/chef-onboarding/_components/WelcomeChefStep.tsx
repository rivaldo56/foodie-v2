"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed, ChefHat } from "lucide-react";

interface WelcomeChefStepProps {
    onNext: () => void;
}

export default function WelcomeChefStep({ onNext }: WelcomeChefStepProps) {
    return (
        <motion.div
            className="flex flex-col h-full justify-between pt-10 pb-4 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Ambient background glow for this step specifically */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                <motion.div 
                    className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#ffb703] opacity-[0.05] blur-[100px] rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.08, 0.05] }}
                    transition={{ duration: 4, repeat: Infinity }}
                />
            </div>

            <div className="flex-1 flex flex-col justify-center items-start">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="mb-10 p-5 bg-gradient-to-br from-[#ffb703]/20 to-[#ff7642]/10 rounded-2xl text-[#ffb703] border border-[#ffb703]/20 relative"
                >
                    <UtensilsCrossed size={48} strokeWidth={1.5} />
                    <motion.div 
                        className="absolute inset-0 bg-[#ffb703]/20 blur-2xl rounded-2xl -z-10"
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                    className="text-5xl md:text-6xl font-semibold tracking-tight text-white mb-6 leading-[1.05]"
                >
                    Your stage <br />
                    is <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffb703] to-[#ff7642]">waiting.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-white/60 text-xl leading-relaxed max-w-sm mb-8 font-light"
                >
                    Chef, it's time to build your independent brand and reach clients who truly value your craft.
                </motion.p>
            </div>

            <div className="space-y-6 w-full pt-8 relative z-10">
                <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(255,183,3,0.3)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onNext}
                    className="w-full bg-gradient-to-r from-[#ffb703] to-[#ff7642] text-black font-bold text-lg py-5 rounded-full shadow-2xl transition-all relative overflow-hidden group"
                >
                    <span className="relative z-10">Start My Journey</span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                </motion.button>

                <button className="w-full text-white/40 text-sm hover:text-white transition-colors py-2 font-medium tracking-wide flex items-center justify-center gap-2">
                    Learn how Foodie works
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ffb703]" />
                </button>
            </div>
        </motion.div>
    );
}

