const MatchQueue = require('../models/MatchQueueModel');
const TeamMatchQueue = require('../models/TeamMatchQueueModel');
const Team = require('../models/TeamModel');
const Match = require('../models/MatchModel');
const User = require('../models/UserModel');

const REQUIRED_PLAYERS = { '5v5': 10, '6v6': 12, '7v7': 14 };

/** Ensure at least 1 GK per team when splitting */
function balanceTeams(players, format) {
  const required = REQUIRED_PLAYERS[format] || 10;
  const half = required / 2;
  const gks = players.filter(p => p.position === 'Goalkeeper');
  const rest = players.filter(p => p.position !== 'Goalkeeper');
  const team1 = [];
  const team2 = [];
  if (gks.length >= 2) {
    team1.push(gks[0]);
    team2.push(gks[1]);
    gks.splice(0, 2);
  } else if (gks.length === 1) {
    team1.push(gks[0]);
  }
  const remaining = [...gks, ...rest];
  for (let i = 0; i < remaining.length; i++) {
    if (team1.length <= team2.length) team1.push(remaining[i]);
    else team2.push(remaining[i]);
  }
  return { team1, team2 };
}

/** Create two teams and a match from queue entries, assign leaders */
async function runMatchingAlgorithm(slotGroup) {
  const format = '5v5';
  const required = REQUIRED_PLAYERS[format];
  if (slotGroup.length < required) return null;

  const entries = slotGroup.slice(0, required);
  const players = entries.map(e => ({
    user: e.user,
    position: e.position,
    skillLevel: e.skillLevel
  }));

  const { team1, team2 } = balanceTeams(players, format);
  const pickLeader = (arr) => arr[Math.floor(Math.random() * arr.length)].user;

  const half = Math.floor(required / 2);
  const leader1 = team1.length ? pickLeader(team1) : entries[0].user;
  const leader2 = team2.length ? pickLeader(team2) : (entries[half] ? entries[half].user : entries[0].user);

  const name1 = `Team A ${Date.now().toString(36)}`;
  const name2 = `Team B ${Date.now().toString(36)}`;

  const t1 = await Team.create({
    name: name1,
    leader: leader1,
    players: team1.map(p => ({ user: p.user, role: (p.user && p.user.toString()) === leader1.toString() ? 'leader' : 'member', position: p.position })),
    skillLevel: entries[0].skillLevel,
    maxPlayers: required / 2,
    matchFormat: format,
    isPublic: false,
    status: 'ready'
  });
  const t2 = await Team.create({
    name: name2,
    leader: leader2,
    players: team2.map(p => ({ user: p.user, role: (p.user && p.user.toString()) === leader2.toString() ? 'leader' : 'member', position: p.position })),
    skillLevel: entries[0].skillLevel,
    maxPlayers: required / 2,
    matchFormat: format,
    isPublic: false,
    status: 'ready'
  });

  const match = await Match.create({
    teamA: t1._id,
    teamB: t2._id,
    status: 'pending',
    assignedLeader: leader1
  });

  for (const e of entries) {
    e.status = 'matched';
    e.matchedAt = new Date();
    e.matchRef = match._id;
    await e.save();
  }

  return { match, teamA: t1, teamB: t2 };
}

/** POST /matchmaking/join-queue */
exports.joinQueue = async (req, res) => {
  try {
    const userId = req.userId;
    const { skillLevel, position, location, availableDate, startTime, endTime } = req.body;

    if (!skillLevel || !position || !availableDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'skillLevel, position, availableDate, startTime, endTime are required'
      });
    }

    const existingInQueue = await MatchQueue.findOne({ user: userId, status: 'waiting' });
    if (existingInQueue) {
      return res.status(400).json({
        success: false,
        message: 'You are already in the queue. Leave first to re-join.'
      });
    }

    const inTeam = await Team.findOne({
      status: { $in: ['forming', 'ready'] },
      $or: [{ leader: userId }, { 'players.user': userId }]
    });
    if (inTeam) {
      return res.status(400).json({
        success: false,
        message: 'You are already in a team. Leave the team first to join solo queue.'
      });
    }

    const entry = await MatchQueue.create({
      user: userId,
      skillLevel,
      position,
      location: location || '',
      availableDate: new Date(availableDate),
      availableTimeSlot: { start: startTime, end: endTime },
      status: 'waiting'
    });

    const date = new Date(availableDate);
    const start = startTime;
    const sameSlot = await MatchQueue.find({
      status: 'waiting',
      skillLevel,
      availableDate: { $gte: new Date(date.setHours(0, 0, 0, 0)), $lt: new Date(date.setHours(23, 59, 59, 999)) },
      'availableTimeSlot.start': start
    }).sort({ createdAt: 1 });

    if (sameSlot.length >= REQUIRED_PLAYERS['5v5']) {
      const result = await runMatchingAlgorithm(sameSlot);
      if (result) {
        const matchPopulated = await Match.findById(result.match._id)
          .populate('teamA', 'name leader players')
          .populate('teamB', 'name leader players')
          .populate('assignedLeader', 'name email');
        return res.status(200).json({
          success: true,
          message: 'Match found!',
          data: { match: matchPopulated, teamA: result.teamA, teamB: result.teamB },
          matched: true
        });
      }
    }

    const populated = await MatchQueue.findById(entry._id).populate('user', 'name email');
    return res.status(201).json({
      success: true,
      message: 'Added to queue. You will be matched when enough players join.',
      data: populated,
      matched: false
    });
  } catch (err) {
    console.error('Join queue error:', err);
    return res.status(500).json({ success: false, message: 'Failed to join queue', error: err.message });
  }
};

