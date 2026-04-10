import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin, ImageIcon, Phone, Mail, Clock, Upload, X, Settings,
  DollarSign, Video, Wifi, Car, Users, Coffee, Shield,
  AlertCircle, Facebook, Instagram, Twitter, Globe, Save,
  Plus, Trash2, Edit2, Info
} from 'lucide-react';
import FutsalOwnerSidebar from './FutsalOwnerSidebar';
import Header from './components/Header';
import { showToast } from './components/Toast';
import venueService from '../store/venueService';

export default function VenuePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const venueDataLoadedToastShownRef = useRef(false);

  // Venue Information
  const [venueInfo, setVenueInfo] = useState({
    name: '',
    address: '',
    description: '',
    phoneNumber: '',
    email: '',
    googleMapLink: '',
    openingTime: '06:00',
    closingTime: '22:00'
  });

  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

  // Gallery
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryVideos, setGalleryVideos] = useState([]);

  // Courts & Pricing
  const [courts, setCourts] = useState([
    { id: 1, name: 'Court 1', size: '5v5', peakPrice: 2500, offPeakPrice: 2000, available: true }
  ]);

  const [peakHours, setPeakHours] = useState({
    start: '16:00',
    end: '21:00'
  });

  // Amenities
  const [amenities, setAmenities] = useState({
    parking: false,
    changingRooms: false,
    showers: false,
    wifi: false,
    refreshments: false,
    firstAid: false,
    lockers: false,
    waitingArea: false
  });

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    khalti: false,
    bankTransfer: false,
    card: false
  });

  // Policies
  const [policies, setPolicies] = useState({
    cancellation: '24 hours notice required for full refund. Cancellations within 24 hours are non-refundable.',
    rules: 'No metal studs allowed. Proper sports attire required. Maximum 10 players per team.',
    advanceBooking: '30'
  });

  // Social Media
  const [socialMedia, setSocialMedia] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    website: ''
  });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      console.log('🔍 Starting to load initial data...');

      // Try to load existing venue first
      try {
        console.log('📍 Step 1: Checking for existing venue...');
        const venueResponse = await venueService.getVenueInfo();
        console.log('📦 Venue response:', venueResponse);

        if (venueResponse?.success && venueResponse?.data) {
          console.log('✅ Existing venue found! Populating form...');
          populateVenueData(venueResponse.data);
          if (!venueDataLoadedToastShownRef.current) {
            showToast.success('Venue data loaded');
            venueDataLoadedToastShownRef.current = true;
          }
          setInitialLoading(false);
          return;
        }
      } catch (venueError) {
        console.log('Error details:', venueError.response?.status, venueError.response?.data?.message);
      }

      // Load futsal owner registration data for auto-fill
      try {
        const ownerResponse = await venueService.getFutsalOwnerData();

        if (!ownerResponse) {
          console.error('No response from getFutsalOwnerData');
          showToast.warning('Please fill in the form manually');
          return;
        }

        if (!ownerResponse.success) {
          console.error('❌ Response success is false:', ownerResponse);
          showToast.warning('Please fill in the form manually');
          return;
        }

        if (!ownerResponse.data) {
          console.error('❌ No data in response:', ownerResponse);
          showToast.warning('No registration data found. Please fill in the form manually');
          return;
        }

        console.log('📋 Data to auto-fill:', {
          futsalName: ownerResponse.data.futsalName,
          futsalLocation: ownerResponse.data.futsalLocation,
          businessContact: ownerResponse.data.businessContact,
          email: ownerResponse.data.email,
          googleMapLink: ownerResponse.data.googleMapLink
        });

        autoFillFromOwnerData(ownerResponse.data);

        const filledFields = [];
        if (ownerResponse.data.futsalName) filledFields.push('Venue Name');
        if (ownerResponse.data.futsalLocation) filledFields.push('Address');
        if (ownerResponse.data.businessContact || ownerResponse.data.phone) filledFields.push('Phone');
        if (ownerResponse.data.email) filledFields.push('Email');

        if (filledFields.length > 0) {
          showToast.success(`Auto-filled: ${filledFields.join(', ')}. Please complete remaining fields.`);
        } else {
          showToast.warning('No data available to auto-fill. Please fill in the form manually.');
        }

      } catch (ownerError) {
        if (ownerError.response?.status === 404) {
          showToast.warning('No registration data found. Please fill in the form manually.');
        } else {
          showToast.error('Failed to load registration data. Please fill in the form manually.');
        }
      }

    } catch (error) {
      console.error('Unexpected error in loadInitialData:', error);
      showToast.error('Failed to load data');
    } finally {
      setInitialLoading(false);
      console.log('Initial data loading complete');
    }
  };

  // Auto-fill form with futsal owner registration data
  const autoFillFromOwnerData = (ownerData) => {
    console.log('Starting auto-fill with data:', ownerData);

    if (!ownerData) {
      console.error('No owner data provided to autoFillFromOwnerData');
      return;
    }

    const updates = {
      name: ownerData.futsalName || '',
      address: ownerData.futsalLocation || '',
      phoneNumber: ownerData.businessContact || ownerData.phone || '',
      email: ownerData.email || '',
      googleMapLink: ownerData.googleMapLink || '',
      description: '',
      openingTime: '06:00',
      closingTime: '22:00'
    };

    console.log('Setting venue info to:', updates);
    setVenueInfo(updates);
  };

  // Populate form with existing venue data
  const populateVenueData = (venue) => {
    // Basic info
    setVenueInfo({
      name: venue.venueName || '',
      address: venue.fullAddress || '',
      description: venue.description || '',
      phoneNumber: venue.contactInfo?.phone || '',
      email: venue.contactInfo?.email || '',
      googleMapLink: venue.googleMapLink || '',
      openingTime: venue.operatingHours?.[0]?.openTime || '06:00',
      closingTime: venue.operatingHours?.[0]?.closeTime || '22:00'
    });

    // Operating days
    if (venue.operatingHours && venue.operatingHours.length > 0) {
      const dayMap = {
        'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed',
        'Thursday': 'Thu', 'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun'
      };
      const openDays = venue.operatingHours
        .filter(oh => oh.isOpen)
        .map(oh => dayMap[oh.day]);
      setSelectedDays(openDays);
    }

    // Courts
    if (venue.courts && venue.courts.length > 0) {
      setCourts(venue.courts.map((court, index) => ({
        id: index + 1,
        name: court.name,
        size: court.dimensions?.includes('40') ? '5v5' :
          court.dimensions?.includes('50') ? '6v6' : '7v7',
        peakPrice: court.pricing?.peakHourRate || court.pricing?.weekendRate || 2500,
        offPeakPrice: court.pricing?.offPeakRate || court.pricing?.weekdayRate || 2000,
        available: court.isActive
      })));

      if (venue.operatingHours?.[0]?.peakHours) {
        setPeakHours({
          start: venue.operatingHours[0].peakHours.start || '16:00',
          end: venue.operatingHours[0].peakHours.end || '21:00'
        });
      }
    }

    // Amenities
    if (venue.facilities && venue.facilities.length > 0) {
      const amenityMap = {
        'Parking': 'parking',
        'Changing Rooms': 'changingRooms',
        'Showers': 'showers',
        'WiFi': 'wifi',
        'Cafeteria': 'refreshments',
        'First Aid': 'firstAid',
        'Lockers': 'lockers',
        'Seating Area': 'waitingArea',
        'Waiting Area': 'waitingArea'
      };

      const newAmenities = { ...amenities };
      venue.facilities.forEach(facility => {
        const key = amenityMap[facility];
        if (key) newAmenities[key] = true;
      });
      setAmenities(newAmenities);
    }

    // ✅ FIX 1: Filter out images with missing/invalid URLs before setting state
    if (venue.media) {
      setGalleryImages((venue.media.images || []).filter(img => img?.url));
      setGalleryVideos((venue.media.videos || []).filter(vid => vid?.url));
    }

    // Policies
    if (venue.policies) {
      setPolicies({
        cancellation: venue.policies.cancellationPolicy || policies.cancellation,
        rules: venue.policies.rulesAndRegulations || policies.rules,
        advanceBooking: venue.policies.advanceBookingDays?.toString() || '30'
      });
    }

    // Social Media
    if (venue.socialMedia) {
      setSocialMedia({
        facebook: venue.socialMedia.facebook || '',
        instagram: venue.socialMedia.instagram || '',
        twitter: venue.socialMedia.twitter || '',
        website: venue.socialMedia.website || ''
      });
    }

    if (venue.paymentMethods) {
      setPaymentMethods({
        cash: venue.paymentMethods.cash || false,
        khalti: venue.paymentMethods.khalti || false,
        bankTransfer: venue.paymentMethods.bankTransfer || false,
        card: venue.paymentMethods.card || false
      });
    }
  };

  // Validation function
  const validateForm = () => {
    const errors = [];

    if (!venueInfo.name.trim()) errors.push('Venue Name');
    if (!venueInfo.address.trim()) errors.push('Address');
    if (!venueInfo.description.trim()) errors.push('Description');
    if (!venueInfo.phoneNumber.trim()) errors.push('Phone Number');
    if (!venueInfo.email.trim()) errors.push('Email');
    if (!venueInfo.openingTime) errors.push('Opening Time');
    if (!venueInfo.closingTime) errors.push('Closing Time');

    if (venueInfo.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(venueInfo.email)) {
      errors.push('Valid Email Address');
    }

    if (venueInfo.phoneNumber && !/^[0-9+\-() ]{10,}$/.test(venueInfo.phoneNumber)) {
      errors.push('Valid Phone Number');
    }

    if (courts.length === 0) {
      errors.push('At least one Court');
    }

    if (selectedDays.length === 0) {
      errors.push('At least one Operating Day');
    }

    courts.forEach((court, index) => {
      if (!court.name.trim()) errors.push(`Court ${index + 1} Name`);
      if (!court.peakPrice || court.peakPrice <= 0) errors.push(`Court ${index + 1} Peak Price`);
      if (!court.offPeakPrice || court.offPeakPrice <= 0) errors.push(`Court ${index + 1} Off-Peak Price`);
    });

    return errors;
  };

  // Handlers
  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) {
        showToast.error('You must select at least one operating day');
        return;
      }
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleInputChange = (field, value) => {
    setVenueInfo({ ...venueInfo, [field]: value });
  };

  const handleAmenityToggle = (amenity) => {
    setAmenities({ ...amenities, [amenity]: !amenities[amenity] });
  };

  const handlePaymentToggle = (method) => {
    setPaymentMethods({ ...paymentMethods, [method]: !paymentMethods[method] });
  };

  const handlePolicyChange = (field, value) => {
    setPolicies({ ...policies, [field]: value });
  };

  const handleSocialChange = (field, value) => {
    setSocialMedia({ ...socialMedia, [field]: value });
  };

  const handleCourtChange = (id, field, value) => {
    setCourts(courts.map(court =>
      court.id === id ? { ...court, [field]: value } : court
    ));
  };

  const handleAddCourt = () => {
    const newId = Math.max(...courts.map(c => c.id), 0) + 1;
    setCourts([...courts, {
      id: newId,
      name: `Court ${newId}`,
      size: '5v5',
      peakPrice: 2500,
      offPeakPrice: 2000,
      available: true
    }]);
  };

  const handleRemoveCourt = (id) => {
    if (courts.length === 1) {
      showToast.error('You must have at least one court');
      return;
    }
    setCourts(courts.filter(court => court.id !== id));
  };

  // Image Upload
  const handleAddImage = async () => {
    if (!venueInfo.name || !venueInfo.address || !venueInfo.email) {
      showToast.error('Please fill in basic venue information (Name, Address, Email) and save before uploading images.');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      const validation = venueService.validateFiles(files, 'image');

      if (validation.invalid.length > 0) {
        validation.invalid.forEach(({ error }) => showToast.error(error));
      }

      if (validation.valid.length === 0) return;

      try {
        setLoading(true);
        const response = await venueService.uploadMedia({ images: validation.valid });

        // ✅ FIX 2: Filter uploaded images to ensure they have valid URLs
        const newImages = (response.data.images || []).filter(img => img?.url);
        setGalleryImages([...galleryImages, ...newImages]);
        showToast.success(`${validation.valid.length} image(s) uploaded successfully`);
      } catch (error) {
        if (error.response?.status === 404) {
          showToast.error('Please save your venue information first before uploading images.');
        } else {
          showToast.error(error.response?.data?.message || 'Failed to upload images');
        }
        console.error('Upload error:', error);
      } finally {
        setLoading(false);
      }
    };

    input.click();
  };

  const handleRemoveImage = async (index) => {
    const image = galleryImages[index];

    try {
      await venueService.deleteMedia(image.publicId);
      setGalleryImages(galleryImages.filter((_, i) => i !== index));
      showToast.success('Image removed');
    } catch (error) {
      showToast.error('Failed to remove image');
    }
  };

  // Video Upload
  const handleAddVideo = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.multiple = true;

    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      const validation = venueService.validateFiles(files, 'video');

      if (validation.invalid.length > 0) {
        validation.invalid.forEach(({ error }) => showToast.error(error));
      }

      if (validation.valid.length === 0) return;

      try {
        setLoading(true);
        showToast.info('Uploading videos... This may take a moment.');

        const response = await venueService.uploadMedia({ videos: validation.valid });

        const newVideos = (response.data.videos || []).filter(vid => vid?.url);
        setGalleryVideos([...galleryVideos, ...newVideos]);
        showToast.success(`${validation.valid.length} video(s) uploaded successfully`);
      } catch (error) {
        showToast.error(error.response?.data?.message || 'Failed to upload videos');
      } finally {
        setLoading(false);
      }
    };

    input.click();
  };

  const handleRemoveVideo = async (index) => {
    const video = galleryVideos[index];

    try {
      await venueService.deleteMedia(video.publicId);
      setGalleryVideos(galleryVideos.filter((_, i) => i !== index));
      showToast.success('Video removed');
    } catch (error) {
      showToast.error('Failed to remove video');
    }
  };

  // Save All Changes
  const handleSaveChanges = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showToast.error(`Please fill in required fields: ${validationErrors.join(', ')}`);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        venueName: venueInfo.name.trim(),
        fullAddress: venueInfo.address.trim(),
        description: venueInfo.description.trim(),
        googleMapLink: venueInfo.googleMapLink.trim() || undefined,

        contactInfo: {
          phone: venueInfo.phoneNumber.trim(),
          email: venueInfo.email.trim().toLowerCase(),
        },

        courts: courts.map(court => ({
          name: court.name.trim(),
          surfaceType: 'Artificial Turf',
          dimensions: court.size === '5v5' ? '40m x 20m' :
            court.size === '6v6' ? '50m x 25m' : '60m x 30m',
          isActive: court.available,
          pricing: {
            weekdayRate: parseFloat(court.offPeakPrice),
            weekendRate: parseFloat(court.peakPrice),
            peakHourRate: parseFloat(court.peakPrice),
            offPeakRate: parseFloat(court.offPeakPrice)
          }
        })),

        operatingHours: selectedDays.map(day => {
          const dayMap = {
            'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday',
            'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday'
          };

          return {
            day: dayMap[day],
            isOpen: true,
            openTime: venueInfo.openingTime,
            closeTime: venueInfo.closingTime,
            peakHours: {
              start: peakHours.start,
              end: peakHours.end
            }
          };
        }),

        facilities: Object.keys(amenities)
          .filter(key => amenities[key])
          .map(key => {
            const facilityMap = {
              parking: 'Parking',
              changingRooms: 'Changing Rooms',
              showers: 'Showers',
              wifi: 'WiFi',
              refreshments: 'Cafeteria',
              firstAid: 'First Aid',
              lockers: 'Lockers',
              waitingArea: 'Seating Area'
            };
            return facilityMap[key];
          }),

        media: {
          images: galleryImages.map(img => ({
            url: img.url,
            publicId: img.publicId,
            category: img.category || 'general'
          })),
          videos: galleryVideos.map(vid => ({
            url: vid.url,
            publicId: vid.publicId,
            thumbnail: vid.thumbnail,
            duration: vid.duration
          }))
        },

        policies: {
          cancellationPolicy: policies.cancellation.trim(),
          rulesAndRegulations: policies.rules.trim(),
          advanceBookingDays: parseInt(policies.advanceBooking) || 30
        },

        socialMedia: {
          facebook: socialMedia.facebook.trim() || undefined,
          instagram: socialMedia.instagram.trim() || undefined,
          twitter: socialMedia.twitter.trim() || undefined,
          website: socialMedia.website.trim() || undefined
        },

        paymentMethods: {
          cash: paymentMethods.cash,
          khalti: paymentMethods.khalti,
          bankTransfer: paymentMethods.bankTransfer,
          card: paymentMethods.card
        }
      };

      const response = await venueService.updateVenueInfo(payload);
      showToast.success(response.message || 'Venue information saved successfully!');

      setTimeout(() => {
        window.location.href = '/futsalowner/myvenue';
      }, 1500);

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save venue information';
      const errors = error.response?.data?.errors;

      if (errors && Array.isArray(errors)) {
        errors.forEach(err => showToast.error(err));
      } else {
        showToast.error(errorMessage);
      }

      console.error('Save error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <FutsalOwnerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
          <div className="p-6 flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <FutsalOwnerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

        <div className="p-6">
          {/* Header with Required Fields Notice */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Venue Management</h1>
                <p className="text-gray-600">Manage your futsal venue details and settings</p>
              </div>
              <button
                onClick={handleSaveChanges}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>

            {/* Required Fields Notice */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900">Required Fields</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Please fill in all fields marked with{' '}
                    <span className="text-red-500 font-semibold" aria-hidden="true">
                      *
                    </span>{' '}
                    except: Social Media links, Google Maps link, Advance Booking Days, and Videos (optional)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Venue Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Venue Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={venueInfo.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={venueInfo.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={venueInfo.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Describe your venue, facilities, and what makes it special..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Link</label>
                    <input
                      type="url"
                      value={venueInfo.googleMapLink}
                      onChange={(e) => handleInputChange('googleMapLink', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* Courts & Pricing */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Courts & Pricing</h2>
                  </div>
                  <button
                    onClick={handleAddCourt}
                    className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Court
                  </button>
                </div>

                {/* Peak Hours Definition */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2 mb-3">
                    <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Peak Hours</h3>
                      <p className="text-sm text-gray-600">Define peak hours for higher pricing</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={peakHours.start}
                        onChange={(e) => setPeakHours({ ...peakHours, start: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                      <input
                        type="time"
                        value={peakHours.end}
                        onChange={(e) => setPeakHours({ ...peakHours, end: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Courts List */}
                <div className="space-y-4">
                  {courts.map((court) => (
                    <div key={court.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Court Name</label>
                            <input
                              type="text"
                              value={court.name}
                              onChange={(e) => handleCourtChange(court.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Court Size</label>
                            <select
                              value={court.size}
                              onChange={(e) => handleCourtChange(court.id, 'size', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <option value="5v5">5v5</option>
                              <option value="6v6">6v6</option>
                              <option value="7v7">7v7</option>
                            </select>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveCourt(court.id)}
                          className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Peak Price (Rs/hr)</label>
                          <input
                            type="number"
                            value={court.peakPrice}
                            onChange={(e) => handleCourtChange(court.id, 'peakPrice', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Off-Peak Price (Rs/hr)</label>
                          <input
                            type="number"
                            value={court.offPeakPrice}
                            onChange={(e) => handleCourtChange(court.id, 'offPeakPrice', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <select
                            value={court.available ? 'available' : 'maintenance'}
                            onChange={(e) => handleCourtChange(court.id, 'available', e.target.value === 'available')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="available">Available</option>
                            <option value="maintenance">Under Maintenance</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery - Images */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-6">
                  <ImageIcon className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Venue Gallery - Images</h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">Upload high-quality images of your venue (Max 10MB each)</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                      {/* ✅ FIX 3: onError hides the broken image container */}
                      <img
                        src={img.url}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.parentElement.style.display = 'none';
                        }}
                      />
                      <button
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddImage}
                  disabled={loading}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-green-500 transition flex flex-col items-center gap-2 text-gray-500 hover:text-green-600 disabled:opacity-50"
                >
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-medium">Add Images</span>
                </button>

                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Note: Save your venue information first before uploading images
                </p>
              </div>

              {/* Gallery - Videos */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Video className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Venue Gallery - Videos</h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">Upload venue tour videos (Max 50MB each)</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {galleryVideos.map((vid, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden aspect-video bg-black">
                      <video src={vid.url} controls className="w-full h-full object-contain" />
                      <button
                        onClick={() => handleRemoveVideo(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddVideo}
                  disabled={loading}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-green-500 transition flex flex-col items-center gap-2 text-gray-500 hover:text-green-600 disabled:opacity-50"
                >
                  <Video className="w-8 h-8" />
                  <span className="text-sm font-medium">Add Videos</span>
                </button>
              </div>

              {/* Policies */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Policies & Rules</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Policy</label>
                    <textarea
                      value={policies.cancellation}
                      onChange={(e) => handlePolicyChange('cancellation', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue Rules</label>
                    <textarea
                      value={policies.rules}
                      onChange={(e) => handlePolicyChange('rules', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Advance Booking (Days)</label>
                    <input
                      type="number"
                      value={policies.advanceBooking}
                      onChange={(e) => handlePolicyChange('advanceBooking', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Phone className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={venueInfo.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={venueInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Operating Hours</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Opening</label>
                      <input
                        type="time"
                        value={venueInfo.openingTime}
                        onChange={(e) => handleInputChange('openingTime', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Closing</label>
                      <input
                        type="time"
                        value={venueInfo.closingTime}
                        onChange={(e) => handleInputChange('closingTime', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Operating Days</label>
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map(day => (
                        <button
                          key={day}
                          onClick={() => handleDayToggle(day)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            selectedDays.includes(day)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Coffee className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'parking', icon: Car, label: 'Parking' },
                    { key: 'changingRooms', icon: Users, label: 'Changing Rooms' },
                    { key: 'showers', icon: Users, label: 'Showers' },
                    { key: 'wifi', icon: Wifi, label: 'WiFi' },
                    { key: 'refreshments', icon: Coffee, label: 'Refreshments' },
                    { key: 'firstAid', icon: Shield, label: 'First Aid' },
                    { key: 'lockers', icon: Shield, label: 'Lockers' },
                    { key: 'waitingArea', icon: Users, label: 'Waiting Area' }
                  ].map(({ key, icon: Icon, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={amenities[key]}
                        onChange={() => handleAmenityToggle(key)}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <Icon className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition" />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-6">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'cash', label: 'Cash' },
                    { key: 'khalti', label: 'Khalti' },
                    { key: 'bankTransfer', label: 'Bank Transfer' },
                    { key: 'card', label: 'Credit/Debit Card' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={paymentMethods[key]}
                        onChange={() => handlePaymentToggle(key)}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Social Media</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Facebook className="w-4 h-4" /> Facebook
                    </label>
                    <input
                      type="url"
                      value={socialMedia.facebook}
                      onChange={(e) => handleSocialChange('facebook', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Instagram className="w-4 h-4" /> Instagram
                    </label>
                    <input
                      type="url"
                      value={socialMedia.instagram}
                      onChange={(e) => handleSocialChange('instagram', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://instagram.com/..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Twitter className="w-4 h-4" /> Twitter
                    </label>
                    <input
                      type="url"
                      value={socialMedia.twitter}
                      onChange={(e) => handleSocialChange('twitter', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://twitter.com/..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Globe className="w-4 h-4" /> Website
                    </label>
                    <input
                      type="url"
                      value={socialMedia.website}
                      onChange={(e) => handleSocialChange('website', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}