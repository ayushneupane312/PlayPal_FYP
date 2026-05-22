import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CreditCard, Loader2 } from 'lucide-react';
import { getPendingSplitPayments } from '../store/bookingStore';

function formatDeadline(deadline) {
  if (!deadline) return '—';
  const d = new Date(deadline);
  const now = new Date();
  const ms = d - now;
  if (ms <= 0) return 'Expired';
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

function formatDate(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function PendingPaymentsSection({ title = 'Pending Payments', compact = false }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getPendingSplitPayments();
      setItems(res?.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (items.length === 0) return undefined;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [items.length]);

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 ${compact ? 'p-4' : 'p-6'} shadow-sm`}>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading pending payments…
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-2xl border border-amber-200 ${compact ? 'p-4' : 'p-6'} shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`font-semibold text-gray-900 ${compact ? 'text-base' : 'text-lg'}`}>{title}</h2>
          <p className="text-sm text-gray-500">Your share for team split bookings</p>
        </div>
        <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
          {items.length} due
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const bookingId = item.bookingId?._id?.toString?.() || item.bookingId?.toString?.() || item.bookingId;
          return (
            <div
              key={bookingId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 bg-amber-50/40"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {item.venueName ? `${item.venueName} · ` : ''}
                  {item.courtName || 'Court'}
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {formatDate(item.date)}
                  {item.startTime ? ` · ${item.startTime}` : ''}
                  {item.endTime ? ` – ${item.endTime}` : ''}
                </p>
                <p className="text-sm text-amber-700 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDeadline(item.deadline)} left
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-lg font-bold text-emerald-700">
                  NPR {item.amountDue?.toLocaleString?.() ?? item.amountDue}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/player/booking/split/${bookingId}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700"
                >
                  <CreditCard className="w-4 h-4" />
                  Pay Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
