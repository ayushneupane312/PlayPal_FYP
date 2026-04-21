const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');
const { getAdminEarningsSummary } = require('../controllers/AdminFinancialController');

router.use(verifyToken, verifyAdmin);
router.get('/earnings-summary', getAdminEarningsSummary);

module.exports = router;
