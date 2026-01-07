const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/futsal';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'uploads/futsal/';
    
    // Organize files by type
    if (file.fieldname === 'businessDoc') {
      folder += 'business-docs/';
    } else if (file.fieldname === 'citizenshipDoc') {
      folder += 'citizenship-docs/';
    } else if (file.fieldname === 'groundImages') {
      folder += 'ground-images/';
    }
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageTypes = /jpeg|jpg|png/;
  const allowedDocTypes = /pdf/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;
  
  if (file.fieldname === 'groundImages') {
    // Only images for ground images
    if (allowedImageTypes.test(extname) && mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed for ground images!'));
    }
  } else {
    // PDF or images for documents
    if ((allowedDocTypes.test(extname) && mimetype === 'application/pdf') ||
        (allowedImageTypes.test(extname) && mimetype.startsWith('image/'))) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or image files are allowed for documents!'));
    }
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

module.exports = upload;