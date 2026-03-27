// src/pages/player/TeamMatchMaking/MyInvitationsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import {
  ArrowLeft, Users, Crown, Loader2, Clock, ChevronRight,
  Trophy, Bell, CheckCircle, XCircle
} from 'lucide-react';
import matchmakingService from '../../store/matchmakingService';
import { showToast } from '../../FutsalOwner/components/Toast';

function TimeRemaining({ expiresAt }) {
  const [remaining, setRemaining] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const diff = new Date(expiresAt) - Date.now();
      if (diff <= 0) { setExpired(true); setRemaining('Expired'); return; }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins}m ${secs}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${expired ? 'text-red-500' : 'text-amber-600'}`}>
      <Clock className="w-3 h-3" />
      {expired ? 'Expired' : `${remaining} left`}
    </span>
  );
}

const MyInvitationsPage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null); // teamId being responded to

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await matchmakingService.getMyInvitations();
      setInvitations(res.data || []);
    } catch (e) {
      showToast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (teamId, teamName, accept) => {
    try {
      setResponding(teamId);
      await matchmakingService.respondToInvite(teamId, accept);
      showToast.success(accept ? `Welcome to ${teamName}! 🎉` : 'Invitation declined.');
      if (accept) {
        navigate(`/player/teams/${teamId}`);
      } else {
        load(); // Refresh list
      }
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed to respond');
    } finally {
      setResponding(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/player/matchmaking')}
            className="flex items-center text-gray-500 hover:text-gray-900 mb-5"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Matchmaking
          </button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Invitations</h1>
              <p className="text-gray-500 text-sm mt-1">Teams that have invited you to join</p>
            </div>
            {invitations.length > 0 && (
              <span className="bg-emerald-100 text-emerald-700 text-sm font-semibold px-3 py-1 rounded-full">
                {invitations.length} pending
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-14 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No pending invitations</h3>
              <p className="text-gray-400 text-sm mb-6">
                When a team leader invites you to join their team, it will appear here.
              </p>
              <button
                onClick={() => navigate('/player/matchmaking/browse-teams')}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 text-sm"
              >
                Browse Teams Instead
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((inv) => {
                const isExpired = inv.expiresAt && new Date(inv.expiresAt) < Date.now();
                const isResponding = responding === inv.team._id;
                const spotsLeft = inv.team.maxPlayers - inv.team.currentPlayers;

                return (
                  <div
                    key={inv.inviteId}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition ${
                      isExpired ? 'opacity-60 border-gray-200' : 'border-gray-200 hover:shadow-md'
                    }`}
                  >
                    {/* Top section */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-gray-900 text-lg">{inv.team.name}</h3>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <Crown className="w-3.5 h-3.5 text-amber-500" />
                              <span>Leader: {inv.team.leader?.name}</span>
                              <span>·</span>
                              <span>{inv.team.matchFormat}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <TimeRemaining expiresAt={inv.expiresAt} />
                          <p className="text-xs text-gray-400 mt-1">
                            {inv.team.currentPlayers}/{inv.team.maxPlayers} players
                          </p>
                        </div>
                      </div>

                      {inv.team.description && (
                        <p className="text-sm text-gray-500 mt-3 ml-16 line-clamp-2">{inv.team.description}</p>
                      )}

                      {inv.position && inv.position !== 'Any' && (
                        <div className="mt-3 ml-16 inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                          You were invited as: <span className="font-semibold">{inv.position}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="px-5 pb-1">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${(inv.team.currentPlayers / inv.team.maxPlayers) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining</p>
                    </div>

                    {/* Action buttons */}
                    <div className="px-5 pb-5 pt-3 flex items-center justify-between">
                      <button
                        onClick={() => navigate(`/player/team-invite/${inv.team._id}`)}
                        className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1"
                      >
                        View full details <ChevronRight className="w-4 h-4" />
                      </button>

                      {!isExpired ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespond(inv.team._id, inv.team.name, false)}
                            disabled={isResponding}
                            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isResponding ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 text-red-400" />}
                            Decline
                          </button>
                          <button
                            onClick={() => handleRespond(inv.team._id, inv.team.name, true)}
                            disabled={isResponding || spotsLeft <= 0}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isResponding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            {spotsLeft <= 0 ? 'Team Full' : 'Accept'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-red-400 font-medium">Invitation expired</span>
                      )}
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

export default MyInvitationsPage;