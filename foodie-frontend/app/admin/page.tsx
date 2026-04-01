'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, DollarSign, UtensilsCrossed, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  kpis: {
    name: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: string;
    color: string;
  }[];
  recent_activity: any[];
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await api.get('/admin/stats/');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    }
    if (user?.role === 'admin') {
      fetchDashboard();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-10 w-10 animate-spin text-[#ff7642]" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center bg-[#16181d] border border-white/5 rounded-xl">
        <p className="text-[#cbd5f5]">Failed to load dashboard data. Please ensure you have admin privileges.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-10 w-10 animate-spin text-[#ff7642]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#f9fafb]">Dashboard</h1>
        <p className="text-[#cbd5f5] mt-1">Overview of your platform performance (Real-time Django Engine).</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.kpis.map((kpi) => (
          <StatsCard
            key={kpi.name}
            title={kpi.name}
            value={kpi.value}
            description={`${kpi.change} from last month`}
            icon={<DollarSign className={`h-5 w-5 ${kpi.color.replace('bg-', 'text-')}`} />}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-[#16181d] border-white/5 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#f9fafb]">Recent Activity</CardTitle>
            <Link href="/admin/bookings" className="text-sm text-[#ff7642] hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recent_activity.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-white/5 rounded-xl bg-white/5">
                <span className="text-[#94a3b8]">No recent activity reported from backend</span>
              </div>
            ) : (
              <ul className="space-y-3">
                {stats.recent_activity.map((activity, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#1f2228] border border-white/5"
                  >
                    <div>
                      <p className="font-medium text-[#f9fafb]">{activity.description}</p>
                      <p className="text-xs text-[#94a3b8]">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-[#16181d] border-white/5 shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#f9fafb]">Quick actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#cbd5f5] mb-4">Manage your marketplace content via native API.</p>
            <div className="space-y-2">
              <Link
                href="/admin/experiences"
                className="block w-full rounded-lg border border-white/10 bg-[#1f2228] px-4 py-3 text-sm font-medium text-[#f9fafb] hover:bg-[#2a2f37] transition-colors"
              >
                Experiences
              </Link>
              <Link
                href="/admin/chefs"
                className="block w-full rounded-lg border border-white/10 bg-[#1f2228] px-4 py-3 text-sm font-medium text-[#f9fafb] hover:bg-[#2a2f37] transition-colors"
              >
                Chef Management
              </Link>
              <Link
                href="/admin/bookings"
                className="block w-full rounded-lg border border-white/10 bg-[#1f2228] px-4 py-3 text-sm font-medium text-[#f9fafb] hover:bg-[#2a2f37] transition-colors"
              >
                Bookings
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="bg-[#16181d] border-white/5 hover:border-[#ff7642]/30 transition-all hover:shadow-glow/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[#cbd5f5]">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-[#1f2228] border border-white/5">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#f9fafb]">{value}</div>
        <p className="text-xs text-[#94a3b8] mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
