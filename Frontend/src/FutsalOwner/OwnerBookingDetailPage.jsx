// src/pages/futsalowner/OwnerBookingDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Users, CreditCard, Phone, Mail, User,
  ArrowLeft, Download, AlertCircle, CheckCircle, XCircle,
  Loader2, Info, DollarSign, Ban
} from 'lucide-react';
import FutsalOwnerSidebar from './FutsalOwnerSidebar';
import Header from './components/Header';
import { showToast } from './components/Toast';
import ConfirmationModal from '../components/ConfirmationModel';
import { 
  getBookingById, 
  approveBooking, 
  rejectBooking,
  confirmCashPayment,
  getStatusColor, 
  getPaymentStatusColor 
} from '../store/bookingStore';

const OwnerBookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showConfirmCashDialog, setShowConfirmCashDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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
      navigate('/futsalowner/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await approveBooking(id);
      showToast.success('Booking approved successfully');
      fetchBookingDetails();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to approve booking');
    } finally {
      setProcessing(false);
      setShowApproveDialog(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showToast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(true);
      await rejectBooking(id, rejectReason);
      showToast.success('Booking rejected successfully');
      fetchBookingDetails();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to reject booking');
    } finally {
      setProcessing(false);
      setShowRejectDialog(false);
      setRejectReason('');
    }
  };

  const handleConfirmCash = async () => {
    try {
      setProcessing(true);
      await confirmCashPayment(id);
      showToast.success('Cash payment confirmed successfully');
      fetchBookingDetails();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setProcessing(false);
      setShowConfirmCashDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <FutsalOwnerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
          <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <FutsalOwnerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
          <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Booking not found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showPaymentBadge = booking.payment.status !== booking.bookingStatus;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <FutsalOwnerSidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => navigate('/futsalowner/bookings')}
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
                
                {/* Status Badges */}
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

            {/* Status Messages */}
            {booking.bookingStatus === 'confirmed' && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium">Booking Confirmed</p>
                  <p className="text-green-600 text-sm mt-1">
                    This booking has been confirmed and the player has been notified.
                  </p>
                </div>
              </div>
            )}

            {booking.bookingStatus === 'pending' && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
                <Clock className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-medium">Booking Pending Approval</p>
                  <p className="text-amber-600 text-sm mt-1">
                    Please review and approve or reject this booking request.
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
                    {booking.cancellation?.isCancelled && booking.cancellation?.cancellationReason && (
                      <>
                        <span className="font-medium">Reason:</span> {booking.cancellation.cancellationReason}
                        <br />
                        <span className="font-medium">Cancelled by:</span> {booking.cancellation.cancelledBy === 'user' ? 'Player' : 'Owner'}
                        {booking.cancellation.cancelledAt && (
                          <>
                            <br />
                            <span className="font-medium">Cancelled on:</span> {new Date(booking.cancellation.cancelledAt).toLocaleString()}
                          </>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}

            {booking.bookingStatus === 'rejected' && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <Ban className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Booking Rejected</p>
                  {booking.ownerApproval?.rejectionReason && (
                    <p className="text-red-600 text-sm mt-1">
                      <span className="font-medium">Reason:</span> {booking.ownerApproval.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Player Information */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Player Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-2xl">
                        {booking.playerInfo?.name?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-xl">{booking.playerInfo?.name}</h3>
                        <p className="text-gray-600">{booking.playerInfo?.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${booking.playerInfo?.phone}`} className="hover:text-green-600">
                          {booking.playerInfo?.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${booking.playerInfo?.email}`} className="hover:text-green-600 truncate">
                          {booking.playerInfo?.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Court Details */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Court & Booking Details</h2>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Court Information</h4>
                    </div>
                    <p className="text-gray-700"><span className="font-medium">Court:</span> {booking.court.name}</p>
                    <p className="text-gray-700"><span className="font-medium">Surface:</span> {booking.court.surfaceType}</p>
                  </div>

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
                      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Special Requests</p>
                          <p className="text-blue-700 mt-1">{booking.specialRequests}</p>
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
                        <span className="text-green-600">Rs. {booking.pricing.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Payment Method</span>
                    </div>
                    <p className="font-medium text-gray-900 capitalize">
                      {booking.payment.method === 'khalti' ? 'Khalti (Online)' : 
                       booking.payment.method === 'cash' ? 'Cash Payment' : 
                       booking.payment.method}
                    </p>
                    
                    <div className={`mt-2 px-3 py-2 rounded-lg text-sm ${
                      booking.payment.status === 'paid' ? 'bg-green-50 text-green-700' :
                      booking.payment.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                      booking.payment.status === 'refunded' ? 'bg-blue-50 text-blue-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      Payment Status: <span className="font-medium capitalize">{booking.payment.status}</span>
                    </div>
                    
                    {booking.payment.paidAt && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Paid on:</span> {new Date(booking.payment.paidAt).toLocaleString()}
                      </p>
                    )}
                    
                    {booking.payment.status === 'refunded' && booking.payment.refundAmount && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Refund Amount:</span> Rs. {booking.payment.refundAmount}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {booking.bookingStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => setShowApproveDialog(true)}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve Booking
                      </button>
                      <button
                        onClick={() => setShowRejectDialog(true)}
                        className="w-full px-4 py-3 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 font-medium flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject Booking
                      </button>
                    </>
                  )}

                  {booking.bookingStatus === 'confirmed' && 
                   booking.payment.method === 'cash' && 
                   booking.payment.status === 'pending' && (
                    <button
                      onClick={() => setShowConfirmCashDialog(true)}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-5 h-5" />
                      Confirm Cash Payment
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <ConfirmationModal
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleApprove}
        title="Approve Booking"
        message={`Are you sure you want to approve this booking for ${booking?.playerInfo?.name}?`}
        confirmText={processing ? 'Approving...' : 'Yes, Approve'}
        cancelText="Cancel"
        type="success"
        isLoading={processing}
      />

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Booking</h3>
                  <p className="text-gray-600">Please provide a reason for rejecting this booking.</p>
                </div>
              </div>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason (required)..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectReason('');
                  }}
                  disabled={processing}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || processing}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject Booking'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Cash Payment Dialog */}
      <ConfirmationModal
        isOpen={showConfirmCashDialog}
        onClose={() => setShowConfirmCashDialog(false)}
        onConfirm={handleConfirmCash}
        title="Confirm Cash Payment"
        message={`Confirm that ${booking?.playerInfo?.name} has paid Rs. ${booking?.pricing?.totalAmount} in cash?`}
        confirmText={processing ? 'Confirming...' : 'Yes, Confirm'}
        cancelText="Cancel"
        type="info"
        isLoading={processing}
      />
    </div>
  );
};

export default OwnerBookingDetailPage;