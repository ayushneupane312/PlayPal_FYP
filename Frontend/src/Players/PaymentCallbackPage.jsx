import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { verifyPayment } from '../store/bookingStore';

const KHALTI_BOOKING_KEY = 'playpal_khalti_booking_id';

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'failed', 'error'
  const [message, setMessage] = useState('Verifying your payment...');
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    const verifyKhaltiPayment = async () => {
      try {
        const pidx = searchParams.get('pidx');
        const bookingId =
          searchParams.get('bookingId') || sessionStorage.getItem(KHALTI_BOOKING_KEY);

        if (!pidx) {
          setStatus('error');
          setMessage('Missing payment reference (pidx)');
          return;
        }

        if (!bookingId) {
          setStatus('error');
          setMessage(
            'Missing booking reference. If you completed payment, check My Bookings or contact support.'
          );
          return;
        }

        setStatus('verifying');
        setMessage('Verifying your payment...');

        const response = await verifyPayment(pidx, bookingId);

        if (response.success) {
          sessionStorage.removeItem(KHALTI_BOOKING_KEY);
          setStatus('success');
          setMessage('Payment successful! Your booking is confirmed.');
          setBookingData(response.data.booking);

          setTimeout(() => {
            navigate(`/player/bookings/${response.data.booking._id}?success=true`);
          }, 3000);
        } else {
          setStatus('failed');
          setMessage(response.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error(error);
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
          'Payment verification failed. Please contact support.'
        );
      }
    };

    verifyKhaltiPayment();
  }, [searchParams, navigate]);


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Verifying */}
        {status === 'verifying' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">{message}</p>
            <div className="mt-6 text-sm text-gray-500">
              Please wait while we confirm your payment with Khalti...
            </div>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            {bookingData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-medium">{bookingData._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Venue:</span>
                    <span className="font-medium">{bookingData.venue?.venueName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Court:</span>
                    <span className="font-medium">{bookingData.court?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-medium text-green-600">NPR {bookingData.pricing?.totalAmount}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500">
              Redirecting to booking details...
            </div>
          </div>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/player/venues')}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
              >
                Browse Venues
              </button>
              <button
                onClick={() => navigate('/player/bookings')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                View My Bookings
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Error</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-red-800">
                <strong>What to do:</strong> If money was deducted from your account, please contact our support team with your transaction details. We will verify and confirm your booking manually.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/player/bookings')}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate('/help')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;