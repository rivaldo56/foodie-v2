"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  ChefHat, 
  CalendarDays, 
  ShoppingBag, 
  UtensilsCrossed, 
  Wallet, 
  Settings,
  LayoutDashboard,
  LogOut,
  Bell,
  Menu,
  ChevronLeft
} from "lucide-react";
import { motion } from "framer-motion";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Chefs", href: "/admin/chefs", icon: ChefHat },
  { name: "Bookings", href: "/admin/bookings", icon: CalendarDays },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Menus", href: "/admin/menus", icon: UtensilsCrossed },
  { name: "Payouts", href: "/admin/payouts", icon: Wallet },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-900 
        border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
              F
            </div>
            <span>Foodie Admin</span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href === "/admin/dashboard" && pathname === "/admin");
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" 
                    : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{link.name}</span>
                {isActive && (
                   <motion.div
                     layoutId="active-sidebar"
                     className="ml-auto w-1 h-4 bg-primary-600 rounded-full"
                   />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <button className="flex items-center gap-3 px-3 py-2 w-full text-neutral-600 hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-900/10 dark:hover:text-red-400 transition-colors rounded-lg">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 uppercase tracking-wider text-xs">
              {sidebarLinks.find(l => pathname === l.href)?.name || "Overview"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900" />
            </button>
            <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 overflow-hidden">
               {/* Avatar placeholder */}
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
