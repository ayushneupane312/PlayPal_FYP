const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { upsertEndorsement, getMyEndorsement, getRatingSummary } = require('../controllers/EndorsementController');

router.post('/upsert', verifyToken, upsertEndorsement);
router.get('/me/:playerId', verifyToken, getMyEndorsement);
router.get('/summary/:playerId', getRatingSummary); // public — no auth needed

module.exports = router;
