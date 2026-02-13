const Team = require('../models/TeamModel');
const User = require('../models/UserModel');
const Match = require('../models/MatchModel');
const Booking = require('../models/BookingModel');
const Venue = require('../models/VenueModel');

const MAX_PLAYERS_BY_FORMAT = { '5v5': 10, '6v6': 12, '7v7': 14 };

/** Ensure leadership transfers if current leader leaves */
async function transferLeadershipIfNeeded(team) {
  const leaderId = team.leader.toString();
  const leaderInPlayers = team.players.some(p => p.user.toString() === leaderId);
  if (leaderInPlayers) return team;
  if (team.players.length === 0) return team;
  team.leader = team.players[0].user;
  team.players[0].role = 'leader';
  await team.save();
  return team;
}

/** POST /team/create */
exports.createTeam = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, description, matchFormat, allowAutoFill, isPublic, skillLevel } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Team name is required' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const format = matchFormat || '5v5';
    const maxPlayers = MAX_PLAYERS_BY_FORMAT[format] || 10;
    const team = await Team.create({
      name: name.trim(),
      leader: userId,
      players: [{ user: userId, role: 'leader', position: 'Any' }],
      skillLevel: skillLevel || 'Intermediate',
      maxPlayers,
      matchFormat: format,
      isPublic: isPublic !== false,
      allowAutoFill: !!allowAutoFill,
      description: description?.trim() || '',
      status: 'forming'
    });
    const populated = await Team.findById(team._id).populate('leader', 'name email').populate('players.user', 'name email');
    return res.status(201).json({ success: true, message: 'Team created successfully', data: populated });
  } catch (err) {
    console.error('Create team error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create team', error: err.message });
  }
};

/** GET my teams */
exports.getMyTeams = async (req, res) => {
  try {
    const userId = req.userId;
    const teams = await Team.find({
      $or: [{ leader: userId }, { 'players.user': userId }]
    }).populate('leader', 'name email').populate('players.user', 'name email').populate('joinRequests.user', 'name email').sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, data: teams });
  } catch (err) {
    console.error('Get my teams error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch teams', error: err.message });
  }
};

/** GET team by id */
exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const team = await Team.findById(id)
      .populate('leader', 'name email phone')
      .populate('players.user', 'name email phone')
      .populate('joinRequests.user', 'name email');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    const isMember = team.leader._id.toString() === userId || team.players.some(p => p.user._id.toString() === userId);
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member of this team' });
    return res.status(200).json({ success: true, data: team });
  } catch (err) {
    console.error('Get team error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch team', error: err.message });
  }
};

/** POST /team/invite - leader invites a user (by userId) */
exports.inviteToTeam = async (req, res) => {
  try {
    const userId = req.userId;
    const { teamId, inviteUserId, position } = req.body;
    if (!teamId || !inviteUserId) {
      return res.status(400).json({ success: false, message: 'teamId and inviteUserId required' });
    }
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (team.leader.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only the leader can invite players' });
    }
    if (team.players.length >= team.maxPlayers) {
      return res.status(400).json({ success: false, message: 'Team is full' });
    }
    const alreadyIn = team.players.some(p => p.user.toString() === inviteUserId);
    if (alreadyIn) return res.status(400).json({ success: false, message: 'Player already in team' });
    const pending = team.joinRequests.find(r => r.user.toString() === inviteUserId && r.status === 'pending');
    if (pending) return res.status(400).json({ success: false, message: 'Invite/request already pending' });
    team.joinRequests.push({
      user: inviteUserId,
      position: position || 'Any',
      status: 'approved',
      requestedAt: new Date(),
      respondedAt: new Date(),
      respondedBy: userId
    });
    team.players.push({ user: inviteUserId, role: 'member', position: position || 'Any' });
    await team.save();
    const populated = await Team.findById(team._id).populate('leader', 'name email').populate('players.user', 'name email');
    return res.status(200).json({ success: true, message: 'Player invited (added to team)', data: populated });
  } catch (err) {
    console.error('Invite error:', err);
    return res.status(500).json({ success: false, message: 'Failed to invite', error: err.message });
  }
};

