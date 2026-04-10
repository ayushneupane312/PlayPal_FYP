import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import KhaltiButton from './KhaltiButton';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking || null;

  useEffect(() => {
    if (!booking) navigate(-1);
  }, [booking, navigate]);

  const amountPaisa = useMemo(() => {
    const total = Number(booking?.totalPrice ?? 0);
    if (!Number.isFinite(total) || total <= 0) return 0;
    return Math.round(total * 100);
  }, [booking?.totalPrice]);

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
            <p className="text-sm text-gray-500 mt-1">Pay securely via Khalti</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-gray-500 hover:text-gray-800"
          >
            Back
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-gray-600">Venue</span>
            <span className="font-medium text-gray-900">{booking.venueName}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-gray-600">Court</span>
            <span className="font-medium text-gray-900">{booking.courtName}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-gray-600">Date</span>
            <span className="font-medium text-gray-900">{booking.date}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-gray-600">Time</span>
            <span className="font-medium text-gray-900">
              {booking.startTime} - {booking.endTime}
            </span>
          </div>
          <div className="flex justify-between gap-3 pt-2 border-t border-gray-200">
            <span className="text-gray-700 font-semibold">Total</span>
            <span className="text-gray-900 font-bold">NPR {booking.totalPrice}</span>
          </div>
        </div>

        {amountPaisa < 1000 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 text-sm">
            Minimum Khalti amount is NPR 10.
          </div>
        )}

        <div className="mt-5">
          <KhaltiButton
            amount={amountPaisa}
            orderId={booking._id}
            orderName={`Booking: ${booking.venueName} (${booking.date})`}
            customer={{ name: booking.userName, email: booking.userEmail, phone: booking.userPhone }}
          />
        </div>
      </div>
    </div>
  );
}