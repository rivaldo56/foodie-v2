'use client';

import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';

export function useExperienceDetails(slugOrId: string | number) {
  const [experience, setExperience] = useState<any>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!slugOrId) return;
    
    setLoading(true);
    setError(null);

    try {
      // Experience detail
      const expResponse = await api.get(`/experiences/${slugOrId}/`);
      setExperience(expResponse.data);

      // Menus for this experience
      const menusResponse = await api.get(`/experiences/${slugOrId}/menus/`);
      setMenus(menusResponse.data || []);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch experience details');
    } finally {
      setLoading(false);
    }
  }, [slugOrId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { experience, menus, loading, error, refetch: fetchDetails };
}
