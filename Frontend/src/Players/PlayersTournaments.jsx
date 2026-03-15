import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from './PlayerSidebar';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Filter,
  ChevronRight,
  Medal,
  Target,
  Award,
  Loader2,
  Clock,
} from 'lucide-react';
import { listTournaments } from '../store/tournamentService';

const statusLabels = {
  draft: 'Draft',
  upcoming: 'Upcoming',
  registration_open: 'Registration Open',
  registration_closed: 'Registration Closed',
  in_progress: 'Live',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const statusToFilter = {
  'Registration Open': 'registration_open',
  'Upcoming': 'upcoming',
  'Live': 'in_progress',
  'Completed': 'completed',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' });
}

const TournamentsPage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [filterStatus, setFilterStatus] = useState('All Tournaments');
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    fetchTournaments();
  }, [filterStatus]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const status = statusToFilter[filterStatus] || undefined;
      const res = await listTournaments(status ? { status } : {});
      const list = res?.data ?? res ?? [];
      setTournaments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Fetch tournaments error:', err);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { id: 1, title: 'Tournaments Won', value: '0', icon: <Trophy className="w-5 h-5" />, color: 'emerald' },
    { id: 2, title: 'Total Participated', value: '0', icon: <Medal className="w-5 h-5" />, color: 'amber' },
    { id: 3, title: 'Active Registrations', value: '0', icon: <Target className="w-5 h-5" />, color: 'blue' },
    { id: 4, title: 'Regional Rank', value: '—', icon: <Award className="w-5 h-5" />, color: 'red' },
  ];

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'registration_open' || s === 'upcoming') return 'bg-amber-100 text-amber-700';
    if (s === 'in_progress') return 'bg-red-100 text-red-700';
    if (s === 'completed') return 'bg-gray-100 text-gray-700';
    if (s === 'cancelled') return 'bg-red-100 text-red-600';
    if (s === 'registration_closed') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getDisplayStatus = (status) => statusLabels[status] || (status || '').replace(/_/g, ' ');

  const getActionButton = (t) => {
    const status = (t.status || '').toLowerCase();
    if (status === 'registration_open' || status === 'upcoming') {
      if (t.userRegistered) {
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium py-1.5 px-4 rounded-lg border border-emerald-200">
            Registered
          </span>
        );
      }
      return (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/PlayersTournaments/${t._id}/register`); }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-all flex items-center gap-1.5"
        >
          Register
          <ChevronRight className="w-4 h-4" />
        </button>
      );
    }
    if (status === 'in_progress') {
      return (
        <button className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-all flex items-center gap-1.5 animate-pulse">
          Live
          <ChevronRight className="w-4 h-4" />
        </button>
      );
    }
    if (status === 'completed') {
      return (
        <button className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-all flex items-center gap-1.5">
          Results
          <ChevronRight className="w-4 h-4" />
        </button>
      );
    }
    return (
      <button
        onClick={(e) => { e.stopPropagation(); navigate(`/PlayersTournaments/${t._id}`); }}
        className="bg-white border border-gray-300 text-gray-700 text-sm font-medium py-1.5 px-4 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5"
      >
        View
        <ChevronRight className="w-4 h-4" />
      </button>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 p-6 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-0.5">Tournaments</h1>
            <p className="text-sm text-gray-600">Browse events and register your team</p>
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
            >
              <option>All Tournaments</option>
              <option>Registration Open</option>
              <option>Upcoming</option>
              <option>Live</option>
              <option>Completed</option>
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                  stat.color === 'emerald'
                    ? 'bg-emerald-100 text-emerald-600'
                    : stat.color === 'amber'
                    ? 'bg-amber-100 text-amber-600'
                    : stat.color === 'blue'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {stat.icon}
              </div>
              <p className="text-lg font-bold text-gray-900 mb-0.5">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'browse'
                ? 'text-emerald-600 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Browse Tournaments
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'matches'
                ? 'text-emerald-600 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Matches
          </button>
        </div>

        {/* Tournaments List */}
        {activeTab === 'browse' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              </div>
            ) : tournaments.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No tournaments found</h3>
                <p className="text-sm text-gray-600">Check back later or try a different filter.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tournaments.map((t) => (
                  <div
                    key={t._id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden"
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                        (t.status === 'registration_open' || t.status === 'upcoming')
                          ? 'bg-amber-500'
                          : t.status === 'in_progress'
                          ? 'bg-red-500'
                          : t.status === 'completed'
                          ? 'bg-gray-400'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pl-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h3 className="text-base font-semibold text-gray-900">{t.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(t.status)}`}
                          >
                            {getDisplayStatus(t.status)}
                          </span>
                        </div>
                        {/* Location, registration deadline, teams registered — prominent row */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mb-2">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>{t.venue?.venueName && t.venue?.fullAddress && t.venue.venueName !== t.venue.fullAddress ? `${t.venue.venueName}, ${t.venue.fullAddress}` : (t.venue?.venueName || t.venue?.fullAddress || t.location || '—')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>Deadline {formatDate(t.registrationDeadline)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>{(t.stats?.registeredTeams ?? 0)}/{t.maxTeams} teams</span>
                          </div>
                        </div>
                        {/* Dates and prize pool — secondary row */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span>{formatDate(t.startDate)} – {formatDate(t.endDate)}</span>
                          </div>
                          {(t.totalPrizePool > 0) && (
                            <div className="flex items-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                              <span className="font-medium text-amber-600">
                                Rs. {Number(t.totalPrizePool || 0).toLocaleString()} prize pool
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Entry fee</p>
                          <p className="text-base font-semibold text-gray-900">
                            Rs. {Number(t.entryFeePerTeam || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          {getActionButton(t)}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); navigate(`/PlayersTournaments/${t._id}`); }}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            View details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* My Matches Tab */}
        {activeTab === 'matches' && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No matches yet</h3>
            <p className="text-sm text-gray-600 mb-2">
              Register for a tournament to see your match schedule here.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Matches will appear here once the organizer publishes the fixture (tie sheet) for tournaments you are registered in.
            </p>
            <button
              onClick={() => setActiveTab('browse')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all inline-flex items-center gap-1.5"
            >
              Browse Tournaments
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Info Banner */}
        <div className="mt-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h3 className="text-base font-semibold mb-0.5">Ready to compete?</h3>
              <p className="text-sm text-emerald-100">Join tournaments and showcase your skills.</p>
            </div>
            <button
              onClick={() => setFilterStatus('All Tournaments')}
              className="bg-white text-emerald-600 hover:bg-gray-100 text-sm font-medium py-2 px-4 rounded-lg transition-all flex-shrink-0"
            >
              View all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentsPage;
