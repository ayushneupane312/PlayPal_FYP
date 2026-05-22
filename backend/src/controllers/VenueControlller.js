const Venue = require('../models/VenueModel');
const { deleteFromCloudinary } = require('../middlewares/UploadMiddleware');
const User = require('../models/UserModel');
const FutsalOwner = require('../models/FutsalOwnerForm.js');

/** Admin card when owner is approved but has not created a Venue in the app yet. */
function venueCardFromRegistration(fo, user) {
  const images = (fo.groundImages || []).map((url, i) => ({
    url,
    publicId: fo.groundImagePublicIds?.[i] || '',
  }));

  return {
    _id: user?._id ? `reg-${fo._id}` : String(fo._id),
    futsalOwnerRef: fo._id,
    isRegistrationOnly: true,
    venueName: fo.futsalName,
    fullAddress: fo.futsalLocation,
    googleMapLink: fo.googleMapLink || '',
    isVerified: true,
    isActive: false,
    description: 'Approved registration — full venue profile pending in owner dashboard.',
    contactInfo: {
      phone: fo.phone || fo.businessContact,
      email: fo.email,
    },
    owner: user
      ? {
          _id: user._id,
          name: user.name || fo.fullName,
          email: user.email || fo.email,
          phone: user.phone || fo.phone,
          applicationStatus: 'approved',
        }
      : {
          name: fo.fullName,
          email: fo.email,
          phone: fo.phone,
        },
    media: { images },
    courts: [],
    operatingHours: [],
    stats: { totalBookings: 0, averageRating: 0, totalReviews: 0 },
  };
}

// Get futsal owner's registration data (for auto-fill)
exports.getMyFutsalOwnerData = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find user and populate futsalOwnerRef
    const user = await User.findById(userId).populate('futsalOwnerRef');
    
    if (!user || !user.futsalOwnerRef) {
      return res.status(404).json({
        success: false,
        message: 'Futsal owner registration not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user.futsalOwnerRef
    });
  } catch (error) {
    console.error('Get futsal owner data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch futsal owner data',
      error: error.message
    });
  }
};


exports.getMyVenue = async (req, res) => {
  try {
    const venue = await Venue.findOne({ owner: req.userId });
    
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'No venue found. Please create your venue first.'
      });
    }

    res.status(200).json({
      success: true,
      data: venue
    });
  } catch (error) {
    console.error('Get venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch venue',
      error: error.message
    });
  }
};

// ✅ Create or Update venue
exports.createOrUpdateVenue = async (req, res) => {
  try {
    const userId = req.userId;
    const venueData = req.body;

    const ownerUser = await User.findById(userId).select('applicationStatus');
    const ownerApplicationApproved = ownerUser?.applicationStatus === 'approved';

    // Validate required fields
    const requiredFields = [
      'venueName',
      'fullAddress',
      'description',
      'contactInfo.phone',
      'contactInfo.email',
      'courts',
      'operatingHours',
      'facilities'
    ];

    const missingFields = [];
    
    // Check venue name
    if (!venueData.venueName) missingFields.push('Venue Name');
    
    // Check full address
    if (!venueData.fullAddress) missingFields.push('Full Address');
    
    // Check description
    if (!venueData.description) missingFields.push('Description');
    
    // Check contact info
    if (!venueData.contactInfo?.phone) missingFields.push('Phone Number');
    if (!venueData.contactInfo?.email) missingFields.push('Email');
    
    // Check courts
    if (!venueData.courts || venueData.courts.length === 0) {
      missingFields.push('At least one Court');
    }
    
    // Check operating hours
    if (!venueData.operatingHours || venueData.operatingHours.length === 0) {
      missingFields.push('Operating Hours');
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if venue already exists
    let venue = await Venue.findOne({ owner: userId });

    // Check email uniqueness (if creating new or email changed)
    if (!venue || venue.contactInfo.email !== venueData.contactInfo.email) {
      const emailExists = await Venue.findOne({ 
        'contactInfo.email': venueData.contactInfo.email,
        owner: { $ne: userId }
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'This email is already used by another venue'
        });
      }
    }

    if (venue) {
      // Update existing venue
      Object.assign(venue, venueData);
      if (ownerApplicationApproved) venue.isVerified = true;
      await venue.save();

      return res.status(200).json({
        success: true,
        message: 'Venue updated successfully',
        data: venue
      });
    } else {
      // Create new venue
      venue = await Venue.create({
        ...venueData,
        owner: userId,
        isVerified: ownerApplicationApproved
      });

      return res.status(201).json({
        success: true,
        message: 'Venue created successfully',
        data: venue
      });
    }
  } catch (error) {
    console.error('Create/Update venue error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to save venue',
      error: error.message
    });
  }
};

