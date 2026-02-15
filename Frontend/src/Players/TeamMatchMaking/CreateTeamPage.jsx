// src/pages/player/CreateTeamPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import {
  Users, ArrowLeft, Info, CheckCircle
} from 'lucide-react';
import { showToast } from '../../FutsalOwner/components/Toast';
import matchmakingService from '../../store/matchmakingService';

const CreateTeamPage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    matchFormat: '5v5', // 5v5, 6v6, 7v7
    allowAutoFill: false
  });

  const matchFormats = [
    { value: '5v5', label: '5 vs 5', players: 10, description: 'Standard futsal format' },
    { value: '6v6', label: '6 vs 6', players: 12, description: 'Medium field format' },
    { value: '7v7', label: '7 vs 7', players: 14, description: 'Large field format' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast.error('Please enter a team name');
      return;
    }

    try {
      setCreating(true);
      const maxPlayers = matchFormats.find(f => f.value === formData.matchFormat).players;
      const res = await matchmakingService.createTeam({
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        matchFormat: formData.matchFormat,
        maxPlayers,
        isPublic: true,
        allowAutoFill: formData.allowAutoFill
      });
      const teamId = res?.data?._id || res?._id;
      if (!teamId) throw new Error('No team ID returned');
      showToast.success('Team created successfully!');
      navigate(`/player/teams/${teamId}`);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div 
        className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/player/matchmaking')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Matchmaking
            </button>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Team</h1>
            <p className="text-gray-600">Set up your team and invite players to join</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Name */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter team name (e.g., Thunder Strikers)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell others about your team, play style, or what you're looking for..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Match Format */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Match Format</h2>
              <p className="text-sm text-gray-600 mb-4">Choose the team size for your matches</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {matchFormats.map((format) => (
                  <div
                    key={format.value}
                    onClick={() => setFormData({ ...formData, matchFormat: format.value })}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.matchFormat === format.value
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{format.label}</h3>
                      {formData.matchFormat === format.value && (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{format.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="w-4 h-4" />
                      <span>{format.players} total players</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Settings</h2>
              
              <div className="space-y-4">
                {/* Auto-fill */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="allowAutoFill"
                    checked={formData.allowAutoFill}
                    onChange={(e) => setFormData({ ...formData, allowAutoFill: e.target.checked })}
                    className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="allowAutoFill" className="font-medium text-gray-900 cursor-pointer">
                      Allow auto-fill from solo queue
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      If your team is incomplete, the system will automatically match you with solo queue players to fill remaining spots
                    </p>
                  </div>
                </div>

                {/* Public Team Info */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Your team will be public</p>
                    <p>All teams are visible to other players. You can invite specific players or accept join requests from interested players.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Leader Info Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-800">
                <p className="font-medium mb-1">As team leader, you will:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Have full control over team management</li>
                  <li>Invite players and approve/reject join requests</li>
                  <li>Select venue, date, and time for matches</li>
                  <li>Confirm booking and make payment</li>
                  <li>Manage team roster and player positions</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/player/matchmaking')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Create Team
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamPage;