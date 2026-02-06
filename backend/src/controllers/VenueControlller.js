const Venue = require('../models/VenueModel');
const { deleteFromCloudinary } = require('../middlewares/UploadMiddleware');
const User = require('../models/UserModel');
const FutsalOwner = require('../models/futsalOwnerForm');



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
        owner: userId
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

// ✅ Get all active venues (Public - for players)
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