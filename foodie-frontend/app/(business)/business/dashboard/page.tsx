'use client';

import { BarChart3, Package, ShoppingBag, TrendingUp } from 'lucide-react';

const STATS = [
    { label: 'Total Sales', value: 'KES 124,500', change: '+12%', icon: TrendingUp },
    { label: 'Active Products', value: '45', change: '+3', icon: Package },
    { label: 'Pending Orders', value: '8', change: '-2', icon: ShoppingBag },
    { label: 'Monthly Revenue', value: 'KES 85,200', change: '+8%', icon: BarChart3 },
];

export default function BusinessDashboard() {
    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {STATS.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-surface-elevated p-4 sm:p-6 shadow-lg backdrop-blur">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-white/50">{stat.label}</p>
                                <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                            <div className="rounded-xl bg-blue-500/20 p-3 text-blue-400">
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-green-400">{stat.change}</span>
                            <span className="ml-2 text-white/30">vs last month</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid gap-8 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-surface-elevated p-6 shadow-lg backdrop-blur">
                    <h2 className="mb-6 text-lg font-semibold text-white">Recent Bulk Orders</h2>
                    <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5">
                        <p className="text-white/30">No recent orders</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-surface-elevated p-6 shadow-lg backdrop-blur">
                    <h2 className="mb-6 text-lg font-semibold text-white">Inventory Alerts</h2>
                    <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5">
                        <p className="text-white/30">Inventory levels are good</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
