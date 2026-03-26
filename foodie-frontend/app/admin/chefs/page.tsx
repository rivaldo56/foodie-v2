"use client";

import React, { useEffect, useState } from "react";
import { 
  ChefHat, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  MoreVertical, 
  Star,
  Loader2,
  Clock,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface Chef {
  id: number;
  user_email: string;
  user_full_name: string;
  bio: string;
  specialties: string[];
  average_rating: number;
  total_bookings: number;
  is_verified: boolean;
}

interface Application {
  id: number;
  user_email: string;
  user_full_name: string;
  culinary_paths: string[];
  status: string;
  updated_at: string;
}

export default function ChefManagement() {
  const [activeTab, setActiveTab] = useState<'profiles' | 'applications'>('profiles');
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'profiles') fetchChefs();
    else fetchApplications();
  }, [activeTab]);

  const fetchChefs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/chefs/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setChefs(response.data.results || response.data);
    } catch (err) {
      console.error("Failed to fetch chefs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/chef-onboarding/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setApplications(response.data.results || response.data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const verifyChef = async (chefId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/chefs/${chefId}/verify/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      fetchChefs();
    } catch (err) {
      console.error("Failed to verify chef:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Vendor Management</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Manage chef profiles and review performance.</p>
        </div>
        <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('profiles')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'profiles' 
                ? "bg-white dark:bg-neutral-700 text-primary-600 shadow-sm" 
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            All Chefs
          </button>
          <button 
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'applications' 
                ? "bg-white dark:bg-neutral-700 text-primary-600 shadow-sm" 
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            Applications
            {applications.length > 0 && (
               <span className="w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="py-20 flex flex-col items-center justify-center text-neutral-500"
          >
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
            <p>Gathering vendor details...</p>
          </motion.div>
        ) : activeTab === 'profiles' ? (
          <motion.div 
            key="profiles"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {chefs.map((chef) => (
              <div key={chef.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm hover:shadow-md transition-all group">
                 <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                       <ChefHat className="w-8 h-8" />
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 dark:bg-amber-900/10 px-2 py-1 rounded-lg text-xs">
                       <Star className="w-4 h-4 fill-current" />
                       {chef.average_rating.toFixed(1)}
                    </div>
                 </div>
                 
                 <div className="mt-4">
                    <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 text-lg">
                      {chef.user_full_name}
                      {chef.is_verified && <ShieldCheck className="w-5 h-5 text-blue-500" />}
                    </h3>
                    <p className="text-sm text-neutral-500 line-clamp-1">{chef.user_email}</p>
                 </div>

                 <div className="mt-4 flex flex-wrap gap-2">
                    {chef.specialties?.slice(0, 3).map(s => (
                       <span key={s} className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                          {s}
                       </span>
                    ))}
                 </div>

                 <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="text-sm">
                       <p className="text-neutral-400 font-medium">Bookings</p>
                       <p className="text-neutral-900 dark:text-white font-bold">{chef.total_bookings}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       {!chef.is_verified && (
                         <button 
                           onClick={() => verifyChef(chef.id)}
                           className="px-3 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition"
                         >
                            Verify
                         </button>
                       )}
                       <button className="p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="applications"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm"
          >
             <div className="overflow-x-auto">
               <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Applicant</th>
                      <th className="px-6 py-4">Specialties</th>
                      <th className="px-6 py-4">Applied</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-neutral-500 italic">
                          No pending chef applications.
                        </td>
                      </tr>
                    ) : (
                      applications.map((app) => (
                        <tr key={app.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                          <td className="px-6 py-4">
                             <div>
                                <p className="text-sm font-bold text-neutral-900 dark:text-white">{app.user_full_name}</p>
                                <p className="text-xs text-neutral-500">{app.user_email}</p>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex gap-1">
                                {app.culinary_paths?.slice(0, 2).map(p => (
                                  <span key={p} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">
                                    {p}
                                  </span>
                                ))}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-neutral-500 flex items-center gap-1">
                             <Clock className="w-3.5 h-3.5" />
                             {new Date(app.updated_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve">
                                   <CheckCircle2 className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Reject">
                                   <XCircle className="w-5 h-5" />
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
               </table>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
