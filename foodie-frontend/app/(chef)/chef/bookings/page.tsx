'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
  MapPin, Users, Calendar, Clock, Utensils, ChefHat,
  CheckCircle, XCircle, Loader2, BellRing, AlertTriangle
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type JobCard = {
  id: string;
  status: string;
  date_time: string;
  address: string;
  guests_count: number;
  total_price: number;
  sla_expires_at: string | null;
  decline_reason: string | null;
  menu: {
    name: string;
    experience: { name: string } | null;
  } | null;
  experience_type: string | null;
  payment_model: string;
  created_at: string;
};

// ─────────────────────────────────────────────────────────────
// SLA Countdown Component
// ─────────────────────────────────────────────────────────────
function SlaCountdown({ expiresAt, onExpired }: { expiresAt: string; onExpired: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const calledExpired = useRef(false);

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff === 0 && !calledExpired.current) {
        calledExpired.current = true;
        onExpired();
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isUrgent = secondsLeft < 120; // last 2 minutes = red

  if (secondsLeft === 0) {
    return (
      <span className="flex items-center gap-1.5 text-red-400 text-sm font-bold animate-pulse">
        <AlertTriangle className="h-4 w-4" /> Expired
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-sm font-bold tabular-nums
      ${isUrgent ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
      <Clock className="h-4 w-4 flex-shrink-0" />
      {mins}:{secs.toString().padStart(2, '0')} remaining
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Decline Modal
// ─────────────────────────────────────────────────────────────
const DECLINE_REASONS = [
  'I am unavailable on this date',
  'Location is too far',
  'Guest count outside my capacity',
  'Menu type not in my specialty',
  'Price does not meet my minimum',
  'Other',
];

function DeclineModal({
  bookingId,
  onClose,
  onDeclined,
}: {
  bookingId: string;
  onClose: () => void;
  onDeclined: () => void;
}) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'Other' ? customReason : reason;
    if (!finalReason.trim()) { setError('Please provide a reason'); return; }

    setSubmitting(true);
    setError('');
    try {
      const res = await api.post(`/bookings/api/assignments/${bookingId}/respond/`, {
        response: 'declined',
        reason: finalReason
      });
      onDeclined();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1a1208] p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2">Decline Booking</h3>
        <p className="text-sm text-white/60 mb-5">Please select a reason so the system can find a better match.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {DECLINE_REASONS.map((r) => (
              <label key={r} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition
                ${reason === r ? 'border-accent bg-accent/10' : 'border-white/10 hover:border-white/20'}`}>
                <input
                  type="radio" name="reason" value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-amber-500"
                />
                <span className="text-sm text-white">{r}</span>
              </label>
            ))}
          </div>

          {reason === 'Other' && (
            <textarea
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none resize-none"
              rows={3} placeholder="Describe your reason…"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-semibold text-white hover:bg-white/5">
              Cancel
            </button>
            <button type="submit" disabled={submitting || !reason}
              className="flex-1 rounded-xl bg-red-500/80 py-3 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-40">
              {submitting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Confirm Decline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Job Card Component
// ─────────────────────────────────────────────────────────────
const PLATFORM_FEE_RATE = 0.15;

function JobCard({
  booking,
  chefId,
  onAction,
}: {
  booking: JobCard;
  chefId: string;
  onAction: (id: string, action: 'accepted' | 'declined') => void;
}) {
  const [accepting, setAccepting] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [slaExpired, setSlaExpired] = useState(
    booking.sla_expires_at ? new Date(booking.sla_expires_at) < new Date() : false
  );
  const acceptStart = useRef<number>(Date.now());

  const estimatedPayout = booking.total_price * (1 - PLATFORM_FEE_RATE);
  const isActive = ['rotating', 'assigned'].includes(booking.status) && !slaExpired;

  const handleAccept = async () => {
    if (!isActive) return;
    setAccepting(true);
    const responseTime = Math.floor((Date.now() - acceptStart.current) / 1000);
    try {
      const res = await api.post(`/bookings/api/assignments/${booking.id}/respond/`, {
        response: 'accepted',
        response_time_seconds: responseTime
      });
      onAction(booking.id, 'accepted');
    } catch (err: any) {
      alert('Could not accept: ' + (err.response?.data?.error || err.message));
    } finally {
      setAccepting(false);
    }
  };

  return (
    <>
      <div className={`rounded-3xl border overflow-hidden transition-all duration-300
        ${isActive
          ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/5 to-transparent shadow-lg shadow-amber-500/5'
          : 'border-white/10 bg-white/5 opacity-70'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-amber-400 animate-pulse' : 'bg-white/20'}`} />
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">
              {isActive ? 'New Job Request' : (booking.status || 'Pending').replace('_', ' ')}
            </span>
          </div>
          {booking.sla_expires_at && isActive && (
            <SlaCountdown
              expiresAt={booking.sla_expires_at}
              onExpired={() => setSlaExpired(true)}
            />
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-xl font-bold text-white">
              {booking.menu?.name ?? 'Custom Event'}
            </h3>
            <p className="text-sm text-white/50 mt-0.5">
              {booking.menu?.experience?.name ?? booking.experience_type ?? 'Private Dining'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoChip icon={<Calendar className="h-4 w-4" />}
              label={new Date(booking.date_time).toLocaleDateString('en-KE', {
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
              })} />
            <InfoChip icon={<Clock className="h-4 w-4" />}
              label={new Date(booking.date_time).toLocaleTimeString('en-KE', {
                hour: '2-digit', minute: '2-digit'
              })} />
            <InfoChip icon={<Users className="h-4 w-4" />}
              label={`${booking.guests_count} Guests`} />
            <InfoChip icon={<Utensils className="h-4 w-4" />}
              label={booking.payment_model === 'cash_balance' ? 'Cash Balance' : 'Full Digital'} />
          </div>

          <InfoChip icon={<MapPin className="h-4 w-4" />} label={booking.address} full />

          {/* Payout */}
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <div>
              <p className="text-xs text-white/40 mb-0.5">Your Estimated Payout</p>
              <p className="text-2xl font-bold text-emerald-400">
                KES {estimatedPayout.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 mb-0.5">Total Value</p>
              <p className="text-base font-semibold text-white/70">
                KES {booking.total_price.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {isActive && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowDecline(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 py-3.5 text-sm font-bold text-red-400 hover:bg-red-500/20 transition">
                <XCircle className="h-4 w-4" /> Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-sm font-bold text-white hover:bg-accent/90 transition disabled:opacity-50 shadow-lg shadow-accent/20">
                {accepting
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <CheckCircle className="h-4 w-4" />}
                {accepting ? 'Accepting…' : 'Accept'}
              </button>
            </div>
          )}

          {!isActive && booking.status === 'confirmed' && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <CheckCircle className="h-4 w-4" /> Booking Confirmed
            </div>
          )}

          {slaExpired && ['rotating', 'assigned'].includes(booking.status) && (
            <p className="text-xs text-red-400/80 text-center">Window expired — this booking was rotated.</p>
          )}
        </div>
      </div>

      {showDecline && (
        <DeclineModal
          bookingId={booking.id}
          onClose={() => setShowDecline(false)}
          onDeclined={() => { setShowDecline(false); onAction(booking.id, 'declined'); }}
        />
      )}
    </>
  );
}

function InfoChip({ icon, label, full = false }: { icon: React.ReactNode; label: string; full?: boolean }) {
  return (
    <div className={`flex items-start gap-2 rounded-xl border border-white/8 bg-white/5 px-3 py-2.5 ${full ? 'col-span-2' : ''}`}>
      <span className="text-white/40 mt-0.5 flex-shrink-0">{icon}</span>
      <span className="text-sm text-white/80 leading-snug">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function ChefBookingsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<JobCard[]>([]);
  const [chefId, setChefId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/auth');
  }, [authLoading, isAuthenticated, router]);

  const loadBookings = useCallback(async () => {
    try {
      const { data } = await api.get('/bookings/api/assignments/');
      setBookings(data || []);
      
      // Extract chef ID from assignments or fetch profile
      if (data && data.length > 0) {
        setChefId(data[0].chef);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadBookings();
  }, [isAuthenticated, loadBookings]);

  // Remote real-time subscription for now, relying on refresh
  useEffect(() => {
    // Polling as a temporary replacement for Supabase Realtime if necessary
    const interval = setInterval(loadBookings, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [loadBookings]);

  const handleAction = useCallback((bookingId: string, action: 'accepted' | 'declined') => {
    // Refresh list after action
    loadBookings();
  }, [loadBookings]);

  // Separate active requests from history
  const activeRequests = bookings.filter(b => ['rotating', 'assigned'].includes(b.status));
  const history = bookings.filter(b => !['rotating', 'assigned'].includes(b.status));

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-amber-300/70">Job Inbox</p>
        <h1 className="text-2xl font-bold text-white">My Bookings</h1>
      </header>

      {/* Active Requests */}
      {activeRequests.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-amber-400 animate-pulse" />
            <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wider">
              Pending Requests ({activeRequests.length})
            </h2>
          </div>
          {activeRequests.map(b => (
            <JobCard key={b.id} booking={b} chefId={chefId!} onAction={handleAction} />
          ))}
        </section>
      )}

      {activeRequests.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 py-16 flex flex-col items-center gap-3 text-center">
          <ChefHat className="h-10 w-10 text-white/20" />
          <p className="text-white/60 font-medium">No active requests right now</p>
          <p className="text-sm text-white/30">New job cards will appear here in real-time</p>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider">History</h2>
          {history.map(b => (
            <JobCard key={b.id} booking={b} chefId={chefId!} onAction={handleAction} />
          ))}
        </section>
      )}
    </div>
  );
}
