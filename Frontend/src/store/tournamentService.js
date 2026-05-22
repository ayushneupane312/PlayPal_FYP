import axios from 'axios';
import API_BASE from '../utils/apiBase.js';

export async function listTournaments(params = {}) {
  const { status } = params;
  const url = `${API_BASE}/api/tournaments` + (status ? `?status=${encodeURIComponent(status)}` : '');
  const res = await axios.get(url, { withCredentials: true });
  return res.data;
}

/** List tournaments created by the logged-in futsal owner */
export async function listMyTournaments(params = {}) {
  const { status } = params;
  const url = `${API_BASE}/api/tournaments/my` + (status ? `?status=${encodeURIComponent(status)}` : '');
  const res = await axios.get(url, { withCredentials: true });
  return res.data;
}

export async function createTournament(payload) {
  const res = await axios.post(`${API_BASE}/api/tournaments`, payload, {
    withCredentials: true
  });
  return res.data;
}

export async function getTournamentById(id) {
  const res = await axios.get(`${API_BASE}/api/tournaments/${id}`, {
    withCredentials: true
  });
  return res.data;
}

/** Get registered teams for a tournament (futsal owner only) */
export async function getRegisteredTeams(tournamentId) {
  const res = await axios.get(`${API_BASE}/api/tournaments/${tournamentId}/registered-teams`, {
    withCredentials: true
  });
  return res.data;
}

export async function getFixtures(tournamentId) {
  const res = await axios.get(`${API_BASE}/api/tournaments/${tournamentId}/fixtures`, {
    withCredentials: true
  });
  return res.data;
}

export async function generateFixtures(tournamentId) {
  const res = await axios.post(
    `${API_BASE}/api/tournaments/${tournamentId}/fixtures/generate`,
    {},
    { withCredentials: true }
  );
  return res.data;
}

/** Register a team for a tournament (team leader only). Body: { teamId, paymentMethod?: 'cash'|'online' } */
export async function registerTeam(tournamentId, body) {
  const res = await axios.post(
    `${API_BASE}/api/tournaments/${tournamentId}/register`,
    body,
    { withCredentials: true }
  );
  return res.data;
}

