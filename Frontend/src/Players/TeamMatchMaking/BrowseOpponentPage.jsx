// src/pages/player/TeamMatchMaking/BrowseOpponentsPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import {
  ArrowLeft, Search, Swords,
  Users, Filter, Loader2,
  AlertCircle, CheckCircle, Send, X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import matchmakingService, {
  browseOpponentTeams,
  sendChallenge,
  findOpponentForTeam,
  getTeamMatchStatus,
  cancelTeamMatchmaking
} from '../../store/matchmakingService';
import { getAllVenues } from '../../store/venueService';
import { showToast } from '../../FutsalOwner/components/Toast';

const FORMATS = ['All', '2v2', '5v5', '7v7'];

const FORMAT_COLORS = {
  '2v2': 'bg-amber-50 text-amber-700 border-amber-200',
  '5v5': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '7v7': 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function BrowseOpponentsPage() {
  const navigate   = useNavigate();
  const { user }   = useAuthStore();
  const userId     = user?._id?.toString?.() || user?.id?.toString?.();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [opponents,  setOpponents]  = useState([]);
  const [myTeams,    setMyTeams]    = useState([]); // ready teams where current user is leader
  const [hasReadyButNotLeader, setHasReadyButNotLeader] = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [formatFilter, setFormatFilter] = useState('All');
  const [search,       setSearch]       = useState('');

  // Challenge modal
  const [challengeModal, setChallengeModal] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [selectedMyTeam, setSelectedMyTeam]     = useState('');
  const [challengeMsg, setChallengeMsg]          = useState('');
  const [sending, setSending]                    = useState(false);

  // Auto matchmaking (queue-based find opponent)
  const [autoTeamId, setAutoTeamId]       = useState('');
  const [autoVenueId, setAutoVenueId]     = useState('');
  const [autoDate, setAutoDate]           = useState('');
  const [autoStartTime, setAutoStartTime] = useState('18:00');
  const [autoEndTime, setAutoEndTime]     = useState('19:00');
  const [venues, setVenues]               = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [autoStatus, setAutoStatus]       = useState('idle'); // idle | searching | matched
  const [autoMatch, setAutoMatch]         = useState(null);
  const [autoLoading, setAutoLoading]     = useState(false);
  const pollRef = useRef(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const params = {};
      if (formatFilter !== 'All') params.matchFormat = formatFilter;
      const [oppRes, myTeamsRes] = await Promise.all([
        browseOpponentTeams(params),
        matchmakingService.getMyTeams()
      ]);
      setOpponents(oppRes.data || []);
      // All ready teams where user is a member
      const allReadyTeams = (myTeamsRes.data || []).filter(t => t.status === 'ready');
      // Ready teams where current user is leader (can challenge/book)
      const readyLeaderTeams = allReadyTeams.filter(
        t => t.status === 'ready' && (t.leader?._id?.toString() === userId || t.leader?.toString() === userId)
      );
      setMyTeams(readyLeaderTeams);
      setHasReadyButNotLeader(allReadyTeams.length > 0 && readyLeaderTeams.length === 0);
      if (!autoTeamId && readyLeaderTeams.length > 0) {
        setAutoTeamId(readyLeaderTeams[0]._id);
      }
    } catch {
      showToast.error('Failed to load opponent teams');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [formatFilter, userId, autoTeamId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Load venues for auto matchmaking
  useEffect(() => {
    (async () => {
      try {
        setLoadingVenues(true);
        const res = await getAllVenues({ limit: 50 });
        const list = res.data || res || [];
        setVenues(list);
        if (!autoVenueId && list.length > 0) {
          setAutoVenueId(list[0]._id);
        }
      } catch {
        setVenues([]);
      } finally {
        setLoadingVenues(false);
      }
    })();
  }, []);

  // Poll team matchmaking status when searching
  useEffect(() => {
    if (autoStatus !== 'searching' || !autoTeamId) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    const poll = async () => {
      try {
        const res = await getTeamMatchStatus(autoTeamId);
        const data = res.data || res;
        if (data?.data?.matched && data.data.match) {
          setAutoMatch(data.data.match);
          setAutoStatus('matched');
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      } catch {
        // ignore transient errors
      }
    };
    pollRef.current = setInterval(poll, 3000);
    poll();
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [autoStatus, autoTeamId]);

  const filtered = opponents.filter(t =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase())
  );

  const openChallengeModal = (opponent) => {
    setSelectedOpponent(opponent);
    // Pre-select a compatible team (same format) if available
    const compatible = myTeams.find(t => t.matchFormat === opponent.matchFormat);
    setSelectedMyTeam(compatible?._id || (myTeams[0]?._id || ''));
    setChallengeMsg('');
    setChallengeModal(true);
  };

  const handleSendChallenge = async () => {
    if (!selectedMyTeam) {
      showToast.error('Please select one of your teams first');
      return;
    }
    try {
      setSending(true);
      await sendChallenge(selectedMyTeam, selectedOpponent._id, challengeMsg);
      showToast.success(`Challenge sent to "${selectedOpponent.name}"!`);
      setChallengeModal(false);
      fetchData(true);
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed to send challenge');
    } finally {
      setSending(false);
    }
  };

  const selectedTeamObj = myTeams.find(t => t._id === selectedMyTeam);
  const formatMismatch  = selectedTeamObj && selectedOpponent && selectedTeamObj.matchFormat !== selectedOpponent.matchFormat;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <button onClick={() => navigate('/player/matchmaking')}
              className="flex items-center text-gray-500 hover:text-gray-800 mb-4 text-sm font-medium transition">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Matchmaking
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Swords className="w-6 h-6 text-red-500" /> Find Opponents
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Browse ready teams, send match challenges, or use automatic matchmaking to find an opponent.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/player/matches/challenges')}
                  className="px-4 py-2 border border-emerald-200 bg-emerald-50 rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                >
                  My Challenges
                </button>
              </div>
            </div>
          </div>

          {/* Auto Matchmaking (Team vs Team) */}
          {myTeams.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Swords className="w-5 h-5 text-emerald-600" /> Automatic Matchmaking
                  </h2>
                  <p className="text-xs text-gray-500">
                    Your team will be paired with another full team searching for the same venue, date and time.
                  </p>
                </div>
                {autoStatus === 'searching' && (
                  <span className="flex items-center gap-2 text-xs text-amber-600">
                    <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                  </span>
                )}
                {autoStatus === 'matched' && (
                  <span className="flex items-center gap-2 text-xs text-emerald-600">
                    <CheckCircle className="w-4 h-4" /> Opponent found
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Your team</label>
                  <select
                    value={autoTeamId}
                    onChange={e => { setAutoTeamId(e.target.value); setAutoStatus('idle'); setAutoMatch(null); }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {myTeams.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.name} · {t.matchFormat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Venue</label>
                  <select
                    value={autoVenueId}
                    onChange={e => setAutoVenueId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {venues.map(v => (
                      <option key={v._id} value={v._id}>{v.venueName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={autoDate}
                    onChange={e => setAutoDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time slot</label>
                  <div className="flex gap-1">
                    <input
                      type="time"
                      value={autoStartTime}
                      onChange={e => setAutoStartTime(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm"
                    />
                    <span className="text-gray-400 text-xs self-center">to</span>
                    <input
                      type="time"
                      value={autoEndTime}
                      onChange={e => setAutoEndTime(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Team must be full and in <span className="font-semibold">ready</span> status. Only leaders can start matchmaking.
                </div>
                {autoStatus === 'searching' ? (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await cancelTeamMatchmaking(autoTeamId);
                        setAutoStatus('idle');
                        setAutoMatch(null);
                        showToast.success('Matchmaking cancelled');
                      } catch (e) {
                        showToast.error(e.response?.data?.message || 'Failed to cancel');
                      }
                    }}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancel search
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={autoLoading || !autoTeamId || !autoVenueId || !autoDate || loadingVenues}
                    onClick={async () => {
                      try {
                        setAutoLoading(true);
                        setAutoMatch(null);
                        const res = await findOpponentForTeam({
                          teamId: autoTeamId,
                          venueId: autoVenueId,
                          date: autoDate,
                          startTime: autoStartTime,
                          endTime: autoEndTime
                        });
                        const data = res.data || res;
                        if (data.matched && data.data?.match) {
                          setAutoMatch(data.data.match);
                          setAutoStatus('matched');
                          showToast.success('Opponent found!');
                        } else {
                          setAutoStatus('searching');
                          showToast.success('Searching for opponent...');
                        }
                      } catch (e) {
                        showToast.error(e.response?.data?.message || 'Failed to start matchmaking');
                        setAutoStatus('idle');
                      } finally {
                        setAutoLoading(false);
                      }
                    }}
                    className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {autoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
                    Find Opponent
                  </button>
                )}
              </div>

              {autoMatch && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Opponent found!</p>
                  <div className="flex flex-col md:flex-row gap-3 text-sm text-gray-700">
                    <div className="flex-1">
                      <span className="font-medium">Team A:</span> {autoMatch.teamA?.name}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">Team B:</span> {autoMatch.teamB?.name}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">Venue:</span> {autoMatch.venue?.venueName || 'Selected venue'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info for readiness / role */}
          {!loading && myTeams.length === 0 && !hasReadyButNotLeader && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Your team isn't ready yet</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  You need a full, ready team in <span className="font-semibold">ready</span> status before you can challenge opponents or book a match.{' '}
                  <button onClick={() => navigate('/player/teams')} className="underline font-medium">View my teams →</button>
                </p>
              </div>
            </div>
          )}

          {!loading && hasReadyButNotLeader && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">You are not the Team Leader</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Only your Team Leader can challenge opponent teams and book matches for the team. You can still browse opponents and view upcoming challenges and bookings.
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search team name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Format filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <label className="text-xs text-gray-500 font-medium">Format</label>
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                className="min-w-[110px] px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <Swords className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No opponent teams found</h3>
              <p className="text-sm text-gray-400">Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-3">{filtered.length} team{filtered.length !== 1 ? 's' : ''} available</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(team => {
                  const filled = team.players?.length || 0;
                  const isFull = filled >= team.maxPlayers;
                  return (
                    <div key={team._id}
                      className="bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 overflow-hidden group"
                    >
                      {/* Card header */}
                      <div className="p-5 pb-3">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base truncate">{team.name}</h3>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{team.description || 'No description'}</p>
                          </div>
                          <span className={`ml-2 px-2 py-1 rounded-lg text-xs font-semibold border ${FORMAT_COLORS[team.matchFormat] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            {team.matchFormat}
                          </span>
                        </div>

                      </div>

                      {/* Players */}
                      <div className="px-5 pb-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Players</span>
                          <span className={`font-semibold ${isFull ? 'text-emerald-600' : 'text-gray-700'}`}>
                            {filled}/{team.maxPlayers}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                          <div
                            className="h-1.5 rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${(filled / (team.maxPlayers || 1)) * 100}%` }}
                          />
                        </div>

                        {/* Leader */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                            {team.leader?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-700">{team.leader?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-400">Team Leader</p>
                          </div>
                        </div>

                        {/* Challenge button */}
                        <button
                          onClick={() => openChallengeModal(team)}
                          disabled={myTeams.length === 0}
                          className="w-full py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl text-sm font-semibold hover:from-red-600 hover:to-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                        >
                          <Swords className="w-4 h-4" /> Challenge
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Challenge Modal ─────────────────────────────── */}
      {challengeModal && selectedOpponent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Swords className="w-7 h-7" />
                <button onClick={() => setChallengeModal(false)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-xl font-bold">Send Match Challenge</h2>
              <p className="text-red-100 text-sm mt-1">
                Challenging <span className="font-semibold text-white">"{selectedOpponent.name}"</span>
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Opponent info */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold">
                  {selectedOpponent.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedOpponent.name}</p>
                  <p className="text-xs text-gray-500">
                    {selectedOpponent.matchFormat} · Led by {selectedOpponent.leader?.name}
                  </p>
                </div>
              </div>

              {/* Select your team */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challenge with your team <span className="text-red-500">*</span>
                </label>
                {myTeams.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                    You have no ready teams to challenge with.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myTeams.map(t => {
                      const mismatch = t.matchFormat !== selectedOpponent.matchFormat;
                      return (
                        <label key={t._id}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                            selectedMyTeam === t._id
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${mismatch ? 'opacity-60' : ''}`}
                        >
                          <input
                            type="radio"
                            name="myTeam"
                            value={t._id}
                            checked={selectedMyTeam === t._id}
                            onChange={() => setSelectedMyTeam(t._id)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                            selectedMyTeam === t._id ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                          }`}>
                            {selectedMyTeam === t._id && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{t.name}</p>
                            <p className="text-xs text-gray-400">{t.matchFormat} · {t.players?.length}/{t.maxPlayers} players</p>
                          </div>
                          {mismatch && (
                            <span className="text-xs text-orange-500 font-medium">Format mismatch</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Format mismatch warning */}
              {formatMismatch && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-700">
                    Format mismatch! Your team is <strong>{selectedTeamObj.matchFormat}</strong> but the opponent is <strong>{selectedOpponent.matchFormat}</strong>. Challenge will be rejected.
                  </p>
                </div>
              )}

              {/* Optional message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challenge message <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={challengeMsg}
                  onChange={e => setChallengeMsg(e.target.value)}
                  placeholder="e.g. Good luck! May the best team win 🔥"
                  rows={2}
                  maxLength={200}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setChallengeModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button
                  onClick={handleSendChallenge}
                  disabled={sending || !selectedMyTeam || formatMismatch}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl text-sm font-semibold hover:from-red-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? 'Sending…' : 'Send Challenge'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}