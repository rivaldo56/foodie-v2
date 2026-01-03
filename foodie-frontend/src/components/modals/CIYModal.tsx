'use client';

import { X, ShoppingBasket, ChefHat, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

interface CIYModalProps {
    isOpen: boolean;
    onClose: () => void;
    mealName: string;
    mealImage?: string;
    ingredients: string[];
    price: number;
}

export default function CIYModal({ isOpen, onClose, mealName, mealImage, ingredients, price }: CIYModalProps) {
    const [step, setStep] = useState<'preview' | 'success'>('preview');

    const handleOrder = async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStep('success');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-surface-elevated rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <ChefHat className="h-5 w-5 text-orange-500" />
                                Cook It Yourself Kit
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition">
                                <X className="h-5 w-5 text-muted" />
                            </button>
                        </div>

                        <div className="p-6">
                            {step === 'preview' ? (
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-surface-highlight flex-shrink-0">
                                            {mealImage ? (
                                                <Image src={mealImage} alt={mealName} fill className="object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <ChefHat className="h-8 w-8 text-muted/20" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white text-lg">{mealName}</h3>
                                            <p className="text-muted text-sm">Fresh ingredients delivered to your door.</p>
                                            <div className="mt-2 text-orange-400 font-bold">
                                                Bundle Price: KES {price}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-surface rounded-xl p-4 border border-white/5">
                                        <h4 className="text-sm font-medium text-white mb-3">Included Ingredients:</h4>
                                        <ul className="space-y-2">
                                            {ingredients.map((ing, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-muted">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    {ing}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button
                                        onClick={handleOrder}
                                        className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBasket className="h-5 w-5" />
                                        Order Kit Now
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-8 space-y-4">
                                    <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check className="h-8 w-8 text-green-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Order Confirmed!</h3>
                                    <p className="text-muted">Your ingredients are being packed by our farmers.</p>
                                    <button
                                        onClick={onClose}
                                        className="mt-6 px-6 py-2 bg-surface border border-white/10 rounded-xl text-white hover:bg-white/5 transition"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