/** DELETE /matchmaking/leave-queue */
exports.leaveQueue = async (req, res) => {
  try {
    const userId = req.userId;
    const entry = await MatchQueue.findOne({ user: userId, status: 'waiting' });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'You are not in the queue' });
    }
    entry.status = 'cancelled';
    await entry.save();
    return res.status(200).json({ success: true, message: 'Left the queue' });
  } catch (err) {
    console.error('Leave queue error:', err);
    return res.status(500).json({ success: false, message: 'Failed to leave queue', error: err.message });
  }
};

/** GET /matchmaking/status - current user's queue status or matched match */
exports.getQueueStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const waiting = await MatchQueue.findOne({ user: userId, status: 'waiting' })
      .populate('user', 'name email');
    if (waiting) {
      const sameSlotCount = await MatchQueue.countDocuments({
        status: 'waiting',
        skillLevel: waiting.skillLevel,
        availableDate: waiting.availableDate,
        'availableTimeSlot.start': waiting.availableTimeSlot.start
      });
      return res.status(200).json({
        success: true,
        data: {
          inQueue: true,
          entry: waiting,
          playersInSlot: sameSlotCount,
          required: REQUIRED_PLAYERS['5v5']
        }
      });
    }

    const matched = await MatchQueue.findOne({ user: userId, status: 'matched' }).populate('matchRef');
    if (matched && matched.matchRef) {
      const match = await Match.findById(matched.matchRef)
        .populate('teamA', 'name leader players status')
        .populate('teamB', 'name leader players status')
        .populate('assignedLeader', 'name email');
      return res.status(200).json({
        success: true,
        data: { inQueue: false, matched: true, match }
      });
    }

    return res.status(200).json({
      success: true,
      data: { inQueue: false, matched: false }
    });
  } catch (err) {
    console.error('Queue status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get status', error: err.message });
  }
};

