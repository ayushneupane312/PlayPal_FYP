const express = require('express');
const venuerouter = express.Router();
const verifyToken = require('../middlewares/verifyToken.js');
const { upload, uploadToCloudinary } = require('../middlewares/UploadMiddleware.js');
const { getMyVenue, getAllVenues, createOrUpdateVenue, uploadMedia, deleteMedia, getVenueById, getMyFutsalOwnerData}
 = require ('../controllers/VenueControlller.js')


// ─── Owner Routes (Protected) ───────────────────────────
venuerouter.get('/my-venue', verifyToken, getMyVenue);
venuerouter.get('/my-futsal-owner-data', verifyToken, getMyFutsalOwnerData);
venuerouter.post('/my-venue', verifyToken, createOrUpdateVenue);

venuerouter.post(
  '/my-venue/upload-media',
  verifyToken,
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 5 }
  ]),
  uploadToCloudinary,
  uploadMedia
);

venuerouter.delete('/my-venue/delete-media', verifyToken, deleteMedia);
// Add this line before other routes

// ─── Public Routes ──────────────────────────────────────
venuerouter.get('/', getAllVenues);
venuerouter.get('/:id', getVenueById);

module.exports = venuerouter;