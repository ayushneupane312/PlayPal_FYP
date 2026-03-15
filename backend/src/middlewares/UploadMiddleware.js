



const multer  = require('multer');
const cloudinary = require('../config/cloudinary');

// ──────────────────────────────────────────────────────────
// FOLDER MAP
// ──────────────────────────────────────────────────────────
const FOLDERS = {
  businessDoc:    'futsal/business-docs',
  citizenshipDoc: 'futsal/citizenship-docs',
  groundImages:   'futsal/ground-images',
  images:         'venue/images',          // venue images
  videos:         'venue/videos',          // venue videos
  file:           'uploads',
};

// ──────────────────────────────────────────────────────────
// ALLOWED MIMETYPES
// ──────────────────────────────────────────────────────────
const ALLOWED = {
  businessDoc:    ['application/pdf', 'image/jpeg', 'image/png'],
  citizenshipDoc: ['application/pdf', 'image/jpeg', 'image/png'],
  groundImages:   ['image/jpeg', 'image/png', 'image/webp'],
  images:         ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  videos:         ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  file:           ['image/jpeg', 'image/png', 'image/gif', 'image/webp',
                   'video/mp4', 'video/webm', 'video/quicktime',
                   'application/pdf'],
};

// ─── fileFilter ───────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = ALLOWED[file.fieldname];

  if (!allowed) {
    return cb(new Error(`Unknown field "${file.fieldname}".`), false);
  }

  if (!allowed.includes(file.mimetype)) {
    return cb(
      new Error(`"${file.originalname}" — invalid type. Allowed: ${allowed.join(', ')}`),
      false
    );
  }

  cb(null, true);
};

// ─── multer instance ──────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },   // 50 MB for videos
});

// ──────────────────────────────────────────────────────────
// resource_type logic
//   video/*        →  "video"
//   everything else (images AND PDFs)  →  "image"
// ──────────────────────────────────────────────────────────
const resourceType = (mimetype) => {
  if (mimetype.startsWith('video/')) return 'video';
  return 'image';
};

// Stream one buffer → Cloudinary
const streamOne = (buffer, originalname, mimetype, folder) =>
  new Promise((resolve, reject) => {
    const type = resourceType(mimetype);
    const ext  = originalname.split('.').pop().toLowerCase();

    const uploadOptions = {
      resource_type: type,
      folder,
      format: ext,
    };

    // Only add transformation for non-PDF images
    if (type === 'image' && mimetype !== 'application/pdf') {
      uploadOptions.transformation = { quality: 'auto', fetch_format: 'auto' };
    }

    // For videos, add eager transformations for thumbnail
    if (type === 'video') {
      uploadOptions.eager = [
        { width: 400, height: 300, crop: 'pad', format: 'jpg' }
      ];
      uploadOptions.eager_async = true;
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (err, result) => (err ? reject(err) : resolve(result))
    );

    stream.end(buffer);
  });

const pick = (result) => ({
  url:           result.secure_url,
  public_id:     result.public_id,
  resource_type: result.resource_type,
  duration:      result.duration || null,  // for videos
});

// ──────────────────────────────────────────────────────────
// uploadToCloudinary middleware
// ──────────────────────────────────────────────────────────
const uploadToCloudinary = async (req, res, next) => {
  try {
    // Single file
    if (req.file) {
      const folder = FOLDERS[req.file.fieldname] || 'uploads';
      const result = await streamOne(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        folder
      );
      req.file = pick(result);
    }

    // Multiple fields
    if (req.files && !Array.isArray(req.files)) {
      const out = {};

      for (const [fieldname, files] of Object.entries(req.files)) {
        const folder = FOLDERS[fieldname] || 'uploads';

        out[fieldname] = await Promise.all(
          files.map((f) => streamOne(f.buffer, f.originalname, f.mimetype, folder).then(pick))
        );
      }

      req.files = out;
    }

    // Array of files
    if (req.files && Array.isArray(req.files)) {
      const folder = FOLDERS[req.files[0]?.fieldname] || 'uploads';

      req.files = await Promise.all(
        req.files.map((f) => streamOne(f.buffer, f.originalname, f.mimetype, folder).then(pick))
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// deleteFromCloudinary
// ──────────────────────────────────────────────────────────
const deleteFromCloudinary = (publicId, resType = 'image') =>
  cloudinary.uploader.destroy(publicId, { resource_type: resType });

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };