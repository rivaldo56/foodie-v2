"use client";

import React, { useEffect, useState } from "react";
import { 
  Settings, 
  Save, 
  RefreshCcw, 
  Shield, 
  Zap, 
  Percent, 
  DollarSign,
  Clock,
  Loader2,
  Lock,
  Unlock,
  Banknote
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

interface PlatformSettings {
  commission_rate: number;
  cancellation_window_hours: number;
  payout_threshold: number;
  feature_flags: Record<string, boolean>;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/settings/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setSettings(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/settings/`, settings, {
        headers: { Authorization: `Token ${token}` }
      });
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center text-neutral-500">
      <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
      <p>Synchronizing platform rules...</p>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Platform Settings</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Configure global rules, commissions, and feature visibility.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-md font-bold disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Financial Settings */}
        <section className="space-y-4">
           <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Financial Controls
           </h3>
           <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-6">
              <div className="space-y-2">
                 <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Commission Rate (%)</label>
                 <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="number" 
                      className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold"
                      value={settings?.commission_rate}
                      onChange={(e) => setSettings(s => s ? {...s, commission_rate: parseInt(e.target.value)} : null)}
                    />
                 </div>
                 <p className="text-xs text-neutral-500 italic">Platform cut from every successful booking.</p>
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Minimum Payout Threshold (KES)</label>
                 <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="number" 
                      className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold"
                      value={settings?.payout_threshold}
                      onChange={(e) => setSettings(s => s ? {...s, payout_threshold: parseInt(e.target.value)} : null)}
                    />
                 </div>
              </div>
           </div>
        </section>

        {/* Operational Settings */}
        <section className="space-y-4">
           <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Operation Rules
           </h3>
           <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-6">
              <div className="space-y-2">
                 <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Cancellation Window (Hours)</label>
                 <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="number" 
                      className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold"
                      value={settings?.cancellation_window_hours}
                      onChange={(e) => setSettings(s => s ? {...s, cancellation_window_hours: parseInt(e.target.value)} : null)}
                    />
                 </div>
              </div>

              <div className="pt-4 space-y-4">
                 <h4 className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Platform Feature Flags</h4>
                 <div className="space-y-3">
                    {settings && Object.entries(settings.feature_flags).map(([key, value]) => (
                       <label key={key} className="flex items-center justify-between cursor-pointer group">
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize">
                             {key.replace('_', ' ')}
                          </span>
                          <div 
                            onClick={() => {
                               const newFlags = {...settings.feature_flags, [key]: !value};
                               setSettings({...settings, feature_flags: newFlags});
                            }}
                            className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                          >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${value ? 'left-7' : 'left-1'}`} />
                          </div>
                       </label>
                    ))}
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
