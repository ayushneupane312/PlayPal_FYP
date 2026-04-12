import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy,
  ArrowLeft,
  Loader2,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  Banknote,
  AlertCircle,
  ChevronRight,
  Smartphone,
} from 'lucide-react';
import PlayerSidebar from './PlayerSidebar';
import { showToast } from '../FutsalOwner/components/Toast';
import PhoneInput from '../components/PhoneInput';
import { getPhoneValidationError } from '../utils/phoneValidation';
import { useAuthStore } from '../store/authStore';
import { getTournamentById, registerTeam } from '../store/tournamentService';
import { getMyTeams } from '../store/matchmakingService';
import { RequiredMark } from '../components/RequiredMark';

const DEFAULT_RULES = [
  'Minimum 5, maximum 10 players per team',
  'Captain must be present on match day',
  'Players must carry valid ID proof',
  'Matches are 20 minutes each half',
  'Late arrival forfeits the match',
  'No refunds after confirmation',
];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' });
}

function isDeadlinePassed(deadline) {
  if (!deadline) return false;
  const raw = String(deadline);
  let parsed;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-').map(Number);
    parsed = new Date(year, month - 1, day, 12, 0, 0, 0);
  } else {
    parsed = new Date(deadline);
    if (Number.isNaN(parsed.getTime())) return false;
  }

  return Date.now() > parsed.getTime();
}

function getEffectiveTournamentStatus(tournament) {
  const originalStatus = (tournament?.status || '').toLowerCase();
  const passed = isDeadlinePassed(tournament?.registrationDeadline);
  if (passed && (originalStatus === 'registration_open' || originalStatus === 'upcoming')) {
    return 'registration_closed';
  }
  return originalStatus;
}

function SectionCard({ step, title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-xs font-semibold text-green-600 flex-shrink-0">
          {step}
        </div>
        <span className="text-sm font-semibold text-gray-900">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-700">
        {label}
        {required ? <RequiredMark className="inline ml-0.5" /> : null}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} />
          {error}
        </div>
      )}
    </div>
  );
}

