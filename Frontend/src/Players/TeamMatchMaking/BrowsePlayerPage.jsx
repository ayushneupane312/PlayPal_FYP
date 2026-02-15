// src/pages/player/BrowsePlayersPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import {
  Users, ArrowLeft, Search, Filter, Mail, Star, MapPin,
  Trophy, Shield, Loader2, UserPlus, CheckCircle
} from 'lucide-react';
import { showToast } from '../../FutsalOwner/components/Toast';

const BrowsePlayersPage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    skillLevel: 'all',
    position: 'all',
    location: 'all'
  });

  const [players, setPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitingPlayer, setInvitingPlayer] = useState(null);

  useEffect(() => {
    fetchPlayers();
  }, [filters]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // Mock data
      setPlayers([
        {
          _id: 'p1',
          name: 'John Doe',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          skillLevel: 'Intermediate',
          position: 'Forward',
          rating: 4.5,
          matchesPlayed: 45,
          winRate: 68,
          location: 'Kathmandu',
          preferredTimes: ['Evening', 'Weekend'],
          bio: 'Love playing futsal! Looking for a competitive team.',
          stats: {
            goals: 23,
            assists: 15,
            cleanSheets: 0
          }
        },
        {
          _id: 'p2',
          name: 'Sarah Wilson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          skillLevel: 'Advanced',
          position: 'Goalkeeper',
          rating: 4.8,
          matchesPlayed: 78,
          winRate: 72,
          location: 'Lalitpur',
          preferredTimes: ['Morning', 'Evening'],
          bio: 'Experienced GK, played at college level.',
          stats: {
            goals: 0,
            assists: 2,
            cleanSheets: 34
          }
        },
        {
          _id: 'p3',
          name: 'Mike Thompson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
          skillLevel: 'Beginner',
          position: 'Defender',
          rating: 4.2,
          matchesPlayed: 12,
          winRate: 50,
          location: 'Bhaktapur',
          preferredTimes: ['Weekend'],
          bio: 'New to futsal, eager to learn and improve!',
          stats: {
            goals: 1,
            assists: 3,
            cleanSheets: 5
          }
        },
        {
          _id: 'p4',
          name: 'Alex Rivera',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          skillLevel: 'Intermediate',
          position: 'Midfielder',
          rating: 4.6,
          matchesPlayed: 56,
          winRate: 64,
          location: 'Kathmandu',
          preferredTimes: ['Evening'],
          bio: 'Playmaker, great at assists and ball control.',
          stats: {
            goals: 18,
            assists: 32,
            cleanSheets: 0
          }
        },
        {
          _id: 'p5',
          name: 'Emma Chen',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
          skillLevel: 'Advanced',
          position: 'Forward',
          rating: 4.9,
          matchesPlayed: 92,
          winRate: 78,
          location: 'Kathmandu',
          preferredTimes: ['Morning', 'Evening', 'Weekend'],
          bio: 'Top scorer, fast and technical player.',
          stats: {
            goals: 67,
            assists: 28,
            cleanSheets: 0
          }
        },
        {
          _id: 'p6',
          name: 'David Park',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
          skillLevel: 'Intermediate',
          position: 'Defender',
          rating: 4.4,
          matchesPlayed: 38,
          winRate: 61,
          location: 'Lalitpur',
          preferredTimes: ['Evening', 'Weekend'],
          bio: 'Solid defender, good positioning and tackling.',
          stats: {
            goals: 5,
            assists: 7,
            cleanSheets: 16
          }
        }
      ]);
      
    } catch (error) {
      showToast.error('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const handleInvitePlayer = async (playerId) => {
    // TODO: Show team selection modal if user has multiple teams
    // For now, assume single team
    
    try {
      // TODO: API call to send invitation
      console.log('Inviting player:', playerId);
      
      showToast.success('Invitation sent successfully!');
    } catch (error) {
      showToast.error('Failed to send invitation');
    }
  };

  const getSkillLevelColor = (level) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-700 border-green-300',
      'Intermediate': 'bg-blue-100 text-blue-700 border-blue-300',
      'Advanced': 'bg-purple-100 text-purple-700 border-purple-300'
    };
    return colors[level] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getPositionColor = (position) => {
    const colors = {
      'Goalkeeper': 'bg-yellow-100 text-yellow-700',
      'Defender': 'bg-blue-100 text-blue-700',
      'Midfielder': 'bg-green-100 text-green-700',
      'Forward': 'bg-red-100 text-red-700'
    };
    return colors[position] || 'bg-gray-100 text-gray-700';
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         player.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = filters.skillLevel === 'all' || player.skillLevel === filters.skillLevel;
    const matchesPosition = filters.position === 'all' || player.position === filters.position;
    const matchesLocation = filters.location === 'all' || player.location === filters.location;
    
    return matchesSearch && matchesSkill && matchesPosition && matchesLocation;
  });

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
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/player/matchmaking')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Matchmaking
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse Players</h1>
                <p className="text-gray-600">Find players and invite them to your team</p>
              </div>
              
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-600">{filteredPlayers.length}</p>
                <p className="text-sm text-gray-600">Players Available</p>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mb-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search players by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.skillLevel}
                onChange={(e) => setFilters({ ...filters, skillLevel: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Skill Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <select
                value={filters.position}
                onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Positions</option>
                <option value="Goalkeeper">Goalkeeper</option>
                <option value="Defender">Defender</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Forward">Forward</option>
              </select>

              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Locations</option>
                <option value="Kathmandu">Kathmandu</option>
                <option value="Lalitpur">Lalitpur</option>
                <option value="Bhaktapur">Bhaktapur</option>
              </select>

              {(filters.skillLevel !== 'all' || filters.position !== 'all' || filters.location !== 'all') && (
                <button
                  onClick={() => setFilters({ skillLevel: 'all', position: 'all', location: 'all' })}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Players Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Players Found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map((player) => (
                <div
                  key={player._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-all border border-gray-200"
                >
                  {/* Player Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="w-16 h-16 rounded-full border-2 border-emerald-100"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{player.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-medium text-gray-900">{player.rating}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{player.matchesPlayed} matches</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">{player.bio}</p>
                  </div>

                  {/* Player Info */}
                  <div className="p-6 space-y-4">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getSkillLevelColor(player.skillLevel)}`}>
                        {player.skillLevel}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getPositionColor(player.position)}`}>
                        {player.position}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-900">{player.stats.goals}</p>
                        <p className="text-xs text-gray-600">Goals</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-900">{player.stats.assists}</p>
                        <p className="text-xs text-gray-600">Assists</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-900">{player.winRate}%</p>
                        <p className="text-xs text-gray-600">Win Rate</p>
                      </div>
                    </div>

                    {/* Location & Times */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{player.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {player.preferredTimes.map((time) => (
                          <span
                            key={time}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded"
                          >
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Invite Button */}
                    <button
                      onClick={() => handleInvitePlayer(player._id)}
                      className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Invite to Team
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowsePlayersPage;