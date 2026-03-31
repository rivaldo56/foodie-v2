'use client';

import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';

export function useFeaturedExperiences(limit = 4) {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatured = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<any>('/experiences/');
      if (response.data) {
        const data = response.data;
        const results = Array.isArray(data) ? data : (data?.results || []);
        // Simple logic for featured: slice first 'limit' items
        setExperiences(results.slice(0, limit));
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch featured experiences');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  return { experiences, loading, error, refetch: fetchFeatured };
}
