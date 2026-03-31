'use client';

import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';

export function useExperiencesAdmin() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiences = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<any[]>('/experiences/'); // Admin might use the same list or a specific one
      setExperiences(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch experiences');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const createExperience = async (input: any) => {
    try {
      await api.post('/experiences/admin/create/', input);
      await fetchExperiences();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const updateExperience = async (id: number, input: any) => {
    try {
      await api.patch(`/experiences/admin/${id}/update/`, input);
      await fetchExperiences();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const deleteExperience = async (id: number) => {
    try {
      await api.delete(`/experiences/admin/${id}/delete/`);
      await fetchExperiences();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  return {
    experiences,
    loading,
    error,
    refetch: fetchExperiences,
    createExperience,
    updateExperience,
    deleteExperience
  };
}
