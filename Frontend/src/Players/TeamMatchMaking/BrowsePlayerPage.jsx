// src/pages/player/TeamMatchMaking/BrowsePlayersPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import {
  Users, ArrowLeft, Search, Star, MapPin,
  Loader2, UserPlus, CheckCircle, Send, X
} from 'lucide-react';
import { showToast } from '../../FutsalOwner/components/Toast';
import matchmakingService from '../../store/matchmakingService';

const BrowsePlayersPage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ skillLevel: 'all', position: 'all', location: 'all' });

  const [players, setPlayers] = useState([]);

  // My teams (for invite)
  const [myTeams, setMyTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  // Team selection modal state
  const [teamSelectModal, setTeamSelectModal] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState('');
  const [invitingFrom, setInvitingFrom] = useState(null); // teamId being used to invite
  const [invitedSet, setInvitedSet] = useState(new Set()); // set of playerIds already invited

  useEffect(() => { fetchPlayers(); }, [filters]);
  useEffect(() => { fetchMyTeams(); }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await matchmakingService.getBrowsePlayersForInvite();
      setPlayers(res.data || []);
    } catch {
      // Fallback mock so UI is never broken during development
      setPlayers([
        {
          _id: 'p1', name: 'John Doe',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          skillLevel: 'Intermediate', position: 'Forward', rating: 4.5,
          matchesPlayed: 45, winRate: 68, location: 'Kathmandu',
          preferredTimes: ['Evening', 'Weekend'],
          bio: 'Love playing futsal! Looking for a competitive team.',
          stats: { goals: 23, assists: 15, cleanSheets: 0 }
        },
        {
          _id: 'p2', name: 'Sarah Wilson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          skillLevel: 'Advanced', position: 'Goalkeeper', rating: 4.8,
          matchesPlayed: 78, winRate: 72, location: 'Lalitpur',
          preferredTimes: ['Morning', 'Evening'],
          bio: 'Experienced GK, played at college level.',
          stats: { goals: 0, assists: 2, cleanSheets: 34 }
        },
        {
          _id: 'p3', name: 'Mike Thompson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
          skillLevel: 'Beginner', position: 'Defender', rating: 4.2,
          matchesPlayed: 12, winRate: 50, location: 'Bhaktapur',
          preferredTimes: ['Weekend'],
          bio: 'New to futsal, eager to learn and improve!',
          stats: { goals: 1, assists: 3, cleanSheets: 5 }
        },
        {
          _id: 'p4', name: 'Alex Rivera',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          skillLevel: 'Intermediate', position: 'Midfielder', rating: 4.6,
          matchesPlayed: 56, winRate: 64, location: 'Kathmandu',
          preferredTimes: ['Evening'],
          bio: 'Playmaker, great at assists and ball control.',
          stats: { goals: 18, assists: 32, cleanSheets: 0 }
        },
        {
          _id: 'p5', name: 'Emma Chen',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
          skillLevel: 'Advanced', position: 'Forward', rating: 4.9,
          matchesPlayed: 92, winRate: 78, location: 'Kathmandu',
          preferredTimes: ['Morning', 'Evening', 'Weekend'],
          bio: 'Top scorer, fast and technical player.',
          stats: { goals: 67, assists: 28, cleanSheets: 0 }
        },
        {
          _id: 'p6', name: 'David Park',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
          skillLevel: 'Intermediate', position: 'Defender', rating: 4.4,
          matchesPlayed: 38, winRate: 61, location: 'Lalitpur',
          preferredTimes: ['Evening', 'Weekend'],
          bio: 'Solid defender, good positioning.',
          stats: { goals: 5, assists: 7, cleanSheets: 16 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTeams = async () => {
    try {
      setTeamsLoading(true);
      const res = await matchmakingService.getMyTeams();
      // Only show teams where I am the leader and team is not full/booked
      const leaderTeams = (res.data || []).filter(
        t => t.status === 'forming' && t.players?.length < t.maxPlayers
      );
      setMyTeams(leaderTeams);
    } catch {
      setMyTeams([]);
    } finally {
      setTeamsLoading(false);
    }
  };

  // Opens team selection (or invites directly if only 1 team)
  const openInviteFlow = (playerId, playerName) => {
    if (myTeams.length === 0) {
      showToast.error('You need to create a team first before inviting players.');
      return;
    }
    setSelectedPlayerId(playerId);
    setSelectedPlayerName(playerName);
    if (myTeams.length === 1) {
      // Only one team — invite directly
      sendInvite(myTeams[0]._id, myTeams[0].name, playerId, playerName);
    } else {
      setTeamSelectModal(true);
    }
  };

  const sendInvite = async (teamId, teamName, playerId, playerName) => {
    try {
      setInvitingFrom(teamId);
      await matchmakingService.inviteToTeam(teamId, playerId || selectedPlayerId);
      const name = playerName || selectedPlayerName;
      showToast.success(`Invitation sent to ${name} for "${teamName}"!`);
      setInvitedSet(prev => new Set([...prev, playerId || selectedPlayerId]));
      setTeamSelectModal(false);
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInvitingFrom(null);
    }
  };

  const getSkillColor = (level) => ({
    Beginner: 'bg-green-100 text-green-700 border-green-200',
    Intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
    Advanced: 'bg-purple-100 text-purple-700 border-purple-200'
  }[level] || 'bg-gray-100 text-gray-700 border-gray-200');

  const getPositionColor = (pos) => ({
    Goalkeeper: 'bg-yellow-100 text-yellow-700',
    Defender: 'bg-blue-100 text-blue-700',
    Midfielder: 'bg-green-100 text-green-700',
    Forward: 'bg-red-100 text-red-700'
  }[pos] || 'bg-gray-100 text-gray-700');

  const filteredPlayers = players.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.bio || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchSkill = filters.skillLevel === 'all' || p.skillLevel === filters.skillLevel;
    const matchPos = filters.position === 'all' || p.position === filters.position;
    const matchLoc = filters.location === 'all' || p.location === filters.location;
    return matchSearch && matchSkill && matchPos && matchLoc;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <button onClick={() => navigate('/player/matchmaking')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to Matchmaking
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Browse Players</h1>
                <p className="text-gray-500 text-sm">Find players and invite them to your team</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-600">{filteredPlayers.length}</p>
                <p className="text-sm text-gray-500">Available</p>
              </div>
            </div>
          </div>

          {/* No leader teams warning */}
          {!teamsLoading && myTeams.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
              <div className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5">⚠️</div>
              <div>
                <p className="text-sm font-medium text-amber-800">You need a team to invite players</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  You can browse players but inviting requires you to be a leader of a team that isn't full yet.
                  <button onClick={() => navigate('/player/matchmaking/create-team')} className="ml-1 underline font-medium">
                    Create a team
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Search & Filters */}
          <div className="mb-6 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search players by name or description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'skillLevel', label: 'Skill', options: ['Beginner', 'Intermediate', 'Advanced'] },
                { key: 'position', label: 'Position', options: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'] },
                { key: 'location', label: 'Location', options: ['Kathmandu', 'Lalitpur', 'Bhaktapur'] }
              ].map(({ key, label, options }) => (
                <select
                  key={key}
                  value={filters[key]}
                  onChange={e => setFilters({ ...filters, [key]: e.target.value })}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All {label}s</option>
                  {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
              {Object.values(filters).some(v => v !== 'all') && (
                <button
                  onClick={() => setFilters({ skillLevel: 'all', position: 'all', location: 'all' })}
                  className="px-4 py-2 text-gray-500 hover:text-gray-800 text-sm font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Players Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <Users className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No Players Found</h3>
              <p className="text-gray-400 text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlayers.map((player) => {
                const alreadyInvited = invitedSet.has(player._id);
                return (
                  <div key={player._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-50">
                      <div className="flex items-start gap-3 mb-3">
                        <img
                          src={player.avatar}
                          alt={player.name}
                          className="w-14 h-14 rounded-full border-2 border-emerald-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{player.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-medium text-gray-700">{player.rating}</span>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs text-gray-500">{player.matchesPlayed} matches</span>
                          </div>
                        </div>
                      </div>
                      {player.bio && <p className="text-xs text-gray-500 line-clamp-2">{player.bio}</p>}
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getSkillColor(player.skillLevel)}`}>
                          {player.skillLevel}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getPositionColor(player.position)}`}>
                          {player.position}
                        </span>
                      </div>


                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin className="w-3.5 h-3.5" /> {player.location}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {(player.preferredTimes || []).map(t => (
                          <span key={t} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full">{t}</span>
                        ))}
                      </div>

                      <button
                        onClick={() => !alreadyInvited && openInviteFlow(player._id, player.name)}
                        disabled={alreadyInvited || myTeams.length === 0}
                        className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition ${
                          alreadyInvited
                            ? 'bg-gray-100 text-gray-400 cursor-default'
                            : myTeams.length === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {alreadyInvited ? (
                          <><CheckCircle className="w-4 h-4" /> Invite Sent</>
                        ) : (
                          <><UserPlus className="w-4 h-4" /> Invite to Team</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Team Selection Modal */}
      {teamSelectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Select a Team</h3>
                <p className="text-xs text-gray-400 mt-0.5">Invite <span className="font-medium">{selectedPlayerName}</span> to which team?</p>
              </div>
              <button onClick={() => setTeamSelectModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {myTeams.map(team => {
                const spots = team.maxPlayers - (team.players?.length || 0);
                const isSending = invitingFrom === team._id;
                return (
                  <button
                    key={team._id}
                    onClick={() => sendInvite(team._id, team.name)}
                    disabled={isSending || invitingFrom !== null}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition disabled:opacity-60 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{team.name}</p>
                        <p className="text-xs text-gray-400">{team.matchFormat} · {spots} spot{spots !== 1 ? 's' : ''} left</p>
                      </div>
                    </div>
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    ) : (
                      <Send className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-4 pt-0">
              <button
                onClick={() => setTeamSelectModal(false)}
                className="w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowsePlayersPage;