import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { verifyEsewaPayment } from '../store/bookingStore';

const ESEWA_BOOKING_KEY = 'playpal_esewa_booking_id';

function pickMessage(err) {
  if (!err) return 'Verification failed';
  if (typeof err === 'string') return err;
  if (err.response?.data?.message) return err.response.data.message;
  if (typeof err.message === 'string') return err.message;
  return 'Verification failed';
}

export default function EsewaPaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Confirming payment with eSewa...');

  useEffect(() => {
    const run = async () => {
      const bookingId =
        searchParams.get('bookingId') || sessionStorage.getItem(ESEWA_BOOKING_KEY);
      const esewaFailed = searchParams.get('esewa_failed') === '1';

      if (!bookingId) {
        setStatus('error');
        setMessage('Missing booking reference. Open My Bookings if you completed a payment.');
        return;
      }

      try {
        const response = await verifyEsewaPayment(bookingId);
        if (response.success && response.data?.booking) {
          sessionStorage.removeItem(ESEWA_BOOKING_KEY);
          setStatus('success');
          setMessage(response.message || 'Payment successful! Your booking is confirmed.');
          setTimeout(() => {
            navigate(`/player/bookings/${response.data.booking._id}?success=true`, {
              replace: true
            });
          }, 2500);
          return;
        }

        if (esewaFailed) {
          setStatus('error');
          setMessage(
            response.message ||
              'Payment was cancelled or not completed. You can try again with eSewa or choose cash when booking.'
          );
          return;
        }

        setStatus('error');
        setMessage(
          response.message ||
            'Payment is not confirmed yet. Wait a moment and refresh, or check My Bookings.'
        );
      } catch (err) {
        setStatus('error');
        setMessage(pickMessage(err));
      }
    };

    run();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-emerald-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying eSewa payment</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Success</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Could not confirm payment</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate('/player/bookings')}
                className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium"
              >
                My bookings
              </button>
              <button
                type="button"
                onClick={() => navigate('/player/venues')}
                className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-lg"
              >
                Browse venues
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
