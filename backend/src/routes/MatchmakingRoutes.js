const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  joinQueue,
  leaveQueue,
  getQueueStatus,
  getBrowsePlayers,
  findTeamOpponent,
  getTeamMatchStatus,
  cancelTeamMatchmaking
} = require('../controllers/MatchmakingController');

router.use(verifyToken);

// Solo queue (player-based)
router.post('/join-queue', joinQueue);
router.delete('/leave-queue', leaveQueue);
router.get('/status', getQueueStatus);
router.get('/players', getBrowsePlayers);

// Team vs Team matchmaking
router.post('/find-opponent', findTeamOpponent);
router.get('/status/:teamId', getTeamMatchStatus);
router.delete('/cancel', cancelTeamMatchmaking);

module.exports = router;
