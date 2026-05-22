import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PlayerSidebar from './PlayerSidebar';
import {
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  AlertCircle,
  Users
} from 'lucide-react';
import {
  getBookingById,
  initiateSplitPayment,
  payShare,
  cancelBookingByLeader
} from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import { showToast } from '../FutsalOwner/components/Toast';

function formatDeadline(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  const ms = d - now;
  if (ms <= 0) return 'Expired';
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

function playerRowKey(p) {
  return p.userId?._id?.toString?.() || p.userId?.toString?.() || '';
}

function playerDisplayName(p) {
  return p.userId?.name || 'Player';
}

export default function SplitPaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const currentUserId = user?._id?.toString?.() || user?.id?.toString?.() || '';
  const isLeader =
    booking &&
    (booking.leaderId?.toString?.() === currentUserId ||
      booking.user?.toString?.() === currentUserId ||
      booking.user?._id?.toString?.() === currentUserId);

  const myShare = booking?.splitPlayers?.find(
    (p) => (p.userId?._id?.toString?.() || p.userId?.toString?.()) === currentUserId
  );

  const splitList = booking?.splitPlayers || [];
  const paidCount = splitList.filter((p) => p.paymentStatus === 'paid').length;
  const totalSplitPlayers = splitList.length;
  const progressPct =
    totalSplitPlayers > 0 ? Math.round((paidCount / totalSplitPlayers) * 100) : 0;

  const expired = booking?.paymentDeadline && new Date(booking.paymentDeadline) < new Date();

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await getBookingById(bookingId);
      setBooking(res?.data ?? res);
    } catch (e) {
      showToast.error(e?.message || 'Booking not found');
      navigate('/player/bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) fetchBooking();
    else setLoading(false);
  }, [bookingId]);

  useEffect(() => {
    if (!booking?.paymentDeadline || booking.bookingStatus !== 'pending') return;
    const t = setInterval(() => {
      setTimeLeft(formatDeadline(booking.paymentDeadline));
    }, 1000);
    setTimeLeft(formatDeadline(booking.paymentDeadline));
    return () => clearInterval(t);
  }, [booking?.paymentDeadline, booking?.bookingStatus]);

  const handlePayKhalti = async () => {
    try {
      setPaying(true);
      const res = await initiateSplitPayment(bookingId);
      const payUrl = res?.data?.paymentUrl || res?.data?.payment_url;
      if (payUrl) {
        sessionStorage.setItem('playpal_split_booking_id', bookingId);
        window.location.href = payUrl;
      }
      else showToast.error('Could not start payment');
    } catch (e) {
      showToast.error(e.response?.data?.message || e.message || 'Failed to initiate payment');
    } finally {
      setPaying(false);
    }
  };

  const handleMarkCashPaid = async () => {
    try {
      setPaying(true);
      await payShare(bookingId, `cash-${Date.now()}`);
      showToast.success('Your share recorded as paid');
      fetchBooking();
    } catch (e) {
      showToast.error(e.response?.data?.message || e.message || 'Failed');
    } finally {
      setPaying(false);
    }
  };

  const handleCancelByLeader = async () => {
    if (!window.confirm('Cancel this booking? The slot will be released.')) return;
    try {
      await cancelBookingByLeader(bookingId);
      showToast.success('Booking cancelled');
      navigate(`/player/teams/${booking?.teamRef || ''}`);
    } catch (e) {
      showToast.error(e.response?.data?.message || e.message || 'Failed to cancel');
    }
  };

  if (loading && bookingId) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!bookingId) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 p-6 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="max-w-md mx-auto text-center py-12">
            <p className="text-gray-600 mb-4">
              No booking specified. Use the link shared by your team leader to pay your share.
            </p>
            <button
              onClick={() => navigate('/player/bookings')}
              className="text-emerald-600 font-medium"
            >
              Go to my bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !booking) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 p-6 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="max-w-md mx-auto text-center py-12">
            <p className="text-gray-600 mb-4">Booking not found or you don’t have access.</p>
            <button
              onClick={() => navigate('/player/bookings')}
              className="text-emerald-600 font-medium"
            >
              Go to my bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (booking.paymentType !== 'split') {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 p-6 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <p className="text-gray-600">This is not a split payment booking.</p>
          <button onClick={() => navigate('/player/bookings')} className="mt-4 text-emerald-600">
            Back to bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
      <div
        className={`flex-1 p-6 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Split payment</h1>
          <p className="text-gray-600 mb-4">
            {booking.venue?.venueName} · {booking.court?.name} · {booking.timeSlot?.startTime}
          </p>

          {/* Countdown + total */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">30 min window</p>
                <span className="font-semibold text-gray-900">
                  {booking.bookingStatus === 'confirmed'
                    ? 'Confirmed'
                    : expired
                      ? 'Time expired'
                      : `Time left: ${timeLeft}`}
                </span>
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Total NPR {booking.pricing?.totalAmount}
            </span>
          </div>

          {/* Progress bar */}
          {booking.bookingStatus === 'pending' && totalSplitPlayers > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Payment progress</span>
                <span>
                  {paidCount} / {totalSplitPlayers} paid
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {booking.bookingStatus === 'confirmed' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-800">All paid – booking confirmed</p>
                <button
                  onClick={() => navigate(`/player/bookings/${bookingId}`)}
                  className="text-emerald-600 text-sm mt-1"
                >
                  View booking
                </button>
              </div>
            </div>
          )}

          {booking.bookingStatus === 'cancelled' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <p className="font-semibold text-red-800">Booking cancelled</p>
            </div>
          )}

          {myShare && booking.bookingStatus === 'pending' && !expired && (
            <div className="bg-white rounded-xl border border-emerald-200 p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">Your share</h2>
              <p className="text-2xl font-bold text-emerald-600 mb-1">
                NPR {myShare.amountAssigned}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Pay from your own account. Booking confirms when all {totalSplitPlayers} players have paid.
              </p>
              {myShare.paymentStatus === 'paid' ? (
                <p className="text-emerald-600 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> You have paid your share
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {booking.payment?.method === 'khalti' ? (
                    <button
                      onClick={handlePayKhalti}
                      disabled={paying}
                      className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {paying ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CreditCard className="w-5 h-5" />
                      )}
                      Pay NPR {myShare.amountAssigned} with Khalti
                    </button>
                  ) : (
                    <button
                      onClick={handleMarkCashPaid}
                      disabled={paying}
                      className="w-full py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                      I&apos;ve paid my cash share
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {isLeader && booking.bookingStatus === 'pending' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" /> Team payment progress
              </h2>
              <ul className="space-y-3">
                {splitList.map((p) => {
                  const uid = playerRowKey(p);
                  const name = playerDisplayName(p);
                  return (
                    <li
                      key={uid}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium">{name}</span>
                      <span className="text-gray-600">NPR {p.amountAssigned}</span>
                      {p.paymentStatus === 'paid' ? (
                        <span className="text-emerald-600 text-sm flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Paid
                        </span>
                      ) : (
                        <span className="text-amber-600 text-sm">Pending</span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/player/booking/split/${bookingId}`;
                    navigator.clipboard.writeText(url);
                    showToast.success('Link copied. Share with teammates to pay their share.');
                  }}
                  className="px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50"
                >
                  Copy payment link
                </button>
                <button
                  onClick={handleCancelByLeader}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Cancel booking
                </button>
              </div>
            </div>
          )}

          {expired && booking.bookingStatus === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-amber-600" />
              <p className="text-amber-800">
                Payment deadline passed. This booking may be cancelled automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