/** POST /team/request-join - user requests to join a public team */
exports.requestJoin = async (req, res) => {
  try {
    const userId = req.userId;
    const { teamId, position } = req.body;
    if (!teamId) return res.status(400).json({ success: false, message: 'teamId required' });
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (!team.isPublic) return res.status(400).json({ success: false, message: 'Team is not open for join requests' });
    if (team.players.length >= team.maxPlayers) return res.status(400).json({ success: false, message: 'Team is full' });
    const alreadyIn = team.players.some(p => p.user.toString() === userId);
    if (alreadyIn) return res.status(400).json({ success: false, message: 'Already in team' });
    const existing = team.joinRequests.find(r => r.user.toString() === userId && r.status === 'pending');
    if (existing) return res.status(400).json({ success: false, message: 'Request already pending' });
    team.joinRequests.push({ user: userId, position: position || 'Any', status: 'pending' });
    await team.save();
    const populated = await Team.findById(team._id).populate('joinRequests.user', 'name email');
    return res.status(200).json({ success: true, message: 'Join request sent', data: populated });
  } catch (err) {
    console.error('Request join error:', err);
    return res.status(500).json({ success: false, message: 'Failed to request join', error: err.message });
  }
};

/** POST /team/approve-request - leader approves or rejects a join request */
exports.approveRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { teamId, requestId, approve } = req.body;
    if (!teamId || !requestId) return res.status(400).json({ success: false, message: 'teamId and requestId required' });
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (team.leader.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only the leader can approve requests' });
    }
    const reqItem = team.joinRequests.id(requestId);
    if (!reqItem) return res.status(404).json({ success: false, message: 'Request not found' });
    if (reqItem.status !== 'pending') return res.status(400).json({ success: false, message: 'Request already processed' });
    reqItem.status = approve ? 'approved' : 'rejected';
    reqItem.respondedAt = new Date();
    reqItem.respondedBy = userId;
    if (approve) {
      if (team.players.length >= team.maxPlayers) {
        reqItem.status = 'rejected';
        await team.save();
        return res.status(400).json({ success: false, message: 'Team is now full' });
      }
      team.players.push({ user: reqItem.user, role: 'member', position: reqItem.position || 'Any' });
    }
    await team.save();
    const populated = await Team.findById(team._id).populate('leader', 'name email').populate('players.user', 'name email').populate('joinRequests.user', 'name email');
    return res.status(200).json({ success: true, message: approve ? 'Request approved' : 'Request rejected', data: populated });
  } catch (err) {
    console.error('Approve request error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process request', error: err.message });
  }
};

/** POST /team/make-public - leader toggles isPublic */
exports.makePublic = async (req, res) => {
  try {
    const userId = req.userId;
    const { teamId, isPublic } = req.body;
    if (!teamId) return res.status(400).json({ success: false, message: 'teamId required' });
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (team.leader.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only the leader can change this' });
    }
    team.isPublic = isPublic !== false;
    await team.save();
    return res.status(200).json({ success: true, message: team.isPublic ? 'Team is now public' : 'Team is now private', data: team });
  } catch (err) {
    console.error('Make public error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update', error: err.message });
  }
};

