// src/pages/player/TeamMatchMaking/TeamInvitePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import {
  Users, ArrowLeft, Crown, Loader2, CheckCircle, XCircle,
  Shield, Clock, Trophy, ChevronRight, UserCheck, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import matchmakingService from '../../store/matchmakingService';
import { showToast } from '../../FutsalOwner/components/Toast';

const SKILL_COLORS = {
  Beginner: 'bg-green-100 text-green-700 border border-green-200',
  Intermediate: 'bg-blue-100 text-blue-700 border border-blue-200',
  Advanced: 'bg-purple-100 text-purple-700 border border-purple-200'
};

const FORMAT_INFO = {
  '5v5': { label: '5 vs 5', desc: 'Standard futsal — 5 players per side', icon: '⚽' },
  '7v7': { label: '7 vs 7', desc: 'Large field format — 7 players per side', icon: '🏟️' },
  '1v1': { label: '1 vs 1', desc: 'One-on-one challenge', icon: '🎯' }
};

function TimeRemaining({ expiresAt }) {
  const [remaining, setRemaining] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const diff = new Date(expiresAt) - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setRemaining('Expired');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins}m ${secs}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return null;
  return (
    <span className={`flex items-center gap-1 text-sm font-medium ${expired ? 'text-red-600' : 'text-amber-600'}`}>
      <Clock className="w-4 h-4" />
      {expired ? 'Invitation expired' : `Expires in ${remaining}`}
    </span>
  );
}

