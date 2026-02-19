const Team = require('../models/TeamModel');
const Match = require('../models/MatchModel');
const User = require('../models/UserModel');
const { notifyUser } = require('../services/notificationService');

/**
 * GET /api/opponent-matchmaking/browse
 * List "ready" public teams that can receive challenges.
 * Filters: matchFormat, skillLevel, page, limit
 * Excludes teams the current user is already in.
 */
exports.browseOpponentTeams = async (req, res) => {
  try {
    const userId = req.userId;
    const { matchFormat, skillLevel, page = 1, limit = 12 } = req.query;

    const query = {
      isPublic: true,
      status: 'ready',          // team must be fully formed
    };
    if (matchFormat) query.matchFormat = matchFormat;
    if (skillLevel)  query.skillLevel  = skillLevel;

    // Exclude teams the user belongs to
    query['players.user'] = { $ne: userId };
    query.leader           = { $ne: userId };

    const teams = await Team.find(query)
      .populate('leader', 'name email')
      .populate('players.user', 'name email')
      .select('name skillLevel maxPlayers matchFormat status players leader description createdAt')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Team.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: teams,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    console.error('Browse opponent teams error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch opponent teams', error: err.message });
  }
};

/**
 * POST /api/opponent-matchmaking/challenge
 * Team leader sends a match challenge to another team's leader.
 * Body: { challengerTeamId, opponentTeamId, message? }
 */
exports.sendChallenge = async (req, res) => {
  try {
    const userId = req.userId;
    const { challengerTeamId, opponentTeamId, message } = req.body;

    if (!challengerTeamId || !opponentTeamId) {
      return res.status(400).json({ success: false, message: 'challengerTeamId and opponentTeamId are required' });
    }
    if (challengerTeamId === opponentTeamId) {
      return res.status(400).json({ success: false, message: 'Cannot challenge your own team' });
    }

    const [challenger, opponent] = await Promise.all([
      Team.findById(challengerTeamId).populate('leader', 'name email').populate('players.user', 'name'),
      Team.findById(opponentTeamId).populate('leader', 'name email').populate('players.user', 'name')
    ]);

    if (!challenger) return res.status(404).json({ success: false, message: 'Your team not found' });
    if (!opponent)   return res.status(404).json({ success: false, message: 'Opponent team not found' });

    // Only the leader of the challenger team can send a challenge
    if (challenger.leader._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only your team leader can send a challenge' });
    }

    // Challenger team must be ready (fully formed)
    if (challenger.status !== 'ready') {
      return res.status(400).json({ success: false, message: 'Your team must be full and ready before challenging opponents' });
    }

    // Opponent team must be ready
    if (opponent.status !== 'ready') {
      return res.status(400).json({ success: false, message: 'Opponent team is not ready yet' });
    }

    // Match formats must be the same
    if (challenger.matchFormat !== opponent.matchFormat) {
      return res.status(400).json({
        success: false,
        message: `Format mismatch: your team is ${challenger.matchFormat}, opponent is ${opponent.matchFormat}`
      });
    }

    // Check for an existing pending challenge between these two teams
    const existingMatch = await Match.findOne({
      $or: [
        { teamA: challengerTeamId, teamB: opponentTeamId },
        { teamA: opponentTeamId,   teamB: challengerTeamId }
      ],
      status: { $in: ['pending', 'confirmed'] }
    });
    if (existingMatch) {
      return res.status(400).json({ success: false, message: 'A challenge or match already exists between these teams' });
    }

    // Create the match record in "pending" (awaiting opponent response)
    const match = await Match.create({
      teamA: challengerTeamId,
      teamB: opponentTeamId,
      status: 'pending',
      assignedLeader: userId,
      challengeMessage: message?.trim() || '',
      challengedAt: new Date(),
      challengeStatus: 'pending'   // pending | accepted | declined
    });

    // Notify the opponent leader
    await notifyUser(opponent.leader._id, {
      title: '⚔️ Match Challenge Received!',
      message: `"${challenger.name}" has challenged your team "${opponent.name}" to a ${challenger.matchFormat} match!`,
      type: 'match_found',
      link: `/player/matches/challenges`,
      meta: {
        matchId: match._id,
        challengerTeamId,
        challengerTeamName: challenger.name,
        opponentTeamId,
        matchFormat: challenger.matchFormat,
        challengeMessage: message?.trim() || ''
      }
    });

    const populated = await Match.findById(match._id)
      .populate('teamA', 'name matchFormat skillLevel players leader')
      .populate('teamB', 'name matchFormat skillLevel players leader')
      .populate('assignedLeader', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Challenge sent! The opponent leader will be notified.',
      data: populated
    });
  } catch (err) {
    console.error('Send challenge error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send challenge', error: err.message });
  }
};

