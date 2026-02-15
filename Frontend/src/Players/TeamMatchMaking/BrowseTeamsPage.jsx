import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import { Search, ArrowLeft, Users, Loader2 } from 'lucide-react';
import matchmakingService from '../../store/matchmakingService';
import { showToast } from '../../FutsalOwner/components/Toast';

const BrowseTeamsPage = () => {
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
      const res = await matchmakingService.getPublicTeams({ status: 'forming' });
      setTeams(res.data || []);
    } catch (e) {
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestJoin = async (teamId) => {
    try {
      await matchmakingService.requestJoinTeam(teamId);
      showToast.success('Join request sent');
      load();
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 p-6 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`} style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}>
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate('/player/matchmaking')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse teams</h1>
          <p className="text-gray-600 mb-6">Find public teams looking for players</p>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
          ) : teams.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              No public teams forming right now.
            </div>
          ) : (
            <div className="grid gap-4">
              {teams.map((team) => {
                const count = (team.players?.length || 0) + (team.leader ? 1 : 0);
                return (
                  <div key={team._id} className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{team.name}</h3>
                        <p className="text-sm text-gray-600">{count}/{team.maxPlayers} · {team.matchFormat} · {team.skillLevel}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRequestJoin(team._id)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                    >
                      Request to join
                    </button>
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

export default BrowseTeamsPage;
