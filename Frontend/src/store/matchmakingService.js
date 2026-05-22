import axios from 'axios';

const API_BASE = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '';
const TEAM_URL = `${API_BASE}/api/team`;
const MATCHMAKING_URL = `${API_BASE}/api/matchmaking`;

// ─── Opponent Matchmaking ──────────────────────────────────────────────────────
const OPPONENT_URL = `${API_BASE}/api/opponent-matchmaking`;


axios.defaults.withCredentials = true;

// ─── Team CRUD ─────────────────────────────────────────────────────────────────
export const createTeam = async (data) => {
  const { data: res } = await axios.post(`${TEAM_URL}/create`, data);
  return res;
};

export const getMyTeams = async () => {
  const { data: res } = await axios.get(`${TEAM_URL}/my-teams`);
  return res;
};

export const getPublicTeams = async (params = {}) => {
  const { data: res } = await axios.get(`${TEAM_URL}/public`, { params });
  return res;
};

export const getTeamById = async (id) => {
  const { data: res } = await axios.get(`${TEAM_URL}/${id}`);
  return res;
};

export const deleteTeam = async (teamId) => {
  const { data: res } = await axios.delete(`${TEAM_URL}/${teamId}`);
  return res;
};

// ─── Invitations (leader → player) ────────────────────────────────────────────
export const inviteToTeam = async (teamId, inviteUserId, position) => {
  const { data: res } = await axios.post(`${TEAM_URL}/invite`, { teamId, inviteUserId, position });
  return res;
};

/**
 * Invited player responds to a team invitation.
 * @param {string} teamId
 * @param {boolean} accept - true to join, false to decline
 */
export const respondToInvite = async (teamId, accept) => {
  const { data: res } = await axios.post(`${TEAM_URL}/respond-invite`, { teamId, accept });
  return res;
};

/** Get all pending invitations for the current user */
export const getMyInvitations = async () => {
  const { data: res } = await axios.get(`${TEAM_URL}/my-invitations`);
  return res;
};

// ─── Join requests (player → leader) ──────────────────────────────────────────
export const requestJoinTeam = async (teamId, position) => {
  const { data: res } = await axios.post(`${TEAM_URL}/request-join`, { teamId, position });
  return res;
};

export const approveJoinRequest = async (teamId, requestId, approve) => {
  const { data: res } = await axios.post(`${TEAM_URL}/approve-request`, { teamId, requestId, approve });
  return res;
};

// ─── Team management ───────────────────────────────────────────────────────────
export const setTeamPublic = async (teamId, isPublic) => {
  const { data: res } = await axios.post(`${TEAM_URL}/make-public`, { teamId, isPublic });
  return res;
};

export const confirmTeamBooking = async (payload) => {
  const { data: res } = await axios.post(`${TEAM_URL}/confirm-booking`, payload);
  return res;
};

export const leaveTeam = async (teamId) => {
  const { data: res } = await axios.post(`${TEAM_URL}/leave`, { teamId });
  return res;
};

/** Leader removes a member from the team */
export const kickMember = async (teamId, kickUserId) => {
  const { data: res } = await axios.post(`${TEAM_URL}/kick`, { teamId, kickUserId });
  return res;
};

// ─── Matchmaking (solo queue) ──────────────────────────────────────────────────
export const joinQueue = async (payload) => {
  const { data: res } = await axios.post(`${MATCHMAKING_URL}/join-queue`, payload);
  return res;
};

export const leaveQueue = async () => {
  const { data: res } = await axios.delete(`${MATCHMAKING_URL}/leave-queue`);
  return res;
};

export const getQueueStatus = async () => {
  const { data: res } = await axios.get(`${MATCHMAKING_URL}/status`);
  return res;
};

export const getBrowsePlayersForInvite = async (teamId) => {
  const { data: res } = await axios.get(`${MATCHMAKING_URL}/players`, {
    params: teamId ? { teamId } : {}
  });
  return res;
};

// ─── Team vs Team matchmaking ────────────────────────────────────────────────────
export const findOpponentForTeam = async (payload) => {
  const { data: res } = await axios.post(`${MATCHMAKING_URL}/find-opponent`, payload);
  return res;
};

export const getTeamMatchStatus = async (teamId) => {
  const { data: res } = await axios.get(`${MATCHMAKING_URL}/status/${teamId}`);
  return res;
};

export const cancelTeamMatchmaking = async (teamId) => {
  const { data: res } = await axios.delete(`${MATCHMAKING_URL}/cancel`, {
    data: { teamId }
  });
  return res;
};


export const browseOpponentTeams = async (params = {}) => {
  const { data: res } = await axios.get(`${OPPONENT_URL}/browse`, { params });
  return res;
};

export const sendChallenge = async (challengerTeamId, opponentTeamId, message = '') => {
  const { data: res } = await axios.post(`${OPPONENT_URL}/challenge`, { challengerTeamId, opponentTeamId, message });
  return res;
};

export const respondToChallenge = async (matchId, accept, declineReason = '') => {
  const { data: res } = await axios.post(`${OPPONENT_URL}/respond-challenge`, { matchId, accept, declineReason });
  return res;
};

export const getMyChallenges = async () => {
  const { data: res } = await axios.get(`${OPPONENT_URL}/my-challenges`);
  return res;
};

export const getMatchById = async (matchId) => {
  const { data: res } = await axios.get(`${OPPONENT_URL}/match/${matchId}`);
  return res;
};

export const cancelChallenge = async (matchId) => {
  const { data: res } = await axios.post(`${OPPONENT_URL}/cancel-challenge`, { matchId });
  return res;
};

// ─── Default export ────────────────────────────────────────────────────────────
const matchmakingService = {
  createTeam,
  getMyTeams,
  getPublicTeams,
  getTeamById,
  deleteTeam,
  inviteToTeam,
  respondToInvite,
  getMyInvitations,
  requestJoinTeam,
  approveJoinRequest,
  setTeamPublic,
  confirmTeamBooking,
  leaveTeam,
  kickMember,
  joinQueue,
  leaveQueue,
  getQueueStatus,
  getBrowsePlayersForInvite,
  browseOpponentTeams,
  sendChallenge,
  respondToChallenge,
  getMyChallenges,
  getMatchById,
  cancelChallenge,
  findOpponentForTeam,
  getTeamMatchStatus,
  cancelTeamMatchmaking,

};

export default matchmakingService;