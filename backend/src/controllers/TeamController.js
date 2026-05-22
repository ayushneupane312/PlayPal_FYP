const Team = require('../models/TeamModel');
const User = require('../models/UserModel');
const Match = require('../models/MatchModel');
const Booking = require('../models/BookingModel');
const Venue = require('../models/VenueModel');
const TeamMatchQueue = require('../models/TeamMatchQueueModel');
const { calculateSplit } = require('../utils/splitPayment');
const { notifyUser } = require('../services/notificationService');
const { syncPendingPaymentsFromBooking } = require('../services/pendingPaymentService');

const MAX_PLAYERS_BY_FORMAT = { '5v5': 5, '6v6': 6, '7v7': 7, '2v2': 2, '1v1': 1 };

/** Resolve player user id (handles populate null when user was deleted). */
function playerUserId(player) {
  const u = player?.user;
  if (u == null) return null;
  return (u._id || u).toString();
}
const SPLIT_PAYMENT_DEADLINE_MINUTES = 30;
const INVITE_EXPIRY_MINUTES = 30;

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
    const populated = await Team.findById(team._id)
      .populate('leader', 'name email')
      .populate('players.user', 'name email');
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
    })
      .populate('leader', 'name email')
      .populate('players.user', 'name email')
      .populate('joinRequests.user', 'name email')
      .sort({ updatedAt: -1 });
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

    // Allow viewing if you are a member OR if you have a pending invite
    const isMember =
      team.leader?._id?.toString() === userId ||
      team.players.some((p) => playerUserId(p) === userId);
    const hasPendingInvite = team.joinRequests.some(
      (r) =>
        r.user?._id?.toString() === userId &&
        r.status === 'pending' &&
        r.type === 'invite'
    );

    if (!isMember && !hasPendingInvite) {
      return res.status(403).json({ success: false, message: 'Not a member of this team' });
    }
    return res.status(200).json({ success: true, data: team });
  } catch (err) {
    console.error('Get team error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch team', error: err.message });
  }
};

/**
 * POST /team/invite
 * Leader invites a user → creates a PENDING invite, sends notification.
 * Player must accept/decline via /team/respond-invite.
 */
exports.inviteToTeam = async (req, res) => {
  try {
    const userId = req.userId;
    const { teamId, inviteUserId, position } = req.body;
    if (!teamId || !inviteUserId) {
      return res.status(400).json({ success: false, message: 'teamId and inviteUserId required' });
    }
    const team = await Team.findById(teamId).populate('leader', 'name');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (team.leader._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only the leader can invite players' });
    }
    if (team.players.length >= team.maxPlayers) {
      return res.status(400).json({ success: false, message: 'Team is full' });
    }
    const alreadyIn = team.players.some(p => p.user.toString() === inviteUserId);
    if (alreadyIn) return res.status(400).json({ success: false, message: 'Player already in team' });

    // Check for existing pending invite or request
    const existing = team.joinRequests.find(
      r => r.user.toString() === inviteUserId && r.status === 'pending'
    );
    if (existing) {
      return res.status(400).json({ success: false, message: 'Invite or request already pending for this player' });
    }

    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_MINUTES * 60 * 1000);
    team.joinRequests.push({
      user: inviteUserId,
      position: position || 'Any',
      type: 'invite',
      status: 'pending',
      requestedAt: new Date(),
      expiresAt
    });
    await team.save();

    // Send notification to invited player
    await notifyUser(inviteUserId, {
      title: 'Team Invitation',
      message: `${team.leader.name} invited you to join team "${team.name}" (${team.matchFormat})`,
      type: 'team_invite',
      link: `/player/team-invite/${team._id}`,
      meta: {
        teamId: team._id,
        teamName: team.name,
        invitedBy: userId,
        matchFormat: team.matchFormat,
        expiresAt
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Invitation sent. Player will be notified.',
      data: { teamId: team._id, invitedUserId: inviteUserId, expiresAt }
    });
  } catch (err) {
    console.error('Invite error:', err);
    return res.status(500).json({ success: false, message: 'Failed to invite', error: err.message });
  }
};

/**
 * POST /team/respond-invite
 * Invited player accepts or declines the invitation.
 * Body: { teamId, accept: true/false }
 */
