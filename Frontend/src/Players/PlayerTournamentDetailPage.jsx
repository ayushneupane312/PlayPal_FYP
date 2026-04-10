import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  BadgeDollarSign,
  LayoutList,
  Loader2,
  Medal,
  Clock,
  CreditCard,
  Banknote,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';
import PlayerSidebar from './PlayerSidebar';
import { showToast } from '../FutsalOwner/components/Toast';
import { getTournamentById } from '../store/tournamentService';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  upcoming: 'bg-blue-100 text-blue-700',
  registration_open: 'bg-green-100 text-green-700',
  registration_closed: 'bg-red-100 text-red-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels = {
  draft: 'Draft',
  upcoming: 'Upcoming',
  registration_open: 'Registration Open',
  registration_closed: 'Registration Closed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' });
}

function isDeadlinePassed(deadline) {
  if (!deadline) return false;
  const raw = String(deadline);
  let parsed;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-').map(Number);
    parsed = new Date(year, month - 1, day, 12, 0, 0, 0);
  } else {
    parsed = new Date(deadline);
    if (Number.isNaN(parsed.getTime())) return false;
  }

  return Date.now() > parsed.getTime();
}

function getEffectiveTournamentStatus(tournament) {
  const originalStatus = (tournament?.status || '').toLowerCase();
  const passed = isDeadlinePassed(tournament?.registrationDeadline);
  if (passed && (originalStatus === 'registration_open' || originalStatus === 'upcoming')) {
    return 'registration_closed';
  }
  return originalStatus;
}

function formatStatus(s) {
  return statusLabels[s] || (s || '').replace(/_/g, ' ');
}

export default function PlayerTournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState(null);

  useEffect(() => {
    if (id) fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const res = await getTournamentById(id);
      const data = res?.data ?? res;
      setTournament(data || null);
    } catch (err) {
      console.error('Fetch tournament error:', err);
      showToast.error(err.response?.data?.message || 'Failed to load tournament');
      setTournament(null);
    } finally {
      setLoading(false);
    }
  };

  const effectiveStatus = getEffectiveTournamentStatus(tournament);

  const canRegister =
    !tournament?.userRegistered &&
    effectiveStatus === 'registration_open' &&
    (tournament.stats?.registeredTeams ?? 0) < tournament.maxTeams;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tournament not found</h2>
            <button
              onClick={() => navigate('/PlayersTournaments')}
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tournaments
            </button>
          </div>
        </div>
      </div>
    );
  }

  const venue = tournament.venue;
  const venueName = venue?.venueName || tournament.location || '—';
  const fullAddress = venue?.fullAddress || tournament.location || '—';
  const prizes = (tournament.prizes || []).filter((p) => p.enabled !== false);
  const paymentMethods = tournament.paymentMethods || [];
  const registeredTeams = tournament.stats?.registeredTeams ?? 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
      <div
        className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <button
          onClick={() => navigate('/PlayersTournaments')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tournaments
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          {/* Banner */}
          <div className="relative h-52 bg-gradient-to-br from-emerald-400 to-emerald-600">
            {tournament.bannerImage ? (
              <img
                src={tournament.bannerImage}
                alt={tournament.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Trophy className="w-16 h-16 text-white/60" />
              </div>
            )}
            <span
              className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-medium ${
                tournament.userRegistered
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : statusColors[effectiveStatus] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {tournament.userRegistered ? 'Registered' : formatStatus(effectiveStatus)}
            </span>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{tournament.name}</h1>
                {tournament.description && (
                  <p className="text-gray-600 text-sm max-w-2xl">{tournament.description}</p>
                )}
              </div>
              {tournament.userRegistered ? (
                <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 font-medium py-2.5 px-5 rounded-lg border border-emerald-200 shrink-0">
                  Registered
                </span>
              ) : canRegister ? (
                <button
                  onClick={() => navigate(`/PlayersTournaments/${id}/register`)}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm transition shrink-0"
                >
                  <UserPlus className="w-5 h-5" />
                  Register team
                </button>
              ) : null}
            </div>

            {/* Key info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Dates</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(tournament.startDate)} – {formatDate(tournament.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Venue</p>
                  <p className="text-sm font-medium text-gray-900">{venueName}</p>
                  {fullAddress && fullAddress !== venueName && (
                    <p className="text-xs text-gray-500">{fullAddress}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Teams</p>
                  <p className="text-sm font-medium text-gray-900">
                    {registeredTeams} / {tournament.maxTeams} registered
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <BadgeDollarSign className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Entry fee</p>
                  <p className="text-sm font-medium text-gray-900">
                    NPR {Number(tournament.entryFeePerTeam || 0).toLocaleString()} per team
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <LayoutList className="w-4 h-4" />
                    Format & registration
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Format: {(tournament.format || 'knockout').replace(/_/g, ' ')}</li>
                    <li>Min players per team: {tournament.minPlayersPerTeam ?? 5}</li>
                    <li className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Registration deadline: {formatDate(tournament.registrationDeadline)}
                    </li>
                  </ul>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Payment methods</h3>
                  <div className="flex flex-wrap gap-2">
                    {paymentMethods.includes('online') && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        <CreditCard className="w-3.5 h-3.5" /> Online
                      </span>
                    )}
                    {paymentMethods.includes('cash') && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                        <Banknote className="w-3.5 h-3.5" /> Cash
                      </span>
                    )}
                    {paymentMethods.length === 0 && (
                      <span className="text-gray-500 text-sm">Not specified</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Medal className="w-4 h-4 text-amber-500" />
                  Prizes
                </h3>
                {tournament.totalPrizePool > 0 && (
                  <p className="text-base font-semibold text-gray-900 mb-3">
                    Total prize pool: NPR {Number(tournament.totalPrizePool).toLocaleString()}
                  </p>
                )}
                {prizes.length > 0 ? (
                  <ul className="space-y-2">
                    {prizes.map((p, i) => (
                      <li key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{p.title || p.reward || 'Prize'}</span>
                        {p.amount != null && (
                          <span className="font-medium text-gray-900">
                            NPR {Number(p.amount).toLocaleString()}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No prizes configured</p>
                )}
              </div>
            </div>

            {/* Your registration details — when user has registered */}
            {tournament.userRegistration && (
              <div className="mt-6 p-4 border border-emerald-200 rounded-lg bg-emerald-50/50">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Your registration
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Team</p>
                    <p className="font-medium text-gray-900">{tournament.userRegistration.teamName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Registered on</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(tournament.userRegistration.registrationDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Payment</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {tournament.userRegistration.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Payment status</p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        tournament.userRegistration.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : tournament.userRegistration.paymentStatus === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {tournament.userRegistration.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
