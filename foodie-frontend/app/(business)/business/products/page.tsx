'use client';

import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Package } from 'lucide-react';
import { Product } from '@/components/farmers/ProductList';

export default function BusinessProductsPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]); // Mock data for now

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition shadow-glow"
                >
                    <Plus className="h-5 w-5" />
                    Add New Product
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        className="w-full bg-surface-elevated border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    />
                </div>
                <button className="p-2.5 bg-surface-elevated border border-white/10 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition">
                    <Filter className="h-5 w-5" />
                </button>
            </div>

            {/* Product List */}
            {products.length === 0 ? (
                <div className="text-center py-20 bg-surface-elevated rounded-2xl border border-white/5">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/5 mb-4">
                        <Package className="h-8 w-8 text-white/20" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">No products listed</h3>
                    <p className="text-white/50 max-w-xs mx-auto mb-6">Start building your catalog to reach chefs and restaurants.</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                    >
                        + Add your first product
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {/* Product items would go here */}
                </div>
            )}
        </div>
    );
}
