import React, { useState, useEffect } from 'react';
import { Search, Bell, MapPin, Calendar, Star, Clock, Eye, Flag, X } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { getAllVenues } from '../store/venueService';

const FutsalCenters = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all venues on component mount
  useEffect(() => {
    fetchAllVenues();
  }, []);

  const fetchAllVenues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the service method - it already handles the correct endpoint
      const response = await getAllVenues({
        page: 1,
        limit: 100
      });

      console.log('Fetched venues:', response);
      
      if (response.success) {
        setCenters(response.data || []);
      } else {
        throw new Error('Failed to fetch venues');
      }
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError('Failed to load futsal centers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get the first court's pricing
  const getCourtPricing = (venue) => {
    if (venue.courts && venue.courts.length > 0) {
      const court = venue.courts[0];
      return {
        weekdayRate: court.pricing?.weekdayRate || 0,
        weekendRate: court.pricing?.weekendRate || 0
      };
    }
    return { weekdayRate: 0, weekendRate: 0 };
  };

  // Helper function to format time (converts "06:00" to "6AM")
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}${ampm}`;
  };

  // Helper function to get operating hours
  const getOperatingHours = (venue) => {
    if (!venue.operatingHours || venue.operatingHours.length === 0) {
      return { weekday: 'N/A', weekend: 'N/A' };
    }

    const weekday = venue.operatingHours.find(h => h.day === 'Monday');
    const weekend = venue.operatingHours.find(h => h.day === 'Saturday');

    return {
      weekday: weekday && weekday.isOpen 
        ? `${formatTime(weekday.openTime)}-${formatTime(weekday.closeTime)}` 
        : 'Closed',
      weekend: weekend && weekend.isOpen 
        ? `${formatTime(weekend.openTime)}-${formatTime(weekend.closeTime)}` 
        : 'Closed'
    };
  };

  // Helper function to get main image
  const getMainImage = (venue) => {
    if (venue.media?.images && venue.media.images.length > 0) {
      return venue.media.images[0].url;
    }
    return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop';
  };

  // Helper function to get owner name
  const getOwnerName = (venue) => {
    if (venue.owner && typeof venue.owner === 'object') {
      return venue.owner.name || venue.owner.email || 'Unknown';
    }
    return 'Unknown';
  };

  // Filter venues based on search
  const filteredCenters = centers.filter(center => {
    const matchesSearch = 
      center.venueName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      center.fullAddress?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Handle flag venue
  const handleFlag = async (venueId) => {
    const confirmed = window.confirm('Are you sure you want to flag this venue for review?');
    if (confirmed) {
      try {
        // TODO: Implement admin flag endpoint in venueService
        alert('Flag functionality needs to be implemented in backend');
        // After implementation:
        // await flagVenue(venueId);
        // fetchAllVenues();
      } catch (err) {
        console.error('Error flagging venue:', err);
        alert('Failed to flag venue. Please try again.');
      }
    }
  };

  // Handle delete venue
  const handleDelete = async (venueId) => {
    const confirmed = window.confirm('Are you sure you want to delete this venue? This action cannot be undone.');
    if (confirmed) {
      try {
        // TODO: Implement admin delete endpoint in venueService
        alert('Delete functionality needs to be implemented in backend');
        // After implementation:
        // await deleteVenue(venueId);
        // fetchAllVenues();
      } catch (err) {
        console.error('Error deleting venue:', err);
        alert('Failed to delete venue. Please try again.');
      }
    }
  };

  // Get current time
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div 
        className={`flex-1 p-8 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search anything..."
              className="flex-1 outline-none text-gray-700"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="text-gray-600" size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                3
              </span>
            </button>
            <span className="text-gray-600 text-sm">{getCurrentTime()}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Futsal Management</h1>
              <p className="text-gray-500">Manage and monitor all futsal centers</p>
            </div>
            {!loading && !error && (
              <div className="text-sm text-gray-600">
                Total Venues: <span className="font-bold text-cyan-600">{centers.length}</span>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading futsal centers...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={fetchAllVenues}
                className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Centers Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCenters.map((center) => {
                const pricing = getCourtPricing(center);
                const hours = getOperatingHours(center);
                const mainImage = getMainImage(center);
                const ownerName = getOwnerName(center);

                return (
                  <div key={center._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                    {/* Image */}
                    <div className="relative h-48">
                      <img 
                        src={mainImage} 
                        alt={center.venueName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop';
                        }}
                      />
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border bg-green-500/10 text-green-500 border-green-500/20">
                          ✓ Approved
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{center.venueName}</h3>
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                        <MapPin size={16} />
                        <span className="line-clamp-1">{center.fullAddress}</span>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Total Bookings</p>
                          <div className="flex items-center gap-1">
                            <Calendar size={16} className="text-blue-500" />
                            <span className="text-blue-500 font-bold">
                              {center.stats?.totalBookings || 0}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Active Courts</p>
                          <div className="flex items-center gap-1">
                            <span className="text-green-500 font-bold">
                              {center.courts?.filter(c => c.isActive).length || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Rating</p>
                          <div className="flex items-center gap-1">
                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-gray-900">
                              {center.stats?.averageRating 
                                ? `${center.stats.averageRating.toFixed(1)} (${center.stats.totalReviews})` 
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Weekday Rate</p>
                          <span className="font-bold text-gray-900">
                            NPR {pricing.weekdayRate}
                          </span>
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                          <Clock size={14} />
                          <span className="font-medium">Availability</span>
                        </div>
                        <div className="text-xs text-gray-700">
                          <div>Weekday: <span className="font-semibold">{hours.weekday}</span></div>
                          <div>Weekend: <span className="font-semibold">{hours.weekend}</span></div>
                        </div>
                      </div>

                      {/* Owner */}
                      <p className="text-xs text-gray-500 mb-4">
                        Owner: <span className="font-medium text-gray-700">{ownerName}</span>
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.location.href = `/admin/venues/${center._id}`}
                          className="flex-1 bg-cyan-500 text-white py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                        <button 
                          onClick={() => handleFlag(center._id)}
                          className="bg-yellow-500/10 text-yellow-600 py-2 px-3 rounded-lg hover:bg-yellow-500/20 transition-colors"
                          title="Flag venue for review"
                        >
                          <Flag size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(center._id)}
                          className="bg-red-500/10 text-red-600 py-2 px-3 rounded-lg hover:bg-red-500/20 transition-colors"
                          title="Delete venue"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {!loading && !error && filteredCenters.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No futsal centers found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FutsalCenters;