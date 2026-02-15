// src/pages/player/BookingDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Users, CreditCard, Phone, Mail,
  ArrowLeft, Download, AlertCircle, CheckCircle, XCircle,
  Loader2, Info
} from 'lucide-react';
import PlayerSidebar from './PlayerSidebar';
import { showToast } from '../FutsalOwner/components/Toast';

import { getBookingById, cancelBooking, getStatusColor, getPaymentStatusColor } from '../store/bookingStore';

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await getBookingById(id);
      setBooking(response.data);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to load booking details');
      navigate('/player/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      showToast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      setCancelling(true);
      await cancelBooking(id, cancelReason);
      showToast.success('Booking cancelled successfully');
      fetchBookingDetails();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
      setShowCancelDialog(false);
      setCancelReason('');
    }
  };

  const canCancel = () => {
    if (!booking) return false;
    
    if (!['pending', 'confirmed'].includes(booking.bookingStatus)) {
      return false;
    }

    const now = new Date();
    const bookingDateTime = new Date(booking.bookingDate);
    const [hours, minutes] = booking.timeSlot.startTime.split(':');
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
    const hoursUntil = (bookingDateTime - now) / (1000 * 60 * 60);
    
    return hoursUntil > 2;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div 
          className={`flex-1 flex items-center justify-center transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
          style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div 
          className={`flex-1 flex items-center justify-center transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
          style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
        >
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Booking not found</p>
          </div>
        </div>
      </div>
    );
  }

  const showPaymentBadge = booking.payment.status !== booking.bookingStatus;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
      
      {/* ✅ FIX: Removed extra padding and increased max-width */}
      <div 
        className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        {/* ✅ FIX: Increased max-width from 4xl to 7xl and removed extra padding */}
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/player/bookings')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Bookings
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
                <p className="text-gray-600">Booking ID: {booking._id}</p>
              </div>
              
              <div className="flex gap-3">
                <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(booking.bookingStatus)}`}>
                  {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                </span>
                {showPaymentBadge && (
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getPaymentStatusColor(booking.payment.status)}`}>
                    Payment: {booking.payment.status.charAt(0).toUpperCase() + booking.payment.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Success/Info Messages */}
          {booking.bookingStatus === 'confirmed' && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-800 font-medium">Booking Confirmed!</p>
                <p className="text-green-600 text-sm mt-1">
                  Your booking has been confirmed. Please arrive 10 minutes early.
                </p>
              </div>
            </div>
          )}

          {booking.bookingStatus === 'pending' && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
              <Clock className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 font-medium">Booking Pending</p>
                <p className="text-amber-600 text-sm mt-1">
                  {booking.payment.method === 'cash' 
                    ? 'Waiting for venue owner approval. You will be notified once confirmed.'
                    : 'Complete payment to confirm your booking.'}
                </p>
              </div>
            </div>
          )}

          {booking.bookingStatus === 'cancelled' && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <XCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Booking Cancelled</p>
                <p className="text-red-600 text-sm mt-1">
                  This booking has been cancelled.
                  {booking.cancellation?.cancellationReason && ` Reason: ${booking.cancellation.cancellationReason}`}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Venue & Court Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Venue & Court</h2>
                
                <div className="space-y-4">
                  {booking.venue?.media?.images?.[0]?.url && (
                    <img
                      src={booking.venue.media.images[0].url}
                      alt={booking.venue.venueName}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xl">{booking.venue?.venueName}</h3>
                    <div className="flex items-start gap-2 text-gray-600 mt-2">
                      <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>{booking.venue?.fullAddress}</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-semibold text-gray-900">Court Details</h4>
                    </div>
                    <p className="text-gray-700"><span className="font-medium">Court:</span> {booking.court.name}</p>
                    <p className="text-gray-700"><span className="font-medium">Surface:</span> {booking.court.surfaceType}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium text-gray-900">
                        {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Number of Players</p>
                      <p className="font-medium text-gray-900">{booking.playerInfo.numberOfPlayers}</p>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Special Requests</p>
                        <p className="text-gray-700 mt-1">{booking.specialRequests}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Court Booking</span>
                    <span className="font-medium">Rs. {booking.pricing.basePrice}</span>
                  </div>
                  {booking.pricing.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>- Rs. {booking.pricing.discount}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-emerald-600">Rs. {booking.pricing.totalAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Payment Method</span>
                  </div>
                  <p className="font-medium text-gray-900 capitalize">
                    {booking.payment.method === 'khalti' ? 'Khalti (Online)' : 'Cash Payment'}
                  </p>
                  {booking.payment.paidAt && (
                    <p className="text-sm text-gray-600 mt-1">
                      Paid on {new Date(booking.payment.paidAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Venue Contact</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${booking.venue?.contactInfo?.phone}`} className="hover:text-emerald-600">
                      {booking.venue?.contactInfo?.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${booking.venue?.contactInfo?.email}`} className="hover:text-emerald-600">
                      {booking.venue?.contactInfo?.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {canCancel() && (
                  <button
                    onClick={() => setShowCancelDialog(true)}
                    className="w-full px-4 py-3 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <XCircle className="w-5 h-5" />
                    Cancel Booking
                  </button>
                )}
                
                <button
                  onClick={() => window.print()}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Receipt
                </button>
              </div>

              {!canCancel() && ['pending', 'confirmed'].includes(booking.bookingStatus) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      Cancellation is only allowed at least 2 hours before the booking time.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Booking</h3>
                  <p className="text-gray-600">Please provide a reason for cancelling this booking.</p>
                </div>
              </div>

              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason (required)..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelDialog(false);
                    setCancelReason('');
                  }}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
                >
                  No, Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={!cancelReason.trim() || cancelling}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel Booking'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetailPage;