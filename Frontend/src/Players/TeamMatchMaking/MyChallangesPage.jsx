// src/pages/player/TeamMatchMaking/MyChallengesPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import {
  ArrowLeft, Swords, Trophy, Clock, CheckCircle, XCircle,
  Loader2, Users, MessageSquare,
  Send, Inbox, Check, X, AlertCircle, ChevronRight
} from 'lucide-react';
import {
  getMyChallenges,
  respondToChallenge,
  cancelChallenge
} from '../../store/matchmakingService';
import { showToast } from '../../FutsalOwner/components/Toast';
import { useAuthStore } from '../../store/authStore';

function TeamCard({ team, label, side }) {
  const sideColors = {
    A: 'bg-blue-50 border-blue-200 text-blue-700',
    B: 'bg-red-50 border-red-200 text-red-700'
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex-1">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${sideColors[side]}`}>{label}</span>
      </div>
      <h4 className="font-bold text-gray-900">{team?.name || '—'}</h4>
      <p className="text-xs text-gray-400 mt-0.5">
        {team?.matchFormat} · {team?.players?.length}/{team?.maxPlayers} players
      </p>
      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
        <Users className="w-3 h-3" /> Led by {team?.leader?.name || '?'}
      </p>
    </div>
  );
}

function TimeAgo({ date }) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  let label = mins < 1 ? 'just now' : mins < 60 ? `${mins}m ago` : hrs < 24 ? `${hrs}h ago` : `${days}d ago`;
  return <span className="text-xs text-gray-400">{label}</span>;
}

const TABS = [
  { key: 'received',  label: 'Received',  icon: <Inbox  className="w-4 h-4" /> },
  { key: 'sent',      label: 'Sent',      icon: <Send   className="w-4 h-4" /> },
  { key: 'confirmed', label: 'Confirmed', icon: <Trophy className="w-4 h-4" /> },
];

