'use client';

import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';

export function usePublishedExperiences() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiences = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<any>('/experiences/');
      // Handle DRF pagination (results key) or direct array
      const data = response.data;
      setExperiences(Array.isArray(data) ? data : (data?.results || []));
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch experiences');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  return { experiences, loading, error, refetch: fetchExperiences };
}
