import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, Building2, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { runGlobalSearch } from '../store/globalSearchService';

function homePath(role) {
  if (role === 'admin') return '/admindashboard';
  if (role === 'futsalowner') return '/futsalownerdashboard';
  return '/playerdashboard';
}

export default function GlobalSearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const q = (searchParams.get('q') || '').trim();

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ venues: [], bookings: [], users: [] });

  const role = user?.role || 'player';

  const title = useMemo(() => (q ? `Results for “${q}”` : 'Search'), [q]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: `/search?q=${encodeURIComponent(q)}` } });
      return;
    }
    if (!q) {
      setResults({ venues: [], bookings: [], users: [] });
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await runGlobalSearch(q, role);
        if (!cancelled) setResults(data);
      } catch {
        if (!cancelled) setResults({ venues: [], bookings: [], users: [] });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, role, isAuthenticated, navigate]);

  const hasAny =
    (results.venues?.length || 0) +
      (results.bookings?.length || 0) +
      (results.users?.length || 0) >
    0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <Link
            to={homePath(role)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            Dashboard
          </Link>
          <span className="ml-auto text-sm font-medium text-gray-700">PlayPal search</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-600">
          Signed in as <span className="font-medium capitalize">{role}</span>. Refine your query and press Enter in the
          header search on any dashboard page.
        </p>

        {!q && (
          <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Add a <code className="font-mono">?q=</code> query, or use the search field in the top bar and press Enter.
          </p>
        )}

        {q && loading && (
          <div className="mt-10 flex items-center justify-center gap-2 text-gray-600">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            Searching…
          </div>
        )}

        {q && !loading && !hasAny && (
          <p className="mt-10 rounded-xl border border-gray-200 bg-white px-4 py-6 text-center text-gray-600">
            No matches for that query in the areas we search for your account type.
          </p>
        )}

        {q && !loading && results.users?.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Users className="h-5 w-5 text-emerald-600" />
              Users
            </h2>
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {results.users.map((u) => (
                <li key={u._id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <span className="font-medium text-gray-900">{u.name || '—'}</span>
                  <span className="text-gray-500">{u.email}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-700">
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {q && !loading && results.venues?.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Building2 className="h-5 w-5 text-emerald-600" />
              Venues
            </h2>
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {results.venues.map((v) => (
                <li key={v._id} className="px-4 py-3">
                  <Link
                    to={
                      role === 'admin'
                        ? `/admin/futsal-centers`
                        : `/player/venues/${v._id}`
                    }
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    {v.venueName || 'Venue'}
                  </Link>
                  <p className="mt-1 flex items-start gap-1 text-xs text-gray-600">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    {v.fullAddress || v?.address?.city || '—'}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {q && !loading && results.bookings?.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Bookings
            </h2>
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {results.bookings.map((b) => (
                <li key={b._id} className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="font-medium text-gray-900">
                      {b.playerInfo?.name || b.user?.name || 'Booking'}
                    </span>
                    <span className="text-gray-500"> · {b.court?.name || 'Court'}</span>
                    <div className="text-xs text-gray-500">
                      {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : '—'} ·{' '}
                      {b.timeSlot?.startTime}–{b.timeSlot?.endTime}
                    </div>
                  </div>
                  <Link
                    to={
                      role === 'futsalowner'
                        ? `/futsalowner/booking-management/${b._id}`
                        : `/player/bookings/${b._id}`
                    }
                    className="text-emerald-700 hover:underline"
                  >
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
