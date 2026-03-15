import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Plus,
  Calendar,
  MapPin,
  Users,
  BadgeDollarSign,
  LayoutList,
  Loader2,
} from 'lucide-react';
import FutsalOwnerSidebar from './FutsalOwnerSidebar';
import Header from './components/Header';
import { showToast } from './components/Toast';
import { listMyTournaments } from '../store/tournamentService';

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
  const date = new Date(d);
  return date.toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatStatus(s) {
  return statusLabels[s] || (s || '').replace(/_/g, ' ');
}

export default function TournamentList() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    fetchMyTournaments();
  }, []);

  const fetchMyTournaments = async () => {
    try {
      setLoading(true);
      const res = await listMyTournaments();
      const list = res?.data ?? res ?? [];
      setTournaments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Fetch my tournaments error:', err);
      showToast.error(err.response?.data?.message || 'Failed to load your tournaments');
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <FutsalOwnerSidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

        <div className="p-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Tournaments</h1>
              <p className="text-gray-600">View and manage tournaments you created</p>
            </div>
            <button
              onClick={() => navigate('/futsalowner/Tournaments')}
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition"
            >
              <Plus className="w-5 h-5" />
              Create tournament
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
            </div>
          ) : tournaments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No tournaments yet</h2>
              <p className="text-gray-600 mb-6">Create your first tournament to get started.</p>
              <button
                onClick={() => navigate('/futsalowner/Tournaments')}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                Create tournament
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tournaments.map((t) => (
                <div
                  key={t._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/futsalowner/my-tournaments/${t._id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/futsalowner/my-tournaments/${t._id}`)}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition cursor-pointer"
                >
                  <div className="relative h-40 bg-gradient-to-br from-green-400 to-green-600">
                    {t.bannerImage ? (
                      <img
                        src={t.bannerImage}
                        alt={t.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Trophy className="w-12 h-12 text-white/60" />
                      </div>
                    )}
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusColors[t.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {formatStatus(t.status)}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate" title={t.name}>
                      {t.name}
                    </h3>
                    {t.venue && (
                      <div className="flex items-center gap-1.5 text-gray-600 text-sm mt-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{t.venue.venueName || t.location || '—'}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{formatDate(t.startDate)} – {formatDate(t.endDate)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        {t.maxTeams} teams
                      </span>
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <BadgeDollarSign className="w-4 h-4" />
                        Rs. {Number(t.entryFeePerTeam || 0).toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <LayoutList className="w-4 h-4" />
                        {(t.format || 'knockout').replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
