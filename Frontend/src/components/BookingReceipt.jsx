const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatPaymentMethod = (method) => {
  if (method === 'khalti') return 'Khalti (Online)';
  if (method === 'cash') return 'Cash Payment';
  return method || '—';
};

/**
 * Printable booking receipt (shown only when printing via .print-only wrapper).
 */
const BookingReceipt = ({ booking, variant = 'player' }) => {
  if (!booking) return null;

  const issuedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const venueName =
    booking.venue?.venueName || booking.venueName || booking.court?.venueName || '—';

  return (
    <div className="booking-receipt bg-white text-gray-900 p-8 max-w-[210mm] mx-auto">
      <header className="border-b-2 border-emerald-600 pb-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-emerald-700 tracking-tight">PlayPal</p>
            <p className="text-sm text-gray-500 mt-1">Futsal Booking Receipt</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>
              <span className="font-medium text-gray-800">Issued:</span> {issuedAt}
            </p>
          </div>
        </div>
      </header>

      <section className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Booking Summary</h1>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <dt className="text-gray-500">Booking ID</dt>
            <dd className="font-mono text-xs break-all text-gray-900">{booking._id}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Booking Status</dt>
            <dd className="font-semibold capitalize">{booking.bookingStatus}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Payment Status</dt>
            <dd className="font-semibold capitalize">{booking.payment?.status}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Payment Method</dt>
            <dd className="font-medium">{formatPaymentMethod(booking.payment?.method)}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-6 border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
          Venue &amp; Court
        </h2>
        <p className="font-semibold text-lg text-gray-900">{venueName}</p>
        {variant === 'player' && booking.venue?.fullAddress && (
          <p className="text-sm text-gray-600 mt-1">{booking.venue.fullAddress}</p>
        )}
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Court</dt>
            <dd className="font-medium">{booking.court?.name || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Surface</dt>
            <dd className="font-medium">{booking.court?.surfaceType || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Date</dt>
            <dd className="font-medium">{formatDate(booking.bookingDate)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Time</dt>
            <dd className="font-medium">
              {booking.timeSlot?.startTime} – {booking.timeSlot?.endTime}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Players</dt>
            <dd className="font-medium">{booking.playerInfo?.numberOfPlayers ?? '—'}</dd>
          </div>
        </dl>
        {booking.specialRequests && (
          <p className="mt-3 text-sm text-gray-700 border-t pt-3">
            <span className="font-medium">Special requests:</span> {booking.specialRequests}
          </p>
        )}
      </section>

      {variant === 'owner' && booking.playerInfo && (
        <section className="mb-6 border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Player
          </h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium">{booking.playerInfo.name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium break-all">{booking.playerInfo.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium">{booking.playerInfo.phone || '—'}</dd>
            </div>
          </dl>
        </section>
      )}

      {variant === 'player' && booking.venue?.contactInfo && (
        <section className="mb-6 border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Venue Contact
          </h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium">{booking.venue.contactInfo.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium break-all">{booking.venue.contactInfo.email || '—'}</dd>
            </div>
          </dl>
        </section>
      )}

      <section className="mb-6 border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
          Payment
        </h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2 text-gray-600">Court booking</td>
              <td className="py-2 text-right font-medium">
                NPR {booking.pricing?.basePrice ?? 0}
              </td>
            </tr>
            {booking.pricing?.discount > 0 && (
              <tr className="border-b border-gray-100 text-emerald-700">
                <td className="py-2">Discount</td>
                <td className="py-2 text-right font-medium">
                  - NPR {booking.pricing.discount}
                </td>
              </tr>
            )}
            <tr>
              <td className="py-3 font-bold text-gray-900">Total</td>
              <td className="py-3 text-right font-bold text-emerald-700 text-lg">
                NPR {booking.pricing?.totalAmount ?? 0}
              </td>
            </tr>
          </tbody>
        </table>

        {booking.venueCashSplit?.enabled && (
          <p className="mt-3 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            Cash split at venue: ~NPR {booking.venueCashSplit.sharePerPlayer} per player ×{' '}
            {booking.venueCashSplit.splittingPlayerCount} players.
          </p>
        )}

        {booking.payment?.paidAt && (
          <p className="mt-3 text-sm text-gray-600">
            Paid on {new Date(booking.payment.paidAt).toLocaleString()}
          </p>
        )}
        {booking.payment?.transactionId && (
          <p className="text-sm text-gray-600">
            Transaction ID: <span className="font-mono text-xs">{booking.payment.transactionId}</span>
          </p>
        )}
        {booking.payment?.status === 'refunded' && booking.payment?.refundAmount != null && (
          <p className="text-sm text-gray-600 mt-1">
            Refund: NPR {booking.payment.refundAmount}
          </p>
        )}
      </section>

      <footer className="border-t pt-4 text-center text-xs text-gray-500">
        <p>Thank you for booking with PlayPal.</p>
        <p className="mt-1">This is a computer-generated receipt.</p>
      </footer>
    </div>
  );
};

export default BookingReceipt;
