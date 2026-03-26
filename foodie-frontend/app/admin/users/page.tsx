"use client";

import React, { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  onboarding_status: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setUsers(response.data.results || response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${userId}/toggle_status/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error("Failed to toggle user status:", err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(search.toLowerCase()) || 
                         user.username.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">User Management</h2>
          <p className="text-neutral-500 dark:text-neutral-400">View and manage all platform accounts.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm font-medium">
          <UserPlus className="w-5 h-5" />
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search users by email or username..." 
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select 
          className="bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="client">Clients</option>
          <option value="chef">Chefs</option>
          <option value="farmer">Farmers</option>
          <option value="admin">Admins</option>
        </select>

        <button className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-2" />
                    <span className="text-neutral-500 font-medium">Fetching users...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-neutral-500 italic">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                          {user.first_name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-900 dark:text-white">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-neutral-500">@{user.username} • {user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        user.role === 'admin' ? 'bg-amber-100 text-amber-700' :
                        user.role === 'chef' ? 'bg-indigo-100 text-indigo-700' :
                        user.role === 'farmer' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                          <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-bold">
                          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleUserStatus(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_active ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'
                          }`}
                          title={user.is_active ? "Suspend User" : "Activate User"}
                        >
                          {user.is_active ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        </button>
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
        
        {/* Pagination placeholder */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <p className="text-xs text-neutral-500">Showing {filteredUsers.length} users</p>
          <div className="flex gap-2">
            <button className="p-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-400 disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-400 disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
