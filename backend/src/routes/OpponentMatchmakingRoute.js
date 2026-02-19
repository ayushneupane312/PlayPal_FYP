const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  browseOpponentTeams,
  sendChallenge,
  respondToChallenge,
  getMyChallenges,
  getMatchById,
  cancelChallenge
} = require('../controllers/OpponentMatchmakingController');

router.use(verifyToken);

router.get('/browse',            browseOpponentTeams);
router.post('/challenge',        sendChallenge);
router.post('/respond-challenge', respondToChallenge);
router.get('/my-challenges',     getMyChallenges);
router.get('/match/:matchId',    getMatchById);
router.post('/cancel-challenge', cancelChallenge);

module.exports = router;