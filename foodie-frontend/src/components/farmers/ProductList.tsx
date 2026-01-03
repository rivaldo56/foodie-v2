'use client';

import { Edit, Trash2, ShoppingBasket } from 'lucide-react';
import Image from 'next/image';

export interface Product {
    id: number;
    name: string;
    category: string;
    price_per_unit: number;
    unit: string;
    quantity_available: number;
    image?: string;
    is_available: boolean;
}

interface ProductListProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
}

export default function ProductList({ products, onEdit, onDelete }: ProductListProps) {
    if (products.length === 0) {
        return (
            <div className="text-center py-20 bg-surface-elevated rounded-2xl border border-white/5">
                <ShoppingBasket className="h-12 w-12 text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white">No products listed</h3>
                <p className="text-muted">Start by adding your first harvest!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
                <div key={product.id} className="bg-surface-elevated rounded-2xl border border-white/5 overflow-hidden group hover:border-green-500/30 transition-colors">
                    <div className="relative h-40 bg-surface-highlight">
                        {product.image ? (
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted">
                                <ShoppingBasket className="h-10 w-10 opacity-20" />
                            </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onEdit(product)}
                                className="p-2 bg-black/60 backdrop-blur rounded-full text-white hover:bg-black/80 transition"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onDelete(product.id)}
                                className="p-2 bg-red-500/80 backdrop-blur rounded-full text-white hover:bg-red-600 transition"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="absolute bottom-2 left-2">
                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-md ${product.is_available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {product.is_available ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-semibold text-white">{product.name}</h3>
                                <p className="text-xs text-muted capitalize">{product.category}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-400">KES {product.price_per_unit}</p>
                                <p className="text-xs text-muted">per {product.unit}</p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-white/5 flex justify-between items-center text-sm">
                            <span className="text-muted">Available:</span>
                            <span className="font-medium text-white">{product.quantity_available} {product.unit}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
