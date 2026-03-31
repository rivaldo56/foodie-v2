'use client';

import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import type { Booking } from '@/types/marketplace';

export interface BookingWithDetails extends Omit<Booking, 'id'> {
  id: string;
  chef_name?: string;
  menu_items?: any[];
}

function mapBookingRow(r: any): BookingWithDetails {
  return {
    id: String(r.id),
    client_id: String(r.client?.id || ''),
    chef_id: String(r.chef?.id || ''),
    date_time: String(r.booking_date),
    address: String(r.service_address || ''),
    guests_count: Number(r.number_of_guests || 0),
    status: (r.status as Booking['status']) ?? 'pending',
    total_price: Number(r.total_amount || 0),
    special_requests: r.special_requests != null ? String(r.special_requests) : null,
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
    chef_name: r.chef?.user?.full_name || 'Chef',
    menu_items: r.booking_menu_items || [],
    // Experience/Menu mapping if needed, adjusting for Django schema
    menu_id: null, 
    experience_id: null
  };
}

export function useClientBookings() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<any[]>('/bookings/');
      if (response.data) {
        setBookings(response.data.map(mapBookingRow));
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

  const cancelBooking = async (id: string | number) => {
    try {
      await api.post(`/bookings/${id}/cancel/`);
      await fetchBookings();
      return true;
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      return false;
    }
  };

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    cancelBooking
  };
}
