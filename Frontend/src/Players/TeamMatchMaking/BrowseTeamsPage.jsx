// src/pages/player/TeamMatchMaking/BrowseTeamsPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import { ArrowLeft, Users, Loader2, Search, Filter, Crown, SlidersHorizontal } from 'lucide-react';
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
  const [listMode, setListMode] = useState('looking'); // 'looking' | 'all'
  const filterMenuRef = useRef(null);

  useEffect(() => { load(); }, [listMode]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!showFilters) return;
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showFilters]);

  const load = async () => {
    try {
      setLoading(true);
      const statusParam = listMode === 'all' ? '' : 'forming';
      const res = await matchmakingService.getPublicTeams({ status: statusParam });
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
    if (listMode === 'looking' && isFull) return false;

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
                {loading
                  ? 'Loading…'
                  : listMode === 'all'
                  ? `${filtered.length} public team${filtered.length !== 1 ? 's' : ''}`
                  : `${filtered.length} team${filtered.length !== 1 ? 's' : ''} looking for players`}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative" ref={filterMenuRef}>
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

                {showFilters && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-20">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Format</label>
                    <select
                      value={fmtFilter}
                      onChange={(e) => setFmtFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="all">Any Format</option>
                      <option value="5v5">5v5</option>
                      <option value="7v7">7v7</option>
                    </select>

                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="w-full mt-3 text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* List mode tabs */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 p-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setListMode('all')}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  listMode === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Team List
              </button>
              <button
                onClick={() => setListMode('looking')}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  listMode === 'looking'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Looking for Players
              </button>
            </div>
          </div>

          {/* Search + Filters panel */}
          <div className="mb-5">
            {/* Search bar — always visible */}
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
                {hasActiveFilters
                  ? 'No teams match your filters'
                  : listMode === 'all'
                  ? 'No public teams right now'
                  : 'No teams forming right now'}
              </h3>
              <p className="text-gray-400 text-sm mb-5">
                {hasActiveFilters
                  ? 'Try adjusting your filters or clearing them.'
                  : listMode === 'all'
                  ? 'Try switching to "Looking for Players" or create a new team.'
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
                const isFullTeam  = playerCount >= team.maxPlayers;
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
                              isFullTeam
                                ? 'bg-emerald-100 text-emerald-700'
                                : spotsLeft <= 2
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isFullTeam
                                ? 'Team Full'
                                : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Request button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => !isRequested && handleRequestJoin(team._id, team.name)}
                          disabled={isFullTeam || isRequested || isRequesting}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                            isFullTeam
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isRequested
                              ? 'bg-gray-100 text-gray-400 cursor-default'
                              : isRequesting
                              ? 'bg-emerald-200 text-emerald-600 cursor-wait'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                          }`}
                        >
                          {isFullTeam
                            ? 'Team Full'
                            : isRequested
                            ? '✓ Requested'
                            : isRequesting
                            ? 'Sending…'
                            : 'Request to Join'}
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