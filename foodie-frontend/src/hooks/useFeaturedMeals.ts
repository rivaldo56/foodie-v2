'use client';

import { useState, useCallback, useEffect } from 'react';
import { mealService } from '@/services/meal.service';

export function useFeaturedMeals(limit = 10) {
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await mealService.getMeals();
      if (response.data) {
        const data = response.data;
        const results = Array.isArray(data) ? data : (data?.results || []);
        // Django doesn't have a limit on the list view by default, 
        // but we can slice it here or add a query param if supported.
        setMeals(results.slice(0, limit));
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An unexpected error occurred');
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  return { meals, loading, error, refetch: fetchMeals };
}
