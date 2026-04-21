import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Calendar, DollarSign, Coins } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { fetchAdminEarningsSummary } from '../store/adminAnalyticsService';

function formatHourLabel(h) {
  const hour = Number(h);
  if (!Number.isFinite(hour)) return '—';
  const h12 = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h12}${ampm}`;
}

function monthLabel(ym) {
  if (!ym || typeof ym !== 'string') return '';
  const [y, m] = ym.split('-').map(Number);
  if (!m) return ym;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

const Analytics = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchAdminEarningsSummary();
        if (!cancelled && res?.success && res?.data) setSummary(res.data);
        else if (!cancelled) setError(res?.message || 'Could not load analytics');
      } catch (e) {
        if (!cancelled) {
          setError(
            e?.response?.data?.message ||
              e?.message ||
              'Sign in as admin to view platform earnings'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fmt = (n) => `NPR ${Math.round(Number(n) || 0).toLocaleString()}`;

  const stats = useMemo(() => {
    if (loading) {
      return [
        { title: 'Platform share (50%)', value: '…', icon: DollarSign, bgColor: 'bg-blue-500/10', iconColor: 'text-blue-500', trend: '', trendPositive: true },
        { title: 'Gross booking volume', value: '…', icon: TrendingUp, bgColor: 'bg-green-500/10', iconColor: 'text-green-500', trend: '', trendPositive: true },
        { title: 'Ledger transactions', value: '…', icon: Calendar, bgColor: 'bg-purple-500/10', iconColor: 'text-purple-500', trend: '', trendPositive: true },
        { title: 'Owner pool (50%)', value: '…', icon: Coins, bgColor: 'bg-yellow-500/10', iconColor: 'text-yellow-500', trend: '', trendPositive: true },
      ];
    }
    if (!summary) {
      return [
        { title: 'Platform share (50%)', value: '—', icon: DollarSign, bgColor: 'bg-blue-500/10', iconColor: 'text-blue-500', trend: '', trendPositive: false },
        { title: 'Gross booking volume', value: '—', icon: TrendingUp, bgColor: 'bg-green-500/10', iconColor: 'text-green-500', trend: '', trendPositive: false },
        { title: 'Ledger transactions', value: '—', icon: Calendar, bgColor: 'bg-purple-500/10', iconColor: 'text-purple-500', trend: '', trendPositive: false },
        { title: 'Owner pool (50%)', value: '—', icon: Coins, bgColor: 'bg-yellow-500/10', iconColor: 'text-yellow-500', trend: '', trendPositive: false },
      ];
    }
    return [
      {
        title: 'Platform share (50%)',
        value: fmt(summary.platformTotal),
        icon: DollarSign,
        bgColor: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
        trend: 'From ledger',
        trendPositive: true,
      },
      {
        title: 'Gross booking volume',
        value: fmt(summary.grossTotal),
        icon: TrendingUp,
        bgColor: 'bg-green-500/10',
        iconColor: 'text-green-500',
        trend: 'Paid bookings',
        trendPositive: true,
      },
      {
        title: 'Ledger transactions',
        value: String(summary.transactionCount ?? 0),
        icon: Calendar,
        bgColor: 'bg-purple-500/10',
        iconColor: 'text-purple-500',
        trend: 'Court bookings',
        trendPositive: true,
      },
      {
        title: 'Owner pool (50%)',
        value: fmt(summary.ownerPoolTotal),
        icon: Coins,
        bgColor: 'bg-yellow-500/10',
        iconColor: 'text-yellow-500',
        trend: 'Sum of owner_earning',
        trendPositive: true,
      },
    ];
  }, [summary, loading]);

  const revenueData = useMemo(() => {
    const rows = summary?.monthlyPlatform || [];
    if (!rows.length) {
      return [{ month: '—', revenue: 0, bookings: 0 }];
    }
    return rows.map((r) => ({
      month: monthLabel(r.month),
      revenue: Math.round(Number(r.platformShare) || 0),
      bookings: r.bookingCount || 0,
    }));
  }, [summary]);

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue), 1);

  const topFutsals = useMemo(() => {
    const list = summary?.topVenues || [];
    return list.map((v, i) => ({
      rank: i + 1,
      name: v.name || 'Venue',
      revenue: Math.round(Number(v.platformShare) || 0),
      bookings: v.bookingCount || 0,
      trend: 'Platform share',
    }));
  }, [summary]);

  const peakHours = useMemo(() => {
    const raw = summary?.peakHours || [];
    if (!raw.length) {
      return [{ hour: '—', bookings: 0 }];
    }
    const sorted = [...raw].sort((a, b) => (a.hour ?? 0) - (b.hour ?? 0));
    return sorted.map((p) => ({
      hour: formatHourLabel(p.hour),
      bookings: p.bookings || 0,
    }));
  }, [summary]);

  const maxBookings = Math.max(...peakHours.map((h) => h.bookings), 1);

  const dailyActiveUsers = [
    { day: 'Mon', users: 0 },
    { day: 'Tue', users: 0 },
    { day: 'Wed', users: 0 },
    { day: 'Thu', users: 0 },
    { day: 'Fri', users: 0 },
    { day: 'Sat', users: 0 },
    { day: 'Sun', users: 0 },
  ];

  const bookingDistribution = [
    { label: 'Court bookings (paid)', value: 100, color: '#06b6d4' },
  ];

  const maxUsers = 1;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        <AdminHeader
          title="Perform Analytics"
          subtitle="Platform earnings from the financial ledger (50% split)"
          notificationCount={0}
          showNotification={true}
          showTime={true}
        />

        <div className="p-8">
          {error && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {error}
            </div>
          )}

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

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Platform share by month</h2>
                <p className="text-gray-500 text-sm">Sum of commission_amount from paid court bookings (ledger)</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                <span className="text-gray-600 text-sm">Platform NPR</span>
              </div>
            </div>

            <div className="relative h-64">
              <svg className="w-full h-full" viewBox="0 0 1200 250" preserveAspectRatio="none">
                <line x1="0" y1="50" x2="1200" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="100" x2="1200" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="150" x2="1200" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="200" x2="1200" y2="200" stroke="#e5e7eb" strokeWidth="1" />

                <defs>
                  <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {revenueData.length > 1 ? (
                  <>
                    <path
                      d={`M 0,${250 - (revenueData[0].revenue / maxRevenue) * 200} ${revenueData
                        .map(
                          (d, i) =>
                            `L ${(i * 1200) / Math.max(revenueData.length - 1, 1)},${250 - (d.revenue / maxRevenue) * 200}`
                        )
                        .join(' ')} L 1200,250 L 0,250 Z`}
                      fill="url(#revenueGrad)"
                    />
                    <path
                      d={`M 0,${250 - (revenueData[0].revenue / maxRevenue) * 200} ${revenueData
                        .map(
                          (d, i) =>
                            `L ${(i * 1200) / Math.max(revenueData.length - 1, 1)},${250 - (d.revenue / maxRevenue) * 200}`
                        )
                        .join(' ')}`}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3"
                    />
                  </>
                ) : (
                  <text x="40" y="120" className="fill-gray-400 text-sm">
                    No ledger months yet
                  </text>
                )}
              </svg>

              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-gray-500 text-xs pr-2">
                <span>{fmt(maxRevenue)}</span>
                <span>{fmt(maxRevenue * 0.75)}</span>
                <span>{fmt(maxRevenue * 0.5)}</span>
                <span>{fmt(maxRevenue * 0.25)}</span>
                <span>NPR 0</span>
              </div>

              <div className="absolute bottom-0 left-0 w-full flex justify-between text-gray-500 text-xs pt-2 pl-10">
                {revenueData.map((d, i) => (
                  <span key={i} className="truncate max-w-[72px] text-center">
                    {d.month}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Daily active users</h2>
                <p className="text-gray-500 text-sm">Not wired to backend yet — placeholder only</p>
              </div>

              <div className="h-64 flex items-end justify-between gap-4">
                {dailyActiveUsers.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gray-200 rounded-t-lg"
                      style={{ height: `${(data.users / maxUsers) * 8}%`, minHeight: '4px' }}
                    />
                    <span className="text-gray-600 text-sm font-medium">{data.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Booking mix</h2>
                <p className="text-gray-500 text-sm">Placeholder — ledger is court bookings only today</p>
              </div>

              <div className="flex items-center justify-center gap-8">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <path d="M 50 50 L 50 10 A 40 40 0 1 1 49.99 10 Z" fill="#06b6d4" />
                    <circle cx="50" cy="50" r="20" fill="white" />
                  </svg>
                </div>
                <div className="space-y-3">
                  {bookingDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-8">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-700 text-sm">{item.label}</span>
                      </div>
                      <span className="text-gray-900 font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Peak booking hours</h2>
                <p className="text-gray-500 text-sm">Paid bookings by hour of day (server UTC)</p>
              </div>

              <div className="space-y-3">
                {peakHours.map((data, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-gray-600 text-sm font-medium w-16">{data.hour}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full flex items-center justify-end pr-3 transition-all"
                        style={{ width: `${(data.bookings / maxBookings) * 100}%` }}
                      >
                        <span className="text-white text-xs font-bold">{data.bookings}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Top venues by platform share</h2>
                <p className="text-gray-500 text-sm">50% of gross per booking (ledger)</p>
              </div>

              <div className="space-y-4">
                {topFutsals.length === 0 && (
                  <p className="text-sm text-gray-500">No ledger data yet.</p>
                )}
                {topFutsals.map((futsal) => (
                  <div
                    key={futsal.rank}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {futsal.rank}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 font-semibold mb-1">{futsal.name}</h4>
                      <p className="text-gray-500 text-xs">{futsal.bookings} ledger rows</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 font-bold text-lg">NPR {futsal.revenue.toLocaleString()}</p>
                      <p className="text-green-500 text-xs">{futsal.trend}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