/**
 * POST /api/opponent-matchmaking/respond-challenge
 * Opponent leader accepts or declines the challenge.
 * Body: { matchId, accept: true/false, declineReason? }
 */
exports.respondToChallenge = async (req, res) => {
  try {
    const userId = req.userId;
    const { matchId, accept, declineReason } = req.body;

    if (!matchId) return res.status(400).json({ success: false, message: 'matchId is required' });

    const match = await Match.findById(matchId)
      .populate('teamA', 'name leader players matchFormat')
      .populate('teamB', 'name leader players matchFormat');

    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
    if (match.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This challenge has already been responded to' });
    }

    // Only the opponent (teamB) leader can respond
    const opponentLeaderId = match.teamB.leader?.toString?.() || match.teamB.leader;
    if (opponentLeaderId !== userId) {
      return res.status(403).json({ success: false, message: 'Only the opponent team leader can respond to this challenge' });
    }

    const challengerTeam = match.teamA;
    const opponentTeam   = match.teamB;

    if (accept) {
      match.status          = 'confirmed';
      match.challengeStatus = 'accepted';
      match.confirmedAt     = new Date();
      match.confirmedByLeader = userId;
      await match.save();

      // Notify ALL members of BOTH teams
      const allPlayerIds = [
        ...challengerTeam.players.map(p => (p.user?._id || p.user).toString()),
        ...opponentTeam.players.map(p => (p.user?._id || p.user).toString()),
      ].filter((id, i, arr) => arr.indexOf(id) === i); // deduplicate

      // Notify challenger team leader separately with specific message
      await notifyUser(challengerTeam.leader, {
        title: '🎉 Challenge Accepted!',
        message: `"${opponentTeam.name}" accepted your match challenge! The match is confirmed.`,
        type: 'match_found',
        link: `/player/matches/${match._id}`,
        meta: { matchId: match._id, opponentTeamName: opponentTeam.name, result: 'accepted' }
      });

      // Notify all other members of both teams
      const othersToNotify = allPlayerIds.filter(
        id => id !== challengerTeam.leader.toString() && id !== userId
      );
      for (const memberId of othersToNotify) {
        const isChallenger = challengerTeam.players.some(p => (p.user?._id || p.user).toString() === memberId);
        await notifyUser(memberId, {
          title: '🎉 Match Confirmed!',
          message: isChallenger
            ? `Your team "${challengerTeam.name}" vs "${opponentTeam.name}" match is confirmed!`
            : `Your team "${opponentTeam.name}" vs "${challengerTeam.name}" match is confirmed!`,
          type: 'match_found',
          link: `/player/matches/${match._id}`,
          meta: { matchId: match._id }
        });
      }
    } else {
      // Declined
      match.status          = 'cancelled';
      match.challengeStatus = 'declined';
      match.declineReason   = declineReason?.trim() || '';
      match.declinedAt      = new Date();
      await match.save();

      // Notify the challenger leader
      await notifyUser(challengerTeam.leader, {
        title: '❌ Challenge Declined',
        message: `"${opponentTeam.name}" declined your match challenge.${declineReason ? ` Reason: ${declineReason}` : ''}`,
        type: 'match_found',
        link: `/player/matches/challenges`,
        meta: { matchId: match._id, opponentTeamName: opponentTeam.name, result: 'declined', declineReason }
      });
    }

    const populated = await Match.findById(match._id)
      .populate('teamA', 'name leader players matchFormat skillLevel')
      .populate('teamB', 'name leader players matchFormat skillLevel')
      .populate('assignedLeader', 'name email')
      .populate('confirmedByLeader', 'name email');

    return res.status(200).json({
      success: true,
      message: accept ? 'Challenge accepted! Match is now confirmed.' : 'Challenge declined.',
      data: populated
    });
  } catch (err) {
    console.error('Respond to challenge error:', err);
    return res.status(500).json({ success: false, message: 'Failed to respond to challenge', error: err.message });
  }
};

