const express = require('express');
const formrouter = express.Router();
const FutsalOwnerFormController = require('../controllers/FutsalOwnerFormController.js');
const upload = require('../middlewares/UploadMiddleware.js');
//const verifyToken = require("../middlewares/verifyToken.js");


const uploadFields = upload.fields([
  { name: 'businessDoc', maxCount: 1  },
  { name: 'citizenshipDoc', maxCount: 1 },
  { name: 'groundImages', maxCount: 10 }
]);

// Public route
formrouter.post('/register', uploadFields, FutsalOwnerFormController.registerFutsalOwner);

formrouter.get('/', FutsalOwnerFormController.getAllFutsalOwners);
formrouter.get('/:id', FutsalOwnerFormController.getFutsalOwnerById);

// Protected admin routes
formrouter.patch('/:id/status', FutsalOwnerFormController.updateFutsalOwnerStatus);
formrouter.delete('/:id',FutsalOwnerFormController.deleteFutsalOwner);

module.exports = formrouter;