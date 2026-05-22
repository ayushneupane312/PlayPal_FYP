import axios from 'axios';
import API_BASE from '../utils/apiBase.js';
import { getAllVenues, getAllVenuesAdmin } from './venueService';
import { getVenueBookings, getMyBookings } from './bookingStore';

const USERS_API = `${API_BASE}/api/users`;

axios.defaults.withCredentials = true;

function norm(s) {
  return (s || '').toString().toLowerCase();
}

function matchesQuery(q, ...fields) {
  const n = norm(q);
  if (!n) return false;
  return fields.some((f) => norm(f).includes(n));
}

/** Escape user text before sending to APIs that build RegExp from the string. */
export function escapeRegex(text) {
  return (text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Role-aware global search used by `/search` (header "Search anything..." submits here).
 */
export async function runGlobalSearch(rawQuery, role) {
  const q = (rawQuery || '').trim();
  const safe = escapeRegex(q);
  const out = { query: q, venues: [], bookings: [], users: [] };
  if (!q) return out;

  if (role === 'admin') {
    try {
      const { data } = await axios.get(USERS_API, {
        params: { page: 1, limit: 25, search: safe, role: 'all' },
      });
      out.users = Array.isArray(data?.data) ? data.data : [];
    } catch {
      out.users = [];
    }
    try {
      const res = await getAllVenuesAdmin({ page: 1, limit: 40, search: safe });
      out.venues = Array.isArray(res?.data) ? res.data : [];
    } catch {
      try {
        const pub = await getAllVenues({ page: 1, limit: 100 });
        const list = Array.isArray(pub?.data) ? pub.data : [];
        out.venues = list
          .filter((v) =>
            matchesQuery(q, v.venueName, v.fullAddress, v?.address?.city, v?.contactInfo?.email)
          )
          .slice(0, 25);
      } catch {
        out.venues = [];
      }
    }
    return out;
  }

  if (role === 'futsalowner') {
    try {
      const res = await getVenueBookings({
        limit: 250,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      out.bookings = list
        .filter((b) =>
          matchesQuery(
            q,
            b.playerInfo?.name,
            b.playerInfo?.phone,
            b.playerInfo?.email,
            b.court?.name,
            b.user?.name,
            b.user?.email
          )
        )
        .slice(0, 30);
    } catch {
      out.bookings = [];
    }
    try {
      const pub = await getAllVenues({ page: 1, limit: 80 });
      const list = Array.isArray(pub?.data) ? pub.data : [];
      out.venues = list
        .filter((v) => matchesQuery(q, v.venueName, v.fullAddress, v?.address?.city))
        .slice(0, 15);
    } catch {
      out.venues = [];
    }
    return out;
  }

  // player (and unknown roles): venues + my bookings
  try {
    const pub = await getAllVenues({ page: 1, limit: 120 });
    const list = Array.isArray(pub?.data) ? pub.data : [];
    out.venues = list
      .filter((v) => matchesQuery(q, v.venueName, v.fullAddress, v?.address?.city))
      .slice(0, 25);
  } catch {
    out.venues = [];
  }
  try {
    const res = await getMyBookings({ page: 1, limit: 60 });
    const list = Array.isArray(res?.data) ? res.data : [];
    out.bookings = list
      .filter((b) =>
        matchesQuery(
          q,
          b.court?.name,
          b.venue?.venueName,
          b.user?.name,
          b.specialRequests
        )
      )
      .slice(0, 25);
  } catch {
    out.bookings = [];
  }

  return out;
}