/** GET browse players (for invite) - list users who are players, not already in this team */
/** GET browse players (for invite) - list users who are players, not already in this team */
exports.getBrowsePlayers = async (req, res) => {
  try {
    const { teamId } = req.query;
    const userId = req.userId;

    const filter = {
      role: 'player',      // exact enum value from UserModel
      isVerified: true,    // must have completed email verification
      status: 'active',    // must be active (not inactive/suspended)
      _id: { $ne: userId } // never show yourself
    };

    if (teamId) {
      const team = await Team.findById(teamId);
      if (team) {
        // Exclude current members
        const memberIds = [
          team.leader.toString(),
          ...team.players.map(p => (p.user?._id || p.user).toString())
        ];
        // Exclude players already invited (pending invite)
        const pendingInviteIds = (team.joinRequests || [])
          .filter(r => r.status === 'pending' && r.type === 'invite')
          .map(r => r.user.toString());

        const excludeIds = [...new Set([...memberIds, ...pendingInviteIds, userId])];
        filter._id = { $nin: excludeIds };
      }
    }

    const users = await User.find(filter)
      .select('name email profileImage phone location preferredPosition isInjured')
      .limit(100)
      .sort({ name: 1 });

    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error('Browse players error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load players', error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════
// TEAM vs TEAM MATCHMAKING (queue by team)
// ═══════════════════════════════════════════════════════════

/** POST /matchmaking/find-opponent - leader puts full team into queue, or matches immediately if opponent exists */
exports.findTeamOpponent = async (req, res) => {
  try {
    const userId = req.userId;
    const { teamId, venueId, date, startTime, endTime } = req.body;

    if (!teamId || !venueId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'teamId, venueId, date, startTime, endTime are required'
      });
    }

    const team = await Team.findById(teamId).populate('players.user', 'name email');
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    if (team.leader.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only the team leader can start matchmaking' });
    }

    const playerCount = (team.players?.length || 0);
    if (playerCount !== team.maxPlayers) {
      return res.status(400).json({
        success: false,
        message: `Team must be full to search for opponent (${playerCount}/${team.maxPlayers})`
      });
    }

    // Ensure no active queue entry for this team
    const existingActive = await TeamMatchQueue.findOne({
      team: teamId,
      status: { $in: ['searching', 'matched'] }
    });
    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: 'This team is already in matchmaking. Cancel existing search or finish current match.'
      });
    }

    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);

    // Look for opponent team already searching with same venue/date/slot/teamSize
    const opponentQueue = await TeamMatchQueue.findOne({
      status: 'searching',
      venue: venueId,
      date: searchDate,
      'timeSlot.startTime': startTime,
      'timeSlot.endTime': endTime,
      teamSize: team.maxPlayers,
      team: { $ne: teamId }
    }).sort({ createdAt: 1 });

    if (opponentQueue) {
      // Found opponent – create Match
      const match = await Match.create({
        teamA: opponentQueue.team,
        teamB: teamId,
        venue: venueId,
        date: searchDate,
        timeSlot: { startTime, endTime },
        status: 'pending'
      });

      opponentQueue.status = 'matched';
      opponentQueue.matchRef = match._id;
      await opponentQueue.save();

      const myQueue = await TeamMatchQueue.create({
        team: teamId,
        leader: userId,
        venue: venueId,
        date: searchDate,
        timeSlot: { startTime, endTime },
        teamSize: team.maxPlayers,
        status: 'matched',
        matchRef: match._id
      });

      const fullMatch = await Match.findById(match._id)
        .populate('teamA', 'name skillLevel matchFormat players leader')
        .populate('teamB', 'name skillLevel matchFormat players leader')
        .populate('venue', 'venueName fullAddress');

      return res.status(200).json({
        success: true,
        matched: true,
        message: 'Opponent found!',
        data: {
          match: fullMatch,
          queue: myQueue
        }
      });
    }

    // No opponent – create queue entry in searching state
    const queue = await TeamMatchQueue.create({
      team: teamId,
      leader: userId,
      venue: venueId,
      date: searchDate,
      timeSlot: { startTime, endTime },
      teamSize: team.maxPlayers,
      status: 'searching'
    });

    return res.status(200).json({
      success: true,
      matched: false,
      message: 'Searching for opponent...',
      data: { queue }
    });
  } catch (err) {
    console.error('findTeamOpponent error:', err);
    return res.status(500).json({ success: false, message: 'Failed to start matchmaking', error: err.message });
  }
};

/** GET /matchmaking/status/:teamId - team matchmaking status (searching vs matched) */
exports.getTeamMatchStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({ success: false, message: 'teamId is required' });
    }

    const team = await Team.findOne({
      _id: teamId,
      $or: [{ leader: userId }, { 'players.user': userId }]
    });
    if (!team) {
      return res.status(403).json({ success: false, message: 'You are not a member of this team' });
    }

    const queue = await TeamMatchQueue.findOne({
      team: teamId,
      status: { $in: ['searching', 'matched'] }
    });

    if (!queue) {
      // If team already has a matchRef, return that
      if (team.matchRef) {
        const match = await Match.findById(team.matchRef)
          .populate('teamA', 'name skillLevel matchFormat players leader')
          .populate('teamB', 'name skillLevel matchFormat players leader')
          .populate('venue', 'venueName fullAddress');
        return res.status(200).json({
          success: true,
          data: { inQueue: false, matched: !!match, match }
        });
      }
      return res.status(200).json({
        success: true,
        data: { inQueue: false, matched: false }
      });
    }

    if (queue.status === 'searching') {
      return res.status(200).json({
        success: true,
        data: {
          inQueue: true,
          matched: false,
          queue
        }
      });
    }

    // matched
    const match = await Match.findById(queue.matchRef)
      .populate('teamA', 'name skillLevel matchFormat players leader')
      .populate('teamB', 'name skillLevel matchFormat players leader')
      .populate('venue', 'venueName fullAddress');

    return res.status(200).json({
      success: true,
      data: {
        inQueue: false,
        matched: !!match,
        match
      }
    });
  } catch (err) {
    console.error('getTeamMatchStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get team matchmaking status', error: err.message });
  }
};

/** DELETE /matchmaking/cancel - cancel team matchmaking (leader only) */
exports.cancelTeamMatchmaking = async (req, res) => {
  try {
    const userId = req.userId;
    const { teamId } = req.body;

    if (!teamId) {
      return res.status(400).json({ success: false, message: 'teamId is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (team.leader.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only the leader can cancel matchmaking' });
    }

    const queue = await TeamMatchQueue.findOne({ team: teamId, status: 'searching' });
    if (!queue) {
      return res.status(404).json({ success: false, message: 'No active search to cancel' });
    }

    queue.status = 'cancelled';
    await queue.save();

    return res.status(200).json({ success: true, message: 'Matchmaking cancelled' });
  } catch (err) {
    console.error('cancelTeamMatchmaking error:', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel matchmaking', error: err.message });
  }
};