exports.respondToInvite = async (req, res) => {
  try {
    const userId = req.userId;
    const { teamId, accept } = req.body;
    if (!teamId) return res.status(400).json({ success: false, message: 'teamId required' });

    const team = await Team.findById(teamId).populate('leader', 'name');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const invite = team.joinRequests.find(
      r => r.user.toString() === userId && r.status === 'pending' && r.type === 'invite'
    );
    if (!invite) {
      return res.status(404).json({ success: false, message: 'No pending invite found for you in this team' });
    }

    // Check expiry
    if (invite.expiresAt && new Date() > invite.expiresAt) {
      invite.status = 'rejected';
      await team.save();
      return res.status(400).json({ success: false, message: 'Invitation has expired' });
    }

    invite.status = accept ? 'approved' : 'rejected';
    invite.respondedAt = new Date();
    invite.respondedBy = userId;

    const invitedUser = await User.findById(userId).select('name');

    if (accept) {
      if (team.players.length >= team.maxPlayers) {
        invite.status = 'rejected';
        await team.save();
        return res.status(400).json({ success: false, message: 'Team is now full' });
      }
      team.players.push({ user: userId, role: 'member', position: invite.position || 'Any' });

      // Auto-mark team as ready if full
      if (team.players.length >= team.maxPlayers) {
        team.status = 'ready';
      }

      // Notify leader of acceptance
      await notifyUser(team.leader._id, {
        title: 'Invitation Accepted',
        message: `${invitedUser?.name || 'A player'} accepted your invitation to join "${team.name}"`,
        type: 'team_join_result',
        link: `/player/teams/${team._id}`,
        meta: { teamId: team._id, userId, result: 'accepted' }
      });

      // If team is now full, notify all members
      if (team.status === 'ready') {
        const memberIds = team.players
          .map(p => p.user.toString())
          .filter(id => id !== userId && id !== team.leader._id.toString());
        for (const memberId of memberIds) {
          await notifyUser(memberId, {
            title: 'Team is Ready!',
            message: `Your team "${team.name}" is now full and ready to find opponents!`,
            type: 'team_join_result',
            link: `/player/teams/${team._id}`,
            meta: { teamId: team._id }
          });
        }
        // Notify leader too
        await notifyUser(team.leader._id, {
          title: 'Team is Full & Ready!',
          message: `"${team.name}" is now full! You can now search for opponents.`,
          type: 'team_join_result',
          link: `/player/teams/${team._id}`,
          meta: { teamId: team._id }
        });
      }
    } else {
      // Notify leader of rejection
      await notifyUser(team.leader._id, {
        title: 'Invitation Declined',
        message: `${invitedUser?.name || 'A player'} declined your invitation to join "${team.name}"`,
        type: 'team_join_result',
        link: `/player/teams/${team._id}`,
        meta: { teamId: team._id, userId, result: 'rejected' }
      });
    }

    await team.save();
    const populated = await Team.findById(team._id)
      .populate('leader', 'name email')
      .populate('players.user', 'name email');
    return res.status(200).json({
      success: true,
      message: accept ? 'You joined the team!' : 'Invitation declined.',
      data: populated
    });
  } catch (err) {
    console.error('Respond invite error:', err);
    return res.status(500).json({ success: false, message: 'Failed to respond to invite', error: err.message });
  }
};

/** POST /team/request-join - user requests to join a public team */
exports.requestJoin = async (req, res) => {
  try {
    const userId = req.userId;
    const { teamId, position } = req.body;
    if (!teamId) return res.status(400).json({ success: false, message: 'teamId required' });
    const team = await Team.findById(teamId).populate('leader', 'name');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (!team.isPublic) return res.status(400).json({ success: false, message: 'Team is not open for join requests' });
    if (team.players.length >= team.maxPlayers) return res.status(400).json({ success: false, message: 'Team is full' });
    const alreadyIn = team.players.some(p => p.user.toString() === userId);
    if (alreadyIn) return res.status(400).json({ success: false, message: 'Already in team' });
    const existing = team.joinRequests.find(r => r.user.toString() === userId && r.status === 'pending');
    if (existing) return res.status(400).json({ success: false, message: 'Request already pending' });

    team.joinRequests.push({ user: userId, position: position || 'Any', type: 'request', status: 'pending' });
    await team.save();

    const requester = await User.findById(userId).select('name');
    // Notify the team leader
    await notifyUser(team.leader._id, {
      title: 'New Join Request',
      message: `${requester?.name || 'Someone'} wants to join your team "${team.name}"`,
      type: 'team_join_request',
      link: `/player/teams/${teamId}`,
      meta: { teamId, userId }
    });

    const populated = await Team.findById(team._id).populate('joinRequests.user', 'name email');
    return res.status(200).json({ success: true, message: 'Join request sent. The leader will be notified.', data: populated });
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
    const team = await Team.findById(teamId).populate('leader', 'name');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (team.leader._id.toString() !== userId) {
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
      if (team.players.length >= team.maxPlayers) team.status = 'ready';
    }

    await team.save();

    // Notify the requesting player of the result
    await notifyUser(reqItem.user, {
      title: approve ? 'Join Request Approved!' : 'Join Request Rejected',
      message: approve
        ? `Your request to join "${team.name}" has been approved! Welcome to the team.`
        : `Your request to join "${team.name}" was declined.`,
      type: 'team_join_result',
      link: approve ? `/player/teams/${teamId}` : `/player/matchmaking`,
      meta: { teamId, result: approve ? 'approved' : 'rejected' }
    });

    const populated = await Team.findById(team._id)
      .populate('leader', 'name email')
      .populate('players.user', 'name email')
      .populate('joinRequests.user', 'name email');
    return res.status(200).json({
      success: true,
      message: approve ? 'Request approved' : 'Request rejected',
      data: populated
    });
  } catch (err) {
    console.error('Approve request error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process request', error: err.message });
  }
};

/** POST /team/make-public */
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
    return res.status(200).json({
      success: true,
      message: team.isPublic ? 'Team is now public' : 'Team is now private',
      data: team
    });
  } catch (err) {
    console.error('Make public error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update', error: err.message });
  }
};

/** GET my pending invitations (for the invitee to see) */
exports.getMyInvitations = async (req, res) => {
  try {
    const userId = req.userId;
    const teams = await Team.find({
      'joinRequests': {
        $elemMatch: {
          user: userId,
          type: 'invite',
          status: 'pending'
        }
      }
    })
      .populate('leader', 'name email')
      .populate('players.user', 'name email')
      .select('name description matchFormat skillLevel maxPlayers players status leader joinRequests');

    // Map to invitation objects
    const invitations = teams.map(team => {
      const invite = team.joinRequests.find(
        r => r.user.toString() === userId && r.type === 'invite' && r.status === 'pending'
      );
      return {
        inviteId: invite._id,
        team: {
          _id: team._id,
          name: team.name,
          description: team.description,
          matchFormat: team.matchFormat,
          skillLevel: team.skillLevel,
          maxPlayers: team.maxPlayers,
          currentPlayers: team.players.length,
          leader: team.leader,
          status: team.status
        },
        position: invite.position,
        expiresAt: invite.expiresAt,
        invitedAt: invite.requestedAt
      };
    });

    return res.status(200).json({ success: true, data: invitations });
  } catch (err) {
    console.error('Get invitations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch invitations', error: err.message });
  }
};

