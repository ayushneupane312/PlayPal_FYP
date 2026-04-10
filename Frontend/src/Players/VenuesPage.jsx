// src/pages/player/VenuesPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from './PlayerSidebar';
import {
  Search,
  MapPin,
  Star,
  Clock,
  Filter,
  Loader2,
  AlertCircle,
  Eye,
  Calendar
} from 'lucide-react';
import { getAllVenues } from '../store/venueService';

const VenuesPage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    facilities: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllVenues(filters);
      setVenues(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch venues');
      console.error('Fetch venues error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchVenues();
  };

  // ✅ Updated to navigate to venue detail page
  const handleViewDetails = (venueId) => {
    navigate(`/player/venues/${venueId}`);
  };

  // 3. Add the handleBookNow function
  const handleBookNow = (venueId) => {
    navigate(`/player/venue/${venueId}/book`);
  };

  const filteredVenues = venues.filter(venue =>
    venue.venueName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.fullAddress?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Find Futsal Venues
            </h1>
            <p className="text-gray-600">Discover and book the best futsal courts near you</p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by venue name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button 
                onClick={handleSearch}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-medium transition-all"
              >
                Search
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <input
                type="text"
                placeholder="City"
                value={filters.city}
                onChange={(e) => setFilters({...filters, city: e.target.value})}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button 
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                <Filter className="w-4 h-4" />
                Apply Filters
              </button>
            </div>
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

          {/* Venues Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue) => (
                <div
                  key={venue._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleViewDetails(venue._id)}
                >
                  {/* Venue Image */}
                  <div className="h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 relative">
                    {venue.media?.images?.[0] ? (
                      <img
                        src={venue.media.images[0].url}
                        alt={venue.venueName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {venue.venueName?.charAt(0)}
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold">{venue.stats?.averageRating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Venue Info */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {venue.venueName}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm line-clamp-1">{venue.fullAddress}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{venue.courts?.filter(c => c.isActive).length || 0} Courts</span>
                      </div>
                      {/* ✅ Removed DollarSign icon, showing only NPR */}
                      <div className="text-emerald-600 font-bold">
                        <span>
                          NPR {venue.courts?.find(c => c.isActive)?.pricing?.weekdayRate || 'N/A'}/hr
                        </span>
                      </div>
                    </div>

                    {/* Facilities */}
                    {venue.facilities && venue.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {venue.facilities?.slice(0, 3).map((facility, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                          >
                            {facility}
                          </span>
                        ))}
                        {venue.facilities?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                            +{venue.facilities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(venue._id);
                        }}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <Eye className="w-5 h-5" />
                        View Details
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(venue._id);
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-5 h-5" />
                        Book Now
                      </button>
                    </div>


                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredVenues.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No venues found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenuesPage;