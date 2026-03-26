"use client";

import React, { useEffect, useState } from "react";
import { 
  Wallet, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Banknote,
  Loader2,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

interface Payout {
  id: number;
  chef_name: string;
  chef_email: string;
  booking_code: string;
  amount: string;
  currency: string;
  status: string;
  bank_name: string;
  created_at: string;
  processed_at: string;
}

export default function PayoutManagement() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/payouts/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setPayouts(response.data.results || response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch payouts:", err);
      setLoading(false);
    }
  };

  const completePayout = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/payouts/${id}/complete/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      fetchPayouts();
    } catch (err) {
      console.error("Failed to complete payout:", err);
    }
  };

  const filteredPayouts = payouts.filter(p => statusFilter === "all" || p.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Payout Management</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Track and process vendor earnings.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl hover:opacity-90 transition shadow-sm font-medium">
          <ArrowUpRight className="w-5 h-5" />
          Export Report
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-4 items-center">
        <div className="flex-1">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search by chef name or email..." 
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
              />
           </div>
        </div>
        
        <select 
          className="bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 font-medium"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Chef</th>
                <th className="px-6 py-4">Booking</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-2" />
                    <span className="text-neutral-500 font-medium">Recalculating earnings...</span>
                  </td>
                </tr>
              ) : filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-neutral-500 italic">
                    No payout records found.
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{payout.chef_name}</p>
                        <p className="text-xs text-neutral-500">{payout.chef_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                         {payout.booking_code}
                       </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white text-sm">
                       {payout.currency} {parseFloat(payout.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          payout.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                          payout.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                       }`}>
                          {payout.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          {payout.status === 'pending' && (
                             <button 
                               onClick={() => completePayout(payout.id)}
                               className="px-3 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition"
                             >
                                Process
                             </button>
                          )}
                          <button className="p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                             <MoreVertical className="w-5 h-5" />
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
