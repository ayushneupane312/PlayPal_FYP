import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Wallet,
  BarChart3,
  CreditCard,
  PieChart,
  Coins,
  Receipt,
  Users,
} from 'lucide-react';
import FutsalOwnerSidebar from './FutsalOwnerSidebar';
import Header from './components/Header';
import { getOwnerEarnings } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(n) {
  return `NPR ${Math.round(Number(n) || 0).toLocaleString()}`;
}

function monthLabel(ym) {
  if (!ym || typeof ym !== 'string') return '';
  const [y, m] = ym.split('-').map(Number);
  if (!m) return ym;
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

// ─── component ──────────────────────────────────────────────────────────────

export default function EarningPage() {
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getOwnerEarnings();
        if (cancelled) return;
        if (res?.success && res?.data) {
          setData(res.data);
          setError(null);
        } else {
          setData(null);
          setError(res?.message || 'Could not load earnings');
        }
      } catch (e) {
        if (!cancelled) {
          setData(null);
          setError(
            e?.response?.data?.message ||
              e?.message ||
              'Failed to load earnings. Ensure you are logged in as a futsal owner with a venue.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── stat cards (mirrors Analytics.jsx stats pattern) ──────────────────────

  const stats = useMemo(() => {
    if (loading) {
      return [
        { title: 'Your share (50%)', value: '…', icon: Wallet, bgColor: 'bg-emerald-500/10', iconColor: 'text-emerald-500', trend: '' },
        { title: 'Gross booking volume', value: '…', icon: TrendingUp, bgColor: 'bg-green-500/10', iconColor: 'text-green-500', trend: '' },
        { title: 'Platform share (50%)', value: '…', icon: PieChart, bgColor: 'bg-blue-500/10', iconColor: 'text-blue-500', trend: '' },
        { title: 'Paid bookings', value: '…', icon: Calendar, bgColor: 'bg-yellow-500/10', iconColor: 'text-yellow-500', trend: '' },
      ];
    }
    if (!data) {
      return [
        { title: 'Your share (50%)', value: '—', icon: Wallet, bgColor: 'bg-emerald-500/10', iconColor: 'text-emerald-500', trend: '' },
        { title: 'Gross booking volume', value: '—', icon: TrendingUp, bgColor: 'bg-green-500/10', iconColor: 'text-green-500', trend: '' },
        { title: 'Platform share (50%)', value: '—', icon: PieChart, bgColor: 'bg-blue-500/10', iconColor: 'text-blue-500', trend: '' },
        { title: 'Paid bookings', value: '—', icon: Calendar, bgColor: 'bg-yellow-500/10', iconColor: 'text-yellow-500', trend: '' },
      ];
    }
    return [
      {
        title: 'Your share (50%)',
        value: fmt(data.ownerNetTotal ?? 0),
        icon: Wallet,
        bgColor: 'bg-emerald-500/10',
        iconColor: 'text-emerald-500',
        trend: `This month: ${fmt(data.monthOwnerNet ?? 0)}`,
      },
      {
        title: 'Gross booking volume',
        value: fmt(data.grossTotal ?? 0),
        icon: TrendingUp,
        bgColor: 'bg-green-500/10',
        iconColor: 'text-green-500',
        trend: data.source === 'ledger' ? 'From ledger' : 'Estimate',
      },
      {
        title: 'Platform share (50%)',
        value: fmt(data.commissionTotal ?? 0),
        icon: PieChart,
        bgColor: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
        trend: 'Super-admin cut',
      },
      {
        title: 'Paid bookings',
        value: String(data.totalBookings ?? 0),
        icon: Calendar,
        bgColor: 'bg-yellow-500/10',
        iconColor: 'text-yellow-500',
        trend: `Today (paid): ${data.todaysPaidBookingsCount ?? 0}`,
      },
    ];
  }, [data, loading]);

  // ── monthly bar data ───────────────────────────────────────────────────────

  const monthlyData = useMemo(() => {
    const src = data?.monthlyOwnerNet || data?.monthlyEarnings || {};
    const keys = Object.keys(src).sort();
    if (!keys.length) return [];
    const vals = keys.map((k) => Number(src[k]) || 0);
    const max = Math.max(...vals, 1);
    return keys.map((k, i) => ({
      key: k,
      month: monthLabel(k),
      value: vals[i],
      pct: (vals[i] / max) * 100,
    }));
  }, [data]);

  const maxMonthly = Math.max(...(monthlyData.map((d) => d.value)), 1);

  // ── recent bookings rows ───────────────────────────────────────────────────

  const recentRows = useMemo(() => {
    return (data?.bookings || []).map((b) => ({
      id: b._id,
      name: b.user?.name || 'Guest',
      court: b.court?.name || 'Court',
      dateShort: b.bookingDate
        ? new Date(b.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : '—',
      time: `${b.timeSlot?.startTime || '—'} – ${b.timeSlot?.endTime || '—'}`,
      gross: fmt(b.pricing?.totalAmount),
      yourShare: fmt((Number(b.pricing?.totalAmount) || 0) * 0.5),
      status: (b.bookingStatus || '').charAt(0).toUpperCase() + (b.bookingStatus || '').slice(1) || '—',
      initial: (b.user?.name || 'B').charAt(0).toUpperCase(),
    }));
  }, [data]);

  const ledgerRows = data?.recentTransactions || [];

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <FutsalOwnerSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onCollapseChange={setCollapsed}
      />

      <div className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        <Header
          title="Earnings & Payouts"
          subtitle="Your venue earnings from the financial ledger (50% split)"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        <div className="p-8">

          {/* ── error banner ── */}
          {error && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {error}
            </div>
          )}

          {/* ── loading spinner ── */}
          {loading && (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="mt-4 text-gray-500 text-sm">Loading earnings…</p>
              </div>
            </div>
          )}

          {!loading && (
            <>
              {/* ── venue/source pill (mirrors Analytics multi-venue note) ── */}
              {data?.venueCount != null && (
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                    <Users className="w-4 h-4 text-emerald-500" />
                    Aggregating{' '}
                    <span className="font-semibold text-gray-800">{data.venueCount}</span> venue
                    {data.venueCount !== 1 ? 's' : ''}
                    {data.activeCourtsCount != null && (
                      <>
                        {' '}·{' '}
                        <span className="font-semibold text-gray-800">{data.activeCourtsCount}</span>{' '}
                        active courts
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                    Data source:{' '}
                    <span className="font-medium text-gray-700">{data.source || '—'}</span>
                  </div>
                </div>
              )}

              {/* ── stat cards — identical card pattern to Analytics.jsx ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                          <Icon className={stat.iconColor} size={24} />
                        </div>
                        {stat.trend ? (
                          <span className="text-xs font-medium text-gray-500 max-w-[120px] text-right">
                            {stat.trend}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                      <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                    </div>
                  );
                })}
              </div>

              {/* ── monthly chart — same SVG line-chart approach as Analytics.jsx ── */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Your share by month</h2>
                    <p className="text-gray-500 text-sm">
                      50% owner net from ledger or estimate (NPR)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="text-gray-600 text-sm">Owner NPR</span>
                  </div>
                </div>

                <div className="relative h-64">
                  <svg className="w-full h-full" viewBox="0 0 1200 250" preserveAspectRatio="none">
                    <line x1="0" y1="50" x2="1200" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="0" y1="100" x2="1200" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="0" y1="150" x2="1200" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="0" y1="200" x2="1200" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                    <defs>
                      <linearGradient id="ownerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {monthlyData.length > 1 ? (
                      <>
                        <path
                          d={`M 0,${250 - (monthlyData[0].value / maxMonthly) * 200} ${monthlyData
                            .map(
                              (d, i) =>
                                `L ${(i * 1200) / Math.max(monthlyData.length - 1, 1)},${250 - (d.value / maxMonthly) * 200}`
                            )
                            .join(' ')} L 1200,250 L 0,250 Z`}
                          fill="url(#ownerGrad)"
                        />
                        <path
                          d={`M 0,${250 - (monthlyData[0].value / maxMonthly) * 200} ${monthlyData
                            .map(
                              (d, i) =>
                                `L ${(i * 1200) / Math.max(monthlyData.length - 1, 1)},${250 - (d.value / maxMonthly) * 200}`
                            )
                            .join(' ')}`}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                        />
                      </>
                    ) : (
                      <text x="40" y="120" fill="#9ca3af" fontSize="16">
                        No monthly data yet
                      </text>
                    )}
                  </svg>

                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-gray-500 text-xs pr-2">
                    <span>{fmt(maxMonthly)}</span>
                    <span>{fmt(maxMonthly * 0.75)}</span>
                    <span>{fmt(maxMonthly * 0.5)}</span>
                    <span>{fmt(maxMonthly * 0.25)}</span>
                    <span>NPR 0</span>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full flex justify-between text-gray-500 text-xs pt-2 pl-10">
                    {monthlyData.map((d, i) => (
                      <span key={i} className="truncate max-w-[72px] text-center">
                        {d.month}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── bottom two-column grid ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* snapshot card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Earnings snapshot</h2>
                    <p className="text-gray-500 text-sm">Today &amp; all-time policy summary</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Today (your share)', value: fmt(data?.todayOwnerNet ?? 0), color: 'text-emerald-600' },
                      { label: 'This month (your share)', value: fmt(data?.monthOwnerNet ?? 0), color: 'text-emerald-600' },
                      { label: 'All-time gross', value: fmt(data?.grossTotal ?? 0), color: 'text-gray-900' },
                      { label: 'All-time your share (50%)', value: fmt(data?.ownerNetTotal ?? 0), color: 'text-emerald-600' },
                      { label: 'All-time platform (50%)', value: fmt(data?.commissionTotal ?? 0), color: 'text-blue-600' },
                    ].map((row, i, arr) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between gap-2 py-2 ${
                          i < arr.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <span className="text-gray-600 text-sm">{row.label}</span>
                        <span className={`font-semibold text-sm ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <span className="text-gray-600 text-sm flex items-center gap-1">
                        <CreditCard className="w-4 h-4 text-gray-400" /> Data source
                      </span>
                      <span className="font-medium text-gray-800 text-sm">{data?.source || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* split policy card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Revenue split policy</h2>
                    <p className="text-gray-500 text-sm">
                      Applied on every paid court booking (gross = <code className="bg-gray-100 px-1 rounded text-xs">pricing.totalAmount</code>)
                    </p>
                  </div>

                  {/* visual split bar */}
                  <div className="mb-6">
                    <div className="flex rounded-xl overflow-hidden h-8 text-xs font-semibold">
                      <div className="flex-1 bg-emerald-500 flex items-center justify-center text-white">
                        50% You
                      </div>
                      <div className="flex-1 bg-blue-500 flex items-center justify-center text-white">
                        50% Platform
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { icon: Wallet, color: 'bg-emerald-500/10', iconColor: 'text-emerald-500', label: 'Futsal owner', value: '50% of gross', sub: 'owner_earning in ledger' },
                      { icon: DollarSign, color: 'bg-blue-500/10', iconColor: 'text-blue-500', label: 'Platform / super admin', value: '50% of gross', sub: 'commission_amount in ledger' },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                            <Icon className={item.iconColor} size={18} />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-semibold text-sm">{item.label}</p>
                            <p className="text-gray-500 text-xs">{item.sub}</p>
                          </div>
                          <span className="font-bold text-gray-900">{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── recent bookings + ledger rows ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* recent paid bookings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Recent paid bookings</h2>
                      <p className="text-gray-500 text-sm">Latest from your venue(s)</p>
                    </div>
                    <Receipt className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                    {recentRows.length === 0 ? (
                      <p className="p-6 text-sm text-gray-500">No paid bookings yet.</p>
                    ) : (
                      recentRows.map((row) => (
                        <div
                          key={row.id}
                          className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center justify-center flex-shrink-0 text-sm">
                              {row.initial}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate text-sm">{row.name}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {row.court} · {row.dateShort}
                              </p>
                              <p className="text-xs text-gray-400">{row.time}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 pl-2">
                            <p className="text-sm font-bold text-gray-900">{row.gross}</p>
                            <p className="text-xs text-emerald-600 font-medium">You: {row.yourShare}</p>
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                                row.status.toLowerCase() === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {row.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* ledger lines — mirrors top-venues card layout from Analytics.jsx */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Ledger lines</h2>
                    <p className="text-gray-500 text-sm">Gross · your share · platform (per transaction)</p>
                  </div>
                  <div className="p-4 max-h-[400px] overflow-y-auto">
                    {ledgerRows.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4">
                        {data?.source === 'ledger'
                          ? 'No rows in this view.'
                          : 'Ledger rows appear after payments are confirmed.'}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {ledgerRows.map((t, i) => (
                          <div
                            key={t._id || i}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-500">Gross</span>
                                <span className="text-sm font-semibold text-gray-900">
                                  {fmt(t.gross_amount)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                <span className="text-xs text-gray-500">Your share (50%)</span>
                                <span className="text-sm font-bold text-emerald-600">
                                  {fmt(t.owner_earning)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                <span className="text-xs text-gray-500">Platform (50%)</span>
                                <span className="text-sm text-blue-600">
                                  {fmt(t.commission_amount)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}