// ✅ Upload media (images/videos)
exports.uploadMedia = async (req, res) => {
  try {
    const userId = req.userId;
    const { category = 'general' } = req.body;

    const venue = await Venue.findOne({ owner: userId });
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    // Handle images
    if (req.files?.images) {
      const newImages = req.files.images.map(file => ({
        url: file.url,
        publicId: file.public_id,
        category
      }));
      venue.media.images.push(...newImages);
    }

    // Handle videos
    if (req.files?.videos) {
      const newVideos = req.files.videos.map(file => ({
        url: file.url,
        publicId: file.public_id,
        thumbnail: file.url.replace(/\.[^/.]+$/, '.jpg'),  // Cloudinary auto-generates thumbnails
        duration: file.duration || 0
      }));
      venue.media.videos.push(...newVideos);
    }

    await venue.save();

    res.status(200).json({
      success: true,
      message: 'Media uploaded successfully',
      data: venue.media
    });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload media',
      error: error.message
    });
  }
};

// Update deleteMedia in VenueController.js
exports.deleteMedia = async (req, res) => {
  try {
    const userId = req.userId;
    const { publicId } = req.body;

    const venue = await Venue.findOne({ owner: userId });
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    // Determine media type from publicId or search both arrays
    let mediaType = 'image';
    let found = venue.media.images.find(img => img.publicId === publicId);
    
    if (!found) {
      found = venue.media.videos.find(vid => vid.publicId === publicId);
      mediaType = 'video';
    }

    if (!found) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Delete from Cloudinary
    const resourceType = mediaType === 'video' ? 'video' : 'image';
    await deleteFromCloudinary(publicId, resourceType);

    // Remove from database
    if (mediaType === 'image') {
      venue.media.images = venue.media.images.filter(img => img.publicId !== publicId);
    } else {
      venue.media.videos = venue.media.videos.filter(vid => vid.publicId !== publicId);
    }

    await venue.save();

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully',
      data: venue.media
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete media',
      error: error.message
    });
  }
};


exports.getAllVenues = async (req, res) => {
  try {
    const { city, facilities, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    if (facilities) {
      const facilityArray = facilities.split(',');
      query.facilities = { $all: facilityArray };
    }

    const venues = await Venue.find(query)
      .populate('owner', 'name email phone')
      .select('-__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Venue.countDocuments(query);

    res.status(200).json({
      success: true,
      data: venues,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch venues',
      error: error.message
    });
  }
};

// ✅ Get single venue by ID (Public)
exports.getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id)
      .populate('owner', 'name email')
      .select('-__v');

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    res.status(200).json({
      success: true,
      data: venue
    });
  } catch (error) {
    console.error('Get venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch venue',
      error: error.message
    });
  }

  // Get futsal owner's registration data (for auto-fill)


};

// ────────────────────────────────────────────────────────────
// ADMIN VENUE MANAGEMENT
// ────────────────────────────────────────────────────────────

