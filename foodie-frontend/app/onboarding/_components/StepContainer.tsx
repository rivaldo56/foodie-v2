"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import React from "react";

interface StepContainerProps {
    children: React.ReactNode;
    onBack?: () => void;
    title?: string;
    subtitle?: string;
    className?: string;
}

export default function StepContainer({
    children,
    onBack,
    title,
    subtitle,
    className = "",
}: StepContainerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Custom ease for "premium" feel
            className={`w-full flex flex-col h-full ${className}`}
        >
            <div className="mb-6">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="mb-6 text-neutral-400 hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/5 w-fit"
                    >
                        <ArrowLeft size={24} />
                    </button>
                )}

                {title && (
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="text-3xl font-medium tracking-tight text-white mb-2"
                    >
                        {title}
                    </motion.h1>
                )}

                {subtitle && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-neutral-400 text-lg leading-relaxed"
                    >
                        {subtitle}
                    </motion.p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide -mx-1 px-1 py-1">
                {children}
            </div>
        </motion.div>
    );
}
