import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import {
  Users, ArrowLeft, Crown, Loader2, UserPlus, Check, X, Globe, Lock, Calendar
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import matchmakingService from '../../store/matchmakingService';
import { showToast } from '../../FutsalOwner/components/Toast';

const TeamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteModal, setInviteModal] = useState(false);
  const [browsePlayers, setBrowsePlayers] = useState([]);
  const [loadingInvite, setLoadingInvite] = useState(false);

  const currentUserId = user?._id?.toString?.() || user?.id?.toString?.();
  const isLeader = team && (team.leader?._id?.toString?.() === currentUserId || team.leader?.toString?.() === currentUserId);

  useEffect(() => {
    if (id) load();
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await matchmakingService.getTeamById(id);
      setTeam(res.data);
    } catch (e) {
      console.error(e);
      showToast.error('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (inviteUserId) => {
    try {
      setLoadingInvite(true);
      await matchmakingService.inviteToTeam(id, inviteUserId);
      showToast.success('Player invited');
      setInviteModal(false);
      load();
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Invite failed');
    } finally {
      setLoadingInvite(false);
    }
  };

  const openInviteModal = async () => {
    setInviteModal(true);
    try {
      const res = await matchmakingService.getBrowsePlayersForInvite(id);
      setBrowsePlayers(res.data || []);
    } catch (e) {
      setBrowsePlayers([]);
    }
  };

  const handleApproveRequest = async (requestId, approve) => {
    try {
      await matchmakingService.approveJoinRequest(id, requestId, approve);
      showToast.success(approve ? 'Request approved' : 'Request rejected');
      load();
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed');
    }
  };

  const handleTogglePublic = async () => {
    try {
      await matchmakingService.setTeamPublic(id, !team.isPublic);
      showToast.success(team.isPublic ? 'Team is now private' : 'Team is now public');
      load();
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed');
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Leave this team?')) return;
    try {
      await matchmakingService.leaveTeam(id);
      showToast.success('Left team');
      navigate('/player/teams');
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed');
    }
  };

  if (loading || !team) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  const members = [
    ...(team.leader ? [{ user: team.leader, role: 'leader' }] : []),
    ...(team.players || []).filter(p => p.user?._id?.toString() !== team.leader?._id?.toString())
  ];
  const pendingRequests = (team.joinRequests || []).filter(r => r.status === 'pending');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
      <div
        className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/player/teams')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to My Teams
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                <p className="text-gray-600 mt-1">
                  {members.length}/{team.maxPlayers} players · {team.matchFormat} · {team.skillLevel}
                </p>
                {team.description && <p className="text-gray-500 text-sm mt-2">{team.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                {team.isPublic ? (
                  <span className="flex items-center gap-1 text-sm text-gray-600"><Globe className="w-4 h-4" /> Public</span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-gray-600"><Lock className="w-4 h-4" /> Private</span>
                )}
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{team.status}</span>
              </div>
            </div>

            {isLeader && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={openInviteModal}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> Invite players
                </button>
                <button
                  onClick={handleTogglePublic}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                >
                  {team.isPublic ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  {team.isPublic ? 'Make private' : 'Make public'}
                </button>
                {team.status === 'forming' && members.length >= team.maxPlayers && (
                  <button
                    onClick={() => navigate(`/player/teams/${id}/confirm-booking`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" /> Confirm booking
                  </button>
                )}
                {team.status === 'booked' && team.bookingRef && (
                  <button
                    onClick={() => navigate(`/player/bookings/${team.bookingRef}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    View booking
                  </button>
                )}
              </div>
            )}

            {!isLeader && (
              <button
                onClick={handleLeave}
                className="mt-4 text-sm text-red-600 hover:text-red-700"
              >
                Leave team
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Members</h2>
            <ul className="space-y-2">
              {members.map((m) => (
                <li key={m.user?._id || m.user} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="flex items-center gap-2">
                    {m.role === 'leader' && <Crown className="w-4 h-4 text-amber-500" />}
                    {m.user?.name || 'Unknown'} {m.position && m.position !== 'Any' && `· ${m.position}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {isLeader && pendingRequests.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">Join requests</h2>
              <ul className="space-y-2">
                {pendingRequests.map((r) => (
                  <li key={r._id} className="flex items-center justify-between py-2">
                    <span>{r.user?.name || 'Unknown'}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(r._id, true)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleApproveRequest(r._id, false)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {inviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Invite player</h3>
              <button onClick={() => setInviteModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {browsePlayers.length === 0 ? (
                <p className="text-gray-500 text-sm">No other players to invite, or they are already in the team.</p>
              ) : (
                <ul className="space-y-2">
                  {browsePlayers.map((p) => (
                    <li key={p._id} className="flex justify-between items-center py-2">
                      <span>{p.name} ({p.email})</span>
                      <button
                        onClick={() => handleInvite(p._id)}
                        disabled={loadingInvite}
                        className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Invite
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetailPage;
