import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Star, Clock, Calendar, Users,
  Edit2, Eye, TrendingUp, Image as ImageIcon, Video,
  Phone, Mail, Globe, Facebook, Instagram, Award,
  Shield, Wifi, Car, Coffee
} from 'lucide-react';
import FutsalOwnerSidebar from './FutsalOwnerSidebar';
import Header from './components/Header';
import { showToast } from './components/Toast';
import venueService from '../store/venueService';

export default function VenueDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [venue, setVenue] = useState(null);

  useEffect(() => {
    fetchVenueData();
  }, []);

  const fetchVenueData = async () => {
    try {
      setLoading(true);
      const response = await venueService.getVenueInfo();
      // API returns { success, data: venue } – use the inner venue object
      const venuePayload = response?.data ?? response;
      setVenue(venuePayload);
    } catch (error) {
      if (error.response?.status === 404) {
        showToast.info('No venue found. Please create your venue first.');
        navigate('/venue-page');
      } else {
        showToast.error('Failed to load venue data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditVenue = () => {
    navigate('/futsalowner/VenuePage');
  };

  const formatCurrency = (amount) => {
    return `Rs ${Math.round(amount).toLocaleString('en-NP')}`;
  };

  const getDayShortName = (dayName) => {
    const map = {
      'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed',
      'Thursday': 'Thu', 'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun'
    };
    return map[dayName] || dayName;
  };

  const getOperatingDays = () => {
    if (!venue?.operatingHours?.length) return 'Not set';
    const openDays = venue.operatingHours
      .filter(oh => oh.isOpen)
      .map(oh => getDayShortName(oh.day))
      .join(', ');
    return openDays || 'Closed';
  };

  const getOperatingHours = () => {
    if (!venue?.operatingHours?.length) return 'Not set';
    const firstDay = venue.operatingHours.find(oh => oh.isOpen);
    if (!firstDay) return 'Closed';
    return `${firstDay.openTime} - ${firstDay.closeTime}`;
  };

  const getAveragePricing = () => {
    if (!venue?.courts?.length) return 'N/A';
    const activeCourts = venue.courts.filter(c => c.isActive);
    if (!activeCourts.length) return 'N/A';
    const avgPrice = activeCourts.reduce((sum, court) => {
      return sum + ((court.pricing.weekdayRate + court.pricing.weekendRate) / 2);
    }, 0) / activeCourts.length;
    return formatCurrency(Math.round(avgPrice));
  };

  const getFacilityIcon = (facility) => {
    const icons = {
      'Parking': Car, 'WiFi': Wifi, 'Cafeteria': Coffee,
      'Refreshments': Coffee, 'First Aid': Shield, 'CCTV': Shield,
      'Changing Rooms': Users, 'Showers': Users, 'Lockers': Shield
    };
    return icons[facility] || Shield;
  };

  // ── Use only Cloudinary (or absolute http/https) URLs – never local /uploads/ ──
  const getUrl = (item) => item?.url || item?.secure_url || null;

  const isCloudinaryOrAbsoluteUrl = (u) => {
    if (!u || typeof u !== 'string' || u.trim() === '') return false;
    const trimmed = u.trim();
    // Reject local paths (uploads folder, relative paths)
    if (trimmed.startsWith('/uploads/') || trimmed.startsWith('../') || !trimmed.startsWith('http')) return false;
    return trimmed.startsWith('http://') || trimmed.startsWith('https://');
  };

  const hasValidUrl = (item) => isCloudinaryOrAbsoluteUrl(getUrl(item));

  // ── Loading State ──
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <FutsalOwnerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
          <div className="p-6 flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-gray-600">Loading venue data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── No Venue State ──
  if (!venue) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <FutsalOwnerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
          <div className="p-6 flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <MapPin className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Venue Found</h2>
              <p className="text-gray-600 mb-6">Create your venue to get started</p>
              <button
                onClick={() => navigate('/venue-page')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                Create Venue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Only Cloudinary / absolute URLs from venue.media.images (no local uploads) ──
  const validImages = (venue.media?.images || []).filter(img => hasValidUrl(img));

  const validVideos = (venue.media?.videos || []).filter(hasValidUrl);

  // Use the url or secure_url from the first valid image
  const coverImageUrl = validImages.length > 0 ? getUrl(validImages[0]) : null;



  return (
    <div className="flex min-h-screen bg-gray-50">
      <FutsalOwnerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

        <div className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Venue</h1>
            <p className="text-gray-600">Manage and view your venue details</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Main Card ── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">

                {/* Cover Image */}
                <div className="relative h-64 bg-gradient-to-br from-green-400 to-green-600">
                  {coverImageUrl ? (
                    <img
                      src={coverImageUrl}
                      alt={venue.venueName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.warn("Cover image failed to load:", coverImageUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="w-16 h-16 text-white/50" />
                      <p className="text-white/60 text-sm">No images uploaded yet</p>
                    </div>
                  )}

                  {/* Verification Badge */}
                  <div className="absolute top-4 right-4">
                    {venue.isVerified ? (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Award className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Pending Verification
                      </span>
                    )}
                  </div>

                  {/* Active Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      venue.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {venue.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Venue Details */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{venue.venueName}</h2>

                  <div className="flex items-start gap-2 text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>{venue.fullAddress}</span>
                  </div>

                  {venue.description && (
                    <p className="text-gray-700 mb-6 line-clamp-3">{venue.description}</p>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs">Revenue (Month)</span>
                      </div>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(0)}</p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">Total Bookings</span>
                      </div>
                      <p className="text-xl font-bold text-blue-600">{venue.stats?.totalBookings || 0}</p>
                    </div>

                    <div className="bg-amber-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Star className="w-4 h-4" />
                        <span className="text-xs">Rating</span>
                      </div>
                      <p className="text-xl font-bold text-amber-600 flex items-center gap-1">
                        <Star className="w-5 h-5 fill-current" />
                        {venue.stats?.averageRating?.toFixed(1) || '0.0'}
                        <span className="text-sm text-gray-500">({venue.stats?.totalReviews || 0})</span>
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <span className="text-xs">Avg. Price/Hour</span>
                      </div>
                      <p className="text-xl font-bold text-purple-600">{getAveragePricing()}</p>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Availability</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Operating Days:</span>
                        <span className="font-medium text-gray-900">{getOperatingDays()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Hours:</span>
                        <span className="font-medium text-gray-900">{getOperatingHours()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleEditVenue}
                      className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      <Edit2 className="w-5 h-5" /> Edit Venue
                    </button>
                    <button
                      onClick={() => navigate(`/venue/${venue._id}`)}
                      className="flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      <Eye className="w-5 h-5" /> View Public Page
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Courts Section ── */}
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Courts ({venue.courts?.length || 0})
                </h3>
                {venue.courts && venue.courts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {venue.courts.map((court, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{court.name}</h4>
                            <p className="text-sm text-gray-600">{court.surfaceType}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            court.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {court.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div>
                            <p className="text-xs text-gray-500">Weekday</p>
                            <p className="font-semibold text-gray-900">{formatCurrency(court.pricing.weekdayRate)}/hr</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Weekend</p>
                            <p className="font-semibold text-gray-900">{formatCurrency(court.pricing.weekendRate)}/hr</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No courts added yet</p>
                )}
              </div>

              {/* ── Gallery Section ── */}
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Gallery ({validImages.length + validVideos.length} items)
                </h3>

                {validImages.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Images ({validImages.length})
                    </h4>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {validImages.slice(0, 6).map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={getUrl(img)}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                          />
                        </div>
                      ))}
                    </div>
                    {validImages.length > 6 && (
                      <p className="text-sm text-gray-500 mt-2">+{validImages.length - 6} more images</p>
                    )}
                  </div>
                )}

                {validVideos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Videos ({validVideos.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {validVideos.slice(0, 2).map((vid, idx) => (
                        <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-black">
                          <video src={getUrl(vid)} controls className="w-full h-full" />
                        </div>
                      ))}
                    </div>
                    {validVideos.length > 2 && (
                      <p className="text-sm text-gray-500 mt-2">+{validVideos.length - 2} more videos</p>
                    )}
                  </div>
                )}

                {validImages.length === 0 && validVideos.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No media uploaded yet</p>
                )}
              </div>
            </div>

            {/* ── Right Sidebar ── */}
            <div className="space-y-6">

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-gray-900 font-medium">{venue.contactInfo?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-gray-900 font-medium break-all">{venue.contactInfo?.email || 'N/A'}</p>
                    </div>
                  </div>
                  {venue.googleMapLink && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Location</p>
                        <a
                          href={venue.googleMapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
                        >
                          View on Map <Globe className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Facilities */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Facilities ({venue.facilities?.length || 0})
                </h3>
                {venue.facilities && venue.facilities.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {venue.facilities.slice(0, 6).map((facility, idx) => {
                      const Icon = getFacilityIcon(facility);
                      return (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <Icon className="w-4 h-4 text-green-600" />
                          <span>{facility}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No facilities listed</p>
                )}
                {venue.facilities && venue.facilities.length > 6 && (
                  <p className="text-sm text-gray-500 mt-3">+{venue.facilities.length - 6} more facilities</p>
                )}
              </div>

              {/* Payment Methods */}
              {venue.paymentMethods && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                  <div className="space-y-2">
                    {venue.paymentMethods.cash && <p className="text-sm text-gray-700">💵 Cash</p>}
                    {venue.paymentMethods.khalti && <p className="text-sm text-gray-700">📱 Khalti</p>}
                    {venue.paymentMethods.bankTransfer && <p className="text-sm text-gray-700">🏦 Bank Transfer</p>}
                    {venue.paymentMethods.card && <p className="text-sm text-gray-700">💳 Credit/Debit Card</p>}
                    {!venue.paymentMethods.cash &&
                      !venue.paymentMethods.khalti && !venue.paymentMethods.bankTransfer &&
                      !venue.paymentMethods.card && (
                        <p className="text-gray-500 text-sm">No payment methods set</p>
                      )}
                  </div>
                </div>
              )}

              {/* Social Media */}
              {(venue.socialMedia?.facebook || venue.socialMedia?.instagram || venue.socialMedia?.website) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
                  <div className="space-y-3">
                    {venue.socialMedia.facebook && (
                      <a href={venue.socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition">
                        <Facebook className="w-5 h-5" /><span className="text-sm">Facebook</span>
                      </a>
                    )}
                    {venue.socialMedia.instagram && (
                      <a href={venue.socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-pink-600 transition">
                        <Instagram className="w-5 h-5" /><span className="text-sm">Instagram</span>
                      </a>
                    )}
                    {venue.socialMedia.website && (
                      <a href={venue.socialMedia.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition">
                        <Globe className="w-5 h-5" /><span className="text-sm">Website</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Policies */}
              {venue.policies?.cancellationPolicy && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Policies</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Cancellation Policy</p>
                      <p>{venue.policies.cancellationPolicy}</p>
                    </div>
                    {venue.policies.advanceBookingDays && (
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Advance Booking</p>
                        <p>Up to {venue.policies.advanceBookingDays} days in advance</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}