'use client';

import { ClipboardList, CheckCircle, Clock, XCircle } from 'lucide-react';

const MOCK_ORDERS = [
    {
        id: 'ORD-001',
        chef: 'Chef John Doe',
        items: 'Fresh Tomatoes (5kg), Red Onions (2kg)',
        total: 990,
        status: 'pending',
        date: '2023-11-27',
    },
    {
        id: 'ORD-002',
        chef: 'Chef Jane Smith',
        items: 'Organic Spinach (10 bunches)',
        total: 800,
        status: 'completed',
        date: '2023-11-26',
    },
];

export default function FarmerOrdersPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Incoming Orders</h1>

            <div className="space-y-4">
                {MOCK_ORDERS.map((order) => (
                    <div key={order.id} className="bg-surface-elevated rounded-2xl border border-white/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-mono text-muted">{order.id}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                        order.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                                            'bg-red-500/20 text-red-400'
                                    }`}>
                                    {order.status.toUpperCase()}
                                </span>
                            </div>
                            <h3 className="font-semibold text-white">{order.chef}</h3>
                            <p className="text-sm text-muted mt-1">{order.items}</p>
                            <p className="text-xs text-muted mt-2">{order.date}</p>
                        </div>

                        <div className="flex items-center justify-between md:flex-col md:items-end gap-4">
                            <div className="text-lg font-bold text-white">KES {order.total}</div>

                            {order.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition">
                                        <CheckCircle className="h-5 w-5" />
                                    </button>
                                    <button className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition">
                                        <XCircle className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
