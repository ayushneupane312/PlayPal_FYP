const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  createTeam,
  getMyTeams,
  getTeamById,
  inviteToTeam,
  respondToInvite,
  getMyInvitations,
  requestJoin,
  approveRequest,
  makePublic,
  confirmBooking,
  getPublicTeams,
  leaveTeam,
  deleteTeam
} = require('../controllers/TeamController');

router.use(verifyToken);

// Team CRUD
router.post('/create', createTeam);
router.get('/my-teams', getMyTeams);
router.get('/public', getPublicTeams);
router.get('/:id', getTeamById);

// Invitations
router.post('/invite', inviteToTeam);
router.post('/respond-invite', respondToInvite);
router.get('/my-invitations', getMyInvitations);

// Join requests (player-initiated)
router.post('/request-join', requestJoin);
router.post('/approve-request', approveRequest);

// Team management
router.post('/make-public', makePublic);
router.post('/confirm-booking', confirmBooking);
router.post('/leave', leaveTeam);

router.delete('/:id', deleteTeam)

module.exports = router;