/** POST /team/confirm-booking - only leader; creates booking and returns it (frontend can then initiate payment) */
exports.confirmBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      teamId,
      venueId,
      courtId,
      bookingDate,
      startTime,
      endTime,
      duration,
      numberOfPlayers,
      specialRequests,
      paymentMethod
    } = req.body;

    if (!teamId || !venueId || !courtId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'teamId, venueId, courtId, bookingDate, startTime, endTime required' });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (team.leader.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only the team leader can confirm booking' });
    }
    if (team.status === 'booked') {
      return res.status(400).json({ success: false, message: 'Team already has a confirmed booking' });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    const court = venue.courts.id(courtId);
    if (!court) return res.status(404).json({ success: false, message: 'Court not found' });

    const isAvailable = await Booking.isSlotAvailable(venueId, courtId, new Date(bookingDate), startTime);
    if (!isAvailable) {
      return res.status(409).json({ success: false, message: 'This time slot is no longer available' });
    }

    const user = await User.findById(userId);
    const date = new Date(bookingDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const operatingHours = venue.operatingHours.find(oh => oh.day === dayName);
    const isWeekend = [0, 6].includes(date.getDay());
    const isPeakHour = operatingHours?.peakHours && startTime >= operatingHours.peakHours.start && startTime < operatingHours.peakHours.end;
    let basePrice = isPeakHour && court.pricing.peakHourRate ? court.pricing.peakHourRate : (court.pricing.offPeakRate || (isWeekend ? court.pricing.weekendRate : court.pricing.weekdayRate));
    const totalAmount = basePrice * (duration || 1);

    const booking = await Booking.create({
      user: userId,
      venue: venueId,
      court: { courtId: court._id, name: court.name, surfaceType: court.surfaceType },
      bookingDate: date,
      timeSlot: { startTime, endTime },
      duration: duration || 1,
      pricing: { basePrice, discount: 0, totalAmount },
      payment: { method: paymentMethod || 'cash', status: paymentMethod === 'cash' ? 'pending' : 'pending' },
      bookingStatus: 'pending',
      playerInfo: {
        name: user.name,
        phone: user.phone || '',
        email: user.email,
        numberOfPlayers: numberOfPlayers || team.maxPlayers
      },
      specialRequests: specialRequests || `Team: ${team.name}`
    });

    team.bookingRef = booking._id;
    team.status = 'booked';
    await team.save();

    const populatedBooking = await Booking.findById(booking._id).populate('venue', 'venueName fullAddress contactInfo');
    return res.status(201).json({
      success: true,
      message: 'Booking created. Complete payment to confirm.',
      data: { booking: populatedBooking, team }
    });
  } catch (err) {
    console.error('Confirm booking error:', err);
    return res.status(500).json({ success: false, message: 'Failed to confirm booking', error: err.message });
  }
};

/** GET public teams (browse) */
exports.getPublicTeams = async (req, res) => {
  try {
    const { status = 'forming', skillLevel, matchFormat, page = 1, limit = 20 } = req.query;
    const query = { isPublic: true };
    if (status) query.status = status;
    if (skillLevel) query.skillLevel = skillLevel;
    if (matchFormat) query.matchFormat = matchFormat;
    const teams = await Team.find(query)
      .populate('leader', 'name email')
      .select('name skillLevel maxPlayers matchFormat status players')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ updatedAt: -1 });
    const total = await Team.countDocuments(query);
    return res.status(200).json({
      success: true,
      data: teams,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('Get public teams error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch teams', error: err.message });
  }
};

/** Leave team - if leader leaves, transfer to next member */
exports.leaveTeam = async (req, res) => {
  try {
    const userId = req.userId;
    const { teamId } = req.body;
    if (!teamId) return res.status(400).json({ success: false, message: 'teamId required' });
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    const memberIndex = team.players.findIndex(p => p.user.toString() === userId);
    if (memberIndex < 0) return res.status(400).json({ success: false, message: 'You are not in this team' });
    team.players.splice(memberIndex, 1);
    if (team.leader.toString() === userId && team.players.length > 0) {
      team.leader = team.players[0].user;
      team.players[0].role = 'leader';
    }
    await team.save();
    const populated = await Team.findById(team._id).populate('leader', 'name email').populate('players.user', 'name email');
    return res.status(200).json({ success: true, message: 'Left team', data: populated });
  } catch (err) {
    console.error('Leave team error:', err);
    return res.status(500).json({ success: false, message: 'Failed to leave team', error: err.message });
  }
};
