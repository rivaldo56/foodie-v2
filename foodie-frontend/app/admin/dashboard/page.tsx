"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  CalendarDays, 
  TrendingUp, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

interface KPI {
  name: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
}

const iconMap: Record<string, any> = {
  Users: Users,
  CalendarDays: CalendarDays,
  TrendingUp: TrendingUp,
  CreditCard: CreditCard,
};

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/stats/`, {
          headers: {
            Authorization: `Token ${token}`
          }
        });
        
        const mappedKpis = response.data.kpis.map((kpi: any) => ({
          ...kpi,
          icon: iconMap[kpi.icon] || Users
        }));
        
        setKpis(mappedKpis);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load dashboard statistics. Please ensure you are logged in as an admin.");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        <p className="text-neutral-500 font-medium">Loading dashboard insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl">
        <h3 className="text-red-800 dark:text-red-400 font-bold flex items-center gap-2">
          Admin Access Required
        </h3>
        <p className="text-red-600 dark:text-red-500 mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">Dashboard Overview</h2>
        <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 mt-1">
          Welcome back, Admin. Here's what's happening today.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-neutral-900 p-5 md:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${kpi.color} bg-opacity-10 text-neutral-900 dark:text-white`}>
                <kpi.icon className={`w-5 h-5 md:w-6 md:h-6 ${kpi.color.replace('bg-', 'text-')}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs md:text-sm font-medium ${
                kpi.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {kpi.change}
                {kpi.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <ArrowDownRight className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{kpi.name}</p>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1 leading-none">{kpi.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm min-h-[300px] md:min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-lg text-neutral-900 dark:text-white">Revenue Trend</h4>
          </div>
          <div className="h-[200px] md:h-[300px] flex items-center justify-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-xl text-neutral-400 dark:text-neutral-600 italic text-sm md:text-base">
            Chart integration coming soon (Recharts)
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-lg text-neutral-900 dark:text-white">Recent Activity</h4>
            <button className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-900 dark:text-white line-clamp-2">
                    <span className="font-bold">Activity Feed</span> placeholder showing recent platform events
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