/** POST /team/confirm-booking */
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
      paymentMethod,
      paymentType = 'full',
      serviceCharge = 0,
      discount = 0,
      matchId
    } = req.body;

    if (!teamId || !venueId || !courtId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'teamId, venueId, courtId, bookingDate, startTime, endTime required' });
    }

    const team = await Team.findById(teamId).populate('players.user', 'name email');
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
    let basePrice = isPeakHour && court.pricing.peakHourRate
      ? court.pricing.peakHourRate
      : (court.pricing.offPeakRate || (isWeekend ? court.pricing.weekendRate : court.pricing.weekdayRate));
    let totalAmount = Math.round(basePrice * (duration || 1));
    totalAmount = Math.max(0, totalAmount + (Number(serviceCharge) || 0) - (Number(discount) || 0));

    const isSplit = paymentType === 'split';
    const seen = new Set();
    const teamMemberIds = [];
    const add = (id) => {
      const sid = (id && (id._id ? id._id.toString() : id.toString())) || id;
      if (!sid || seen.has(sid)) return;
      seen.add(sid);
      teamMemberIds.push(id._id || id);
    };
    add(team.leader);
    team.players.forEach(p => add(p.user));
    const teamSize = teamMemberIds.length;

    let splitPlayers = [];
    let paymentDeadline = null;

    if (isSplit) {
      paymentDeadline = new Date(Date.now() + SPLIT_PAYMENT_DEADLINE_MINUTES * 60 * 1000);
      if (teamSize < 1) {
        return res.status(400).json({
          success: false,
          message: 'Team has no members to split payment across'
        });
      }
      const { amounts } = calculateSplit(totalAmount, teamSize);
      splitPlayers = teamMemberIds.map((memberId, index) => ({
        userId: memberId,
        amountAssigned: amounts[index],
        paymentStatus: 'pending',
        paidAt: null,
        transactionId: null
      }));
    }

    const booking = await Booking.create({
      user: userId,
      venue: venueId,
      court: { courtId: court._id, name: court.name, surfaceType: court.surfaceType },
      bookingDate: date,
      timeSlot: { startTime, endTime },
      duration: duration || 1,
      pricing: { basePrice, discount: Number(discount) || 0, totalAmount },
      payment: { method: paymentMethod || 'khalti', status: 'pending' },
      bookingStatus: 'pending',
      paymentType: isSplit ? 'split' : 'full',
      leaderId: userId,
      teamRef: teamId,
      paymentDeadline: paymentDeadline || undefined,
      splitPlayers: splitPlayers.length ? splitPlayers : undefined,
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

    // Optionally link booking to an existing confirmed Match
    let linkedMatch = null;
    if (matchId) {
      linkedMatch = await Match.findOne({
        _id: matchId,
        $or: [{ teamA: teamId }, { teamB: teamId }]
      });
      if (linkedMatch) {
        linkedMatch.bookingRef = booking._id;
        await linkedMatch.save();
      }
    }

    const courtName = court.name;
    const dateLabel = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    if (isSplit && splitPlayers.length > 0) {
      const bookingForSync = await Booking.findById(booking._id).populate('venue', 'venueName');
      await syncPendingPaymentsFromBooking(bookingForSync);

      for (const entry of splitPlayers) {
        const memberId = entry.userId.toString();
        await notifyUser(memberId, {
          title: 'Split Payment Required',
          message: `You owe NPR ${entry.amountAssigned} for ${courtName} on ${dateLabel}. Pay within 30 minutes.`,
          type: 'split_payment_due',
          link: `/player/booking/split/${booking._id}`,
          meta: {
            bookingId: booking._id,
            teamId,
            amountAssigned: entry.amountAssigned,
            matchId: linkedMatch ? linkedMatch._id : undefined,
          },
        });
      }
    } else {
      const notifiedIds = new Set([userId]);
      const collectFromTeam = (t) => {
        if (!t) return;
        const leaderStr = (t.leader && t.leader._id ? t.leader._id : t.leader)?.toString?.();
        if (leaderStr && !notifiedIds.has(leaderStr)) notifiedIds.add(leaderStr);
        (t.players || []).forEach((p) => {
          const id = (p.user && p.user._id ? p.user._id : p.user)?.toString?.();
          if (id && !notifiedIds.has(id)) notifiedIds.add(id);
        });
      };

      if (linkedMatch) {
        const fullMatch = await Match.findById(linkedMatch._id)
          .populate('teamA', 'name leader players')
          .populate('teamB', 'name leader players');
        collectFromTeam(fullMatch.teamA);
        collectFromTeam(fullMatch.teamB);
      } else {
        collectFromTeam(team);
      }

      const idsToNotify = Array.from(notifiedIds).filter((id) => id !== userId);
      for (const memberId of idsToNotify) {
        await notifyUser(memberId, {
          title: 'Match booking confirmed',
          message: `A match for your team "${team.name}" has been booked by the leader.`,
          type: 'booking_created',
          link: `/player/bookings/${booking._id}`,
          meta: { bookingId: booking._id, teamId, matchId: linkedMatch ? linkedMatch._id : undefined },
        });
      }
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('venue', 'venueName fullAddress contactInfo')
      .populate('splitPlayers.userId', 'name email');
    const perPlayerAmount =
      isSplit && splitPlayers.length > 0 ? splitPlayers[0].amountAssigned : null;

    return res.status(201).json({
      success: true,
      message: isSplit
        ? `Split payment requests sent to all ${splitPlayers.length} teammates. Each player must pay their share within 30 minutes.`
        : 'Booking created. Complete payment to confirm.',
      data: {
        booking: populatedBooking,
        team,
        splitSummary: isSplit
          ? {
              teamSize: splitPlayers.length,
              amountPerPlayer: perPlayerAmount,
              amounts: splitPlayers.map((p) => p.amountAssigned),
              deadlineMinutes: SPLIT_PAYMENT_DEADLINE_MINUTES,
            }
          : null,
      },
    });
  } catch (err) {
    console.error('Confirm booking error:', err);
    return res.status(500).json({ success: false, message: 'Failed to confirm booking', error: err.message });
  }
};

/** GET public teams */
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

/** Leave team */
exports.leaveTeam = async (req, res) => {
  try {
    const userId = req.userId;
    const { teamId } = req.body;
    if (!teamId) return res.status(400).json({ success: false, message: 'teamId required' });
    const team = await Team.findById(teamId).populate('leader', 'name');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    const memberIndex = team.players.findIndex((p) => playerUserId(p) === userId);
    if (memberIndex < 0) return res.status(400).json({ success: false, message: 'You are not in this team' });
    team.players.splice(memberIndex, 1);
    if (team.leader._id.toString() === userId && team.players.length > 0) {
      team.leader = team.players[0].user;
      team.players[0].role = 'leader';
    }
    if (team.status === 'ready') team.status = 'forming';
    await team.save();

    // Notify new leader if transferred
    if (team.players.length > 0) {
      await notifyUser(team.leader, {
        title: 'You are now Team Leader',
        message: `The previous leader left "${team.name}". You are now the team leader.`,
        type: 'team_join_result',
        link: `/player/teams/${teamId}`,
        meta: { teamId }
      });
    }

    const populated = await Team.findById(team._id)
      .populate('leader', 'name email')
      .populate('players.user', 'name email');
    return res.status(200).json({ success: true, message: 'Left team', data: populated });
  } catch (err) {
    console.error('Leave team error:', err);
    return res.status(500).json({ success: false, message: 'Failed to leave team', error: err.message });
  }
};

/**
 * POST /team/kick
 * Leader removes a member from the team.
 * Body: { teamId, kickUserId }
 */
exports.kickMember = async (req, res) => {
  try {
    const userId = req.userId;
    const { teamId, kickUserId } = req.body;
    if (!teamId || !kickUserId) {
      return res.status(400).json({ success: false, message: 'teamId and kickUserId required' });
    }
    const team = await Team.findById(teamId).populate('leader', 'name');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    if (team.leader._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only the leader can remove players' });
    }
    if (kickUserId === userId) {
      return res.status(400).json({ success: false, message: 'You cannot kick yourself. Use "leave team" or delete the team instead.' });
    }
    if (team.status === 'booked') {
      return res.status(400).json({ success: false, message: 'Cannot remove players from a team with an active booking.' });
    }

    const memberIndex = team.players.findIndex((p) => playerUserId(p) === kickUserId);
    if (memberIndex < 0) {
      return res.status(404).json({ success: false, message: 'Player not found in this team' });
    }

    team.players.splice(memberIndex, 1);
    if (team.status === 'ready') team.status = 'forming'; // team no longer full
    await team.save();

    // Notify kicked player
    await notifyUser(kickUserId, {
      title: 'Removed from Team',
      message: `You have been removed from the team "${team.name}" by the leader.`,
      type: 'team_join_result',
      link: '/player/matchmaking',
      meta: { teamId, result: 'kicked' }
    });

    const populated = await Team.findById(team._id)
      .populate('leader', 'name email')
      .populate('players.user', 'name email');
    return res.status(200).json({ success: true, message: 'Player removed from team', data: populated });
  } catch (err) {
    console.error('Kick member error:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove player', error: err.message });
  }
};

/**
 * DELETE /team/:id
 * Only the leader can delete. Cannot delete if team is booked (active booking).
 */
exports.deleteTeam = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const team = await Team.findById(id).populate('players.user', 'name');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    if (team.leader.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only the team leader can delete this team' });
    }

    if (team.status === 'booked') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a team with an active booking. Cancel the booking first.'
      });
    }

    const leaderId = team.leader.toString();
    const memberIds = team.players
      .map((p) => playerUserId(p))
      .filter((mid) => mid && mid !== leaderId);

    for (const memberId of memberIds) {
      try {
        await notifyUser(memberId, {
          title: 'Team Disbanded',
          message: `The team "${team.name}" has been deleted by the leader.`,
          type: 'team_join_result',
          link: '/player/matchmaking',
          meta: { teamId: id }
        });
      } catch (notifyErr) {
        console.warn('Delete team: notification skipped for', memberId, notifyErr.message);
      }
    }

    await TeamMatchQueue.deleteMany({ team: id });
    await Team.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: `Team "${team.name}" has been deleted.` });
  } catch (err) {
    console.error('Delete team error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete team', error: err.message });
  }
};