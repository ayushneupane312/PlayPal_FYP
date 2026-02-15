import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import { Users, ArrowLeft, Trophy, Loader2, Crown } from 'lucide-react';
import matchmakingService from '../../store/matchmakingService';

const MyTeamsPage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await matchmakingService.getMyTeams();
      setTeams(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isLeader = (team) => team.leader?._id || team.leader === team.leader?.id;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
      <div
        className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate('/player/matchmaking')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Matchmaking
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Teams</h1>
          <p className="text-gray-600 mb-6">View and manage your teams</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : teams.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams yet</h3>
              <p className="text-gray-600 mb-4">Create a team or join one from the matchmaking dashboard.</p>
              <button
                onClick={() => navigate('/player/matchmaking/create-team')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
              >
                Create Team
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {teams.map((team) => {
                const leaderId = (team.leader?._id || team.leader)?.toString?.() || team.leader;
                const playerCount = (team.players?.length || 0) + (leaderId ? 1 : 0);
                return (
                  <div
                    key={team._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/player/teams/${team._id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{team.name}</h3>
                        <p className="text-sm text-gray-600">
                          {playerCount}/{team.maxPlayers} players · {team.matchFormat} · {team.status}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Leader: {team.leader?.name || 'Unknown'} {team.isPublic && '· Public'}
                        </p>
                      </div>
                    </div>
                    <span className="text-emerald-600 text-sm font-medium">Manage →</span>
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
