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
  UserCircle,
  Mail,
  Phone,
} from 'lucide-react';
import FutsalOwnerSidebar from './FutsalOwnerSidebar';
import Header from './components/Header';
import { showToast } from './components/Toast';
import { getTournamentById, getRegisteredTeams } from '../store/tournamentService';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  upcoming: 'bg-blue-100 text-blue-700',
  registration_open: 'bg-green-100 text-green-700',
  registration_closed: 'bg-amber-100 text-amber-700',
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

function formatStatus(s) {
  return statusLabels[s] || (s || '').replace(/_/g, ' ');
}

export default function OwnerTournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState(null);
  const [registeredTeamsList, setRegisteredTeamsList] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  useEffect(() => {
    if (id) fetchTournament();
  }, [id]);

  useEffect(() => {
    if (id && tournament) fetchRegisteredTeams();
  }, [id, tournament?._id]);

  const fetchRegisteredTeams = async () => {
    if (!id) return;
    try {
      setLoadingTeams(true);
      const res = await getRegisteredTeams(id);
      const list = res?.data ?? res ?? [];
      setRegisteredTeamsList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Fetch registered teams error:', err);
      setRegisteredTeamsList([]);
    } finally {
      setLoadingTeams(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <FutsalOwnerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
          <div className="p-6 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <FutsalOwnerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Tournament not found</h2>
              <button
                onClick={() => navigate('/futsalowner/my-tournaments')}
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to My Tournaments
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const venue = tournament.venue;
  const venueName = venue?.venueName || tournament.location || '—';
  const fullAddress = venue?.fullAddress || tournament.location || '—';
  const prizes = (tournament.prizes || []).filter(p => p.enabled !== false);
  const paymentMethods = tournament.paymentMethods || [];
  const registeredTeams = tournament.stats?.registeredTeams ?? 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <FutsalOwnerSidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

        <div className="p-6">
          <button
            onClick={() => navigate('/futsalowner/my-tournaments')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Tournaments
          </button>

          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            {/* Banner */}
            <div className="relative h-56 bg-gradient-to-br from-green-400 to-green-600">
              {tournament.bannerImage ? (
                <img
                  src={tournament.bannerImage}
                  alt={tournament.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Trophy className="w-16 h-16 text-white/60" />
                </div>
              )}
              <span
                className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-medium ${
                  statusColors[tournament.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {formatStatus(tournament.status)}
              </span>
            </div>

            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{tournament.name}</h1>
              {tournament.description && (
                <p className="text-gray-600 mb-6">{tournament.description}</p>
              )}

              {/* Key info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Dates</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(tournament.startDate)} – {formatDate(tournament.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Venue</p>
                    <p className="text-sm font-medium text-gray-900">{venueName}</p>
                    {fullAddress && fullAddress !== venueName && (
                      <p className="text-xs text-gray-500">{fullAddress}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Teams</p>
                    <p className="text-sm font-medium text-gray-900">
                      {registeredTeams} / {tournament.maxTeams} registered
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <BadgeDollarSign className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Entry fee</p>
                    <p className="text-sm font-medium text-gray-900">
                      Rs. {Number(tournament.entryFeePerTeam || 0).toLocaleString()} per team
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Format & registration */}
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
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      Payment methods
                    </h3>
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

                {/* Prizes */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Medal className="w-4 h-4 text-amber-500" />
                    Prizes
                  </h3>
                  {tournament.totalPrizePool > 0 && (
                    <p className="text-lg font-semibold text-gray-900 mb-3">
                      Total prize pool: Rs. {Number(tournament.totalPrizePool).toLocaleString()}
                    </p>
                  )}
                  {prizes.length > 0 ? (
                    <ul className="space-y-2">
                      {prizes.map((p, i) => (
                        <li key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{p.title || p.reward || 'Prize'}</span>
                          {p.amount != null && (
                            <span className="font-medium text-gray-900">
                              Rs. {Number(p.amount).toLocaleString()}
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

              {/* Registered teams — for owner to review */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Registered teams ({registeredTeams})
                </h3>
                {loadingTeams ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                  </div>
                ) : registeredTeamsList.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4">No teams registered yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Team</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Captain</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Registered on</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {registeredTeamsList.map((r, i) => (
                          <tr key={r._id} className="bg-white hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-600">{i + 1}</td>
                            <td className="py-3 px-4 font-medium text-gray-900">{r.teamName}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <UserCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                {r.leader?.name || '—'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-0.5">
                                {r.leader?.email && r.leader.email !== '—' && (
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Mail className="w-3.5 h-3.5" />
                                    <a href={`mailto:${r.leader.email}`} className="hover:text-green-600 truncate max-w-[180px] block">
                                      {r.leader.email}
                                    </a>
                                  </div>
                                )}
                                {r.leader?.phone && r.leader.phone !== '—' && (
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Phone className="w-3.5 h-3.5" />
                                    <a href={`tel:${r.leader.phone}`} className="hover:text-green-600">
                                      {r.leader.phone}
                                    </a>
                                  </div>
                                )}
                                {(!r.leader?.email || r.leader.email === '—') && (!r.leader?.phone || r.leader.phone === '—') && '—'}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {formatDate(r.registrationDate)}
                            </td>
                            <td className="py-3 px-4 text-gray-600 capitalize">{r.paymentMethod}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                  r.paymentStatus === 'paid'
                                    ? 'bg-green-100 text-green-700'
                                    : r.paymentStatus === 'failed'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {r.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
