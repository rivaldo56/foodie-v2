'use client';

import { ShoppingCart, Filter } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    category: string;
    price_per_unit: number;
    unit: string;
    farmer_name: string;
    image?: string;
    is_available: boolean;
}

interface MarketplaceGridProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
}

export default function MarketplaceGrid({ products, onAddToCart }: MarketplaceGridProps) {
    const [filter, setFilter] = useState('all');

    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => p.category === filter);

    const categories = ['all', 'vegetable', 'fruit', 'spice', 'meat', 'dairy', 'grain'];

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${filter === cat
                                ? 'bg-orange-500 text-white'
                                : 'bg-surface-elevated text-muted hover:bg-white/5'
                            }`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-surface-elevated rounded-2xl border border-white/5 overflow-hidden group hover:border-orange-500/30 transition-colors">
                        <div className="relative h-32 sm:h-40 bg-surface-highlight">
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted">
                                    <ShoppingCart className="h-8 w-8 opacity-20" />
                                </div>
                            )}
                            <div className="absolute top-2 left-2">
                                <span className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-black/60 backdrop-blur text-white">
                                    {product.farmer_name}
                                </span>
                            </div>
                            <button
                                onClick={() => onAddToCart(product)}
                                className="absolute bottom-2 right-2 p-2 bg-orange-500 rounded-full text-white shadow-lg transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                            >
                                <ShoppingCart className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-3">
                            <h3 className="font-semibold text-white text-sm truncate">{product.name}</h3>
                            <div className="flex justify-between items-end mt-1">
                                <div>
                                    <p className="text-xs text-muted capitalize">{product.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-orange-400 text-sm">KES {product.price_per_unit}</p>
                                    <p className="text-[10px] text-muted">/{product.unit}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
