const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');
const {
  getAllVenuesAdmin,
  flagVenueByAdmin,
  updateVenueStatusByAdmin,
  deleteVenueByAdmin
} = require('../controllers/VenueControlller');

// All routes in this router are protected and admin-only
router.use(verifyToken, verifyAdmin);

// GET /admin/venues
router.get('/', getAllVenuesAdmin);

// PATCH /admin/venues/:id/flag
router.patch('/:id/flag', flagVenueByAdmin);

// PATCH /admin/venues/:id/status
router.patch('/:id/status', updateVenueStatusByAdmin);

// DELETE /admin/venues/:id
router.delete('/:id', deleteVenueByAdmin);

module.exports = router;

