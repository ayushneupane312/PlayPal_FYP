const express = require('express');
const formrouter = express.Router();
const FutsalOwnerFormController = require('../controllers/FutsalOwnerFormController.js');
const upload = require('../middlewares/UploadMiddleware.js');
const verifyToken = require("../middlewares/verifyToken.js"); // ✅ Uncomment this
const verifyAdmin = require("../middlewares/verifyAdmin.js"); // ✅ Add this

const uploadFields = upload.fields([
  { name: 'businessDoc', maxCount: 1 },
  { name: 'citizenshipDoc', maxCount: 1 },
  { name: 'groundImages', maxCount: 10 }
]);

// ✅ Protected route - requires authentication
formrouter.post('/register', verifyToken, uploadFields, FutsalOwnerFormController.registerFutsalOwner);

// ✅ Get user's own application status
formrouter.get('/my-application', verifyToken, FutsalOwnerFormController.getMyApplication);

// ✅ Admin routes - require admin authentication
formrouter.get('/', verifyToken, verifyAdmin, FutsalOwnerFormController.getAllFutsalOwners);
formrouter.get('/:id', verifyToken, verifyAdmin, FutsalOwnerFormController.getFutsalOwnerById);
formrouter.patch('/:id/status', verifyToken, verifyAdmin, FutsalOwnerFormController.updateFutsalOwnerStatus);
formrouter.delete('/:id', verifyToken, verifyAdmin, FutsalOwnerFormController.deleteFutsalOwner);

module.exports = formrouter;