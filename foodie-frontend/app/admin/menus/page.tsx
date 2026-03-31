"use client";

import React, { useEffect, useState } from "react";
import { 
  UtensilsCrossed, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2,
  Copy,
  Archive,
  Loader2,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
  id: number;
  name: string;
  chef_name: string;
  category: string;
  price_per_serving: string;
  is_available: boolean;
  image: string;
}

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/menu-items/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setMenuItems(response.data.results || response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
      setLoading(false);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/menu-items/${item.id}/`, 
        { is_available: !item.is_available },
        { headers: { Authorization: `Token ${token}` } }
      );
      fetchMenuItems();
    } catch (err) {
      console.error("Failed to toggle availability:", err);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                         item.chef_name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Menu & Pricing</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Manage vendor menus, items, and platform pricing rules.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm font-medium">
          <Plus className="w-5 h-5" />
          Create New Menu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Statistics Cards */}
        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
           <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Total Items</p>
           <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{menuItems.length}</h3>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800">
           <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Available</p>
           <h3 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-2">
             {menuItems.filter(i => i.is_available).length}
           </h3>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-800">
           <p className="text-sm font-bold text-amber-600 dark:text-amber-400">Avg. Pricing</p>
           <h3 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-2">
             KES {(menuItems.reduce((acc, i) => acc + parseFloat(i.price_per_serving), 0) / (menuItems.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
           </h3>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search items or chefs..." 
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select 
          className="bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="appetizer">Appetizers</option>
          <option value="main_course">Main Courses</option>
          <option value="dessert">Desserts</option>
          <option value="beverage">Beverages</option>
        </select>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Chef</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-2" />
                    <span className="text-neutral-500 font-medium">Fetching menu catalog...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-neutral-500 italic">
                    No menu items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                            {item.image ? (
                               <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                  <UtensilsCrossed className="w-6 h-6" />
                               </div>
                            )}
                         </div>
                         <p className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-tight">{item.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                       {item.chef_name}
                    </td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-[10px] font-bold rounded uppercase tracking-widest">
                          {(item.category || '').replace('_', ' ')}
                       </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white text-sm">
                       KES {parseFloat(item.price_per_serving).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                       <button 
                         onClick={() => toggleAvailability(item)}
                         className={`flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2 py-1 rounded-md transition-colors ${
                            item.is_available 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-rose-100 text-rose-700'
                         }`}
                       >
                          <div className={`w-1.5 h-1.5 rounded-full ${item.is_available ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`} />
                          {item.is_available ? 'Available' : 'Hidden'}
                       </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors" title="Edit">
                             <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors" title="Clone">
                             <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
