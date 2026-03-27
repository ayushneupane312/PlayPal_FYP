// src/pages/player/TeamMatchMaking/TeamDetailPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import {
  Users, ArrowLeft, Crown, Loader2, UserPlus, Globe,
  Calendar, Clock, CheckCircle, XCircle, Send, AlertCircle, Trash2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import matchmakingService from '../../store/matchmakingService';
import { showToast } from '../../FutsalOwner/components/Toast';

// Live countdown for pending invite expiry
function InviteExpiry({ expiresAt }) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = new Date(expiresAt) - Date.now();
      if (diff <= 0) { setLabel('Expired'); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLabel(`${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  if (!expiresAt) return null;
  const expired = label === 'Expired';
  return (
    <span className={`flex items-center gap-1 text-xs ${expired ? 'text-red-400' : 'text-amber-500'}`}>
      <Clock className="w-3 h-3" /> {expired ? 'Expired' : `Expires in ${label}`}
    </span>
  );
}

const STATUS_STYLE = {
  forming:   'bg-amber-100 text-amber-700',
  ready:     'bg-emerald-100 text-emerald-700',
  booked:    'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const TeamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Invite modal
  const [inviteModal, setInviteModal] = useState(false);
  const [browsePlayers, setBrowsePlayers] = useState([]);
  const [inviteSearch, setInviteSearch] = useState('');
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(null);

  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Kick member
  const [kickingMember, setKickingMember] = useState(null); // userId being kicked

  const currentUserId = user?._id?.toString?.() || user?.id?.toString?.();
  const isLeader = team && (
    team.leader?._id?.toString?.() === currentUserId ||
    team.leader?.toString?.() === currentUserId
  );

  useEffect(() => { if (id) load(); }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await matchmakingService.getTeamById(id);
      setTeam(res.data);
    } catch {
      showToast.error('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const openInviteModal = async () => {
    setInviteModal(true);
    setInviteSearch('');
    try {
      setLoadingPlayers(true);
      const res = await matchmakingService.getBrowsePlayersForInvite(id);
      setBrowsePlayers(res.data || []);
    } catch {
      setBrowsePlayers([]);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const handleInvite = async (inviteUserId, playerName) => {
    try {
      setSendingInvite(inviteUserId);
      await matchmakingService.inviteToTeam(id, inviteUserId);
      showToast.success(`Invitation sent to ${playerName}!`);
      load();
      setBrowsePlayers(prev => prev.filter(p => p._id !== inviteUserId));
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed to send invite');
    } finally {
      setSendingInvite(null);
    }
  };

  const handleApproveRequest = async (requestId, approve) => {
    try {
      await matchmakingService.approveJoinRequest(id, requestId, approve);
      showToast.success(approve ? 'Player added to team!' : 'Request rejected');
      load();
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed');
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    try {
      await matchmakingService.leaveTeam(id);
      showToast.success('You left the team');
      navigate('/player/teams');
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed');
    }
  };

  const handleKick = async (kickUserId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from the team?`)) return;
    try {
      setKickingMember(kickUserId);
      await matchmakingService.kickMember(id, kickUserId);
      showToast.success(`${memberName} has been removed from the team`);
      load();
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed to remove player');
    } finally {
      setKickingMember(null);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await matchmakingService.deleteTeam(id);
      showToast.success('Team deleted successfully');
      navigate('/player/teams');
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed to delete team');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading || !team) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Build deduplicated members list
  // The leader is already inside team.players with role:'leader'.
  // We just display team.players directly to avoid any duplication.
  const allMembers = team.players || [];

  // Separate join requests by type so invites the LEADER sent never
  // appear in the "join requests" section (which is player-initiated only).
  // Handle old DB records where `type` may be undefined — treat those as 'request'.
  const pendingJoinRequests = (team.joinRequests || []).filter(
    r => r.status === 'pending' && (r.type === 'request' || !r.type)
  );
  // Pending invites = leader sent → player hasn't responded yet
  const pendingInvites = (team.joinRequests || []).filter(
    r => r.status === 'pending' && r.type === 'invite'
  );

  const filteredBrowse = browsePlayers.filter(p =>
    p.name?.toLowerCase().includes(inviteSearch.toLowerCase()) ||
    p.email?.toLowerCase().includes(inviteSearch.toLowerCase())
  );

  const spotsLeft = team.maxPlayers - allMembers.length;
  const isFull = spotsLeft <= 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate('/player/teams')} className="flex items-center text-gray-500 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to My Teams
          </button>

          {/* ── Team Header ────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Users className="w-3.5 h-3.5" />
                    {allMembers.length}/{team.maxPlayers} players
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {team.matchFormat}
                  </span>
                </div>
                {team.description && <p className="text-gray-400 text-sm mt-2">{team.description}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Globe className="w-3.5 h-3.5" /> Public
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[team.status] || 'bg-gray-100 text-gray-500'}`}>
                    {team.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Fill bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Team filled</span>
                <span>{allMembers.length}/{team.maxPlayers}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${isFull ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                  style={{ width: `${(allMembers.length / (team.maxPlayers || 1)) * 100}%` }}
                />
              </div>
              {isFull && (
                <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Team is full!
                </p>
              )}
            </div>

            {/* Leader actions */}
            {isLeader && (
              <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100">
                {!isFull && (
                  <button onClick={openInviteModal}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Invite Players
                  </button>
                )}
                {team.status !== 'booked' && isFull && (
                  <button onClick={() => navigate(`/player/teams/${id}/confirm-booking`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Confirm Booking
                  </button>
                )}
                {team.status === 'booked' && team.bookingRef && (
                  <button onClick={() => navigate(`/player/bookings/${team.bookingRef}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    View Booking
                  </button>
                )}
                {/* Delete — only if not booked */}
                {team.status !== 'booked' && (
                  <button onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 border border-red-200 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center gap-2 ml-auto">
                    <Trash2 className="w-4 h-4" /> Delete Team
                  </button>
                )}
              </div>
            )}

            {/* Non-leader: leave button */}
            {!isLeader && (
              <button onClick={handleLeave} className="mt-4 text-sm text-red-500 hover:text-red-700 font-medium">
                Leave team
              </button>
            )}
          </div>

          {/* ── Members ────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" /> Members ({allMembers.length})
            </h2>
            <ul className="space-y-2">
              {allMembers.map((m, i) => {
                const memberId = m.user?._id?.toString() || m.user?.toString();
                const isSelf = memberId === currentUserId;
                const isThisLeader = m.role === 'leader';
                return (
                  <li key={m.user?._id || i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">
                      {m.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 text-sm">{m.user?.name || 'Unknown'}</span>
                        {isThisLeader && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-600 font-medium">
                            <Crown className="w-3 h-3" /> Leader
                          </span>
                        )}
                        {isSelf && !isThisLeader && (
                          <span className="text-xs text-gray-400">(you)</span>
                        )}
                      </div>
                      {m.position && m.position !== 'Any' && <p className="text-xs text-gray-400">{m.position}</p>}
                    </div>
                    {/* Leader can kick non-leader members (not themselves) */}
                    {isLeader && !isThisLeader && team.status !== 'booked' && (
                      <button
                        onClick={() => handleKick(memberId, m.user?.name)}
                        disabled={kickingMember === memberId}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title={`Remove ${m.user?.name} from team`}
                      >
                        {kickingMember === memberId
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <XCircle className="w-4 h-4" />
                        }
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ── Pending Invites (sent by leader, awaiting player response) ── */}
          {isLeader && pendingInvites.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 mb-5">
              <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-500" />
                Invitations Sent
                <span className="ml-1 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingInvites.length} awaiting response
                </span>
              </h2>
              <p className="text-xs text-gray-400 mb-4">These players have been invited and haven't responded yet.</p>
              <ul className="space-y-2">
                {pendingInvites.map((r) => (
                  <li key={r._id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-sm font-semibold text-amber-600">
                        {r.user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{r.user?.name || 'Unknown'}</p>
                        {r.position && r.position !== 'Any' && (
                          <p className="text-xs text-gray-400">Invited as {r.position}</p>
                        )}
                      </div>
                    </div>
                    <InviteExpiry expiresAt={r.expiresAt} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Join Requests (player-initiated, leader approves) ── */}
          {isLeader && pendingJoinRequests.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                Join Requests
                <span className="ml-1 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingJoinRequests.length} pending
                </span>
              </h2>
              <ul className="space-y-2">
                {pendingJoinRequests.map((r) => (
                  <li key={r._id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm font-semibold text-blue-600">
                        {r.user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{r.user?.name || 'Unknown'}</p>
                        {r.position && r.position !== 'Any' && (
                          <p className="text-xs text-gray-400">Position: {r.position}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveRequest(r._id, true)}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button onClick={() => handleApproveRequest(r._id, false)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 flex items-center gap-1 text-gray-600">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ── Invite Modal ──────────────────────────────── */}
      {inviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Invite Players</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left · Invitation expires in 30 min
                </p>
              </div>
              <button onClick={() => setInviteModal(false)} className="text-gray-400 hover:text-gray-700 font-bold text-lg">✕</button>
            </div>
            <div className="p-4 border-b border-gray-50">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={inviteSearch}
                onChange={e => setInviteSearch(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {loadingPlayers ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
              ) : filteredBrowse.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">{inviteSearch ? 'No players match.' : 'No available players to invite.'}</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {filteredBrowse.map((p) => (
                    <li key={p._id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                          {p.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleInvite(p._id, p.name)}
                        disabled={sendingInvite === p._id}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {sendingInvite === p._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        {sendingInvite === p._id ? 'Sending...' : 'Invite'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Team?</h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              You are about to permanently delete <span className="font-semibold text-gray-800">"{team.name}"</span>.
            </p>
            <p className="text-xs text-gray-400 text-center mb-6">
              All members will be notified. This cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetailPage;