// src/pages/player/Bookings.jsx - Updated to show recent bookings only
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from './PlayerSidebar';
import SearchAndNotificationBar from '../components/SearchAndNotificationBar';
import {
  Calendar, Clock, MapPin, Users, Plus, CreditCard,
  AlertCircle, Loader2, ChevronRight, ArrowRight
} from 'lucide-react';
import { showToast } from '../FutsalOwner/components/Toast';
import { getMyBookings, getStatusColor, getPaymentStatusColor } from '../store/bookingStore';

const Bookings = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentBookings();
  }, []);

  const fetchRecentBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyBookings({ limit: 4 }); // ✅ Get only 4 recent bookings
      setBookings(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
      showToast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    confirmed: bookings.filter(b => b.bookingStatus === 'confirmed').length,
    pending: bookings.filter(b => b.bookingStatus === 'pending').length,
    total: bookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0)
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      
<div 
  className={`flex-1 p-8 transition-all duration-300 ease-in-out ${
    isSidebarCollapsed ? 'ml-20' : 'ml-64'
  }`}
  style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
>
        <div className="max-w-7xl mx-auto">
          {/* Search & Notification Bar */}
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-6">
            <SearchAndNotificationBar searchPlaceholder="Search anything..." />
          </div>

          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
              <p className="text-gray-600">Recent futsal court reservations</p>
            </div>
            <button 
              onClick={() => navigate('/player/venues')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-emerald-200"
            >
              <Plus className="w-5 h-5" />
              Book New Slot
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-5xl font-bold text-emerald-600 mb-2">{stats.confirmed}</p>
              <p className="text-gray-600">Confirmed Bookings</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-5xl font-bold text-amber-600 mb-2">{stats.pending}</p>
              <p className="text-gray-600">Pending Confirmation</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-5xl font-bold text-gray-900 mb-2">Rs. {stats.total.toLocaleString()}</p>
              <p className="text-gray-600">Total Amount</p>
            </div>
          </div>

          {/* Recent Bookings Section */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Recent Bookings</h2>
            <button
              onClick={() => navigate('/player/mybookings')}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && bookings.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">Start by booking your first futsal court!</p>
              <button 
                onClick={() => navigate('/player/venues')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Book Now
              </button>
            </div>
          )}

          {/* Bookings List */}
          {!loading && !error && bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  onClick={() => navigate(`/player/bookings/${booking._id}`)}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {booking.venue?.venueName || 'Unknown Venue'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                            {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            Rs. {booking.pricing?.totalAmount?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{booking.court?.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span className="font-medium">
                            {new Date(booking.bookingDate).toLocaleDateString()} • {booking.timeSlot?.startTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{booking.playerInfo?.numberOfPlayers || 10} players</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookings;