// src/pages/player/TeamMatchMaking/MatchDetailPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import {
  ArrowLeft, Swords, CheckCircle, Users, Crown,
  Loader2, Calendar, MapPin, ChevronRight, Trophy,
  Shield, Zap, Star
} from 'lucide-react';
import { getMatchById } from '../../store/matchmakingService';
import { useAuthStore } from '../../store/authStore';
import { showToast } from '../../FutsalOwner/components/Toast';

const SKILL_CONFIG = {
  Beginner:     { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <Shield className="w-3.5 h-3.5" /> },
  Intermediate: { color: 'text-blue-600',    bg: 'bg-blue-50',    icon: <Zap    className="w-3.5 h-3.5" /> },
  Advanced:     { color: 'text-purple-600',  bg: 'bg-purple-50',  icon: <Star   className="w-3.5 h-3.5" /> },
};

function PlayerList({ players, leader }) {
  return (
    <ul className="space-y-2 mt-3">
      {(players || []).map((m, i) => {
        const memberId   = m.user?._id?.toString() || m.user?.toString();
        const leaderId   = leader?._id?.toString() || leader?.toString();
        const isThisLeader = memberId === leaderId || m.role === 'leader';
        return (
          <li key={m.user?._id || i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
              {m.user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-800">{m.user?.name || 'Unknown'}</span>
                {isThisLeader && (
                  <span className="flex items-center gap-0.5 text-xs text-amber-600">
                    <Crown className="w-3 h-3" /> Leader
                  </span>
                )}
              </div>
              {m.position && m.position !== 'Any' && (
                <p className="text-xs text-gray-400">{m.position}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function MatchDetailPage() {
  const { matchId }  = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuthStore();
  const userId       = user?._id?.toString?.() || user?.id?.toString?.();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMatchById(matchId);
        setMatch(res.data);
      } catch {
        showToast.error('Failed to load match details');
      } finally {
        setLoading(false);
      }
    })();
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  if (!match) return null;

  const teamA = match.teamA;
  const teamB = match.teamB;
  const skillA = SKILL_CONFIG[teamA?.skillLevel] || SKILL_CONFIG.Intermediate;
  const skillB = SKILL_CONFIG[teamB?.skillLevel] || SKILL_CONFIG.Intermediate;

  // Is current user the "assigned leader" (challenger who booked)?
  const isAssignedLeader = match.assignedLeader?._id?.toString() === userId ||
    match.assignedLeader?.toString() === userId;

  const myTeam = [
    ...(teamA?.players || []).map(p => (p.user?._id || p.user)?.toString()),
    teamA?.leader?._id?.toString()
  ].includes(userId) ? teamA : teamB;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate('/player/matches/challenges')}
            className="flex items-center text-gray-500 hover:text-gray-800 mb-5 text-sm font-medium transition">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Challenges
          </button>

          {/* Status banner */}
          <div className={`rounded-xl p-4 mb-5 flex items-center gap-3 ${
            match.status === 'confirmed' ? 'bg-emerald-50 border border-emerald-200' :
            match.status === 'pending'   ? 'bg-amber-50 border border-amber-200' :
            'bg-gray-100 border border-gray-200'
          }`}>
            {match.status === 'confirmed' ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            ) : (
              <Swords className="w-6 h-6 text-amber-600 flex-shrink-0" />
            )}
            <div>
              <p className={`font-semibold text-sm ${
                match.status === 'confirmed' ? 'text-emerald-800' :
                match.status === 'pending'   ? 'text-amber-800'   : 'text-gray-700'
              }`}>
                {match.status === 'confirmed' ? '🎉 Match Confirmed — Ready to Play!'  :
                 match.status === 'pending'   ? '⏳ Waiting for opponent to respond…' :
                 'Match ' + match.status}
              </p>
              {match.confirmedAt && (
                <p className="text-xs text-emerald-600 mt-0.5">
                  Confirmed on {new Date(match.confirmedAt).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
              )}
            </div>
          </div>

          {/* VS card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-5">
            <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 p-5 text-white text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{teamA?.matchFormat} Match</p>
              <div className="flex items-center justify-center gap-4 mt-2">
                <span className="text-xl font-black">{teamA?.name}</span>
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white font-black text-sm">VS</span>
                </div>
                <span className="text-xl font-black">{teamB?.name}</span>
              </div>
            </div>

            {/* Team details side-by-side */}
            <div className="grid grid-cols-2 divide-x divide-gray-100">
              {[{ team: teamA, skill: skillA, label: 'Challenger' }, { team: teamB, skill: skillB, label: 'Opponent' }].map(({ team, skill, label }, idx) => (
                <div key={idx} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                    <span className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-full ${skill.bg} ${skill.color}`}>
                      {skill.icon} {team?.skillLevel}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{team?.name}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                    <Users className="w-3.5 h-3.5" /> {team?.players?.length}/{team?.maxPlayers} players
                  </p>
                  <PlayerList players={team?.players} leader={team?.leader} />
                </div>
              ))}
            </div>
          </div>

          {/* Challenge message */}
          {match.challengeMessage && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
              <p className="text-xs text-gray-400 font-medium mb-1">Challenge Message</p>
              <p className="text-sm text-gray-700 italic">"{match.challengeMessage}"</p>
            </div>
          )}

          {/* Book venue CTA (only assigned leader when confirmed) */}
          {match.status === 'confirmed' && isAssignedLeader && !match.bookingRef && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Book a Venue
                </h4>
                <p className="text-xs text-blue-600">
                  As the challenging team leader, you can now book a futsal venue for this match.
                </p>
              </div>
              <button
                onClick={() => navigate(`/player/bookings/new?matchId=${matchId}`)}
                className="ml-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 transition flex-shrink-0"
              >
                Book Venue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {match.status === 'confirmed' && match.bookingRef && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Venue has been booked for this match
              </span>
              <button
                onClick={() => navigate(`/player/bookings/${match.bookingRef}`)}
                className="text-sm text-emerald-700 underline font-medium"
              >
                View Booking →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}