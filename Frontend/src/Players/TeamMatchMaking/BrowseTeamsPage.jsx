// src/pages/player/TeamMatchMaking/BrowseTeamsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import { ArrowLeft, Users, Loader2, Search, Filter, Crown, RefreshCw, SlidersHorizontal } from 'lucide-react';
import matchmakingService from '../../store/matchmakingService';
import { showToast } from '../../FutsalOwner/components/Toast';

const FORMAT_COLORS = {
  '5v5': 'bg-orange-100 text-orange-700',
  '7v7': 'bg-teal-100 text-teal-700',
  '1v1': 'bg-pink-100 text-pink-700',
};

// Track which teams the user has already requested to join this session
const requestedSet = new Set();

const BrowseTeamsPage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [teams, setTeams]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [requesting, setRequesting] = useState(null); // teamId being requested
  const [requested, setRequested]   = useState(new Set()); // locally tracked

  // Filters
  const [search, setSearch]           = useState('');
  const [fmtFilter, setFmtFilter]     = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await matchmakingService.getPublicTeams({ status: 'forming' });
      setTeams(res.data || []);
    } catch {
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestJoin = async (teamId, teamName) => {
    try {
      setRequesting(teamId);
      await matchmakingService.requestJoinTeam(teamId);
      showToast.success(`Request sent to "${teamName}"! The leader will be notified.`);
      setRequested(prev => new Set([...prev, teamId]));
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed to send request');
    } finally {
      setRequesting(null);
    }
  };

  // Client-side filtering
  const filtered = teams.filter(team => {
    const playerCount = team.players?.length || 0;
    const isFull = playerCount >= team.maxPlayers;
    if (isFull) return false; // never show full teams

    const matchSearch = !search ||
      team.name.toLowerCase().includes(search.toLowerCase()) ||
      (team.leader?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchFmt    = fmtFilter === 'all'   || team.matchFormat === fmtFilter;
    return matchSearch && matchFmt;
  });

  const hasActiveFilters = fmtFilter !== 'all' || search;
  const clearFilters = () => { setSearch(''); setFmtFilter('all'); };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <button
            onClick={() => navigate('/player/matchmaking')}
            className="flex items-center text-gray-500 hover:text-gray-800 mb-5 text-sm font-medium transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Matchmaking
          </button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Browse Teams</h1>
              <p className="text-gray-500 text-sm mt-1">
                {loading ? 'Loading…' : `${filtered.length} team${filtered.length !== 1 ? 's' : ''} looking for players`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={load}
                className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-500"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowFilters(prev => !prev)}
                className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm font-medium transition ${
                  showFilters || hasActiveFilters
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-emerald-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {[fmtFilter !== 'all', !!search].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search + Filters panel */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden">
            {/* Search bar — always visible */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by team name or leader…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Expandable filter row */}
            {showFilters && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-100 flex flex-wrap gap-3 items-center">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Format</label>
                  <div className="flex gap-2">
                    {['all', '5v5', '7v7', '1v1'].map(v => (
                      <button
                        key={v}
                        onClick={() => setFmtFilter(v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          fmtFilter === v
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                        }`}
                      >
                        {v === 'all' ? 'Any Format' : v}
                      </button>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto text-xs text-red-500 hover:text-red-700 font-medium mt-4"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Teams list */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>

          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-14 text-center shadow-sm">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">
                {hasActiveFilters ? 'No teams match your filters' : 'No teams forming right now'}
              </h3>
              <p className="text-gray-400 text-sm mb-5">
                {hasActiveFilters
                  ? 'Try adjusting your filters or clearing them.'
                  : 'Be the first — create your own team and invite players.'}
              </p>
              <div className="flex gap-3 justify-center">
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => navigate('/player/matchmaking/create-team')}
                  className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
                >
                  Create a Team
                </button>
              </div>
            </div>

          ) : (
            <div className="space-y-3">
              {filtered.map(team => {
                const playerCount = team.players?.length || 0;
                const spotsLeft   = team.maxPlayers - playerCount;
                const fillPct     = (playerCount / team.maxPlayers) * 100;
                const isRequested = requested.has(team._id);
                const isRequesting = requesting === team._id;
                const fmc = FORMAT_COLORS[team.matchFormat] || 'bg-gray-100 text-gray-600';

                return (
                  <div
                    key={team._id}
                    className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all p-5"
                  >
                    <div className="flex items-start justify-between gap-4">

                      {/* Left */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Users className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 truncate text-base">{team.name}</h3>

                          {/* Leader */}
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                            <Crown className="w-3 h-3 text-amber-500" />
                            <span>{team.leader?.name || 'Unknown'}</span>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${fmc}`}>
                              {team.matchFormat}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              spotsLeft <= 2 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Request button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => !isRequested && handleRequestJoin(team._id, team.name)}
                          disabled={isRequested || isRequesting}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                            isRequested
                              ? 'bg-gray-100 text-gray-400 cursor-default'
                              : isRequesting
                              ? 'bg-emerald-200 text-emerald-600 cursor-wait'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                          }`}
                        >
                          {isRequested ? '✓ Requested' : isRequesting ? 'Sending…' : 'Request to Join'}
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{playerCount} of {team.maxPlayers} players</span>
                        <span>{Math.round(fillPct)}% full</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            fillPct >= 80 ? 'bg-orange-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseTeamsPage;