import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CreditCard, Loader2 } from 'lucide-react';
import { getMyPendingSplitPayments } from '../store/bookingStore';

function formatDeadline(deadline) {
  if (!deadline) return '—';
  const ms = new Date(deadline) - Date.now();
  if (ms <= 0) return 'Expired';
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

export default function PendingSplitPaymentsSection({ title = 'Pending Payments', className = '' }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const load = async () => {
    try {
      setLoading(true);
      const res = await getMyPendingSplitPayments();
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
    if (!items.length) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [items.length]);

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-100 p-6 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading pending payments...
        </div>
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <div className={`bg-white rounded-2xl border border-amber-200 shadow-sm ${className}`}>
      <div className="p-6 border-b border-amber-100">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">
          Pay your share before the deadline or the team booking may be cancelled.
        </p>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map((item) => {
          const deadlineLabel = formatDeadline(item.deadline);
          void now;
          return (
            <div
              key={item.bookingId}
              className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-amber-50/40"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {item.venueName || 'Venue'} · {item.courtName}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {item.dateLabel || '—'} · {item.startTime}
                  {item.endTime ? ` - ${item.endTime}` : ''}
                </p>
                <p className="text-sm font-medium text-amber-700 mt-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Time left: {deadlineLabel}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Team progress: {item.paidCount} / {item.totalPlayers} paid
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase">Your share</p>
                  <p className="text-xl font-bold text-emerald-600">NPR {item.amountDue}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/player/booking/split/${item.bookingId}`)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
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
