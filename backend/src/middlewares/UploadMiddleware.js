const multer  = require('multer');
const cloudinary = require('../config/cloudinary');

// ──────────────────────────────────────────────────────────
// FOLDER MAP — fieldname  →  Cloudinary folder
// ──────────────────────────────────────────────────────────
const FOLDERS = {
  businessDoc:    'futsal/business-docs',
  citizenshipDoc: 'futsal/citizenship-docs',
  groundImages:   'futsal/ground-images',
  file:           'uploads',            // generic single-file route
};

// ──────────────────────────────────────────────────────────
// ALLOWED MIMETYPES — per fieldname
// ──────────────────────────────────────────────────────────
const ALLOWED = {
  businessDoc:    ['application/pdf', 'image/jpeg', 'image/png'],
  citizenshipDoc: ['application/pdf', 'image/jpeg', 'image/png'],
  groundImages:   ['image/jpeg', 'image/png', 'image/webp'],
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

// ─── multer instance — memory only, nothing touches disk ─
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },   // 10 MB
});

// ──────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────

// Cloudinary needs "raw" for PDFs, "video" for videos, "image" for images
const resourceType = (mimetype) => {
  if (mimetype === 'application/pdf')  return 'raw';
  if (mimetype.startsWith('video/'))   return 'video';
  return 'image';
};

// Stream one buffer → Cloudinary, returns the full result object
const streamOne = (buffer, originalname, mimetype, folder) =>
  new Promise((resolve, reject) => {
    const type = resourceType(mimetype);
    const ext  = originalname.split('.').pop().toLowerCase();

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: type,
        folder,
        format: ext,
        // auto-optimise images only
        ...(type === 'image' && {
          transformation: { quality: 'auto', fetch_format: 'auto' },
        }),
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );

    stream.end(buffer);
  });

// Normalise a single Cloudinary result down to what the controller needs
const pick = (result) => ({
  url:           result.secure_url,
  public_id:     result.public_id,
  resource_type: result.resource_type,
});

// ──────────────────────────────────────────────────────────
// uploadToCloudinary  — Express middleware
//
// Plug this AFTER upload.single / upload.fields / upload.array.
// It reads the buffers multer put on req, streams every file to
// Cloudinary, then REPLACES req.file / req.files with the results.
//
// Your controller reads exactly the same keys, just .url instead of .path
// ──────────────────────────────────────────────────────────
const uploadToCloudinary = async (req, res, next) => {
  try {
    // ── upload.single("field")  →  req.file  (one object) ──
    if (req.file) {
      const folder = FOLDERS[req.file.fieldname] || 'uploads';
      const result = await streamOne(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        folder
      );
      req.file = pick(result);   // overwrite
    }

    // ── upload.fields([…])  →  req.files  (object of arrays) ──
    if (req.files && !Array.isArray(req.files)) {
      const out = {};

      for (const [fieldname, files] of Object.entries(req.files)) {
        const folder = FOLDERS[fieldname] || 'uploads';

        out[fieldname] = await Promise.all(
          files.map((f) => streamOne(f.buffer, f.originalname, f.mimetype, folder).then(pick))
        );
      }

      req.files = out;   // overwrite
    }

    // ── upload.array("field")  →  req.files  (plain array) ──
    if (req.files && Array.isArray(req.files)) {
      const folder = FOLDERS[req.files[0]?.fieldname] || 'uploads';

      req.files = await Promise.all(
        req.files.map((f) => streamOne(f.buffer, f.originalname, f.mimetype, folder).then(pick))
      );
    }

    next();
  } catch (err) {
    next(err);   // hits your global error handler
  }
};

// ──────────────────────────────────────────────────────────
// deleteFromCloudinary(public_id, resource_type)
//   resource_type  →  "image" | "video" | "raw"
// ──────────────────────────────────────────────────────────
const deleteFromCloudinary = (publicId, resType = 'image') =>
  cloudinary.uploader.destroy(publicId, { resource_type: resType });

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };