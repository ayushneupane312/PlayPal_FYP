import axios from "axios";
import API_BASE from "../utils/apiBase.js";
const ENDORSEMENTS_URL = `${API_BASE}/api/endorsements`;

/**
 * Returns aggregated rating summary for a player.
 */
export const getPlayerRatingSummary = async (playerId) => {
  const { data } = await axios.get(`${ENDORSEMENTS_URL}/summary/${playerId}`, {
    withCredentials: true,
  });
  return data;
};

/**
 * Returns the current user's own endorsement for a given player (if any).
 */
export const getMyEndorsement = async (playerId, userId) => {
  if (!playerId || !userId) return null;
  const { data } = await axios.get(`${ENDORSEMENTS_URL}/me/${playerId}`, {
    withCredentials: true,
  });
  return data;
};

/**
 * Creates/updates an endorsement for a player.
 * Returns { endorsement: { rating, skills, comment, updatedAt } }
 */
export const upsertEndorsement = async ({ playerId, userId, rating, skills, comment }) => {
  if (!playerId || !userId) throw new Error("Missing playerId or userId");
  if (!rating) throw new Error("Missing rating");
  const { data } = await axios.post(
    `${ENDORSEMENTS_URL}/upsert`,
    { playerId, rating, skills, comment },
    { withCredentials: true }
  );
  return data;
};

