import axios from 'axios';

const API_BASE = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '';
const TEAM_URL = `${API_BASE}/api/team`;
const MATCHMAKING_URL = `${API_BASE}/api/matchmaking`;

axios.defaults.withCredentials = true;

// ─── Team ─────────────────────────────────────────────────────────
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

export const inviteToTeam = async (teamId, inviteUserId, position) => {
  const { data: res } = await axios.post(`${TEAM_URL}/invite`, { teamId, inviteUserId, position });
  return res;
};

export const requestJoinTeam = async (teamId, position) => {
  const { data: res } = await axios.post(`${TEAM_URL}/request-join`, { teamId, position });
  return res;
};

export const approveJoinRequest = async (teamId, requestId, approve) => {
  const { data: res } = await axios.post(`${TEAM_URL}/approve-request`, { teamId, requestId, approve });
  return res;
};

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

// ─── Matchmaking (solo queue) ──────────────────────────────────────
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
  const { data: res } = await axios.get(`${MATCHMAKING_URL}/players`, { params: teamId ? { teamId } : {} });
  return res;
};

const matchmakingService = {
  createTeam,
  getMyTeams,
  getPublicTeams,
  getTeamById,
  inviteToTeam,
  requestJoinTeam,
  approveJoinRequest,
  setTeamPublic,
  confirmTeamBooking,
  leaveTeam,
  joinQueue,
  leaveQueue,
  getQueueStatus,
  getBrowsePlayersForInvite
};

export default matchmakingService;
