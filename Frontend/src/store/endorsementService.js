import axios from "axios";

const API_BASE = import.meta.env.MODE === "development" ? "http://localhost:5000" : "";
const ENDORSEMENTS_URL = `${API_BASE}/api/endorsements`;

/**
 * LocalStorage-based mock so the UI works without backend endpoints.
 * Structure:
 *  - playpal_endorsements_v1 : { [userId]: { [playerId]: { rating, skills, comment, updatedAt } } }
 */
const STORAGE_KEY = "playpal_endorsements_v1";

const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const loadAllEndorsements = () => {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return safeJsonParse(raw, {});
};

const saveAllEndorsements = (data) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const hashToSeed = (str) => {
  // Simple deterministic hash to seed mock data.
  let h = 2166136261;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

const clampInt = (n, min, max) => Math.max(min, Math.min(max, Math.floor(n)));

const genDistributionFromSeed = (seed) => {
  // Create a believable aggregated distribution across 1-5 stars.
  // Uses deterministic math so the UI is stable for a given playerId.
  const total = 40 + (seed % 60); // 40..99 endorsements

  // Weights skew towards higher ratings.
  const w5 = 20 + (seed % 15);
  const w4 = 18 + ((seed * 3) % 14);
  const w3 = 10 + ((seed * 7) % 12);
  const w2 = 6 + ((seed * 11) % 9);
  const w1 = 3 + ((seed * 17) % 7);
  const weightsSum = w5 + w4 + w3 + w2 + w1;

  const count5 = clampInt((total * w5) / weightsSum, 0, total);
  const count4 = clampInt((total * w4) / weightsSum, 0, total - count5);
  const remainingAfter54 = total - count5 - count4;
  const count3 = clampInt((remainingAfter54 * w3) / (w3 + w2 + w1), 0, remainingAfter54);
  const remainingAfter543 = remainingAfter54 - count3;
  const count2 = clampInt((remainingAfter543 * w2) / (w2 + w1), 0, remainingAfter543);
  const count1 = remainingAfter543 - count2;

  return { 5: count5, 4: count4, 3: count3, 2: count2, 1: count1 };
};

const calcOverallFromDistribution = (dist) => {
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  if (!total) return 0;
  const sum = 5 * dist[5] + 4 * dist[4] + 3 * dist[3] + 2 * dist[2] + 1 * dist[1];
  return Math.round((sum / total) * 10) / 10; // 1 decimal
};

/**
 * Returns aggregated rating summary for a player.
 */
export const getPlayerRatingSummary = async (playerId) => {
  try {
    const { data } = await axios.get(`${ENDORSEMENTS_URL}/summary/${playerId}`, {
      withCredentials: true,
    });
    if (data?.distribution && typeof data?.overallRating === "number") return data;
  } catch {
    // fall back to mock if backend is unreachable
  }

  const seed = hashToSeed(playerId);
  const distribution = genDistributionFromSeed(seed);
  const endorsementsCount = Object.values(distribution).reduce((a, b) => a + b, 0);
  const overallRating = calcOverallFromDistribution(distribution);
  return { overallRating, endorsementsCount, distribution };
};

/**
 * Returns the current user's own endorsement for a given player (if any).
 */
export const getMyEndorsement = async (playerId, userId) => {
  if (!playerId || !userId) return null;

  try {
    const { data } = await axios.get(`${ENDORSEMENTS_URL}/me/${playerId}`, {
      withCredentials: true,
    });
    if (data?.rating) return data;
    if (data === null) return null;
  } catch {
    // fall back to localStorage mock
  }

  const all = loadAllEndorsements();
  const userMap = all?.[userId] || {};
  return userMap?.[playerId] || null;
};

/**
 * Creates/updates an endorsement for a player.
 * Returns { endorsement: { rating, skills, comment, updatedAt } }
 */
export const upsertEndorsement = async ({ playerId, userId, rating, skills, comment }) => {
  if (!playerId || !userId) throw new Error("Missing playerId or userId");
  if (!rating) throw new Error("Missing rating");

  try {
    const { data } = await axios.post(
      `${ENDORSEMENTS_URL}/upsert`,
      { playerId, rating, skills, comment },
      { withCredentials: true }
    );
    if (data?.endorsement) return data;
  } catch (err) {
    // If it's a real API error (not just unreachable), rethrow it
    if (err?.response?.data?.message) throw err;
    // Otherwise fall back to localStorage mock
  }

  const all = loadAllEndorsements();
  all[userId] = all[userId] || {};
  all[userId][playerId] = {
    rating,
    skills: Array.isArray(skills) ? skills : [],
    comment: comment || "",
    updatedAt: Date.now(),
  };
  saveAllEndorsements(all);

  return { endorsement: all[userId][playerId] };
};

