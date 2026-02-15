// src/pages/player/MyBookingsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Filter, Search, ChevronRight,
  Loader2, AlertCircle
} from 'lucide-react';
import PlayerSidebar from './PlayerSidebar';
import { showToast } from '../FutsalOwner/components/Toast';
import { getMyBookings, getStatusColor } from '../store/bookingStore';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await getMyBookings(params);
      setBookings(response.data);
    } catch (error) {
      showToast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.venue?.venueName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.court?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusCounts = () => {
    return {
      all: bookings.length,
      pending: bookings.filter(b => b.bookingStatus === 'pending').length,
      confirmed: bookings.filter(b => b.bookingStatus === 'confirmed').length,
      completed: bookings.filter(b => b.bookingStatus === 'completed').length,
      cancelled: bookings.filter(b => b.bookingStatus === 'cancelled').length
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="flex h-screen bg-gray-50">
     
    <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map((booking) => (
                <div
                  key={booking._id}
                  onClick={() => navigate(`/player/bookings/${booking._id}`)}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="p-6">
                    {/* Venue Image */}
                    {booking.venue?.media?.images?.[0]?.url && (
                      <img
                        src={booking.venue.media.images[0].url}
                        alt={booking.venue.venueName}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                    )}

                    {/* Venue Name */}
                    <h3 className="font-semibold text-gray-900 mb-2">{booking.venue?.venueName}</h3>
                    
                    {/* Status Badge */}
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${getStatusColor(booking.bookingStatus)}`}>
                      {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                    </span>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{booking.timeSlot.startTime} - {booking.timeSlot.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{booking.court.name}</span>
                      </div>
                    </div>

                    {/* Price and View Details */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="font-bold text-emerald-600">Rs. {booking.pricing.totalAmount}</span>
                      <button className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium">
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