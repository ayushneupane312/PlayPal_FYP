// src/pages/futsalowner/BookingsManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Users, Phone, Mail, DollarSign, 
  Filter, Search, CheckCircle, XCircle, Loader2,
  Eye, ChevronRight, AlertCircle, Info
} from 'lucide-react';
import FutsalOwnerSidebar from './FutsalOwnerSidebar';
import Header from './components/Header';
import { showToast } from './components/Toast';
import ConfirmationModal from '../components/ConfirmationModel';
import { 
  getVenueBookings, 
  approveBooking, 
  rejectBooking,
  confirmCashPayment,
  getStatusColor,
  getPaymentStatusColor 
} from '../store/bookingStore';

export default function BookingsManagementPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showConfirmCashDialog, setShowConfirmCashDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;

      const response = await getVenueBookings(params);
      setBookings(response.data);
      setStats(response.stats);
    } catch (error) {
      showToast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await approveBooking(selectedBooking._id);
      showToast.success('Booking approved successfully');
      fetchBookings();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to approve booking');
    } finally {
      setProcessing(false);
      setShowApproveDialog(false);
      setSelectedBooking(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showToast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(true);
      await rejectBooking(selectedBooking._id, rejectReason);
      showToast.success('Booking rejected');
      fetchBookings();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to reject booking');
    } finally {
      setProcessing(false);
      setShowRejectDialog(false);
      setSelectedBooking(null);
      setRejectReason('');
    }
  };

  const handleConfirmCash = async () => {
    try {
      setProcessing(true);
      await confirmCashPayment(selectedBooking._id);
      showToast.success('Cash payment confirmed');
      fetchBookings();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setProcessing(false);
      setShowConfirmCashDialog(false);
      setSelectedBooking(null);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.playerInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.playerInfo?.phone?.includes(searchQuery) ||
      booking.playerInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.court?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const openApproveDialog = (booking) => {
    setSelectedBooking(booking);
    setShowApproveDialog(true);
  };

  const openRejectDialog = (booking) => {
    setSelectedBooking(booking);
    setShowRejectDialog(true);
  };

  const openConfirmCashDialog = (booking) => {
    setSelectedBooking(booking);
    setShowConfirmCashDialog(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <FutsalOwnerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
            <p className="text-gray-600">View and manage all booking requests</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">Total Bookings</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-amber-50 rounded-lg shadow p-4">
              <div className="text-sm text-amber-600 mb-1">Pending</div>
              <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-4">
              <div className="text-sm text-green-600 mb-1">Confirmed</div>
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            </div>
            <div className="bg-blue-50 rounded-lg shadow p-4">
              <div className="text-sm text-blue-600 mb-1">Completed</div>
              <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            </div>
            <div className="bg-red-50 rounded-lg shadow p-4">
              <div className="text-sm text-red-600 mb-1">Cancelled</div>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by player name, phone, email, or court..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { value: 'all', label: 'All', count: stats.total },
              { value: 'pending', label: 'Pending', count: stats.pending },
              { value: 'confirmed', label: 'Confirmed', count: stats.confirmed },
              { value: 'completed', label: 'Completed', count: stats.completed },
              { value: 'cancelled', label: 'Cancelled', count: stats.cancelled }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  statusFilter === filter.value
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          {/* Bookings Table/Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
                          booking.bookingStatus === 'confirmed' ? 'bg-green-500' :
                          booking.bookingStatus === 'pending' ? 'bg-amber-500' :
                          booking.bookingStatus === 'completed' ? 'bg-blue-500' :
                          'bg-red-500'
                        }`}>
                          {booking.playerInfo?.name?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{booking.playerInfo?.name}</h3>
                          <p className="text-sm text-gray-600">{booking.court?.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.bookingStatus)}`}>
                        {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(booking.payment.status)}`}>
                        {booking.payment.status.charAt(0).toUpperCase() + booking.payment.status.slice(1)}
                      </span>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{booking.timeSlot.startTime} - {booking.timeSlot.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{booking.playerInfo?.numberOfPlayers} players</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{booking.playerInfo?.phone}</span>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 mb-4">
                      <div>
                        <div className="text-xs text-gray-600">Amount</div>
                        <div className="font-semibold text-gray-900">NPR {booking.pricing.totalAmount}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">Method</div>
                        <div className="text-sm font-medium capitalize">{booking.payment.method}</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {/* ✅ VIEW DETAILS BUTTON - Always visible */}
                      <button
                        onClick={() => navigate(`/futsalowner/booking-management/${booking._id}`)}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>

                      {booking.bookingStatus === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openRejectDialog(booking)}
                            className="flex-1 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                          <button
                            onClick={() => openApproveDialog(booking)}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                        </div>
                      )}

                      {booking.bookingStatus === 'confirmed' && 
                       booking.payment.method === 'cash' && 
                       booking.payment.status === 'pending' && (
                        <button
                          onClick={() => openConfirmCashDialog(booking)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1"
                        >
                          <DollarSign className="w-4 h-4" />
                          Confirm Cash Payment
                        </button>
                      )}

                      {booking.specialRequests && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-blue-900">Special Request:</div>
                              <div className="text-blue-700">{booking.specialRequests}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approve Dialog */}
      <ConfirmationModal
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleApprove}
        title="Approve Booking"
        message={`Are you sure you want to approve this booking for ${selectedBooking?.playerInfo?.name}?`}
        confirmText={processing ? 'Approving...' : 'Yes, Approve'}
        cancelText="Cancel"
        type="info"
        isLoading={processing}
      />

      {/* Reject Dialog with Reason */}
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
                placeholder="Enter rejection reason..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectReason('');
                  }}
                  disabled={processing}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || processing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
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
        message={`Confirm that ${selectedBooking?.playerInfo?.name} has paid NPR ${selectedBooking?.pricing?.totalAmount} in cash?`}
        confirmText={processing ? 'Confirming...' : 'Yes, Confirm'}
        cancelText="Cancel"
        type="info"
        isLoading={processing}
      />
    </div>
  );
}