'use client';

import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';

export function useAdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<any[]>('/payments/admin/');
      if (response.data) {
        setPayments(response.data);
      } else {
        setError('Failed to fetch payments');
        setPayments([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const refundPayment = async (id: number, amount: number, reason: string) => {
    try {
      await api.post(`/payments/refund/`, { payment_id: id, amount, reason });
      await fetchPayments();
      return true;
    } catch (err) {
      console.error('Failed to refund payment:', err);
      return false;
    }
  };

  return {
    payments,
    loading,
    error,
    refetch: fetchPayments,
    refundPayment
  };
}
