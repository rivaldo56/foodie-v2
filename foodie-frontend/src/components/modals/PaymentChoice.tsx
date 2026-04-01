'use client';

import React from 'react';
import { ShieldCheck, Zap, Info, CheckCircle } from 'lucide-react';

interface PaymentChoiceProps {
    totalAmount: number;
    selectedMode: 'full_escrow' | 'deposit_only';
    onSelect: (mode: 'full_escrow' | 'deposit_only') => void;
}

export default function PaymentChoice({ totalAmount, selectedMode, onSelect }: PaymentChoiceProps) {
    const depositAmount = Math.round(totalAmount * 0.4);
    const platformFee = Math.round(totalAmount * 0.05);
    const balanceAmount = totalAmount - depositAmount;

    const options = [
        {
            id: 'full_escrow' as const,
            title: 'Full Escrow (Secure)',
            description: 'Pay 100% now. We hold the funds until the event is finished. Maximum security for you.',
            icon: ShieldCheck,
            accentColor: 'border-blue-500/50 bg-blue-500/10',
            iconColor: 'text-blue-400',
            badge: 'Most Secure',
            priceInfo: `Pay $${totalAmount} now`
        },
        {
            id: 'deposit_only' as const,
            title: '40% Deposit (Fast)',
            description: 'Pay only $${depositAmount} now. Pay the remaining $${balanceAmount} directly to the chef later.',
            icon: Zap,
            accentColor: 'border-orange-500/50 bg-orange-500/10',
            iconColor: 'text-orange-400',
            badge: 'Faster Access',
            priceInfo: `Pay only $${depositAmount} now`
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <label className="text-white font-semibold flex items-center gap-2">
                    Choose Payment Option
                </label>
                <div className="group relative">
                    <Info className="h-4 w-4 text-white/40 cursor-help transition-colors hover:text-white" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 rounded-lg text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-white/10 shadow-xl">
                        Full Escrow protects your money until fulfillment. Deposit Only lets the chef start preparations immediately.
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {options.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onSelect(option.id)}
                        className={`relative w-full text-left p-5 rounded-2xl border transition-all duration-300 group overflow-hidden ${selectedMode === option.id
                                ? option.accentColor + ' shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                                : 'border-white/10 bg-white/5 hover:border-white/20'
                            }`}
                    >
                        {/* Selected Indicator */}
                        {selectedMode === option.id && (
                            <div className="absolute top-4 right-4 animate-in zoom-in-50 duration-300">
                                <CheckCircle className={`h-5 w-5 ${option.iconColor}`} />
                            </div>
                        )}

                        {/* Badge */}
                        {option.badge && (
                            <div className={`mb-3 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedMode === option.id ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40'}`}>
                                {option.badge}
                            </div>
                        )}

                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl transition-colors ${selectedMode === option.id ? 'bg-white/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                <option.icon className={`h-6 w-6 ${option.iconColor}`} />
                            </div>
                            
                            <div className="flex-1 pr-6">
                                <h3 className="font-bold text-white mb-1 drop-shadow-sm">
                                    {option.title}
                                </h3>
                                <p className="text-white/60 text-xs leading-relaxed mb-3">
                                    {option.description}
                                </p>
                                <div className={`text-sm font-semibold ${selectedMode === option.id ? 'text-white' : 'text-white/80'}`}>
                                    {option.priceInfo}
                                </div>
                            </div>
                        </div>

                        {/* Summary for Deposit Only */}
                        {option.id === 'deposit_only' && selectedMode === 'deposit_only' && (
                            <div className="mt-4 pt-4 border-t border-orange-500/20 grid grid-cols-2 gap-4 text-[10px]">
                                <div className="space-y-1">
                                    <span className="text-white/40 uppercase">Platform Fee (5%)</span>
                                    <p className="text-white font-medium">${platformFee}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-white/40 uppercase">Chef Portion</span>
                                    <p className="text-white font-medium">${depositAmount - platformFee}</p>
                                </div>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] text-white/40 leading-relaxed italic">
                {selectedMode === 'full_escrow' ? 
                    '* Cancellations are subject to platform refund policy. Chef portion released upon completion.' :
                    '* 30% of deposit is refundable if cancelled 48h+ before event. Remaining 60% balance to be settled directly with the chef.'
                }
            </div>
        </div>
    );
}
