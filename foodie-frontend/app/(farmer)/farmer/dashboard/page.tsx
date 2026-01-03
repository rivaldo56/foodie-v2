'use client';

import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBasket, DollarSign, Users } from 'lucide-react';

export default function FarmerDashboard() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Sales', value: 'KES 45,000', icon: DollarSign, color: 'text-green-400' },
                    { label: 'Active Listings', value: '12', icon: ShoppingBasket, color: 'text-orange-400' },
                    { label: 'Pending Orders', value: '5', icon: TrendingUp, color: 'text-blue-400' },
                    { label: 'Chef Connections', value: '8', icon: Users, color: 'text-purple-400' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-surface-elevated p-4 rounded-2xl border border-white/5"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs text-muted">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-surface-elevated rounded-2xl border border-white/5 p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
                <div className="text-center py-10 text-muted">
                    <p>No orders yet. List more produce to get started!</p>
                </div>
            </div>
        </div>
    );
}
