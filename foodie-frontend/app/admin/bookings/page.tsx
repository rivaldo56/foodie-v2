"use client";

import React, { useEffect, useState } from "react";
import { 
  Calendar, 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  MapPin, 
  User, 
  ChefHat,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

interface Booking {
  id: number;
  client_email: string;
  chef_name: string;
  service_type: string;
  booking_date: string;
  status: string;
  total_amount: string;
  confirmation_code: string;
  service_city: string;
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/bookings/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setBookings(response.data.results || response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setLoading(false);
    }
  };

  const cancelBooking = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/bookings/${id}/cancel/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      fetchBookings();
    } catch (err) {
      console.error("Failed to cancel booking:", err);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.confirmation_code.toLowerCase().includes(search.toLowerCase()) || 
                         b.client_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': 
      case 'refunded': return 'bg-rose-100 text-rose-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Booking Management</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Monitor and manage platform service bookings.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search by confirmation code or client email..." 
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select 
          className="bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 font-medium"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 tracking-tighter">Confirmation</th>
                <th className="px-6 py-4">Client / Chef</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date & Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-2" />
                    <span className="text-neutral-500 font-medium">Loading bookings...</span>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-neutral-500 italic">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-bold bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                        {booking.confirmation_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                           <User className="w-3.5 h-3.5" />
                           {booking.client_email}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                           <ChefHat className="w-3.5 h-3.5" />
                           {booking.chef_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-xs space-y-1">
                          <p className="text-neutral-500 flex items-center gap-1">
                             <Calendar className="w-3.5 h-3.5" />
                             {new Date(booking.booking_date).toLocaleDateString()}
                          </p>
                          <p className="text-neutral-900 dark:text-white font-bold">
                             KES {parseFloat(booking.total_amount).toLocaleString()}
                          </p>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === 'pending' && (
                          <button 
                            onClick={() => cancelBooking(booking.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Cancel Booking"
                          >
                             <XCircle className="w-5 h-5" />
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
