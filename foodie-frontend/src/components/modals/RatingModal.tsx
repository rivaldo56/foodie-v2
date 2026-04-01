'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, ShieldCheck, X, Heart } from 'lucide-react';

interface RatingModalProps {
    bookingId: string | number;
    chefName: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RatingData) => void;
}

export interface RatingData {
    chefRating: number;
    platformRating: number;
    comment: string;
}

export default function RatingModal({ bookingId, chefName, isOpen, onClose, onSubmit }: RatingModalProps) {
    const [chefRating, setChefRating] = useState(0);
    const [platformRating, setPlatformRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoverChef, setHoverChef] = useState(0);
    const [hoverPlatform, setHoverPlatform] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleRatingSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit({ chefRating, platformRating, comment });
            onClose();
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
            <div className="relative w-full max-w-md bg-gray-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col">
                {/* Header */}
                <div className="p-8 pb-4 text-center">
                    <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                        <Heart className="h-8 w-8 text-orange-500 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">How was the experience?</h2>
                    <p className="text-white/40 text-sm">Your feedback helps us maintain the quality of our community.</p>
                </div>

                <div className="p-8 pt-0 space-y-8">
                    {/* Chef Rating */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Rate Chef</span>
                            <span className="text-sm font-semibold text-white">{chefName}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoverChef(star)}
                                    onMouseLeave={() => setHoverChef(0)}
                                    onClick={() => setChefRating(star)}
                                    className="p-1 transition-transform active:scale-90"
                                >
                                    <Star
                                        className={`h-8 w-8 transition-colors ${
                                            (hoverChef || chefRating) >= star
                                                ? 'fill-orange-400 text-orange-400'
                                                : 'text-white/10'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <MessageSquare className="absolute top-4 left-4 h-4 w-4 text-white/30" />
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write a note to the chef..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 transition-all resize-none min-h-[100px]"
                            />
                        </div>
                    </div>

                    {/* Platform Rating */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Rate Platform</span>
                            <ShieldCheck className="h-3 w-3 text-blue-400" />
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoverPlatform(star)}
                                    onMouseLeave={() => setHoverPlatform(0)}
                                    onClick={() => setPlatformRating(star)}
                                    className="p-1 transition-transform active:scale-90"
                                >
                                    <Star
                                        className={`h-6 w-6 transition-colors ${
                                            (hoverPlatform || platformRating) >= star
                                                ? 'fill-blue-400 text-blue-400'
                                                : 'text-white/10'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 pt-0 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white font-semibold border border-white/10 transition-all"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleRatingSubmit}
                        disabled={isSubmitting || chefRating === 0}
                        className="flex-[2] py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/40 rounded-2xl text-white font-bold transition-all shadow-[0_10px_20px_rgba(249,115,22,0.2)] flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Submit Review'
                        )}
                    </button>
                </div>

                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors">
                    <X className="h-5 w-5 text-white/40" />
                </button>
            </div>
        </div>
    );
}
