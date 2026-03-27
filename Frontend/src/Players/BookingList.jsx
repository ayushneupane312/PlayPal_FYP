// src/pages/player/MyBookingsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Search, ChevronRight, Loader2
} from 'lucide-react';
import PlayerSidebar from './PlayerSidebar';
import { showToast } from '../FutsalOwner/components/Toast';
import { getMyBookings, getStatusColor } from '../store/bookingStore';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getMyBookings();
      setAllBookings(response?.data || []);
    } catch (error) {
      showToast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = allBookings.filter((booking) => {
    const matchesStatus = statusFilter === 'all' || booking.bookingStatus === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      booking.venue?.venueName?.toLowerCase().includes(q) ||
      booking.court?.name?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusCounts = () => {
    return {
      all: allBookings.length,
      pending: allBookings.filter((b) => b.bookingStatus === 'pending').length,
      confirmed: allBookings.filter((b) => b.bookingStatus === 'confirmed').length,
      completed: allBookings.filter((b) => b.bookingStatus === 'completed').length,
      cancelled: allBookings.filter((b) => b.bookingStatus === 'cancelled').length
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600">View and manage all your bookings</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by venue or court..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Pending ({counts.pending})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                statusFilter === 'confirmed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Confirmed ({counts.confirmed})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                statusFilter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Completed ({counts.completed})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                statusFilter === 'cancelled'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancelled ({counts.cancelled})
            </button>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">Start booking your favorite venues now!</p>
              <button
                onClick={() => navigate('/player/venues')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Browse Venues
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking._id}
                  onClick={() => navigate(`/player/bookings/${booking._id}`)}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-semibold text-gray-900">
                            {booking.venue?.venueName || 'Unknown Venue'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                            {booking.bookingStatus?.charAt(0).toUpperCase() + booking.bookingStatus?.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">
                            {booking.venue?.fullAddress || booking.venue?.venueName || 'Location'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{booking.timeSlot?.startTime} - {booking.timeSlot?.endTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-lg font-bold text-emerald-600">
                        Rs. {booking.pricing?.totalAmount || 0}
                      </span>
                      <button className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
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

export default MyBookingsPage;