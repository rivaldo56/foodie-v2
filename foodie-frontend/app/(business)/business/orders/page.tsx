'use client';

import { Search, Filter, ClipboardList } from 'lucide-react';

export default function BusinessOrdersPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Bulk Orders</h1>

            {/* Search and Filter */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="w-full bg-surface-elevated border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    />
                </div>
                <button className="p-2.5 bg-surface-elevated border border-white/10 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition">
                    <Filter className="h-5 w-5" />
                </button>
            </div>

            <div className="text-center py-20 bg-surface-elevated rounded-2xl border border-white/5">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/5 mb-4">
                    <ClipboardList className="h-8 w-8 text-white/20" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No orders yet</h3>
                <p className="text-white/50 max-w-xs mx-auto">Orders from chefs and restaurants will appear here.</p>
            </div>
        </div>
    );
}
