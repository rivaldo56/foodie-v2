'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ProductList, { type Product } from '@/components/farmers/ProductList';
import AddProductModal from '@/components/modals/AddProductModal';
import { apiRequest } from '@/lib/api';
import type { ProductFormData } from '@/schemas/product.schema';

// Mock data for now, will replace with API call
const MOCK_PRODUCTS: Product[] = [
    {
        id: 1,
        name: 'Fresh Tomatoes',
        category: 'vegetable',
        price_per_unit: 150,
        unit: 'kg',
        quantity_available: 50,
        is_available: true,
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=1000',
    },
    {
        id: 2,
        name: 'Red Onions',
        category: 'vegetable',
        price_per_unit: 120,
        unit: 'kg',
        quantity_available: 30,
        is_available: true,
        image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=1000',
    },
];

export default function ProductsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddProduct = async (data: ProductFormData) => {
        setIsSubmitting(true);
        try {
            // TODO: Replace with actual API call
            // const response = await apiRequest({
            //   url: '/farmers/products/',
            //   method: 'POST',
            //   data,
            // }, true);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newProduct = {
                id: products.length + 1,
                ...data,
                image: data.image || undefined,
            };

            setProducts([newProduct, ...products]);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to add product:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Farm Produce</h1>
                    <p className="text-muted">Manage your inventory and listings</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition shadow-lg shadow-green-900/20"
                >
                    <Plus className="h-5 w-5" />
                    Add Produce
                </button>
            </div>

            <ProductList
                products={products}
                onEdit={(product) => console.log('Edit', product)}
                onDelete={handleDeleteProduct}
            />

            <AddProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddProduct}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