const TeamInvitePage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [team, setTeam] = useState(null);
  const [inviteInfo, setInviteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [decided, setDecided] = useState(null); // 'accepted' | 'declined'

  const currentUserId = user?._id?.toString?.() || user?.id?.toString?.();

  useEffect(() => {
    if (teamId) loadInviteData();
  }, [teamId]);

  const loadInviteData = async () => {
    try {
      setLoading(true);
      // Load team details (accessible if you have a pending invite)
      const teamRes = await matchmakingService.getTeamById(teamId);
      const teamData = teamRes.data;
      setTeam(teamData);

      // Find our invite in joinRequests
      const myInvite = teamData.joinRequests?.find(
        r => r.user?._id?.toString() === currentUserId && r.type === 'invite' && r.status === 'pending'
      );
      setInviteInfo(myInvite || null);
    } catch (e) {
      showToast.error('Could not load invitation details');
      navigate('/player/matchmaking');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (accept) => {
    try {
      setResponding(true);
      await matchmakingService.respondToInvite(teamId, accept);
      setDecided(accept ? 'accepted' : 'declined');
      if (accept) {
        showToast.success(`Welcome to ${team?.name}! 🎉`);
      } else {
        showToast.info('Invitation declined.');
      }
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed to respond. Please try again.');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading invitation...</p>
        </div>
      </div>
    );
  }

  const members = team
    ? [
        ...(team.leader ? [{ user: team.leader, role: 'leader' }] : []),
        ...(team.players || []).filter(
          p => p.user?._id?.toString() !== team.leader?._id?.toString()
        )
      ]
    : [];
  const spotsLeft = team ? team.maxPlayers - members.length : 0;
  const formatInfo = FORMAT_INFO[team?.matchFormat] || FORMAT_INFO['5v5'];
  const isExpired = inviteInfo?.expiresAt && new Date(inviteInfo.expiresAt) < Date.now();

  // ── Post-decision screen ─────────────────────────────────────────
  if (decided) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div
          className={`flex-1 flex items-center justify-center p-6 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
          style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 max-w-md w-full text-center">
            {decided === 'accepted' ? (
              <>
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You're in the team!</h2>
                <p className="text-gray-600 mb-6">
                  You've joined <span className="font-semibold text-emerald-700">{team?.name}</span>. Your team leader
                  has been notified.
                </p>
                <button
                  onClick={() => navigate(`/player/teams/${teamId}`)}
                  className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" /> Go to Team Page
                </button>
                <button
                  onClick={() => navigate('/player/matchmaking')}
                  className="w-full mt-3 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Back to Matchmaking
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <XCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Declined</h2>
                <p className="text-gray-600 mb-6">
                  You declined the invitation to <span className="font-semibold">{team?.name}</span>. The leader has
                  been notified.
                </p>
                <button
                  onClick={() => navigate('/player/matchmaking')}
                  className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
                >
                  Back to Matchmaking
                </button>
                <button
                  onClick={() => navigate('/player/matchmaking/browse-teams')}
                  className="w-full mt-3 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Browse Other Teams
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/player/matchmaking')}
            className="flex items-center text-gray-500 hover:text-gray-900 mb-5 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Matchmaking
          </button>

          {/* Invitation Banner */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-emerald-100 text-sm font-medium">You have been invited</p>
                <h1 className="text-xl font-bold">Join {team?.name}</h1>
              </div>
            </div>
            <p className="text-emerald-100 text-sm mt-3">
              <span className="font-semibold text-white">{team?.leader?.name}</span> wants you on their team. Review the
              details below and decide.
            </p>
            {inviteInfo?.expiresAt && (
              <div className="mt-3 bg-white/10 rounded-lg px-3 py-2 inline-flex">
                <TimeRemaining expiresAt={inviteInfo.expiresAt} />
              </div>
            )}
          </div>

          {/* Expired Warning */}
          {isExpired && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-5">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-700">Invitation Expired</p>
                <p className="text-sm text-red-600 mt-1">
                  This invitation is no longer valid. The leader can send a new invitation if the spot is still open.
                </p>
                <button
                  onClick={() => navigate('/player/matchmaking')}
                  className="mt-2 text-sm text-red-700 font-medium underline"
                >
                  Back to Matchmaking
                </button>
              </div>
            </div>
          )}

          {/* No pending invite (maybe already responded) */}
          {!inviteInfo && !isExpired && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-5">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                No pending invitation found. You may have already responded or the invitation was cancelled.
              </p>
            </div>
          )}

          {/* Team Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-5">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{team?.name}</h2>
                  {team?.description && (
                    <p className="text-gray-500 text-sm mt-1">{team.description}</p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    SKILL_COLORS[team?.skillLevel] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {team?.skillLevel}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Match Format */}
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-2xl">{formatInfo.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900">{formatInfo.label}</p>
                  <p className="text-sm text-gray-500">{formatInfo.desc}</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center bg-gray-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Current Players</p>
                </div>
                <div className="text-center bg-gray-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-gray-900">{team?.maxPlayers}</p>
                  <p className="text-xs text-gray-500 mt-1">Team Size</p>
                </div>
                <div className={`text-center rounded-xl p-3 ${spotsLeft > 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <p className={`text-2xl font-bold ${spotsLeft > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {spotsLeft}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Spots Open</p>
                </div>
              </div>

              {/* Fill progress bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Team filled</span>
                  <span>{members.length}/{team?.maxPlayers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${(members.length / (team?.maxPlayers || 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Leader */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Team Leader</p>
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center font-bold text-amber-800 text-sm">
                    {team?.leader?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{team?.leader?.name}</p>
                      <Crown className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-xs text-gray-500">{team?.leader?.email}</p>
                  </div>
                </div>
              </div>

              {/* Members */}
              {members.filter(m => m.role !== 'leader').length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Current Members ({members.length - 1})
                  </p>
                  <div className="space-y-2">
                    {members
                      .filter(m => m.role !== 'leader')
                      .map((m, i) => (
                        <div
                          key={m.user?._id || i}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-semibold text-emerald-700">
                            {m.user?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{m.user?.name || 'Unknown'}</p>
                            {m.position && m.position !== 'Any' && (
                              <p className="text-xs text-gray-400">{m.position}</p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Your invited position */}
              {inviteInfo?.position && inviteInfo.position !== 'Any' && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Your invited position</p>
                    <p className="text-sm text-blue-600">{inviteInfo.position}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!isExpired && inviteInfo && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleRespond(false)}
                disabled={responding}
                className="px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {responding ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400" />
                    Decline
                  </>
                )}
              </button>
              <button
                onClick={() => handleRespond(true)}
                disabled={responding || spotsLeft <= 0}
                className="px-6 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-emerald-200"
              >
                {responding ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {spotsLeft <= 0 ? 'Team Full' : 'Accept & Join'}
                  </>
                )}
              </button>
            </div>
          )}

          {spotsLeft <= 0 && !isExpired && (
            <p className="text-center text-sm text-red-500 mt-3">
              This team is now full and cannot accept more players.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamInvitePage;