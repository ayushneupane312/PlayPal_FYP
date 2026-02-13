const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  createTeam,
  getMyTeams,
  getTeamById,
  inviteToTeam,
  requestJoin,
  approveRequest,
  makePublic,
  confirmBooking,
  getPublicTeams,
  leaveTeam
} = require('../controllers/TeamController');

router.use(verifyToken);

router.post('/create', createTeam);
router.get('/my-teams', getMyTeams);
router.get('/public', getPublicTeams);
router.get('/:id', getTeamById);
router.post('/invite', inviteToTeam);
router.post('/request-join', requestJoin);
router.post('/approve-request', approveRequest);
router.post('/make-public', makePublic);
router.post('/confirm-booking', confirmBooking);
router.post('/leave', leaveTeam);

module.exports = router;
