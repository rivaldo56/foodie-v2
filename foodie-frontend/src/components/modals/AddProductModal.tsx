'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '@/schemas/product.schema';
import { X, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProductFormData) => Promise<void>;
    isSubmitting?: boolean;
}

export default function AddProductModal({ isOpen, onClose, onSubmit, isSubmitting }: AddProductModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            is_available: true,
            category: 'vegetable',
            unit: 'kg',
        },
    });

    const handleFormSubmit = async (data: ProductFormData) => {
        await onSubmit(data);
        reset();
        onClose();
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
                            <h2 className="text-lg font-semibold text-white">Add New Produce</h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition">
                                <X className="h-5 w-5 text-muted" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Product Name</label>
                                <input
                                    {...register('name')}
                                    className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition"
                                    placeholder="e.g. Red Onions"
                                />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-1">Category</label>
                                    <select
                                        {...register('category')}
                                        className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-green-500 outline-none appearance-none"
                                    >
                                        <option value="vegetable">Vegetable</option>
                                        <option value="fruit">Fruit</option>
                                        <option value="spice">Spice</option>
                                        <option value="meat">Meat</option>
                                        <option value="dairy">Dairy</option>
                                        <option value="grain">Grain</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-1">Unit</label>
                                    <select
                                        {...register('unit')}
                                        className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-green-500 outline-none appearance-none"
                                    >
                                        <option value="kg">Kilogram (kg)</option>
                                        <option value="g">Gram (g)</option>
                                        <option value="bunch">Bunch</option>
                                        <option value="piece">Piece</option>
                                        <option value="liter">Liter</option>
                                        <option value="box">Box</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-1">Price per Unit (KES)</label>
                                    <input
                                        type="number"
                                        {...register('price_per_unit')}
                                        className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-green-500 outline-none"
                                        placeholder="0.00"
                                    />
                                    {errors.price_per_unit && <p className="text-red-400 text-xs mt-1">{errors.price_per_unit.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-1">Quantity Available</label>
                                    <input
                                        type="number"
                                        {...register('quantity_available')}
                                        className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-green-500 outline-none"
                                        placeholder="0"
                                    />
                                    {errors.quantity_available && <p className="text-red-400 text-xs mt-1">{errors.quantity_available.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Image URL (Optional)</label>
                                <div className="flex gap-2">
                                    <input
                                        {...register('image')}
                                        className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-green-500 outline-none"
                                        placeholder="https://..."
                                    />
                                    <button type="button" className="p-2.5 bg-surface border border-white/10 rounded-xl hover:bg-white/5 transition">
                                        <Upload className="h-5 w-5 text-muted" />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'List Product'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
