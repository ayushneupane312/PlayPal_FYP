import axios from 'axios';

// API Configuration - matches backend /api/venue
const API_BASE = import.meta.env.MODE === 'development'
  ? 'http://localhost:5000'
  : '';

const API_URL = `${API_BASE}/api/venue`;

// IMPORTANT: Allow cookies (JWT stored in httpOnly cookie)
axios.defaults.withCredentials = true;

// ══════════════════════════════════════════════════════════
// OWNER-SPECIFIC METHODS
// ══════════════════════════════════════════════════════════

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

export const createOrUpdateVenue = async (venueData) => {
  return updateVenueInfo(venueData);
};

// ══════════════════════════════════════════════════════════
// MEDIA MANAGEMENT (IMAGES + VIDEOS)
// ══════════════════════════════════════════════════════════

export const uploadMedia = async ({ images = [], videos = [], category = 'general' }) => {
  try {
    const formData = new FormData();

    if (images.length > 0) {
      images.forEach((file) => {
        formData.append('images', file);
      });
    }

    if (videos.length > 0) {
      videos.forEach((file) => {
        formData.append('videos', file);
      });
    }

    formData.append('category', category);

    const { data } = await axios.post(
      `${API_URL}/my-venue/upload-media`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
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

export const uploadImages = async (files, category = 'general') => {
  return uploadMedia({ images: files, category });
};

export const uploadVideos = async (files) => {
  return uploadMedia({ videos: files });
};

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

export const deleteImage = async (publicId) => {
  return deleteMedia(publicId);
};

export const deleteVideo = async (publicId) => {
  return deleteMedia(publicId);
};

// ══════════════════════════════════════════════════════════
// PUBLIC VENUE METHODS - FIXED TO USE /api/venue
// ══════════════════════════════════════════════════════════

/**
 * Get all active venues with optional filters
 * @route GET /api/venue
 */
export const getAllVenues = async (params = {}) => {
  try {
    console.log('📡 Calling:', `${API_URL}`);
    console.log('📦 Params:', params);
    
    const { data } = await axios.get(API_URL, { 
      params,
      withCredentials: true 
    });
    
    console.log('✅ Response:', data);
    return data;
  } catch (error) {
    console.error('❌ Get venues error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get a single venue by ID
 * @route GET /api/venue/:id
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
 */
export const findNearbyVenues = async (longitude, latitude, maxDistance = 10000) => {
  try {
    const { data } = await axios.get(API_URL, {
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
 */
export const searchVenues = async (searchTerm, additionalParams = {}) => {
  try {
    const { data } = await axios.get(API_URL, {
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
// ADMIN-SPECIFIC METHODS
// ══════════════════════════════════════════════════════════

/**
 * Flag a venue for review (admin only)
 */
export const flagVenue = async (venueId, reason = '') => {
  try {
    const { data } = await axios.patch(
      `${API_BASE}/admin/venues/${venueId}/flag`,
      { reason },
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    console.error('Flag venue error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update venue status (admin only)
 */
export const updateVenueStatus = async (venueId, statusData) => {
  try {
    const { data } = await axios.patch(
      `${API_BASE}/admin/venues/${venueId}/status`,
      statusData,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    console.error('Update venue status error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete a venue (admin only)
 */
export const deleteVenue = async (venueId) => {
  try {
    const { data } = await axios.delete(
      `${API_BASE}/admin/venues/${venueId}`,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    console.error('Delete venue error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all venues for admin (includes inactive/unverified)
 */
export const getAllVenuesAdmin = async (params = {}) => {
  try {
    const { data } = await axios.get(`${API_BASE}/admin/venues`, { 
      params,
      withCredentials: true 
    });
    return data;
  } catch (error) {
    console.error('Get admin venues error:', error.response?.data || error.message);
    throw error;
  }
};

// ══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════

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
  // Owner Methods
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
  
  // Admin Methods
  flagVenue,
  updateVenueStatus,
  deleteVenue,
  getAllVenuesAdmin,
  
  // Helpers
  validateImageFile,
  validateVideoFile,
  validateFiles
};

export default venueService;