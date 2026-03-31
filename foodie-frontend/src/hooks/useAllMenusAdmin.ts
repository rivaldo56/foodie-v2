'use client';

import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';

export function useAllMenusAdmin() {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<any[]>('/experiences/admin/menus/');
      if (response.data) {
        setMenus(response.data);
      } else {
        setError('Failed to fetch menus');
        setMenus([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const approveMenu = async (id: number) => {
    try {
      // Assuming a patch endpoint for menu approval
      await api.patch(`/bookings/menu-items/${id}/update/`, { is_approved: true });
      await fetchMenus();
      return true;
    } catch (err) {
      console.error('Failed to approve menu:', err);
      return false;
    }
  };

  const toggleMenuStatus = async (id: number, isActive: boolean) => {
    try {
      await api.patch(`/bookings/menu-items/${id}/update/`, { is_active: isActive });
      await fetchMenus();
      return true;
    } catch (err) {
      console.error('Failed to toggle menu status:', err);
      return false;
    }
  };

  return {
    menus,
    loading,
    error,
    refetch: fetchMenus,
    approveMenu,
    toggleMenuStatus
  };
}
