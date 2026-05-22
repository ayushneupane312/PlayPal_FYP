const Tournament = require('../models/TournamentModel');
const TournamentTeam = require('../models/TournamentTeamModel');
const TournamentMatch = require('../models/TournamentMatchModel');
const PlayerTournamentStats = require('../models/PlayerTournamentStatsModel');
const Venue = require('../models/VenueModel');
const Team = require('../models/TeamModel');
const { notifyUser, notifyRole } = require('../services/notificationService');

async function closeExpiredRegistrationWindows(extraFilter = {}) {
  const now = new Date();
  await Tournament.updateMany(
    {
      ...extraFilter,
      status: 'registration_open',
      registrationDeadline: { $lt: now }
    },
    { $set: { status: 'registration_closed' } }
  );
}

async function assertOwner(req, venueId) {
  const userId = req.userId;
  const venue = await Venue.findById(venueId).select('owner venueName fullAddress');
  if (!venue) {
    const err = new Error('Venue not found');
    err.statusCode = 404;
    throw err;
  }
  if (!venue.owner || venue.owner.toString() !== userId.toString()) {
    const err = new Error('Only the venue owner can manage tournaments');
    err.statusCode = 403;
    throw err;
  }
  return venue;
}


exports.createTournament = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      venueId,
      name,
      description,
      bannerImage,
      startDate,
      endDate,
      registrationDeadline,
      maxTeams,
      minPlayersPerTeam,
      entryFeePerTeam,
      paymentMethods,
      format,
      prizes = []
    } = req.body;

    if (
      !venueId ||
      !name ||
      !startDate ||
      !endDate ||
      !registrationDeadline ||
      maxTeams == null ||
      entryFeePerTeam == null
    ) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const venue = await assertOwner(req, venueId);

    const totalPrizePool = prizes
      .filter((p) => p.enabled !== false && typeof p.amount === 'number')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const tournament = await Tournament.create({
      owner: userId,
      venue: venueId,
      name,
      description,
      bannerImage,
      location: venue.fullAddress || '',
      startDate,
      endDate,
      registrationDeadline,
      maxTeams,
      minPlayersPerTeam: minPlayersPerTeam || 5,
      entryFeePerTeam,
      paymentMethods: paymentMethods && paymentMethods.length ? paymentMethods : ['cash'],
      format: format || 'knockout',
      prizes,
      totalPrizePool
    });

    await notifyRole('player', {
      title: 'New Futsal Tournament Announced!',
      message: `${tournament.name} at ${venue.venueName} starts on ${new Date(
        startDate
      ).toLocaleDateString()}.`,
      type: 'tournament_created',
      link: `/tournaments/${tournament._id}`,
      meta: { tournamentId: tournament._id, venueId }
    });

    return res.status(201).json({ success: true, data: tournament });
  } catch (err) {
    console.error('Create tournament error:', err);
    const status = err.statusCode || 500;
    return res
      .status(status)
      .json({ success: false, message: err.message || 'Failed to create tournament' });
  }
};

