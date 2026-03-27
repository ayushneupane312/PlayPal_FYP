import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import { Zap, ArrowLeft, Loader2, Users, LogOut, Calendar } from 'lucide-react';
import matchmakingService from '../../store/matchmakingService';
import { showToast } from '../../FutsalOwner/components/Toast';
import { useAuthStore } from '../../store/authStore';

const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

const SoloQueuePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    position: 'Midfielder',
    location: '',
    availableDate: '',
    startTime: '18:00',
    endTime: '19:00'
  });

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await matchmakingService.getQueueStatus();
      setStatus(res?.data ?? res ?? { inQueue: false, matched: false });
    } catch (e) {
      setStatus({ inQueue: false, matched: false });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!form.availableDate || !form.startTime || !form.endTime) {
      showToast.error('Please select date and time');
      return;
    }
    try {
      setSubmitting(true);
      const res = await matchmakingService.joinQueue({
        skillLevel: 'Intermediate',
        position: form.position,
        location: form.location,
        availableDate: form.availableDate,
        startTime: form.startTime,
        endTime: form.endTime
      });
      if (res.matched && res.data?.match) {
        showToast.success('Match found!');
        setStatus({ inQueue: false, matched: true, match: res.data.match });
      } else {
        showToast.success('Added to queue');
        loadStatus();
      }
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed to join queue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeave = async () => {
    try {
      await matchmakingService.leaveQueue();
      showToast.success('Left queue');
      loadStatus();
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }

  if (status?.matched && status?.match) {
    const match = status.match;
    const currentUserId = user?._id?.toString?.() || user?.id?.toString?.() || '';
    const teamALeaderId = match.teamA?.leader?._id?.toString?.() || match.teamA?.leader?.toString?.() || '';
    const teamBLeaderId = match.teamB?.leader?._id?.toString?.() || match.teamB?.leader?.toString?.() || '';
    const assignedLeaderId = match.assignedLeader?._id?.toString?.() || match.assignedLeader?.toString?.() || '';
    const isAssignedLeader = currentUserId && (assignedLeaderId === currentUserId || teamALeaderId === currentUserId || teamBLeaderId === currentUserId);
    const myTeamId = teamALeaderId === currentUserId ? match.teamA?._id : (teamBLeaderId === currentUserId ? match.teamB?._id : null);

    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 p-6 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`} style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}>
          <div className="max-w-2xl mx-auto">
            <button onClick={() => navigate('/player/matchmaking')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </button>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Match found!</h2>
              <p className="text-gray-600 mb-4">
                {isAssignedLeader ? 'You are the assigned leader. Confirm the booking to select venue and complete payment.' : 'Match is in pending state. The assigned leader will confirm the booking.'}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Team A</p>
                  <p className="font-semibold">{match.teamA?.name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Team B</p>
                  <p className="font-semibold">{match.teamB?.name}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">Status: {match.status}</p>
              {isAssignedLeader && myTeamId && (
                <button
                  onClick={() => navigate(`/player/teams/${myTeamId}/confirm-booking`)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                >
                  <Calendar className="w-4 h-4" /> Confirm booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 p-6 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`} style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}>
        <div className="max-w-xl mx-auto">
          <button onClick={() => navigate('/player/matchmaking')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Find Match (Solo)</h1>
          <p className="text-gray-600 mb-6">Join the queue and get matched with other available players</p>

          {status?.inQueue ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-700 mb-2">You are in the queue.</p>
              <p className="text-sm text-gray-500 mb-4">
                Players in your slot: {status.playersInSlot ?? 0} / {status.required ?? 10}
              </p>
              <button onClick={handleLeave} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Leave queue
              </button>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Kathmandu"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available date</label>
                <input
                  type="date"
                  value={form.availableDate}
                  onChange={(e) => setForm({ ...form, availableDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                Join queue
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoloQueuePage;
