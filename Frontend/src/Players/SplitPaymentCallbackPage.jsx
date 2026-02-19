import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { verifySplitPayment } from '../store/bookingStore';

export default function SplitPaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your split payment...');

  useEffect(() => {
    const run = async () => {
      const pidx = searchParams.get('pidx');
      if (!pidx) {
        setStatus('error');
        setMessage('Missing payment reference');
        return;
      }
      try {
        const response = await verifySplitPayment(pidx);
        const data = response?.data ?? response;
        if (data?.booking) {
          setStatus('success');
          setMessage(data.allPaid ? 'All shares paid! Booking confirmed.' : 'Your share has been recorded.');
          setTimeout(() => {
            navigate(`/player/booking/split/${data.booking._id}`, { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          setMessage(response?.message || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Payment verification failed');
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying payment</h2>
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verification failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate('/player/bookings')}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg"
            >
              Back to bookings
            </button>
          </>
        )}
      </div>
    </div>
  );
}