// Get all venues for admin (includes inactive / unverified / flagged)
exports.getAllVenuesAdmin = async (req, res) => {
  try {
    const {
      search,
      city,
      isActive,
      isVerified,
      approvedOnly = 'true',
      onePerOwner = 'true',
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (typeof isActive !== 'undefined') {
      query.isActive = isActive === 'true';
    }

    if (typeof isVerified !== 'undefined') {
      query.isVerified = isVerified === 'true';
    }

    // Futsal Centers: match Futsal Approval (approved registrations + their venues)
    if (approvedOnly === 'true') {
      const approvedRegistrations = await FutsalOwner.find({ status: 'approved' })
        .sort({ createdAt: -1 })
        .lean();

      let rows = [];

      for (const fo of approvedRegistrations) {
        let user = await User.findOne({ futsalOwnerRef: fo._id }).select(
          'name email phone applicationStatus role status'
        );
        if (!user) {
          user = await User.findOne({
            email: fo.email.toLowerCase().trim(),
            role: 'futsalowner',
          }).select('name email phone applicationStatus role status');
        }

        if (user && user.applicationStatus !== 'approved') {
          user.applicationStatus = 'approved';
          user.status = 'active';
          await user.save();
        }

        if (user) {
          let venue = await Venue.findOne({ owner: user._id }).sort({ createdAt: -1 });
          if (venue) {
            if (!venue.isVerified) {
              venue.isVerified = true;
              await venue.save();
            }
            const populated = await Venue.findById(venue._id)
              .populate('owner', 'name email phone applicationStatus')
              .select('-__v')
              .lean();
            populated.isRegistrationOnly = false;
            rows.push(populated);
            continue;
          }
        }

        rows.push(venueCardFromRegistration(fo, user));
      }

      if (city) {
        const cityRegex = new RegExp(city, 'i');
        rows = rows.filter(
          (r) =>
            cityRegex.test(r.fullAddress || '') ||
            cityRegex.test(r.address?.city || '')
        );
      }

      if (search) {
        const searchRegex = new RegExp(search, 'i');
        rows = rows.filter(
          (r) =>
            searchRegex.test(r.venueName || '') ||
            searchRegex.test(r.fullAddress || '') ||
            searchRegex.test(r.owner?.name || '') ||
            searchRegex.test(r.owner?.email || '')
        );
      }

      const total = rows.length;
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 20);
      const start = (pageNum - 1) * limitNum;
      const paged = rows.slice(start, start + limitNum);

      return res.status(200).json({
        success: true,
        data: paged,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum) || 0,
        },
      });
    }

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { venueName: searchRegex },
        { fullAddress: searchRegex },
        { 'address.city': searchRegex }
      ];
    }

    let venues = await Venue.find(query)
      .populate('owner', 'name email phone applicationStatus')
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    if (onePerOwner === 'true') {
      const seenOwners = new Set();
      venues = venues.filter((v) => {
        const ownerId = (v.owner?._id || v.owner)?.toString();
        if (!ownerId || seenOwners.has(ownerId)) return false;
        seenOwners.add(ownerId);
        return true;
      });
    }

    const total = venues.length;

    res.status(200).json({
      success: true,
      data: venues,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit) || 0
      }
    });
  } catch (error) {
    console.error('Get admin venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch venues for admin',
      error: error.message
    });
  }
};

// Flag or unflag a venue for review
exports.flagVenueByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;

    const venue = await Venue.findById(id);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    const currentlyFlagged = venue.adminReview?.isFlagged;

    venue.adminReview = {
      isFlagged: !currentlyFlagged,
      reason: reason || venue.adminReview?.reason || 'Flagged by admin',
      flaggedAt: !currentlyFlagged ? new Date() : venue.adminReview?.flaggedAt,
      flaggedBy: req.userId
    };

    await venue.save();

    res.status(200).json({
      success: true,
      message: currentlyFlagged ? 'Venue unflagged successfully' : 'Venue flagged for review',
      data: venue
    });
  } catch (error) {
    console.error('Flag venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update venue flag status',
      error: error.message
    });
  }
};

// Update venue active / verified status
exports.updateVenueStatusByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, isVerified } = req.body;

    const venue = await Venue.findById(id);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    if (typeof isActive === 'boolean') {
      venue.isActive = isActive;
    }
    if (typeof isVerified === 'boolean') {
      venue.isVerified = isVerified;
    }

    await venue.save();

    res.status(200).json({
      success: true,
      message: 'Venue status updated successfully',
      data: venue
    });
  } catch (error) {
    console.error('Update venue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update venue status',
      error: error.message
    });
  }
};

// Delete a venue (and its media references)
exports.deleteVenueByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const venue = await Venue.findById(id);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    await Venue.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Venue deleted successfully'
    });
  } catch (error) {
    console.error('Delete venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete venue',
      error: error.message
    });
  }
};