exports.listTournaments = async (req, res) => {
  try {
    await closeExpiredRegistrationWindows();

    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const tournaments = await Tournament.find(query)
      .populate('venue', 'venueName fullAddress')
      .sort({ startDate: 1 })
      .lean();
    const ids = tournaments.map((t) => t._id);
    const counts = await TournamentTeam.aggregate([
      { $match: { tournament: { $in: ids } } },
      { $group: { _id: '$tournament', count: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
    const userId = req.userId?.toString();
    let userRegisteredIds = new Set();
    if (userId) {
      const myRegs = await TournamentTeam.find({ leader: userId }).select('tournament').lean();
      myRegs.forEach((r) => userRegisteredIds.add(r.tournament.toString()));
    }
    tournaments.forEach((t) => {
      t.stats = t.stats || {};
      t.stats.registeredTeams = countMap[t._id.toString()] ?? 0;
      t.userRegistered = userRegisteredIds.has(t._id.toString());
    });
    return res.status(200).json({ success: true, data: tournaments });
  } catch (err) {
    console.error('List tournaments error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch tournaments' });
  }
};

/** List tournaments created by the logged-in futsal owner */
exports.listMyTournaments = async (req, res) => {
  try {
    const userId = req.userId;
    await closeExpiredRegistrationWindows({ owner: userId });

    const { status } = req.query;
    const query = { owner: userId };
    if (status) query.status = status;
    const tournaments = await Tournament.find(query)
      .populate('venue', 'venueName fullAddress')
      .sort({ isDemoProtected: -1, createdAt: -1 })
      .lean();
    const ids = tournaments.map((t) => t._id);
    const counts = await TournamentTeam.aggregate([
      { $match: { tournament: { $in: ids } } },
      { $group: { _id: '$tournament', count: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
    tournaments.forEach((t) => {
      t.stats = t.stats || {};
      t.stats.registeredTeams = countMap[t._id.toString()] ?? 0;
    });
    return res.status(200).json({ success: true, data: tournaments });
  } catch (err) {
    console.error('List my tournaments error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch your tournaments' });
  }
};

exports.getTournamentById = async (req, res) => {
  try {
    const { id } = req.params;
    await closeExpiredRegistrationWindows({ _id: id });

    const tournament = await Tournament.findById(id).populate(
      'venue',
      'venueName fullAddress contactInfo'
    );
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }
    const teamCount = await TournamentTeam.countDocuments({ tournament: id });
    const userId = req.userId?.toString();
    let userRegistered = false;
    let userRegistration = null;
    if (userId) {
      const reg = await TournamentTeam.findOne({ tournament: id, leader: userId })
        .populate('team', 'name')
        .lean();
      if (reg) {
        userRegistered = true;
        userRegistration = {
          teamId: reg.team?._id,
          teamName: reg.team?.name || 'Your team',
          registrationDate: reg.registrationDate,
          paymentStatus: reg.paymentStatus || 'pending',
          paymentMethod: reg.paymentMethod || 'cash'
        };
      }
    }
    return res.status(200).json({
      success: true,
      data: {
        ...tournament.toObject(),
        stats: {
          ...(tournament.stats || {}),
          registeredTeams: teamCount
        },
        userRegistered: !!userRegistered,
        ...(userRegistration && { userRegistration })
      }
    });
  } catch (err) {
    console.error('Get tournament error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch tournament' });
  }
};

exports.registerTeam = async (req, res) => {
  try {
    const userId = req.userId;
    const { id: tournamentId } = req.params;
    const { teamId, paymentMethod = 'cash' } = req.body;

    if (!teamId) {
      return res.status(400).json({ success: false, message: 'teamId is required' });
    }

    await closeExpiredRegistrationWindows({ _id: tournamentId });
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    const now = new Date();
    if (now > tournament.registrationDeadline || tournament.status !== 'registration_open') {
      return res
        .status(400)
        .json({ success: false, message: 'Registration is closed for this tournament' });
    }
    const currentTeams = await TournamentTeam.countDocuments({ tournament: tournamentId });
    if (currentTeams >= tournament.maxTeams) {
      return res
        .status(400)
        .json({ success: false, message: 'Maximum number of teams reached' });
    }

    const team = await Team.findById(teamId)
      .populate('players.user', '_id')
      .populate('leader', '_id');
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    const leaderId = (team.leader && team.leader._id ? team.leader._id : team.leader).toString();
    if (leaderId !== userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: 'Only the team leader can register for tournaments' });
    }

    const playerCount = (team.players || []).length + 1;
    if (playerCount < (tournament.minPlayersPerTeam || 5)) {
      return res.status(400).json({
        success: false,
        message: `Team must have at least ${
          tournament.minPlayersPerTeam || 5
        } players to register`
      });
    }

    const doc = await TournamentTeam.create({
      tournament: tournamentId,
      team: teamId,
      leader: userId,
      paymentStatus: tournament.entryFeePerTeam > 0 ? 'pending' : 'paid',
      paymentMethod
    });

    tournament.stats = tournament.stats || {};
    tournament.stats.registeredTeams = currentTeams + 1;
    if (tournament.entryFeePerTeam > 0) {
      tournament.stats.totalRevenue =
        (tournament.stats.totalRevenue || 0) + tournament.entryFeePerTeam;
    }
    await tournament.save();

    // Notify the player (registrant) — link to tournaments list
    await notifyUser(userId, {
      title: 'Tournament registration successful',
      message: `Your team "${team.name}" is registered for ${tournament.name}.`,
      type: 'tournament_registration',
      link: '/PlayersTournaments',
      meta: { tournamentId, teamId: team._id }
    });

    // Notify the tournament owner (futsal owner) — link to my-tournaments list
    const ownerId = tournament.owner?.toString?.() || tournament.owner;
    if (ownerId && ownerId !== userId.toString()) {
      await notifyUser(ownerId, {
        title: 'New team registered',
        message: `"${team.name}" registered for your tournament "${tournament.name}".`,
        type: 'tournament_registration',
        link: '/futsalowner/my-tournaments',
        meta: { tournamentId, teamId: team._id }
      });
    }

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: 'This team is already registered for the tournament' });
    }
    console.error('Register team error:', err);
    return res.status(500).json({ success: false, message: 'Failed to register team' });
  }
};

