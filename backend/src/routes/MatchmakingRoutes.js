const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  joinQueue,
  leaveQueue,
  getQueueStatus,
  getBrowsePlayers
} = require('../controllers/MatchmakingController');

router.use(verifyToken);

router.post('/join-queue', joinQueue);
router.delete('/leave-queue', leaveQueue);
router.get('/status', getQueueStatus);
router.get('/players', getBrowsePlayers);

module.exports = router;
