'use client';

import { X, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    unit: string;
    image?: string;
    farmer: string;
}

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onRemoveItem: (id: number) => void;
    onCheckout: () => Promise<void>;
    isCheckingOut: boolean;
}

export default function CartDrawer({
    isOpen,
    onClose,
    items,
    onRemoveItem,
    onCheckout,
    isCheckingOut
}: CartDrawerProps) {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-surface-elevated border-l border-white/10 shadow-2xl z-50 flex flex-col"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-orange-500" />
                                <h2 className="text-lg font-semibold text-white">Your Basket</h2>
                                <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded-full">
                                    {items.length}
                                </span>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition">
                                <X className="h-5 w-5 text-muted" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted space-y-4">
                                    <ShoppingBag className="h-16 w-16 opacity-20" />
                                    <p>Your basket is empty</p>
                                    <button onClick={onClose} className="text-orange-500 hover:text-orange-400 text-sm font-medium">
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="flex gap-4 bg-surface p-3 rounded-xl border border-white/5">
                                        <div className="relative h-20 w-20 bg-surface-highlight rounded-lg overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <ShoppingBag className="h-8 w-8 text-muted/20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-medium text-white">{item.name}</h3>
                                                <p className="text-xs text-muted">{item.farmer}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-orange-400 font-semibold">
                                                    KES {item.price} <span className="text-muted font-normal text-xs">x {item.quantity} {item.unit}</span>
                                                </div>
                                                <button
                                                    onClick={() => onRemoveItem(item.id)}
                                                    className="p-1.5 hover:bg-red-500/10 text-muted hover:text-red-400 rounded-lg transition"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="p-4 border-t border-white/5 bg-surface space-y-4">
                                <div className="flex justify-between items-center text-lg font-semibold text-white">
                                    <span>Total</span>
                                    <span>KES {total.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={onCheckout}
                                    disabled={isCheckingOut}
                                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2"
                                >
                                    {isCheckingOut ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Checkout'
                                    )}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
