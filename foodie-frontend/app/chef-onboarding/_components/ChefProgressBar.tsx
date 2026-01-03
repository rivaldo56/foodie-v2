"use client";

import { motion } from "framer-motion";

interface ChefProgressBarProps {
    current: number;
    total: number;
}

export default function ChefProgressBar({ current, total }: ChefProgressBarProps) {
    const progress = (current / total) * 100;

    return (
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
                className="h-full bg-[#ffb703] rounded-full" // Yellow/Gold for Chef distinctness? Or stick to orange? Let's use Gold (#ffb703) to signify "Talent/Premium"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </div>
    );
}
