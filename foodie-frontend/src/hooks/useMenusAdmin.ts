'use client';

import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';

export function useMenusAdmin() {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<any[]>('/experiences/admin/menus/');
      setMenus(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch menus');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const approveMenu = async (id: number) => {
    try {
      await api.patch(`/experiences/admin/menus/${id}/approve/`, { is_approved: true });
      await fetchMenus();
      return true;
    } catch (err) {
      console.error('Failed to approve menu:', err);
      return false;
    }
  };

  return {
    menus,
    loading,
    error,
    refetch: fetchMenus,
    approveMenu
  };
}