export default function MyChallengesPage() {
  const navigate   = useNavigate();
  const { user }   = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [challenges, setChallenges] = useState({ sent: [], received: [], confirmed: [] });
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState('received');

  // Per-match action loading
  const [actionLoading, setActionLoading] = useState({});

  // Decline modal
  const [declineModal, setDeclineModal] = useState(false);
  const [declineTarget, setDeclineTarget] = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await getMyChallenges();
      setChallenges(res.data || { sent: [], received: [], confirmed: [] });
    } catch {
      showToast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const setAction = (id, val) => setActionLoading(prev => ({ ...prev, [id]: val }));

  const handleAccept = async (match) => {
    setAction(match._id, 'accepting');
    try {
      await respondToChallenge(match._id, true);
      showToast.success('Challenge accepted! Match is confirmed 🎉');
      load();
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed to accept');
    } finally {
      setAction(match._id, null);
    }
  };

  const openDecline = (match) => {
    setDeclineTarget(match);
    setDeclineReason('');
    setDeclineModal(true);
  };

  const handleDecline = async () => {
    if (!declineTarget) return;
    setAction(declineTarget._id, 'declining');
    try {
      await respondToChallenge(declineTarget._id, false, declineReason);
      showToast.success('Challenge declined');
      setDeclineModal(false);
      load();
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed to decline');
    } finally {
      setAction(declineTarget._id, null);
    }
  };

  const handleCancel = async (matchId) => {
    if (!window.confirm('Cancel this challenge?')) return;
    setAction(matchId, 'cancelling');
    try {
      await cancelChallenge(matchId);
      showToast.success('Challenge cancelled');
      load();
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed to cancel');
    } finally {
      setAction(matchId, null);
    }
  };

  const tabData   = challenges[activeTab] || [];
  const counts    = {
    received:  challenges.received?.length  || 0,
    sent:      challenges.sent?.length      || 0,
    confirmed: challenges.confirmed?.length || 0
  };

  const renderMatch = (match) => {
    const isLoading = actionLoading[match._id];
    const msg       = match.challengeMessage;
    return (
      <div key={match._id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all overflow-hidden">
        {/* vs. header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Swords className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold">{match.teamA?.matchFormat} Match Challenge</span>
          </div>
          <TimeAgo date={match.createdAt || match.challengedAt} />
        </div>

        {/* Teams */}
        <div className="p-4">
          <div className="flex items-stretch gap-3">
            <TeamCard team={match.teamA} label="Team A" side="A" />
            <div className="flex items-center justify-center px-1">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-black text-xs">VS</span>
              </div>
            </div>
            <TeamCard team={match.teamB} label="Team B" side="B" />
          </div>

          {/* Optional message */}
          {msg && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
              <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 italic">"{msg}"</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4">
            {activeTab === 'received' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(match)}
                  disabled={!!isLoading}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-1.5 transition"
                >
                  {isLoading === 'accepting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Accept Challenge
                </button>
                <button
                  onClick={() => openDecline(match)}
                  disabled={!!isLoading}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-1.5 transition"
                >
                  {isLoading === 'declining' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  Decline
                </button>
              </div>
            )}
            {activeTab === 'sent' && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                  <Clock className="w-3.5 h-3.5" /> Awaiting opponent response
                </span>
                <button
                  onClick={() => handleCancel(match._id)}
                  disabled={!!isLoading}
                  className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50 transition"
                >
                  {isLoading === 'cancelling' ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : 'Withdraw challenge'}
                </button>
              </div>
            )}
            {activeTab === 'confirmed' && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5" /> Match Confirmed
                </span>
                <button
                  onClick={() => navigate(`/player/matches/${match._id}`)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
                >
                  View match <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button onClick={() => navigate('/player/matchmaking')}
              className="flex items-center text-gray-500 hover:text-gray-800 mb-4 text-sm font-medium transition">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Matchmaking
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" /> My Challenges
                </h1>
                <p className="text-gray-500 text-sm mt-1">Manage match challenges you've sent and received</p>
              </div>
              <button
                onClick={() => navigate('/player/matchmaking/browse-opponents')}
                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 flex items-center gap-2 transition"
              >
                <Swords className="w-4 h-4" /> Find Opponents
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-5">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.icon}
                {tab.label}
                {counts[tab.key] > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-600'
                  }`}>{counts[tab.key]}</span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
          ) : tabData.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              {activeTab === 'received' && <Inbox className="w-12 h-12 text-gray-200 mx-auto mb-3" />}
              {activeTab === 'sent'     && <Send  className="w-12 h-12 text-gray-200 mx-auto mb-3" />}
              {activeTab === 'confirmed'&& <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-3" />}
              <h3 className="text-base font-semibold text-gray-600 mb-1">
                {activeTab === 'received'  && 'No incoming challenges'}
                {activeTab === 'sent'      && 'No challenges sent'}
                {activeTab === 'confirmed' && 'No confirmed matches yet'}
              </h3>
              <p className="text-sm text-gray-400">
                {activeTab === 'received'  && 'You haven\'t received any match challenges yet.'}
                {activeTab === 'sent'      && 'Challenge an opponent team to get started.'}
                {activeTab === 'confirmed' && 'Accept a challenge to confirm a match.'}
              </p>
              {activeTab !== 'confirmed' && (
                <button
                  onClick={() => navigate('/player/matchmaking/browse-opponents')}
                  className="mt-4 px-5 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition"
                >
                  Browse Opponents
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {tabData.map(renderMatch)}
            </div>
          )}
        </div>
      </div>

      {/* Decline Reason Modal */}
      {declineModal && declineTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Decline Challenge</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Declining challenge from <strong>"{declineTarget.teamA?.name}"</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                placeholder="e.g. We already have a match scheduled…"
                rows={2}
                maxLength={150}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setDeclineModal(false)}
                className="py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={!!actionLoading[declineTarget._id]}
                className="py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading[declineTarget._id] === 'declining'
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <XCircle className="w-4 h-4" />}
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}