"use client";

import { motion } from "framer-motion";

interface ChefProgressBarProps {
    current: number;
    total: number;
}

export default function ChefProgressBar({ current, total }: ChefProgressBarProps) {
    const percent = Math.min(100, Math.round((current / total) * 100));

    return (
        <div className="w-full">
            <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.08)" }}
            >
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #ffb703 0%, #ff7642 100%)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
            </div>
            <p className="text-[10px] text-neutral-500 mt-1.5 text-right">
                Step {current} of {total}
            </p>
        </div>
    );
}
