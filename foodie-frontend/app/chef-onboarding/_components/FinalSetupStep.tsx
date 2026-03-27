"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChefHat, ArrowRight, Loader2 } from "lucide-react";

interface FinalSetupStepProps {
    onNext?: () => void;
}

export default function FinalSetupStep({ onNext }: FinalSetupStepProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoToDashboard = async () => {
        if (!onNext || loading) return;
        setLoading(true);
        setError(null);
        try {
            await onNext();
        } catch {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="flex flex-col h-full justify-center items-center text-center relative overflow-hidden px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Multi-layered ambient glow for premium depth */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px]"
                    style={{ background: "radial-gradient(circle, #ffb703 0%, #ff7642 50%, transparent 100%)", opacity: 0.12 }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.2, 0.12] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-blue-500/10 blur-[80px] rounded-full" />
            </div>

            <motion.div
                initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 1.2, type: "spring", bounce: 0.5 }}
                className="mb-10 relative z-10"
            >
                <div className="w-36 h-36 rounded-[3rem] flex items-center justify-center relative group"
                    style={{ background: "linear-gradient(135deg, rgba(255,183,3,0.3) 0%, rgba(255,118,66,0.15) 100%)", border: "1px solid rgba(255,183,3,0.5)" }}>
                    <ChefHat size={56} className="text-[#ffb703] group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                    
                    {/* Concentric pulse rings */}
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute inset-0 rounded-[3rem] border border-[#ffb703]/20"
                            animate={{ scale: [1, 1 + i * 0.3], opacity: [0.4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
                        />
                    ))}
                </div>
            </motion.div>

            <div className="space-y-4 max-w-sm relative z-10">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-[2.5rem] font-black text-white leading-[1.1] tracking-tighter"
                >
                    Your kitchen <br/><span className="text-[#ffb703]">is open.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-white/40 text-lg font-light leading-relaxed px-4"
                >
                    Welcome to the future of culinary freedom. Your profile is now live.
                </motion.p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="w-full mt-16 max-w-sm z-10"
            >
                {error && (
                    <motion.p 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-sm font-bold text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-2xl px-6 py-4 mb-6 shadow-xl"
                    >
                        {error}
                    </motion.p>
                )}
                
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoToDashboard}
                    disabled={loading}
                    className="w-full font-black text-xl py-6 rounded-full shadow-[0_20px_50px_rgba(255,183,3,0.2)] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                    style={{ 
                        background: loading ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #ffb703 0%, #ff9500 100%)", 
                        color: loading ? "rgba(255,255,255,0.2)" : "#0f0f0f",
                        border: loading ? "1px solid rgba(255,255,255,0.05)" : "none"
                    }}
                >
                    {loading ? (
                        <>
                            <Loader2 size={24} className="animate-spin" />
                            <span>Preparing Seat...</span>
                        </>
                    ) : (
                        <>
                            <span>Enter Dashboard</span>
                            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
                        </>
                    )}
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
