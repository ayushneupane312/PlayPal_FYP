// src/pages/player/MatchmakingDashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import SearchAndNotificationBar from '../../components/SearchAndNotificationBar';
import {
  Users, Zap, Trophy, Search, Plus, Clock, MapPin,
  Star, Shield, Target
} from 'lucide-react';


const MatchmakingDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div 
        className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Search & Notification Bar */}
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-6">
            <SearchAndNotificationBar searchPlaceholder="Search anything..." />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Match</h1>
            <p className="text-gray-600">Choose how you want to play - with friends or solo</p>
          </div>

          {/* Main Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Manual Matchmaking - Create Team */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                 onClick={() => navigate('/player/matchmaking/create-team')}>
              <div className="p-8 text-white">
                <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Users className="w-8 h-8" />
                </div>
                
                <h2 className="text-2xl font-bold mb-3">Create Team</h2>
                <p className="text-emerald-50 mb-6">
                  Build your own squad with friends, invite players, and manage your team
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-emerald-50">
                    <div className="w-5 h-5 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-sm">You become team leader</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-50">
                    <div className="w-5 h-5 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-sm">Invite specific players</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-50">
                    <div className="w-5 h-5 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-sm">Control booking & payment</span>
                  </div>
                </div>

                <button 
                onClick={(e) => { e.stopPropagation(); navigate('/player/matchmaking/create-team'); }}
                className="w-full px-6 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Your Team
                </button>
              </div>
            </div>

            {/* Auto Matchmaking - Solo Queue */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                 onClick={() => navigate('/player/matchmaking/solo-queue')}>
              <div className="p-8 text-white">
                <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8" />
                </div>
                
                <h2 className="text-2xl font-bold mb-3">Find Match (Solo)</h2>
                <p className="text-purple-50 mb-6">
                  Join the queue and get matched with players of similar skill level
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-purple-50">
                    <div className="w-5 h-5 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-sm">Auto team balancing</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-50">
                    <div className="w-5 h-5 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-sm">Skill-based matching</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-50">
                    <div className="w-5 h-5 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-sm">Quick & easy setup</span>
                  </div>
                </div>

                <button className="w-full px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  Join Solo Queue
                </button>
              </div>
            </div>
          </div>

          {/* Browse Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Browse Public Teams */}
            <div 
              onClick={() => navigate('/player/matchmaking/browse-teams')}
              className="bg-white rounded-lg shadow hover:shadow-md transition-all cursor-pointer border border-gray-200 p-6"
            >
              <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Teams</h3>
              <p className="text-gray-600 text-sm mb-4">
                Find public teams looking for players to join
              </p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                View Teams
                <span className="ml-1">→</span>
              </div>
            </div>

            {/* Browse Players */}
            <div 
              onClick={() => navigate('/player/matchmaking/browse-players')}
              className="bg-white rounded-lg shadow hover:shadow-md transition-all cursor-pointer border border-gray-200 p-6"
            >
              <div className="bg-emerald-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Players</h3>
              <p className="text-gray-600 text-sm mb-4">
                Find players and invite them to your team
              </p>
              <div className="flex items-center text-emerald-600 text-sm font-medium">
                View Players
                <span className="ml-1">→</span>
              </div>
            </div>

            {/* My Teams */}
            <div 
              onClick={() => navigate('/player/teams')}
              className="bg-white rounded-lg shadow hover:shadow-md transition-all cursor-pointer border border-gray-200 p-6"
            >
              <div className="bg-amber-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">My Teams</h3>
              <p className="text-gray-600 text-sm mb-4">
                View and manage your existing teams
              </p>
              <div className="flex items-center text-amber-600 text-sm font-medium">
                View Teams
                <span className="ml-1">→</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 rounded-lg p-2">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">247</p>
                  <p className="text-sm text-gray-600">Active Players</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 rounded-lg p-2">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">42</p>
                  <p className="text-sm text-gray-600">Teams Forming</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 rounded-lg p-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">18</p>
                  <p className="text-sm text-gray-600">In Queue</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 rounded-lg p-2">
                  <Target className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                  <p className="text-sm text-gray-600">Matches Today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchmakingDashboard;