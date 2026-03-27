// src/pages/player/TeamMatchMaking/CreateTeamPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import { Users, ArrowLeft, Info, CheckCircle } from 'lucide-react';
import { showToast } from '../../FutsalOwner/components/Toast';
import matchmakingService from '../../store/matchmakingService';

const MATCH_FORMATS = [
  { value: '5v5', label: '5 vs 5', players: 5, description: 'Standard futsal format' },
  { value: '7v7', label: '7 vs 7', players: 7, description: 'Large field format' },
  { value: '2v2', label: '2 vs 2', players: 2,  description: 'Small-sided format' },
];

const CreateTeamPage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    matchFormat: '5v5',
    allowAutoFill: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast.error('Please enter a team name');
      return;
    }
    try {
      setCreating(true);
      const fmt = MATCH_FORMATS.find(f => f.value === formData.matchFormat);
      const res = await matchmakingService.createTeam({
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        matchFormat: formData.matchFormat,
        maxPlayers: fmt.players,
        skillLevel: 'Intermediate',
        isPublic: true,
        allowAutoFill: formData.allowAutoFill,
      });
      const teamId = res?.data?._id || res?._id;
      if (!teamId) throw new Error('No team ID returned');
      showToast.success('Team created! Now invite your players.');
      navigate(`/player/teams/${teamId}`);
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-7">
            <button
              onClick={() => navigate('/player/matchmaking')}
              className="flex items-center text-gray-500 hover:text-gray-800 mb-4 text-sm font-medium transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Matchmaking
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Create Your Team</h1>
            <p className="text-gray-500 text-sm mt-1">Set up your squad and start inviting players</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Team Info ─────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Team Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Thunder Strikers, FC Elite…"
                    maxLength={40}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{formData.name.length}/40</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Tell players about your team's style, goals, or any requirements…"
                    rows={3}
                    maxLength={300}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{formData.description.length}/300</p>
                </div>
              </div>
            </div>

            {/* ── Match Format ──────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-800 mb-1">Match Format</h2>
              <p className="text-xs text-gray-400 mb-4">Choose how many players per side</p>
              <div className="grid grid-cols-3 gap-3">
                {MATCH_FORMATS.map(fmt => (
                  <button
                    key={fmt.value}
                    type="button"
                    onClick={() => set('matchFormat', fmt.value)}
                    className={`relative border-2 rounded-xl p-4 text-left transition-all ${
                      formData.matchFormat === fmt.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                    }`}
                  >
                    {formData.matchFormat === fmt.value && (
                      <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-emerald-600" />
                    )}
                    <p className="font-bold text-gray-900 text-sm">{fmt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{fmt.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                      <Users className="w-3.5 h-3.5" />
                      <span>{fmt.players} total players</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Settings ──────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Settings</h2>

              {/* Auto-fill toggle */}
              <label className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    id="allowAutoFill"
                    checked={formData.allowAutoFill}
                    onChange={e => set('allowAutoFill', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${formData.allowAutoFill ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.allowAutoFill ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Allow auto-fill from solo queue</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    System will fill empty spots with solo queue players of matching skill level
                  </p>
                </div>
              </label>

              {/* Public info */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl mt-3">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Your team will be <strong>public</strong> by default. Other players can find and request to join it.
                  You can make it private at any time from the team page.
                </p>
              </div>
            </div>

            {/* ── Leader Reminder ───────────────────────────── */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-800">
                <p className="font-semibold mb-2">As team leader you can:</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {[
                    'Invite & remove players',
                    'Approve join requests',
                    'Set match venue & time',
                    'Confirm & pay booking',
                    'Transfer leadership',
                    'Delete the team'
                  ].map(item => (
                    <div key={item} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Actions ───────────────────────────────────── */}
            <div className="flex gap-3 pb-8">
              <button
                type="button"
                onClick={() => navigate('/player/matchmaking')}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !formData.name.trim()}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                {creating ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating…</>
                ) : (
                  <><Users className="w-4 h-4" /> Create Team</>
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