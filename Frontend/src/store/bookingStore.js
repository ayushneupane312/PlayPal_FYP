import axios from 'axios';

const API_URL = import.meta.env.MODE === 'development'
  ? 'http://localhost:5000/api/bookings'
  : '/api/bookings';

axios.defaults.withCredentials = true;

/**
 * Get available time slots for a venue/court on a specific date
 */
export const getAvailableSlots = async (venueId, courtId, date) => {
  try {
    console.log('📡 Getting available slots:', { venueId, courtId, date });
    
    const { data } = await axios.get(`${API_URL}/available-slots`, {
      params: { venueId, courtId, date }
    });
    
    console.log('Available slots received:', data);
    return data;
  } catch (error) {
    console.error(' Get available slots error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Create a new booking
 * @param {Object} bookingData - Booking details including paymentMethod ('cash' or 'khalti')
 */
export const createBooking = async (bookingData) => {
  try {
    console.log('📝 Creating booking:', bookingData);
    
    const { data } = await axios.post(API_URL, bookingData);
    
    console.log('✅ Booking created:', data);
    return data;
  } catch (error) {
    console.error('❌ Create booking error:', error.response?.data || error.message);
    const data = error.response?.data;
    if (data && error.response?.status) {
      data.httpStatus = error.response.status;
    }
    throw data || error;
  }
};

/**
 * Initiate Khalti payment for a booking
 * Only call this for bookings with paymentMethod='khalti'
 */
export const initiatePayment = async (bookingId) => {
  try {
    console.log('💳 Initiating payment for booking:', bookingId);
    
    const { data } = await axios.post(`${API_URL}/payment/initiate`, {
      bookingId
    });
    
    console.log('✅ Payment initiated:', data);
    return data;
  } catch (error) {
    console.error('❌ Initiate payment error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Verify Khalti payment
 */
export const verifyPayment = async (pidx, bookingId) => {
  try {
    console.log('🔍 Verifying payment:', { pidx, bookingId });
    
    const { data } = await axios.post(`${API_URL}/payment/verify`, {
      pidx,
      bookingId
    });
    
    console.log('✅ Payment verified:', data);
    return data;
  } catch (error) {
    console.error('❌ Verify payment error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get user's bookings
 */
export const getMyBookings = async (params = {}) => {
  try {
    const { data } = await axios.get(`${API_URL}/my-bookings`, { params });
    return data;
  } catch (error) {
    console.error('❌ Get my bookings error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (bookingId) => {
  try {
    const { data } = await axios.get(`${API_URL}/${bookingId}`);
    return data;
  } catch (error) {
    console.error('❌ Get booking error:', error.response?.data || error.message);
    const payload = error.response?.data;
    if (payload && error.response?.status) {
      payload.httpStatus = error.response.status;
    }
    throw payload || error;
  }
};

/**
 * Cancel booking
 */
export const cancelBooking = async (bookingId, reason) => {
  try {
    const { data } = await axios.patch(`${API_URL}/${bookingId}/cancel`, {
      reason
    });
    return data;
  } catch (error) {
    console.error('❌ Cancel booking error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// ═══════════════════════════════════════════════════════════
// SPLIT PAYMENT (after matchmaking)
// ═══════════════════════════════════════════════════════════

/** Pending split shares for logged-in user */
export const getPendingSplitPayments = async () => {
  const { data } = await axios.get(`${API_URL}/pending-split-payments`);
  return data;
};

/** Initiate Khalti for current user's split share */
export const initiateSplitPayment = async (bookingId) => {
  const { data } = await axios.post(`${API_URL}/${bookingId}/initiate-split-payment`);
  return data;
};

/** Verify Khalti split payment (after return from Khalti) */
export const verifySplitPayment = async (pidx, bookingId) => {
  const { data } = await axios.post(`${API_URL}/verify-split-payment`, {
    pidx,
    bookingId: bookingId || undefined,
  });
  return data;
};

/** Mark own share as paid (e.g. cash) */
export const payShare = async (bookingId, transactionId) => {
  const { data } = await axios.post(`${API_URL}/${bookingId}/pay-share`, {
    transactionId: transactionId || undefined
  });
  return data;
};

/** Leader cancels split/full team booking */
export const cancelBookingByLeader = async (bookingId) => {
  const { data } = await axios.patch(`${API_URL}/${bookingId}/cancel-by-leader`);
  return data;
};

// ═══════════════════════════════════════════════════════════
// FUTSAL OWNER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get all bookings for owner's venue
 */
export const getVenueBookings = async (params = {}) => {
  try {
    const { data } = await axios.get(`${API_URL}/owner/bookings`, { params });
    return data;
  } catch (error) {
    console.error('❌ Get venue bookings error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Approve booking
 */
export const approveBooking = async (bookingId) => {
  try {
    const { data } = await axios.patch(`${API_URL}/owner/${bookingId}/approve`);
    return data;
  } catch (error) {
    console.error('❌ Approve booking error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Reject booking
 */
export const rejectBooking = async (bookingId, reason) => {
  try {
    const { data } = await axios.patch(`${API_URL}/owner/${bookingId}/reject`, {
      reason
    });
    return data;
  } catch (error) {
    console.error('❌ Reject booking error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Confirm cash payment (owner confirms player paid in cash)
 */
export const confirmCashPayment = async (bookingId) => {
  try {
    const { data } = await axios.post(`${API_URL}/owner/confirm-cash-payment`, {
      bookingId
    });
    return data;
  } catch (error) {
    console.error('❌ Confirm cash payment error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get owner earnings/revenue
 */
export const getOwnerEarnings = async (params = {}) => {
  try {
    const { data } = await axios.get(`${API_URL}/owner/earnings`, { params });
    return data;
  } catch (error) {
    console.error('❌ Get earnings error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Format date for API
 */
export const formatDateForAPI = (date) => {
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0];
};

/**
 * Calculate booking duration in hours
 */
export const calculateDuration = (startTime, endTime) => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return (endMinutes - startMinutes) / 60;
};

/**
 * Get booking status badge color
 */
export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-amber-100 text-amber-700 border-amber-300',
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    rejected: 'bg-red-100 text-red-700 border-red-300',
    cancelled: 'bg-gray-100 text-gray-700 border-gray-300',
    completed: 'bg-blue-100 text-blue-700 border-blue-300'
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
};

/**
 * Get payment status badge color
 */
export const getPaymentStatusColor = (status) => {
  const colors = {
    pending: 'bg-amber-100 text-amber-700 border-amber-300',
    paid: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    failed: 'bg-red-100 text-red-700 border-red-300',
    refunded: 'bg-blue-100 text-blue-700 border-blue-300'
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
};

/**
 * Get payment method display
 */
export const getPaymentMethodDisplay = (method) => {
  const methods = {
    khalti: 'Khalti (Online)',
    cash: 'Cash Payment',
    card: 'Card Payment',
    bank_transfer: 'Bank Transfer'
  };
  return methods[method] || method;
};

/**
 * Check if booking can be cancelled
 */
export const canCancelBooking = (bookingDate, bookingStatus) => {
  const now = new Date();
  const booking = new Date(bookingDate);
  const hoursUntil = (booking - now) / (1000 * 60 * 60);
  
  return hoursUntil > 24 && ['pending', 'confirmed'].includes(bookingStatus);
};

/**
 * Calculate refund amount based on cancellation time
 */
export const calculateRefundAmount = (bookingDate, totalAmount) => {
  const now = new Date();
  const booking = new Date(bookingDate);
  const hoursUntil = (booking - now) / (1000 * 60 * 60);
  
  // Full refund if more than 48 hours
  if (hoursUntil > 48) {
    return totalAmount;
  }
  
  // 50% refund if 24-48 hours
  if (hoursUntil > 24) {
    return totalAmount * 0.5;
  }
  
  return 0;
};

const bookingStore = {
  // Player functions
  getAvailableSlots,
  createBooking,
  initiatePayment,
  verifyPayment,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getPendingSplitPayments,
  initiateSplitPayment,
  verifySplitPayment,
  payShare,
  cancelBookingByLeader,

  // Owner functions
  getVenueBookings,
  approveBooking,
  rejectBooking,
  confirmCashPayment,
  getOwnerEarnings,
  
  // Helpers
  formatDateForAPI,
  calculateDuration,
  getStatusColor,
  getPaymentStatusColor,
  getPaymentMethodDisplay,
  canCancelBooking,
  calculateRefundAmount
};

export default bookingStore;