// src/pages/player/MatchmakingDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import SearchAndNotificationBar from '../../components/SearchAndNotificationBar';
import {
  Users, Zap, Trophy, Search, Plus, Clock,
  Target, Bell, Swords
} from 'lucide-react';
import matchmakingService from '../../store/matchmakingService';

const MatchmakingDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [pendingInviteCount, setPendingInviteCount] = useState(0);

  useEffect(() => {
    // Fetch pending invites count for badge
    matchmakingService.getMyInvitations()
      .then(res => setPendingInviteCount((res.data || []).length))
      .catch(() => setPendingInviteCount(0));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 p-6 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Search & Notification Bar */}
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-6">
            <SearchAndNotificationBar searchPlaceholder="Search anything..." />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Find Your Match</h1>
            <p className="text-gray-500">Choose how you want to play — with friends or solo</p>
          </div>

          {/* Pending Invitations Banner */}
          {pendingInviteCount > 0 && (
            <div
              onClick={() => navigate('/player/my-invitations')}
              className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900">
                    You have {pendingInviteCount} pending team invitation{pendingInviteCount > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-amber-600">Tap to view and respond before they expire</p>
                </div>
              </div>
              <span className="bg-amber-500 text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
                {pendingInviteCount}
              </span>
            </div>
          )}

          {/* Main Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Create Team */}
            <div
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              onClick={() => navigate('/player/matchmaking/create-team')}
            >
              <div className="p-8 text-white">
                <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Users className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Create Team</h2>
                <p className="text-emerald-100 mb-6">Build your own squad, invite players, and manage your team</p>
                <div className="space-y-2 mb-6">
                  {['You become team leader', 'Invite specific players', 'Control booking & payment'].map(t => (
                    <div key={t} className="flex items-center gap-2 text-emerald-100">
                      <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                      <span className="text-sm">{t}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); navigate('/player/matchmaking/create-team'); }}
                  className="w-full px-6 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Create Your Team
                </button>
              </div>
            </div>

            {/* Solo Queue */}
            <div
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              onClick={() => navigate('/player/matchmaking/solo-queue')}
            >
              <div className="p-8 text-white">
                <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Find Match (Solo)</h2>
                <p className="text-purple-100 mb-6">Join the queue and get matched with players of similar skill level</p>
                <div className="space-y-2 mb-6">
                  {['Auto team balancing', 'Skill-based matching', 'Quick & easy setup'].map(t => (
                    <div key={t} className="flex items-center gap-2 text-purple-100">
                      <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                      <span className="text-sm">{t}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" /> Join Solo Queue
                </button>
              </div>
            </div>
          </div>

          {/* Browse Options — now 4 cards including My Invitations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              {
                icon: <Search className="w-6 h-6 text-blue-600" />,
                bg: 'bg-blue-50',
                title: 'Browse Teams',
                desc: 'Find public teams looking for players',
                cta: 'View Teams',
                color: 'text-blue-600',
                path: '/player/matchmaking/browse-teams'
              },
              {
                icon: <Users className="w-6 h-6 text-emerald-600" />,
                bg: 'bg-emerald-50',
                title: 'Browse Players',
                desc: 'Find players and invite them to your team',
                cta: 'View Players',
                color: 'text-emerald-600',
                path: '/player/matchmaking/browse-players'
              },
              {
                icon: <Trophy className="w-6 h-6 text-amber-600" />,
                bg: 'bg-amber-50',
                title: 'My Teams',
                desc: 'View and manage your existing teams',
                cta: 'View Teams',
                color: 'text-amber-600',
                path: '/player/teams'
              },
              {
                icon: <Bell className="w-6 h-6 text-rose-500" />,
                bg: 'bg-rose-50',
                title: 'My Invitations',
                desc: 'Respond to team invites sent to you',
                cta: 'View Invitations',
                color: 'text-rose-500',
                path: '/player/my-invitations',
                badge: pendingInviteCount
              },
              {
                icon: <Swords className="w-6 h-6 text-red-500" />,
                bg: 'bg-red-50',
                title: 'Find Opponents',
                desc: 'Challenge ready teams to a match',
                cta: 'Browse Opponents',
                color: 'text-red-500',
                path: '/player/matchmaking/browse-opponents'
              }
            ].map(card => (
              <div
                key={card.path}
                onClick={() => navigate(card.path)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100 p-5 relative"
              >
                {card.badge > 0 && (
                  <span className="absolute top-3 right-3 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {card.badge}
                  </span>
                )}
                <div className={`${card.bg} rounded-full w-11 h-11 flex items-center justify-center mb-3`}>
                  {card.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{card.title}</h3>
                <p className="text-gray-500 text-xs mb-3">{card.desc}</p>
                <div className={`flex items-center ${card.color} text-sm font-medium`}>
                  {card.cta} <span className="ml-1">→</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Users className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', value: '247', label: 'Active Players' },
              { icon: <Trophy className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50', value: '42', label: 'Teams Forming' },
              { icon: <Clock className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50', value: '18', label: 'In Queue' },
              { icon: <Target className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50', value: '156', label: 'Matches Today' }
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className={`${stat.bg} rounded-lg p-2`}>{stat.icon}</div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchmakingDashboard;