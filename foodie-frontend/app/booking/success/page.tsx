'use client';
import { Suspense } from 'react';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  Loader2, CheckCircle2, ChefHat, AlertTriangle,
  Search, Clock, Star, MapPin,
} from 'lucide-react';

type BookingStatus =
  | 'pending' | 'paid' | 'dispatching' | 'awaiting_chef'
  | 'confirmed' | 'in_progress' | 'completed' | 'no_chef_found';

type ChefInfo = {
  id: string;
  name: string;
  avg_rating: number;
};

// ─── Status display config ────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: 'paid',           label: 'Payment confirmed',      done: false },
  { key: 'awaiting_chef',  label: 'Finding your chef',      done: false },
  { key: 'confirmed',      label: 'Chef confirmed!',        done: false },
];

function getStepIndex(status: string) {
  const map: Record<string, number> = {
    pending: -1, paid: 0, dispatching: 0, awaiting_chef: 1, confirmed: 2, in_progress: 2,
  };
  return map[status] ?? -1;
}

function BookingSuccessPageContent() {
  const params    = useSearchParams();
  const router    = useRouter();
  const bookingId = params.get('id');

  const [status, setStatus]   = useState<BookingStatus>('pending');
  const [chef,   setChef]     = useState<ChefInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId && !params.get('reference')) { 
      setError('No booking ID provided'); 
      setLoading(false); 
      return; 
    }

    const fetchBooking = async () => {
      try {
        let url = `/bookings/${bookingId}/`;
        if (!bookingId && params.get('reference')) {
          // Extract ID from BOOK-ID-TIMESTAMP
          const ref = params.get('reference') || '';
          const parts = ref.split('-');
          if (parts.length >= 2) {
             url = `/bookings/${parts[1]}/`;
          }
        }

        const res = await api.get(url);
        const data = res.data;
        
        setStatus(data.status as BookingStatus);

        // If already confirmed, fetch chef info
        const chefId = data.chef?.id;
        if (data.status === 'confirmed' && chefId) {
          await fetchChef(chefId);
        }
        
        setLoading(false);
      } catch (err: any) {
        setError('Booking not found or payment pending verification.');
        setLoading(false);
      }
    };

    fetchBooking();
    
    // Polling for status updates
    const interval = setInterval(fetchBooking, 5000);
    return () => clearInterval(interval);
  }, [bookingId, params]);

  // ── Realtime subscription ──────────────────────────────────────────────────
  // Realtime subscription removed - replaced by polling above
  useEffect(() => {
    return () => {};
  }, [bookingId]);

  const fetchChef = async (chefId: string | number) => {
    try {
      const res = await api.get(`/chefs/${chefId}/`);
      const data = res.data;
      if (data) {
        setChef({
          id: data.id,
          name: data.user?.full_name || 'Chef',
          avg_rating: data.rating || 5
        });
      }
    } catch (err) {
      console.error('Error fetching chef:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0c0a]">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0f0c0a] text-white gap-4">
        <AlertTriangle className="h-12 w-12 text-red-400" />
        <p className="text-xl font-semibold">{error}</p>
        <button onClick={() => router.push('/')} className="rounded-full bg-accent px-8 py-3 font-semibold text-white">
          Go Home
        </button>
      </div>
    );
  }

  // ── No chef found edge case ─────────────────────────────────────────────────
  if (status === 'no_chef_found') {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0f0c0a] text-white gap-6 px-4">
        <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-10 max-w-md text-center">
          <AlertTriangle className="h-14 w-14 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Chef Available</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            We could not find an available chef for your booking. Our team will reach out within 24 hours.
            A full refund will be issued automatically.
          </p>
          <button onClick={() => router.push('/bookings')} className="mt-6 rounded-full bg-accent px-8 py-3 font-semibold text-white w-full">
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(status);

  return (
    <div className="min-h-screen bg-[#0f0c0a] text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-accent/20 border border-accent/30 mb-6 animate-pulse">
            {status === 'confirmed' || status === 'in_progress'
              ? <CheckCircle2 className="h-10 w-10 text-accent" />
              : <Search className="h-10 w-10 text-accent" />}
          </div>
          <h1 className="text-3xl font-bold">
            {status === 'confirmed' || status === 'in_progress'
              ? 'Chef Confirmed!' : 'Payment Confirmed!'}
          </h1>
          <p className="text-white/50 mt-2 text-sm">
            {status === 'confirmed' || status === 'in_progress'
              ? 'Your private chef is confirmed and ready for your event.'
              : 'Hang tight — we\'re finding the perfect chef for your event.'}
          </p>
        </div>

        {/* Progress steps */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
          <div className="space-y-4">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStep;
              const isCurrent   = idx === currentStep + 1;
              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500
                    ${isCompleted
                      ? 'bg-accent border-accent text-white'
                      : isCurrent
                        ? 'border-accent/60 bg-accent/10'
                        : 'border-white/20 bg-transparent'}`}>
                    {isCompleted
                      ? <CheckCircle2 className="h-4 w-4" />
                      : isCurrent
                        ? <Loader2 className="h-4 w-4 animate-spin text-accent" />
                        : <span className="text-xs text-white/30">{idx + 1}</span>}
                  </div>
                  <span className={`text-sm font-medium ${isCompleted ? 'text-white' : isCurrent ? 'text-accent' : 'text-white/30'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chef confirmed card */}
        {(status === 'confirmed' || status === 'in_progress') && chef && (
          <div className="rounded-3xl border border-accent/30 bg-accent/5 p-6 mb-6 animate-in fade-in">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
                <ChefHat className="h-7 w-7 text-accent" />
              </div>
              <div>
                <p className="font-bold text-lg">{chef.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < Math.round(chef.avg_rating) ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`}
                    />
                  ))}
                  <span className="text-xs text-white/50 ml-1">{chef.avg_rating?.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-accent/70 mt-4">
              ✓ Prep advance has been sent to your chef — they are ready to get to work!
            </p>
          </div>
        )}

        {/* Search indicator */}
        {['paid', 'dispatching', 'awaiting_chef'].includes(status) && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 mb-6 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-accent/20 animate-ping absolute inset-0" />
              <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center relative">
                <Search className="h-5 w-5 text-accent" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Searching for chefs near you...</p>
              <p className="text-xs text-white/40 mt-0.5">This usually takes 2–5 minutes</p>
            </div>
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/bookings')}
            className="w-full rounded-2xl bg-accent py-3.5 font-semibold text-white hover:bg-accent/90 transition text-sm"
          >
            View My Bookings
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full rounded-2xl border border-white/10 py-3.5 font-semibold text-white/70 hover:bg-white/5 transition text-sm"
          >
            Back to Home
          </button>
        </div>

        {/* Booking ID */}
        <p className="text-center text-xs text-white/20 mt-6">
          Booking ID: {bookingId?.slice(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  );
}




export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
      <BookingSuccessPageContent />
    </Suspense>
  );
}