exports.generateFixtures = async (req, res) => {
  try {
    const { id: tournamentId } = req.params;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }
    await assertOwner(req, tournament.venue);

    if (tournament.status !== 'registration_closed' && tournament.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: 'Fixtures can only be generated after registration closes'
      });
    }

    const teams = await TournamentTeam.find({ tournament: tournamentId });
    if (teams.length < 2) {
      return res
        .status(400)
        .json({ success: false, message: 'At least 2 teams required to generate fixtures' });
    }

    await TournamentMatch.deleteMany({ tournament: tournamentId });

    const shuffled = [...teams];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const matches = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (!shuffled[i + 1]) break;
      matches.push({
        tournament: tournamentId,
        stage: 'knockout',
        round: 'Round of ' + shuffled.length,
        teamA: shuffled[i]._id,
        teamB: shuffled[i + 1]._id,
        status: 'scheduled'
      });
    }

    const created = await TournamentMatch.insertMany(matches);

    tournament.status = 'in_progress';
    await tournament.save();

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('Generate fixtures error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate fixtures' });
  }
};

/** List registered teams for a tournament (futsal owner only) */
exports.getRegisteredTeams = async (req, res) => {
  try {
    const { id: tournamentId } = req.params;
    const tournament = await Tournament.findById(tournamentId).select('venue').lean();
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }
    await assertOwner(req, tournament.venue);

    const list = await TournamentTeam.find({ tournament: tournamentId })
      .populate('team', 'name')
      .populate('leader', 'name fullName email phone')
      .sort({ registrationDate: 1 })
      .lean();

    const data = list.map((r) => ({
      _id: r._id,
      teamId: r.team?._id,
      teamName: r.team?.name || '—',
      leader: r.leader
        ? {
            _id: r.leader._id,
            name: r.leader.name || r.leader.fullName || '—',
            email: r.leader.email || '—',
            phone: r.leader.phone || '—'
          }
        : null,
      registrationDate: r.registrationDate,
      paymentMethod: r.paymentMethod || 'cash',
      paymentStatus: r.paymentStatus || 'pending',
      notes: r.notes
    }));

    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    console.error('Get registered teams error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch registered teams' });
  }
};

exports.getFixtures = async (req, res) => {
  try {
    const { id: tournamentId } = req.params;
    const matches = await TournamentMatch.find({ tournament: tournamentId })
      .populate({
        path: 'teamA teamB',
        populate: { path: 'team', select: 'name' }
      })
      .sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: matches });
  } catch (err) {
    console.error('Get fixtures error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch fixtures' });
  }
};

/** Delete tournament (owner only). Demo-protected tournaments cannot be removed. */
exports.deleteTournament = async (req, res) => {
  try {
    const { id: tournamentId } = req.params;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    if (tournament.isDemoProtected) {
      return res.status(403).json({
        success: false,
        message: 'Demo tournament cannot be deleted.',
      });
    }

    await assertOwner(req, tournament.venue);

    await TournamentMatch.deleteMany({ tournament: tournamentId });
    await TournamentTeam.deleteMany({ tournament: tournamentId });
    await PlayerTournamentStats.deleteMany({ tournament: tournamentId });
    await Tournament.findByIdAndDelete(tournamentId);

    return res.status(200).json({ success: true, message: 'Tournament deleted' });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    console.error('Delete tournament error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete tournament' });
  }
};