export default function PlayerTournamentRegisterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userId = user?.id ?? user?._id;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [txnId, setTxnId] = useState('');
  const [agreeRules, setAgreeRules] = useState(false);
  const [agreeRefund, setAgreeRefund] = useState(false);
  const [captainName, setCaptainName] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');
  const [captainEmail, setCaptainEmail] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (user) {
      if (!captainName && (user.name || user.fullName)) setCaptainName(user.name || user.fullName || '');
      if (!captainEmail && user.email) setCaptainEmail(user.email || '');
      if (!captainPhone && user.phone) setCaptainPhone(user.phone || '');
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tournamentRes, teamsRes] = await Promise.all([
        getTournamentById(id),
        getMyTeams(),
      ]);
      const tourData = tournamentRes?.data ?? tournamentRes;
      setTournament(tourData || null);
      const teamList = teamsRes?.data ?? teamsRes ?? [];
      const allTeams = Array.isArray(teamList) ? teamList : [];
      const leaderOnly = allTeams.filter(
        (t) => (t.leader?._id?.toString() || t.leader?.toString()) === userId
      );
      setTeams(leaderOnly.length > 0 ? leaderOnly : allTeams);
      const first = (leaderOnly.length > 0 ? leaderOnly : allTeams)[0];
      if (first && !selectedTeamId) setSelectedTeamId(first._id);
      const pm = tourData?.paymentMethods || [];
      if (pm.includes('cash') && !pm.includes('online')) setPaymentMethod('cash');
      else if (pm.includes('online') && !pm.includes('cash')) setPaymentMethod('khalti');
    } catch (err) {
      console.error('Fetch error:', err);
      showToast.error(err.response?.data?.message || 'Failed to load data');
      setTournament(null);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!selectedTeamId) e.team = 'Please select a team';
    else {
      const selectedTeam = teams.find((t) => t._id === selectedTeamId);
      if (selectedTeam) {
        const count = (selectedTeam.players?.length ?? 0) + 1;
        if (count < minPlayers)
          e.team = `This team has ${count} players. At least ${minPlayers} are required to register.`;
      }
    }
    if (!captainName?.trim()) e.captainName = 'Captain name is required';
    const capPhoneErr = getPhoneValidationError(captainPhone);
    if (capPhoneErr) e.captainPhone = capPhoneErr;
    if (!captainEmail?.trim() || !captainEmail.includes('@')) e.captainEmail = 'Valid email is required';
    if (paymentMethod !== 'cash' && !txnId?.trim()) e.txnId = 'Transaction ID is required for online payment';
    if (!agreeRules) e.agreeRules = 'You must agree to the tournament rules';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const apiPaymentMethod = paymentMethod === 'cash' ? 'cash' : 'online';
    try {
      setSubmitting(true);
      const res = await registerTeam(id, { teamId: selectedTeamId, paymentMethod: apiPaymentMethod });
      if (res?.success) {
        showToast.success(res?.message || 'Team registered successfully');
        navigate(`/PlayersTournaments/${id}`);
      } else {
        showToast.error(res?.message || 'Registration failed');
      }
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods = tournament?.paymentMethods || [];
  const minPlayers = tournament?.minPlayersPerTeam ?? 5;
  const registeredTeams = tournament?.stats?.registeredTeams ?? 0;
  const maxTeams = tournament?.maxTeams ?? 16;
  const slotsLeft = maxTeams - registeredTeams;
  const venueName = tournament?.venue?.venueName || tournament?.location || '—';
  const rules = tournament?.policies?.rulesAndRegulations
    ? [tournament.policies.rulesAndRegulations]
    : DEFAULT_RULES;
  const effectiveStatus = getEffectiveTournamentStatus(tournament);

  const payOptions = [
    ...(paymentMethods.includes('online') ? [
      { id: 'khalti', label: 'Khalti', Icon: Smartphone, api: 'online' },
    ] : []),
    ...(paymentMethods.includes('cash') ? [{ id: 'cash', label: 'Cash on arrival', Icon: Banknote, api: 'cash' }] : []),
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tournament not found</h2>
            <button
              onClick={() => navigate('/PlayersTournaments')}
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tournaments
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (effectiveStatus !== 'registration_open') {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Registration closed</h2>
            <p className="text-sm text-gray-600 mb-4">This tournament is not open for registration.</p>
            <button
              onClick={() => navigate(`/PlayersTournaments/${id}`)}
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              View tournament
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
      <div
        className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <button
          onClick={() => navigate(`/PlayersTournaments/${id}`)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to tournament
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Left column — Form */}
          <div>
            <form onSubmit={handleSubmit}>
              <SectionCard step="1" title="Team information">
                <div className="space-y-4">
                  <Field label="Select your team" required error={errors.team}>
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    >
                      <option value="">Choose a team</option>
                      {teams.map((t) => {
                        const count = (t.players?.length ?? 0) + 1;
                        const belowMin = count < minPlayers;
                        return (
                          <option key={t._id} value={t._id}>
                            {t.name || 'Unnamed team'} ({count}/{minPlayers} players){belowMin ? ' — add more players to register' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </Field>
                  {teams.length === 0 && (
                    <p className="text-xs text-amber-600">
                      Only team leaders can register. Create or join a team first.
                    </p>
                  )}
                </div>
              </SectionCard>

              <SectionCard step="2" title="Captain details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Captain name" required error={errors.captainName}>
                    <input
                      type="text"
                      value={captainName}
                      onChange={(e) => setCaptainName(e.target.value)}
                      placeholder="Full name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </Field>
                  <PhoneInput
                    label="Phone number"
                    required
                    value={captainPhone}
                    onValueChange={setCaptainPhone}
                    placeholder="9841234567 or +9779841234567"
                    hideHint
                    inputClassName="px-3 py-2.5 text-sm"
                  />
                  <div className="sm:col-span-2">
                    <Field label="Email address" required error={errors.captainEmail}>
                      <input
                        type="email"
                        value={captainEmail}
                        onChange={(e) => setCaptainEmail(e.target.value)}
                        placeholder="captain@email.com"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </Field>
                  </div>
                </div>
              </SectionCard>

              <SectionCard step="3" title="Payment">
                <div className="space-y-4">
                  <Field label="Payment method">
                    <div className="flex flex-wrap gap-2">
                      {payOptions.map(({ id, label, Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setPaymentMethod(id)}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition ${
                            paymentMethod === id
                              ? 'border-emerald-500 bg-green-50 text-emerald-600'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Icon size={14} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {paymentMethod !== 'cash' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                      <Field label="Transaction / voucher ID" required error={errors.txnId}>
                        <input
                          type="text"
                          value={txnId}
                          onChange={(e) => setTxnId(e.target.value)}
                          placeholder="e.g. TXN-2026XXXXXXX"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </Field>
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                      Pay NPR {Number(tournament.entryFeePerTeam || 0).toLocaleString()} in cash at the venue on or before {formatDate(tournament.registrationDeadline)}. Mention your team name when paying.
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeRules}
                        onChange={(e) => setAgreeRules(e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">I have read and agree to the tournament rules and regulations</span>
                    </label>
                    {errors.agreeRules && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle size={12} />
                        {errors.agreeRules}
                      </div>
                    )}
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeRefund}
                        onChange={(e) => setAgreeRefund(e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">I understand entry fees are non-refundable after confirmation</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/PlayersTournaments/${id}`)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !selectedTeamId || teams.length === 0}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Registering…
                        </>
                      ) : (
                        <>
                          Submit registration
                          <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </SectionCard>
            </form>
          </div>

          {/* Right sidebar — Tournament summary + description + rules */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-6">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg mb-4">
                <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Trophy size={22} className="text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-800">{tournament.name}</div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 mt-0.5">
                    <MapPin size={11} />
                    {venueName}
                  </div>
                </div>
              </div>

              {tournament.description && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Description</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{tournament.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                  {slotsLeft} slots left
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
                  Deadline {formatDate(tournament.registrationDeadline)}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                  {(tournament.format || 'knockout').replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-0 divide-y divide-gray-100">
                {[
                  [Calendar, 'Start date', formatDate(tournament.startDate)],
                  [Users, 'Registered', `${registeredTeams} / ${maxTeams} teams`],
                  [CreditCard, 'Entry fee', `NPR ${Number(tournament.entryFeePerTeam || 0).toLocaleString()}`],
                ].map(([Icon, label, val]) => (
                  <div key={label} className="flex justify-between items-center py-2 text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <Icon size={13} />
                      {label}
                    </span>
                    <span className="font-semibold text-gray-900">{val}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Trophy size={13} />
                    Prize pool
                  </span>
                  <span className="font-semibold text-emerald-600">
                    NPR {Number(tournament.totalPrizePool || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Total due</span>
                <span className="text-lg font-bold text-emerald-600">
                  NPR {Number(tournament.entryFeePerTeam || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                <AlertCircle size={16} className="text-gray-500" />
                Key rules
              </div>
              <ul className="space-y-2">
                {rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    {typeof rule === 'string' ? rule : rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
