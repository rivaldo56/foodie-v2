'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, User, Store } from 'lucide-react';

export default function BusinessBottomNav() {
    const pathname = usePathname();

    const navItems = [
        {
            name: 'Dashboard',
            href: '/business/dashboard',
            icon: LayoutDashboard,
        },
        {
            name: 'Products',
            href: '/business/products',
            icon: Package,
        },
        {
            name: 'Market',
            href: '/chef/market',
            icon: Store,
        },
        {
            name: 'Orders',
            href: '/business/orders',
            icon: ShoppingBag,
        },
        {
            name: 'Profile',
            href: '/business/profile',
            icon: User,
        },
    ];

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center bg-black/50 pb-4 pt-2 backdrop-blur">
            <div className="flex w-full max-w-xl items-center justify-between gap-2 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-xs font-medium text-white/70">
                {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-1 transition ${active ? 'text-white' : 'hover:text-white'}`}
                        >
                            <span
                                className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${active ? 'bg-blue-600 text-white shadow-glow' : 'bg-white/10 text-white/70'
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                            </span>
                            {item.name}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
