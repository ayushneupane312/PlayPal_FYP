const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  createTournament,
  listTournaments,
  listMyTournaments,
  getTournamentById,
  registerTeam,
  generateFixtures,
  getFixtures,
  getRegisteredTeams,
  deleteTournament
} = require('../controllers/TournamentController');

router.use(verifyToken);

// Tournament APIs (specific routes before /:id)
router.get('/my', listMyTournaments);
router.get('/', listTournaments);
router.get('/:id/registered-teams', getRegisteredTeams);
router.get('/:id', getTournamentById);
router.post('/', createTournament);
router.post('/:id/register', registerTeam);
router.post('/:id/fixtures/generate', generateFixtures);
router.get('/:id/fixtures', getFixtures);
router.delete('/:id', deleteTournament);

module.exports = router;

