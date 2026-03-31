'use client';

import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';

export function useAdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<any[]>('/bookings/');
      if (response.data) {
        setBookings(response.data);
      } else {
        setError('Failed to fetch bookings');
        setBookings([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingStatus = async (id: number, status: string, chefNotes?: string) => {
    try {
      await api.patch(`/bookings/${id}/status/`, { status, chef_notes: chefNotes });
      await fetchBookings();
      return true;
    } catch (err) {
      console.error('Failed to update booking status:', err);
      return false;
    }
  };

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    updateBookingStatus
  };
}
