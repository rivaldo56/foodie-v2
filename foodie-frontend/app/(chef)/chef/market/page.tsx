'use client';

import { useState } from 'react';
import MarketplaceGrid from '@/components/market/MarketplaceGrid';
import CartDrawer from '@/components/market/CartDrawer';
import { ShoppingBasket } from 'lucide-react';

// Mock data
const MOCK_MARKET_PRODUCTS = [
    {
        id: 1,
        name: 'Fresh Tomatoes',
        category: 'vegetable',
        price_per_unit: 150,
        unit: 'kg',
        farmer_name: 'Green Valley Farm',
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
        farmer_name: 'Highland Organics',
        quantity_available: 30,
        is_available: true,
        image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=1000',
    },
    {
        id: 3,
        name: 'Organic Spinach',
        category: 'vegetable',
        price_per_unit: 80,
        unit: 'bunch',
        farmer_name: 'Mama Mboga Co-op',
        quantity_available: 100,
        is_available: true,
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=1000',
    },
];

export default function MarketplacePage() {
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleAddToCart = (product: any) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1, price: product.price_per_unit, farmer: product.farmer_name }];
        });
        setIsCartOpen(true);
    };

    const handleRemoveItem = (id: number) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        try {
            // TODO: Implement API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert('Order placed successfully!');
            setCartItems([]);
            setIsCartOpen(false);
        } catch (error) {
            console.error('Checkout failed:', error);
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Ingredient Marketplace</h1>
                    <p className="text-muted">Source fresh produce directly from farmers</p>
                </div>
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-3 bg-surface-elevated rounded-xl border border-white/10 hover:bg-white/5 transition"
                >
                    <ShoppingBasket className="h-6 w-6 text-white" />
                    {cartItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                            {cartItems.length}
                        </span>
                    )}
                </button>
            </div>

            <MarketplaceGrid
                products={MOCK_MARKET_PRODUCTS}
                onAddToCart={handleAddToCart}
            />

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cartItems}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout}
                isCheckingOut={isCheckingOut}
            />
        </div>
    );
}
