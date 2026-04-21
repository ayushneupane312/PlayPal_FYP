const { getPlatformEarningsSummary } = require('../services/earningsSplitService');

/**
 * GET /api/admin/earnings-summary — platform (super admin) share from ledger.
 */
exports.getAdminEarningsSummary = async (req, res) => {
  try {
    const data = await getPlatformEarningsSummary();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Admin earnings summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load earnings summary',
      error: error.message,
    });
  }
};
