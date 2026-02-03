const express = require('express');
const formrouter = express.Router();
const FutsalOwnerFormController = require('../controllers/FutsalOwnerFormController.js');
const { upload, uploadToCloudinary } = require('../middlewares/UploadMiddleware.js');
const verifyToken  = require('../middlewares/verifyToken.js');
const verifyAdmin  = require('../middlewares/verifyAdmin.js');

// ─── multer field config (unchanged) ─────────────────────
const uploadFields = upload.fields([
  { name: 'businessDoc',    maxCount: 1  },
  { name: 'citizenshipDoc', maxCount: 1  },
  { name: 'groundImages',   maxCount: 10 },
]);

// ─── POST /futsal-owners/register ─────────────────────────
// Chain order matters:
//   1. verifyToken        → confirm JWT
//   2. uploadFields       → multer validates + buffers files in memory
//   3. uploadToCloudinary → streams every buffer to Cloudinary,
//                            replaces req.files with { url, public_id, … }
//   4. controller         → reads req.files, saves to DB
formrouter.post(
  '/register',
  verifyToken,
  uploadFields,
  uploadToCloudinary,                                          // ← only new piece
  FutsalOwnerFormController.registerFutsalOwner
);

// ─── GET  /futsal-owners/my-application ───────────────────
formrouter.get('/my-application', verifyToken, FutsalOwnerFormController.getMyApplication);

// ─── Admin routes ─────────────────────────────────────────
formrouter.get('/',         verifyToken, verifyAdmin, FutsalOwnerFormController.getAllFutsalOwners);
formrouter.get('/:id',      verifyToken, verifyAdmin, FutsalOwnerFormController.getFutsalOwnerById);
formrouter.patch('/:id/status', verifyToken, verifyAdmin, FutsalOwnerFormController.updateFutsalOwnerStatus);
formrouter.delete('/:id',   verifyToken, verifyAdmin, FutsalOwnerFormController.deleteFutsalOwner);

module.exports = formrouter;