/**
 * GET /api/opponent-matchmaking/my-challenges
 * Returns all challenges involving the current user's teams:
 * - challenges SENT (user is leader of teamA)
 * - challenges RECEIVED (user is leader of teamB, status pending)
 */
exports.getMyChallenges = async (req, res) => {
  try {
    const userId = req.userId;

    // Find all teams where this user is leader
    const myTeams = await Team.find({ leader: userId }).select('_id name');
    const myTeamIds = myTeams.map(t => t._id);

    if (myTeamIds.length === 0) {
      return res.status(200).json({ success: true, data: { sent: [], received: [], confirmed: [] } });
    }

    const allMatches = await Match.find({
      $or: [{ teamA: { $in: myTeamIds } }, { teamB: { $in: myTeamIds } }],
      status: { $in: ['pending', 'confirmed', 'cancelled'] }
    })
      .populate('teamA', 'name leader players matchFormat skillLevel maxPlayers status')
      .populate('teamB', 'name leader players matchFormat skillLevel maxPlayers status')
      .populate({ path: 'teamA', populate: { path: 'leader', select: 'name email' } })
      .populate({ path: 'teamB', populate: { path: 'leader', select: 'name email' } })
      .sort({ createdAt: -1 });

    const sent      = allMatches.filter(m => myTeamIds.some(id => id.toString() === m.teamA?._id?.toString()) && m.status === 'pending');
    const received  = allMatches.filter(m => myTeamIds.some(id => id.toString() === m.teamB?._id?.toString()) && m.status === 'pending');
    const confirmed = allMatches.filter(m => m.status === 'confirmed');

    return res.status(200).json({
      success: true,
      data: { sent, received, confirmed }
    });
  } catch (err) {
    console.error('Get my challenges error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch challenges', error: err.message });
  }
};

/**
 * GET /api/opponent-matchmaking/match/:matchId
 * Get full details of a specific match
 */
exports.getMatchById = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;

    const match = await Match.findById(matchId)
      .populate({ path: 'teamA', populate: [{ path: 'leader', select: 'name email' }, { path: 'players.user', select: 'name email' }] })
      .populate({ path: 'teamB', populate: [{ path: 'leader', select: 'name email' }, { path: 'players.user', select: 'name email' }] })
      .populate('assignedLeader', 'name email')
      .populate('confirmedByLeader', 'name email');

    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    // Must be a member of one of the teams
    const teamAPlayerIds = match.teamA?.players?.map(p => (p.user?._id || p.user).toString()) || [];
    const teamBPlayerIds = match.teamB?.players?.map(p => (p.user?._id || p.user).toString()) || [];
    const allIds = [...teamAPlayerIds, ...teamBPlayerIds];

    const isMember = allIds.includes(userId) ||
      match.teamA?.leader?._id?.toString() === userId ||
      match.teamB?.leader?._id?.toString() === userId;

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'You are not part of this match' });
    }

    return res.status(200).json({ success: true, data: match });
  } catch (err) {
    console.error('Get match by id error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch match', error: err.message });
  }
};

/**
 * POST /api/opponent-matchmaking/cancel-challenge
 * Challenger leader cancels a pending challenge they sent.
 * Body: { matchId }
 */
exports.cancelChallenge = async (req, res) => {
  try {
    const userId = req.userId;
    const { matchId } = req.body;

    if (!matchId) return res.status(400).json({ success: false, message: 'matchId is required' });

    const match = await Match.findById(matchId)
      .populate('teamA', 'name leader')
      .populate('teamB', 'name leader');

    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
    if (match.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only cancel a pending challenge' });
    }
    if (match.teamA.leader.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only the challenger leader can cancel the challenge' });
    }

    match.status          = 'cancelled';
    match.challengeStatus = 'cancelled';
    match.cancelledAt     = new Date();
    await match.save();

    // Notify opponent leader
    await notifyUser(match.teamB.leader, {
      title: 'Challenge Withdrawn',
      message: `"${match.teamA.name}" has withdrawn their match challenge against your team.`,
      type: 'match_found',
      link: `/player/matches/challenges`,
      meta: { matchId: match._id }
    });

    return res.status(200).json({ success: true, message: 'Challenge cancelled successfully' });
  } catch (err) {
    console.error('Cancel challenge error:', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel challenge', error: err.message });
  }
};