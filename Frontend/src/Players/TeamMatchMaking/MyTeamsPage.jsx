// src/pages/player/TeamMatchMaking/MyTeamsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import { Users, ArrowLeft, Trophy, Loader2, Crown, Plus, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import matchmakingService from '../../store/matchmakingService';
import { showToast } from '../../FutsalOwner/components/Toast';

const STATUS_CONFIG = {
  forming: { label: 'Forming',  bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
  ready:   { label: 'Ready!',   bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  booked:  { label: 'Booked',   bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  cancelled:{ label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-500',   dot: 'bg-gray-400'   },
};

const SKILL_CONFIG = {
  Beginner:     { bg: 'bg-green-100',  text: 'text-green-700'  },
  Intermediate: { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  Advanced:     { bg: 'bg-purple-100', text: 'text-purple-700' },
};

const MyTeamsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = user?._id?.toString?.() || user?.id?.toString?.();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await matchmakingService.getMyTeams();
      setTeams(res.data || []);
    } catch {
      showToast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  // Leader is already inside team.players (role: 'leader')
  // So team.players.length IS the full count — don't add 1
  const getPlayerCount = (team) => team.players?.length || 0;

  const amILeader = (team) => {
    const leaderId = team.leader?._id?.toString?.() || team.leader?.toString?.();
    return leaderId === currentUserId;
  };

  const statusCfg   = (s) => STATUS_CONFIG[s]   || STATUS_CONFIG.forming;
  const skillCfg    = (s) => SKILL_CONFIG[s]     || { bg: 'bg-gray-100', text: 'text-gray-600' };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <button
            onClick={() => navigate('/player/matchmaking')}
            className="flex items-center text-gray-500 hover:text-gray-800 mb-5 text-sm font-medium transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Matchmaking
          </button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Teams</h1>
              <p className="text-gray-500 text-sm mt-1">Manage your active teams</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={load}
                className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-500"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/player/matchmaking/create-team')}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> New Team
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>

          ) : teams.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-14 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No teams yet</h3>
              <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                Create your own team and start inviting players, or browse existing teams to join.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/player/matchmaking/create-team')}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
                >
                  Create Team
                </button>
                <button
                  onClick={() => navigate('/player/matchmaking/browse-teams')}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  Browse Teams
                </button>
              </div>
            </div>

          ) : (
            <div className="space-y-3">
              {teams.map((team) => {
                const playerCount = getPlayerCount(team);
                const isFull      = playerCount >= team.maxPlayers;
                const fillPct     = Math.min((playerCount / team.maxPlayers) * 100, 100);
                const sc          = statusCfg(team.status);
                const skc         = skillCfg(team.skillLevel);
                const isLeader    = amILeader(team);

                return (
                  <div
                    key={team._id}
                    onClick={() => navigate(`/player/teams/${team._id}`)}
                    className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">

                      {/* Left: icon + info */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isFull ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                          <Users className={`w-6 h-6 ${isFull ? 'text-emerald-600' : 'text-gray-500'}`} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 truncate">{team.name}</h3>
                            {isLeader && (
                              <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex-shrink-0">
                                <Crown className="w-3 h-3" /> Leader
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {/* Status */}
                            <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              {sc.label}
                            </span>

                            {/* Skill */}
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${skc.bg} ${skc.text}`}>
                              {team.skillLevel}
                            </span>

                            {/* Format */}
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {team.matchFormat}
                            </span>
                          </div>

                          {/* Leader name (for non-leaders) */}
                          {!isLeader && (
                            <p className="text-xs text-gray-400 mt-1">
                              Leader: <span className="text-gray-600 font-medium">{team.leader?.name || 'Unknown'}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: player count + arrow */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-700">
                          {playerCount}<span className="text-gray-400 font-normal">/{team.maxPlayers}</span>
                        </span>
                        <span className="text-emerald-600 text-sm font-medium group-hover:translate-x-0.5 transition-transform">
                          →
                        </span>
                      </div>
                    </div>

                    {/* Fill progress bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${isFull ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-400">
                          {isFull
                            ? '✓ Team full — ready to book!'
                            : `${team.maxPlayers - playerCount} spot${team.maxPlayers - playerCount !== 1 ? 's' : ''} remaining`}
                        </p>
                        {team.isPublic && (
                          <p className="text-xs text-gray-400">Public</p>
                        )}
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

export default MyTeamsPage;