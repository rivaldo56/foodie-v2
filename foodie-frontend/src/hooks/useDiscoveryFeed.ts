import { useState, useEffect } from 'react';
import api from '@/lib/api';

export function useDiscoveryFeed() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDiscovery() {
      try {
        setLoading(true);
        const response = await api.get('/experiences/feed/discovery/');
        setItems(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch discovery feed');
      } finally {
        setLoading(false);
      }
    }

    fetchDiscovery();
  }, []);

  return { items, loading, error };
}
