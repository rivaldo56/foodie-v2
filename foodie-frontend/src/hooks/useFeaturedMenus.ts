'use client';

import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';

export function useFeaturedMenus(limit = 4) {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatured = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<any>('/experiences/menus/');
      if (response.data) {
        const data = response.data;
        const results = Array.isArray(data) ? data : (data?.results || []);
        setMenus(results.slice(0, limit));
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch featured menus');
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  return { menus, loading, error, refetch: fetchFeatured };
}
