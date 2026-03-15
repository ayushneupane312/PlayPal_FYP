import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FutsalOwnerSidebar from './FutsalOwnerSidebar';
import Header from './components/Header';
import { showToast } from '../utils/showToast';

const API_BACKEND = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '';

export default function FutsalOwnerTournamentsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [venueId, setVenueId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxTeams: '',
    entryFeePerTeam: '',
    minPlayersPerTeam: 5,
    format: 'knockout',
    paymentOnline: false,
    paymentCash: true,
    bannerPreview: '',
    rules: '',
    prizes: {
      winner: { enabled: true, amount: '', label: 'Winner' },
      runnerUp: { enabled: true, amount: '', label: 'Runner-up' },
      bestPlayer: { enabled: false, amount: '', label: 'Best Player' },
      topScorer: { enabled: false, amount: '', label: 'Top Scorer' },
      bestGoalkeeper: { enabled: false, amount: '', label: 'Best Goalkeeper' },
      risingPlayer: { enabled: false, amount: '', label: 'Rising Player' },
      fairPlay: { enabled: false, amount: '', label: 'Fair Play Team' }
    }
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const venueRes = await axios.get(`${API_BACKEND}/api/venue/my-venue`, {
          withCredentials: true
        });
        if (venueRes.data?.success && venueRes.data.data) {
          setVenueId(venueRes.data.data._id);
        }

        try {
          const listRes = await axios.get(`${API_BACKEND}/api/tournaments`, {
            withCredentials: true
          });
          if (listRes.data?.success) {
            setTournaments(listRes.data.data || []);
          }
        } catch (err) {
          console.warn('Tournament list not available yet:', err.response?.data || err.message);
        }
      } catch (err) {
        console.error('Failed to load venue/tournaments', err);
        showToast.error('Could not load tournament data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePrizeToggle = (key) => {
    setForm((prev) => ({
      ...prev,
      prizes: {
        ...prev.prizes,
        [key]: {
          ...prev.prizes[key],
          enabled: !prev.prizes[key].enabled
        }
      }
    }));
  };

  const handlePrizeChange = (key, field, value) => {
    setForm((prev) => ({
      ...prev,
      prizes: {
        ...prev.prizes,
        [key]: {
          ...prev.prizes[key],
          [field]: value
        }
      }
    }));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((prev) => ({
        ...prev,
        bannerPreview: ev.target?.result || ''
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!venueId) {
      showToast.error('Please create your venue first before creating a tournament.');
      return false;
    }
    const required = [
      'name',
      'startDate',
      'endDate',
      'registrationDeadline',
      'maxTeams',
      'entryFeePerTeam',
      'rules'
    ];
    for (const key of required) {
      if (!form[key]) {
        showToast.error('Please fill all required fields.');
        return false;
      }
    }
    if (!form.paymentOnline && !form.paymentCash) {
      showToast.error('Select at least one payment method.');
      return false;
    }
    return true;
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const draft = {
        ...form,
        createdAt: new Date().toISOString()
      };
      setTournaments((prev) => [draft, ...prev]);
      showToast.success('Tournament draft saved. Backend integration comes next.');
    } finally {
      setSaving(false);
    }
  };

  const upcoming = tournaments.filter(
    (t) => !t.status || t.status === 'upcoming' || t.status === 'registration_open'
  );
  const ongoing = tournaments.filter((t) => t.status === 'in_progress');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <FutsalOwnerSidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Header />

        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Tournaments</h1>
              <p className="text-sm text-gray-500">
                Create, manage and track futsal tournaments hosted at your venue.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <p className="text-sm text-gray-500">Loading tournament workspace...</p>
              </div>
            </div>
          ) : !venueId ? (
            <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">No venue found</h2>
                <p className="text-sm text-gray-500 mt-1 max-w-xl">
                  To organise tournaments, you first need to create your futsal venue profile with
                  courts, pricing and operating hours.
                </p>
              </div>
            </div>
          ) : (
            <>
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <p className="text-xs text-gray-500">Upcoming / Open</p>
                  <p className="text-2xl font-semibold text-emerald-600 mt-1">
                    {upcoming.length.toString().padStart(2, '0')}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <p className="text-xs text-gray-500">Ongoing</p>
                  <p className="text-2xl font-semibold text-blue-600 mt-1">
                    {ongoing.length.toString().padStart(2, '0')}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <p className="text-xs text-gray-500">Total tournaments (this account)</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {tournaments.length.toString().padStart(2, '0')}
                  </p>
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Create new tournament
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  Configure the key details, registration window and prize structure. Fixtures and
                  advanced options will be wired to the backend in the next step.
                </p>

                <form onSubmit={handleSaveDraft} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tournament name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInput}
                        placeholder="PlayPal Futsal Championship 2026"
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Short description
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleInput}
                        rows={3}
                        placeholder="Highlight the level, format and any special rules or prizes."
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tournament rules & important information *
                      </label>
                      <textarea
                        name="rules"
                        value={form.rules}
                        onChange={handleInput}
                        rows={4}
                        placeholder="Include eligibility, match duration, tie-break rules, fair play policy, ID checks, refund policy, etc."
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Start date *
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={form.startDate}
                          onChange={handleInput}
                          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          End date *
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={form.endDate}
                          onChange={handleInput}
                          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Registration deadline *
                        </label>
                        <input
                          type="date"
                          name="registrationDeadline"
                          value={form.registrationDeadline}
                          onChange={handleInput}
                          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Maximum teams *
                        </label>
                        <input
                          type="number"
                          min={2}
                          name="maxTeams"
                          value={form.maxTeams}
                          onChange={handleInput}
                          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Min players per team
                        </label>
                        <input
                          type="number"
                          min={5}
                          name="minPlayersPerTeam"
                          value={form.minPlayersPerTeam}
                          onChange={handleInput}
                          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tournament banner
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Recommended size 1200 × 600px. This is shown on the player-side tournament
                        page.
                      </p>
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-700 hover:border-emerald-500 hover:text-emerald-600">
                          <span>Upload banner</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleBannerChange}
                          />
                        </label>
                        {form.bannerPreview && (
                          <img
                            src={form.bannerPreview}
                            alt="Preview"
                            className="h-20 rounded-md border border-gray-200 object-cover"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tournament format *
                      </label>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {['knockout', 'group_knockout', 'round_robin'].map((value) => {
                          const label =
                            value === 'knockout'
                              ? 'Knockout'
                              : value === 'group_knockout'
                              ? 'Group + Knockout'
                              : 'Round Robin';
                          const hint =
                            value === 'knockout'
                              ? 'Single elimination bracket'
                              : value === 'group_knockout'
                              ? 'Groups then knockout rounds'
                              : 'Everyone plays everyone';
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  format: value
                                }))
                              }
                              className={`text-left rounded-lg border px-3 py-2 text-xs transition ${
                                form.format === value
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                  : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'
                              }`}
                            >
                              <div className="font-medium">{label}</div>
                              <div className="text-[11px] text-gray-500 mt-0.5">{hint}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Entry fee per team (NPR) *
                      </label>
                      <input
                        type="number"
                        name="entryFeePerTeam"
                        min={0}
                        value={form.entryFeePerTeam}
                        onChange={handleInput}
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Payment methods *</p>
                      <div className="flex items-center gap-4 text-sm text-gray-700">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="paymentOnline"
                            checked={form.paymentOnline}
                            onChange={handleInput}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Online</span>
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="paymentCash"
                            checked={form.paymentCash}
                            onChange={handleInput}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Cash at venue</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Prizes & awards</p>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {Object.entries(form.prizes).map(([key, prize]) => (
                          <div
                            key={key}
                            className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                          >
                            <label className="inline-flex items-center gap-2 w-32 text-xs font-medium text-gray-700">
                              <input
                                type="checkbox"
                                checked={prize.enabled}
                                onChange={() => handlePrizeToggle(key)}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span>{prize.label}</span>
                            </label>
                            <input
                              type="number"
                              value={prize.amount}
                              onChange={(e) => handlePrizeChange(key, 'amount', e.target.value)}
                              placeholder="Amount"
                              disabled={!prize.enabled}
                              className="w-28 rounded-md border border-gray-200 px-2 py-1 text-xs disabled:bg-gray-100"
                            />
                            <input
                              type="text"
                              value={prize.description || ''}
                              onChange={(e) =>
                                handlePrizeChange(key, 'description', e.target.value)
                              }
                              placeholder="Optional description"
                              disabled={!prize.enabled}
                              className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-xs disabled:bg-gray-100"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {saving ? 'Saving draft...' : 'Save tournament draft'}
                      </button>
                    </div>
                  </div>
                </form>
              </section>

              <section className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900">Your tournaments</h2>
                </div>

                {tournaments.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No tournaments created yet. Your drafts and published tournaments will appear
                    here.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tournaments.map((t, index) => (
                      <div
                        key={t._id || index}
                        className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden"
                      >
                        {t.bannerImage || t.bannerPreview ? (
                          <img
                            src={t.bannerImage || t.bannerPreview}
                            alt={t.name}
                            className="h-28 w-full object-cover"
                          />
                        ) : (
                          <div className="h-28 w-full bg-gradient-to-r from-emerald-500 to-emerald-700 flex items-center justify-center text-sm text-emerald-50">
                            Tournament banner
                          </div>
                        )}
                        <div className="p-3 flex-1 flex flex-col">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {t.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                            {t.description || 'No description provided yet.'}
                          </p>

                          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                            <span>
                              Teams:{' '}
                              {t.stats?.registeredTeams != null ? t.stats.registeredTeams : 0}/
                              {t.maxTeams || '-'}
                            </span>
                            <span>
                              Start:{' '}
                              {t.startDate
                                ? new Date(t.startDate).toLocaleDateString()
                                : 'Not set'}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                            <span>
                              Fee:{' '}
                              {t.entryFeePerTeam
                                ? `NPR ${Number(t.entryFeePerTeam).toLocaleString()}`
                                : '-'}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                              {t.status || 'Draft'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

