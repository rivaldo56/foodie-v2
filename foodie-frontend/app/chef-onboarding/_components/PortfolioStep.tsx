"use client";

import ChefStepContainer from "./ChefStepContainer";
import { motion } from "framer-motion";
import { Upload, Image as ImageIcon, Plus } from "lucide-react";
import { useState } from "react";

interface PortfolioStepProps {
    onNext: () => void;
    onBack: () => void;
}

export default function PortfolioStep({ onNext, onBack }: PortfolioStepProps) {
    const [files, setFiles] = useState<number[]>([]);

    const handleFakeUpload = () => {
        if (files.length < 4) {
            setFiles([...files, Date.now()]);
        }
    };

    return (
        <ChefStepContainer
            title="Show your craft."
            subtitle="Upload plating, menus, or vibes."
            onBack={onBack}
        >
            <div className="mt-4">
                {/* Upload Area */}
                <motion.div
                    whileHover={{ scale: 1.01, borderColor: "rgba(255, 183, 3, 0.4)" }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleFakeUpload}
                    className="w-full h-48 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-white/5 transition-all mb-8"
                >
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 text-[#ffb703]">
                        <Upload size={24} />
                    </div>
                    <p className="text-white font-medium mb-1">Tap to upload</p>
                    <p className="text-neutral-500 text-sm">Images or videos</p>
                </motion.div>

                {/* Preview Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {files.map((file, i) => (
                        <motion.div
                            key={file}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="aspect-square rounded-xl bg-neutral-800 flex items-center justify-center relative overflow-hidden group"
                        >
                            <ImageIcon className="text-neutral-600" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-xs text-white">Preview</span>
                            </div>
                        </motion.div>
                    ))}

                    {/* Add more placeholder */}
                    {files.length > 0 && files.length < 4 && (
                        <button
                            onClick={handleFakeUpload}
                            className="aspect-square rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors text-neutral-500 hover:text-white"
                        >
                            <Plus size={24} />
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-auto pt-8">
                <button
                    onClick={onNext}
                    className="w-full py-4 rounded-full font-semibold text-lg bg-[#ffb703] text-black shadow-lg hover:shadow-yellow-500/25 transition-all"
                >
                    {files.length > 0 ? "Continue" : "Skip for now"}
                </button>
            </div>
        </ChefStepContainer>
    );
}
