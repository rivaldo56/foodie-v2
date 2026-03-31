'use client';

import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';

export function useExploreMeals(limit = 10) {
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<any>('/bookings/menu-items/discovery/');
      if (response.data) {
        const data = response.data;
        const results = Array.isArray(data) ? data : (data?.results || []);
        setMeals(results.slice(0, limit));
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch meals');
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { meals, loading, error, refetch: fetch };
}
