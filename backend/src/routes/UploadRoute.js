const express = require('express');
const { upload, uploadToCloudinary } = require('../middlewares/UploadMiddleware');

const uploadrouter = express.Router();

// POST /upload/file
// multipart/form-data  →  field name "file"
// Works for images, videos, and PDFs.
// After uploadToCloudinary runs, req.file = { url, public_id, resource_type }
uploadrouter.post('/file', upload.single('file'), uploadToCloudinary, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    res.status(200).json({
      success:       true,
      url:           req.file.url,
      public_id:     req.file.public_id,
      resource_type: req.file.resource_type,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = uploadrouter;