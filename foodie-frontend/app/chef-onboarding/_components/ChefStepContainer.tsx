"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import React from "react";

interface ChefStepContainerProps {
    children: React.ReactNode;
    onBack?: () => void;
    title?: string;
    subtitle?: string;
}

export default function ChefStepContainer({
    children,
    onBack,
    title,
    subtitle,
}: ChefStepContainerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex flex-col h-full relative"
        >
            <div className="mb-8 relative z-10">
                {onBack && (
                    <motion.button
                        whileHover={{ x: -4, backgroundColor: "rgba(255,255,255,0.05)" }}
                        onClick={onBack}
                        className="mb-8 text-neutral-500 hover:text-white transition-all p-2 -ml-2 rounded-full flex items-center gap-2 group"
                    >
                        <ArrowLeft size={20} className="group-hover:text-[#ffb703] transition-colors" />
                        <span className="text-sm font-medium">Back</span>
                    </motion.button>
                )}

                {title && (
                    <motion.h1
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="text-4xl font-semibold tracking-tight text-white mb-3"
                    >
                        {title}
                    </motion.h1>
                )}

                {subtitle && (
                    <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-white/50 text-lg leading-relaxed font-light max-w-sm"
                    >
                        {subtitle}
                    </motion.p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide -mx-2 px-2 py-2 mb-4">

                {children}
            </div>
        </motion.div>
    );
}
