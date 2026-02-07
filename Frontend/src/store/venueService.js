import axios from 'axios';

const API_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/venue'
    : '/venue';

// IMPORTANT: Allow cookies (JWT stored in httpOnly cookie)
axios.defaults.withCredentials = true;

export const getFutsalOwnerData = async () => {
  try {
    console.log('🌐 Calling API: /api/venue/my-futsal-owner-data');
    const { data } = await axios.get(`${API_URL}/my-futsal-owner-data`, {
      withCredentials: true
    });
    console.log('✅ API response received:', data);
    return data;
  } catch (error) {
    console.error('❌ API call failed:', error.response?.data || error.message);
    throw error;
  }
};

export const getVenueInfo = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/my-venue`);
    return data;
  } catch (error) {
    console.error('Get venue error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateVenueInfo = async (venueData) => {
  try {
    const { data } = await axios.post(`${API_URL}/my-venue`, venueData);
    return data;
  } catch (error) {
    console.error('Update venue error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create or update venue (alias for consistency)
 * @param {Object} venueData - Complete venue information
 * @returns {Promise} Updated venue data
 */
export const createOrUpdateVenue = async (venueData) => {
  return updateVenueInfo(venueData);
};

// ══════════════════════════════════════════════════════════
// MEDIA MANAGEMENT (IMAGES + VIDEOS)
// ══════════════════════════════════════════════════════════

/**
 * Upload images and/or videos to venue gallery
 * @param {Object} params - Upload parameters
 * @param {File[]} params.images - Array of image files (optional)
 * @param {File[]} params.videos - Array of video files (optional)
 * @param {string} params.category - Media category (optional, default: 'general')
 * @returns {Promise} Updated media data
 */
export const uploadMedia = async ({ images = [], videos = [], category = 'general' }) => {
  try {
    const formData = new FormData();

    // Append images
    if (images.length > 0) {
      images.forEach((file) => {
        formData.append('images', file);
      });
    }

    // Append videos
    if (videos.length > 0) {
      videos.forEach((file) => {
        formData.append('videos', file);
      });
    }

    // Append category
    formData.append('category', category);

    const { data } = await axios.post(
      `${API_URL}/my-venue/upload-media`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        // Optional: Track upload progress
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      }
    );

    return data;
  } catch (error) {
    console.error('Upload media error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Upload only images (convenience wrapper)
 * @param {File[]} files - Array of image files
 * @param {string} category - Image category (optional)
 * @returns {Promise} Updated media data
 */
export const uploadImages = async (files, category = 'general') => {
  return uploadMedia({ images: files, category });
};

/**
 * Upload only videos (convenience wrapper)
 * @param {File[]} files - Array of video files
 * @returns {Promise} Updated media data
 */
export const uploadVideos = async (files) => {
  return uploadMedia({ videos: files });
};

/**
 * Delete image or video from venue gallery
 * @param {string} publicId - Cloudinary public_id of the media
 * @returns {Promise} Updated media data
 */
export const deleteMedia = async (publicId) => {
  try {
    const { data } = await axios.delete(`${API_URL}/my-venue/delete-media`, {
      data: { publicId }
    });
    return data;
  } catch (error) {
    console.error('Delete media error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete image (convenience wrapper)
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise} Updated media data
 */
export const deleteImage = async (publicId) => {
  return deleteMedia(publicId);
};

/**
 * Delete video (convenience wrapper)
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise} Updated media data
 */
export const deleteVideo = async (publicId) => {
  return deleteMedia(publicId);
};


/**
 * Get all active venues with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.city - Filter by city
 * @param {string} params.facilities - Comma-separated facilities
 * @param {number} params.minPrice - Minimum price filter
 * @param {number} params.maxPrice - Maximum price filter
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @returns {Promise} List of venues with pagination
 */
export const getAllVenues = async (params = {}) => {
  try {
    const { data } = await axios.get(`${API_URL}`, { params });
    return data;
  } catch (error) {
    console.error('Get venues error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get a single venue by ID
 * @param {string} id - Venue ID
 * @returns {Promise} Venue details
 */
export const getVenueById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/${id}`);
    return data;
  } catch (error) {
    console.error('Get venue by ID error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Search venues by location
 * @param {number} longitude - Longitude coordinate
 * @param {number} latitude - Latitude coordinate
 * @param {number} maxDistance - Maximum distance in meters (default: 10000)
 * @returns {Promise} Nearby venues
 */
export const findNearbyVenues = async (longitude, latitude, maxDistance = 10000) => {
  try {
    const { data } = await axios.get(`${API_URL}`, {
      params: {
        longitude,
        latitude,
        maxDistance
      }
    });
    return data;
  } catch (error) {
    console.error('Find nearby venues error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Search venues by name or description
 * @param {string} searchTerm - Search query
 * @param {Object} additionalParams - Additional filters
 * @returns {Promise} Matching venues
 */
export const searchVenues = async (searchTerm, additionalParams = {}) => {
  try {
    const { data } = await axios.get(`${API_URL}`, {
      params: {
        search: searchTerm,
        ...additionalParams
      }
    });
    return data;
  } catch (error) {
    console.error('Search venues error:', error.response?.data || error.message);
    throw error;
  }
};

// ══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════

/**
 * Validate image file before upload
 * @param {File} file - Image file
 * @returns {Object} Validation result
 */
export const validateImageFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Image ${file.name} exceeds 10MB limit`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Image ${file.name} has invalid format. Allowed: JPG, PNG, WEBP, GIF`
    };
  }

  return { valid: true };
};

/**
 * Validate video file before upload
 * @param {File} file - Video file
 * @returns {Object} Validation result
 */
export const validateVideoFile = (file) => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Video ${file.name} exceeds 50MB limit`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Video ${file.name} has invalid format. Allowed: MP4, WEBM, MOV`
    };
  }

  return { valid: true };
};

/**
 * Validate multiple files before upload
 * @param {File[]} files - Array of files
 * @param {string} type - 'image' or 'video'
 * @returns {Object} Validation result with valid and invalid files
 */
export const validateFiles = (files, type = 'image') => {
  const validator = type === 'image' ? validateImageFile : validateVideoFile;
  const results = {
    valid: [],
    invalid: []
  };

  files.forEach((file) => {
    const result = validator(file);
    if (result.valid) {
      results.valid.push(file);
    } else {
      results.invalid.push({ file, error: result.error });
    }
  });

  return results;
};

// ══════════════════════════════════════════════════════════
// DEFAULT EXPORT - ALL METHODS
// ══════════════════════════════════════════════════════════

const venueService = {
  // Venue Info
  getFutsalOwnerData,
  getVenueInfo,
  updateVenueInfo,
  createOrUpdateVenue,
  
  // Media Management
  uploadMedia,
  uploadImages,
  uploadVideos,
  deleteMedia,
  deleteImage,
  deleteVideo,
  
  // Public Routes
  getAllVenues,
  getVenueById,
  findNearbyVenues,
  searchVenues,
  
  // Helpers
  validateImageFile,
  validateVideoFile,
  validateFiles
};

export default venueService;