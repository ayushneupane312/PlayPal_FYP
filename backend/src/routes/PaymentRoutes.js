const express = require('express');
const router = express.Router();

const { initiatePayment, verifyPayment } = require('../controllers/PaymentController');

router.post('/initiate', initiatePayment);
router.post('/verify', verifyPayment);

module.exports = router;

