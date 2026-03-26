// src/pages/player/VenueDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Clock, Star, Calendar,
  CheckCircle, Users, Wifi, Car, ShowerHead, Coffee, Shield,
  Tv, Armchair, Droplet, AlertCircle, Loader2, ArrowLeft,
  Globe, Facebook, Instagram, Twitter, Video, Info,
  CreditCard, Banknote, Building2, Smartphone, ChevronLeft,
  ChevronRight, ExternalLink
} from 'lucide-react';
import PlayerSidebar from './PlayerSidebar';
import { showToast } from '../FutsalOwner/components/Toast';
import { getVenueById } from '../store/venueService';

const VenueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));

  useEffect(() => {
    fetchVenueDetails();
  }, [id]);

  const fetchVenueDetails = async () => {
    try {
      setLoading(true);
      const response = await getVenueById(id);
      setVenue(response.data);
    } catch (error) {
      showToast.error('Failed to load venue details');
      navigate('/player/venues');
    } finally {
      setLoading(false);
    }
  };

  const facilityIcons = {
    'Parking': Car,
    'Changing Rooms': Users,
    'Showers': ShowerHead,
    'Lockers': Shield,
    'Equipment Rental': Building2,
    'Cafeteria': Coffee,
    'First Aid': AlertCircle,
    'WiFi': Wifi,
    'Seating Area': Armchair,
    'Lighting': Tv,
    'CCTV': Shield,
    'Restrooms': ShowerHead,
    'Drinking Water': Droplet,
    'Pro Shop': Building2
  };

  const paymentMethodIcons = {
    cash: Banknote,
    esewa: Smartphone,
    khalti: Smartphone,
    bankTransfer: Building2,
    card: CreditCard
  };

  const nextImage = () => {
    if (venue?.media?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === venue.media.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (venue?.media?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? venue.media.images.length - 1 : prev - 1
      );
    }
  };

  const getDayOperatingHours = (day) => {
    return venue?.operatingHours?.find(oh => oh.day === day);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
        {/* ✅ FIX: Added proper margin-left */}
        <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}>
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
        {/* ✅ FIX: Added proper margin-left */}
        <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}>
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Venue not found</p>
          </div>
        </div>
      </div>
    );
  }

  const hasImages = venue.media?.images && venue.media.images.length > 0;
  const hasVideos = venue.media?.videos && venue.media.videos.length > 0;
  const currentHours = getDayOperatingHours(selectedDay);

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
          {/* Back Button - Outside of cards */}
          <button
            onClick={() => navigate('/player/venues')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Venues
          </button>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Venue Image Card - Medium Size */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Venue & Court</h2>
                
                {hasImages ? (
                  <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden mb-4">
                    <img
                      src={venue.media.images[currentImageIndex]?.url}
                      alt={venue.venueName}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation Arrows */}
                    {venue.media.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-lg text-sm">
                      {currentImageIndex + 1} / {venue.media.images.length}
                    </div>

                    {/* Verified Badge */}
                    {venue.isVerified && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-64 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                    <MapPin className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}

                {/* Venue Name and Details */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{venue.venueName}</h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPin className="w-5 h-5" />
                    <span>{venue.fullAddress}</span>
                  </div>
                  {venue.googleMapLink && (
                    <a
                      href={venue.googleMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in Google Maps
                    </a>
                  )}
                </div>
              </div>

              {/* About & Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">About</h2>
                  
                  {/* Stats */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-500 mb-1">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-bold text-lg">{venue.stats?.averageRating?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <p className="text-sm text-gray-600">{venue.stats?.totalReviews || 0} reviews</p>
                    <p className="text-sm text-gray-600">{venue.stats?.totalBookings || 0} bookings</p>
                  </div>
                </div>

                {venue.description && (
                  <p className="text-gray-700 leading-relaxed">{venue.description}</p>
                )}
              </div>

              {/* Courts */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-emerald-600" />
                  Available Courts ({venue.courts?.filter(c => c.isActive).length || 0})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {venue.courts?.filter(c => c.isActive).map((court) => (
                    <div key={court._id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-emerald-500 transition">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{court.name}</h3>
                      
                      <div className="space-y-2 text-sm mb-3">
                        <p className="text-gray-600">
                          <span className="font-medium">Surface:</span> {court.surfaceType}
                        </p>
                        {court.dimensions && (
                          <p className="text-gray-600">
                            <span className="font-medium">Size:</span> {court.dimensions}
                          </p>
                        )}
                      </div>

                      {court.description && (
                        <p className="text-gray-600 text-sm mb-3">{court.description}</p>
                      )}

                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1 text-sm">
                        <p className="text-gray-700">
                          <span className="font-medium">Weekday:</span> Rs. {court.pricing.weekdayRate}/hr
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Weekend:</span> Rs. {court.pricing.weekendRate}/hr
                        </p>
                        {court.pricing.peakHourRate && (
                          <p className="text-gray-700">
                            <span className="font-medium">Peak Hour:</span> Rs. {court.pricing.peakHourRate}/hr
                          </p>
                        )}
                        {court.pricing.offPeakRate && (
                          <p className="text-gray-700">
                            <span className="font-medium">Off-Peak:</span> Rs. {court.pricing.offPeakRate}/hr
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operating Hours */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-emerald-600" />
                  Operating Hours
                </h2>

                {/* Day Selector */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                        selectedDay === day
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>

                {currentHours ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    {currentHours.isOpen ? (
                      <>
                        <div className="flex items-center gap-2 text-green-600 font-medium mb-3">
                          <CheckCircle className="w-5 h-5" />
                          Open
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            <span className="font-medium">Hours:</span> {currentHours.openTime} - {currentHours.closeTime}
                          </p>
                          {currentHours.peakHours?.start && currentHours.peakHours?.end && (
                            <p className="text-gray-700">
                              <span className="font-medium">Peak Hours:</span> {currentHours.peakHours.start} - {currentHours.peakHours.end}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600 font-medium">
                        <AlertCircle className="w-5 h-5" />
                        Closed
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">No operating hours set for this day</p>
                )}
              </div>

              {/* Facilities & Amenities */}
              {venue.facilities && venue.facilities.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Facilities & Amenities</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {venue.facilities.map((facility, index) => {
                      const Icon = facilityIcons[facility] || CheckCircle;
                      return (
                        <div key={index} className="flex items-center gap-3 text-gray-700">
                          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-emerald-600" />
                          </div>
                          <span className="font-medium">{facility}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Videos */}
              {hasVideos && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Video className="w-6 h-6 text-emerald-600" />
                    Videos
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {venue.media.videos.map((video, index) => (
                      <div key={index} className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                        <video
                          src={video.url}
                          controls
                          poster={video.thumbnail}
                          className="w-full h-full"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Policies */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-6 h-6 text-emerald-600" />
                  Policies & Rules
                </h2>
                
                <div className="space-y-4">
                  {venue.policies?.cancellationPolicy && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Cancellation Policy</h3>
                      <p className="text-gray-700">{venue.policies.cancellationPolicy}</p>
                    </div>
                  )}
                  
                  {venue.policies?.paymentTerms && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Payment Terms</h3>
                      <p className="text-gray-700">{venue.policies.paymentTerms}</p>
                    </div>
                  )}
                  
                  {venue.policies?.rulesAndRegulations && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Rules & Regulations</h3>
                      <p className="text-gray-700 whitespace-pre-line">{venue.policies.rulesAndRegulations}</p>
                    </div>
                  )}

                  {venue.policies?.advanceBookingDays && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-800 text-sm">
                        <span className="font-medium">Advance Booking:</span> Up to {venue.policies.advanceBookingDays} days in advance
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-5 h-5 text-emerald-600" />
                    <a href={`tel:${venue.contactInfo.phone}`} className="hover:text-emerald-600">
                      {venue.contactInfo.phone}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-5 h-5 text-emerald-600" />
                    <a href={`mailto:${venue.contactInfo.email}`} className="hover:text-emerald-600 break-all">
                      {venue.contactInfo.email}
                    </a>
                  </div>

                  {venue.contactInfo.whatsapp && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Smartphone className="w-5 h-5 text-emerald-600" />
                      <a 
                        href={`https://wa.me/${venue.contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-600"
                      >
                        {venue.contactInfo.whatsapp}
                      </a>
                    </div>
                  )}

                  {venue.contactInfo.website && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Globe className="w-5 h-5 text-emerald-600" />
                      <a 
                        href={venue.contactInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-600 break-all"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Media */}
                {(venue.socialMedia?.facebook || venue.socialMedia?.instagram || venue.socialMedia?.twitter) && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold text-gray-900 mb-3">Follow Us</h3>
                    <div className="flex gap-3">
                      {venue.socialMedia.facebook && (
                        <a
                          href={venue.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center transition"
                        >
                          <Facebook className="w-5 h-5 text-blue-600" />
                        </a>
                      )}
                      {venue.socialMedia.instagram && (
                        <a
                          href={venue.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-pink-50 hover:bg-pink-100 rounded-lg flex items-center justify-center transition"
                        >
                          <Instagram className="w-5 h-5 text-pink-600" />
                        </a>
                      )}
                      {venue.socialMedia.twitter && (
                        <a
                          href={venue.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-sky-50 hover:bg-sky-100 rounded-lg flex items-center justify-center transition"
                        >
                          <Twitter className="w-5 h-5 text-sky-600" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              {venue.paymentMethods && Object.values(venue.paymentMethods).some(method => method) && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Methods</h2>
                  
                  <div className="space-y-2">
                    {Object.entries(venue.paymentMethods).map(([method, accepted]) => {
                      if (!accepted) return null;
                      const Icon = paymentMethodIcons[method] || CreditCard;
                      const methodNames = {
                        cash: 'Cash Payment',
                        esewa: 'eSewa',
                        khalti: 'Khalti',
                        bankTransfer: 'Bank Transfer',
                        card: 'Credit/Debit Card'
                      };
                      
                      return (
                        <div key={method} className="flex items-center gap-3 text-gray-700">
                          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span>{methodNames[method]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Book Now Button */}
              <button
                onClick={() => navigate(`/player/venue/${venue._id}/book`)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Calendar className="w-6 h-6" />
                Book Now
              </button>

              {/* Owner Info */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Venue Owner</p>
                <p className="font-semibold text-gray-900">
                  {venue.owner?.name || 'Venue Owner'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailPage;