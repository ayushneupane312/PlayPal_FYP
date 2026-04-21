import React, { useState, useEffect, useCallback, useMemo, useId } from 'react';
import { DollarSign, Users, Calendar, AlertTriangle, Building2, Scale, Activity, TrendingUp, Clock, CheckCircle, UserCheck, Loader2, Bell } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import SearchAndNotificationBar from '../components/SearchAndNotificationBar';
import notificationService from '../store/notificationService';
import { fetchAdminEarningsSummary } from '../store/adminAnalyticsService';

function formatNotificationTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

const typeToIcon = {
  admin_alert: AlertTriangle,
  booking_created: Calendar,
  booking_status: CheckCircle,
  system: Bell,
  team_invite: Users,
  team_join_request: UserCheck,
  team_join_result: CheckCircle,
  match_found: Activity,
  default: Bell
};

const typeToStyle = {
  admin_alert: { bg: 'bg-red-500/10', color: 'text-red-500' },
  booking_created: { bg: 'bg-blue-500/10', color: 'text-blue-500' },
  booking_status: { bg: 'bg-green-500/10', color: 'text-green-500' },
  system: { bg: 'bg-gray-500/10', color: 'text-gray-500' },
  default: { bg: 'bg-cyan-500/10', color: 'text-cyan-500' }
};

function formatNprTick(value) {
  const n = Math.round(Number(value) || 0);
  if (Math.abs(n) >= 100000) return `NPR ${(n / 1000).toFixed(0)}k`;
  if (Math.abs(n) >= 1000) return `NPR ${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `NPR ${n.toLocaleString()}`;
}

function fmtNpr(n) {
  return `NPR ${Math.round(Number(n) || 0).toLocaleString()}`;
}

/** Last 12 calendar months; merge ledger `monthlyPlatform` rows by `YYYY-MM`. */
function lastTwelveMonthsSeries(monthlyPlatform) {
  const map = new Map();
  for (const r of monthlyPlatform || []) {
    if (!r?.month) continue;
    map.set(r.month, {
      revenue: Math.round(Number(r.platformShare) || 0),
      bookings: Number(r.bookingCount) || 0,
    });
  }
  const now = new Date();
  const rows = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const v = map.get(key) || { revenue: 0, bookings: 0 };
    rows.push({
      month: d.toLocaleString('en-US', { month: 'short' }),
      revenue: v.revenue,
      bookings: v.bookings,
    });
  }
  return rows;
}

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [adminSummary, setAdminSummary] = useState(null);
  const [adminSummaryLoading, setAdminSummaryLoading] = useState(true);
  const [adminSummaryError, setAdminSummaryError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchAdminEarningsSummary();
        if (!cancelled && res?.success && res?.data) {
          setAdminSummary(res.data);
          setAdminSummaryError(null);
        } else if (!cancelled) setAdminSummaryError(res?.message || 'Could not load dashboard metrics');
      } catch (e) {
        if (!cancelled) {
          setAdminSummaryError(
            e?.response?.data?.message || e?.message || 'Sign in as admin to load metrics'
          );
        }
      } finally {
        if (!cancelled) setAdminSummaryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setNotificationsLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res?.data ?? []);
    } catch (_) {
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const stats = useMemo(() => {
    if (adminSummaryLoading) {
      return [
        {
          title: 'Platform share (50%)',
          value: '…',
          subtitle: 'Loading…',
          icon: DollarSign,
          bgColor: 'bg-blue-500/10',
          iconColor: 'text-blue-500',
          pill: null,
          pillLoading: true,
        },
        {
          title: 'Gross booking volume',
          value: '…',
          subtitle: 'Loading…',
          icon: TrendingUp,
          bgColor: 'bg-green-500/10',
          iconColor: 'text-green-500',
          pill: null,
          pillLoading: true,
        },
        {
          title: 'Ledger transactions',
          value: '…',
          subtitle: 'Loading…',
          icon: Calendar,
          bgColor: 'bg-yellow-500/10',
          iconColor: 'text-yellow-500',
          pill: null,
          pillLoading: true,
        },
      ];
    }
    const s = adminSummary;
    if (!s) {
      return [
        {
          title: 'Platform share (50%)',
          value: '—',
          subtitle: adminSummaryError || 'Unavailable',
          icon: DollarSign,
          bgColor: 'bg-blue-500/10',
          iconColor: 'text-blue-500',
          pill: null,
          pillLoading: false,
        },
        {
          title: 'Gross booking volume',
          value: '—',
          subtitle: adminSummaryError || 'Unavailable',
          icon: TrendingUp,
          bgColor: 'bg-green-500/10',
          iconColor: 'text-green-500',
          pill: null,
          pillLoading: false,
        },
        {
          title: 'Ledger transactions',
          value: '—',
          subtitle: adminSummaryError || 'Unavailable',
          icon: Calendar,
          bgColor: 'bg-yellow-500/10',
          iconColor: 'text-yellow-500',
          pill: null,
          pillLoading: false,
        },
      ];
    }
    return [
      {
        title: 'Platform share (50%)',
        value: fmtNpr(s.platformTotal),
        subtitle: 'From financial ledger',
        icon: DollarSign,
        bgColor: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
        pill: 'Live',
        pillLoading: false,
      },
      {
        title: 'Gross booking volume',
        value: fmtNpr(s.grossTotal),
        subtitle: 'Paid court bookings (sum)',
        icon: TrendingUp,
        bgColor: 'bg-green-500/10',
        iconColor: 'text-green-500',
        pill: 'Live',
        pillLoading: false,
      },
      {
        title: 'Ledger transactions',
        value: String(s.transactionCount ?? 0),
        subtitle: 'Court booking rows recorded',
        icon: Calendar,
        bgColor: 'bg-yellow-500/10',
        iconColor: 'text-yellow-500',
        pill: 'Live',
        pillLoading: false,
      },
    ];
  }, [adminSummary, adminSummaryLoading, adminSummaryError]);

  const secondaryStats = useMemo(() => {
    if (adminSummaryLoading) {
      return [
        { title: 'Owner pool (50%)', value: '…', icon: Scale, bgColor: 'bg-purple-500/10', iconColor: 'text-purple-500', pill: null, pillLoading: true },
        { title: 'Top venues (ledger)', value: '…', icon: Building2, bgColor: 'bg-cyan-500/10', iconColor: 'text-cyan-500', pill: null, pillLoading: true },
        { title: 'Peak hour bookings', value: '…', icon: Activity, bgColor: 'bg-orange-500/10', iconColor: 'text-orange-500', pill: null, pillLoading: true },
      ];
    }
    const s = adminSummary;
    if (!s) {
      return [
        { title: 'Owner pool (50%)', value: '—', icon: Scale, bgColor: 'bg-purple-500/10', iconColor: 'text-purple-500', pill: null, pillLoading: false },
        { title: 'Top venues (ledger)', value: '—', icon: Building2, bgColor: 'bg-cyan-500/10', iconColor: 'text-cyan-500', pill: null, pillLoading: false },
        { title: 'Peak hour bookings', value: '—', icon: Activity, bgColor: 'bg-orange-500/10', iconColor: 'text-orange-500', pill: null, pillLoading: false },
      ];
    }
    const topN = (s.topVenues || []).length;
    const peakMax = (s.peakHours || []).reduce((m, h) => Math.max(m, Number(h.bookings) || 0), 0);
    return [
      {
        title: 'Owner pool (50%)',
        value: fmtNpr(s.ownerPoolTotal),
        icon: Scale,
        bgColor: 'bg-purple-500/10',
        iconColor: 'text-purple-500',
        pill: 'Live',
        pillLoading: false,
      },
      {
        title: 'Top venues (ledger)',
        value: String(topN),
        icon: Building2,
        bgColor: 'bg-cyan-500/10',
        iconColor: 'text-cyan-500',
        pill: 'Top 10',
        pillLoading: false,
      },
      {
        title: 'Peak hour bookings',
        value: String(peakMax),
        icon: Activity,
        bgColor: 'bg-orange-500/10',
        iconColor: 'text-orange-500',
        pill: 'Peak',
        pillLoading: false,
      },
    ];
  }, [adminSummary, adminSummaryLoading]);

  const chartId = useId().replace(/:/g, '');

  const chartRows = useMemo(() => {
    if (adminSummaryLoading) return null;
    return lastTwelveMonthsSeries(adminSummary?.monthlyPlatform);
  }, [adminSummary, adminSummaryLoading]);

  const chartGeometry = useMemo(() => {
    if (!chartRows?.length) return null;
    const data = chartRows;
    const W = 800;
    const H = 260;
    const ML = 62;
    const MR = 54;
    const MT = 16;
    const MB = 40;
    const iw = W - ML - MR;
    const ih = H - MT - MB;
    const n = data.length;
    if (n < 2) return null;

    const revs = data.map((d) => d.revenue);
    const books = data.map((d) => d.bookings);
    let revLo = Math.min(...revs);
    let revHi = Math.max(...revs);
    let bookLo = Math.min(...books);
    let bookHi = Math.max(...books);

    const padRange = (lo, hi) => {
      const span = hi - lo || 1;
      return [lo - span * 0.06, hi + span * 0.06];
    };
    [revLo, revHi] = padRange(revLo, revHi);
    [bookLo, bookHi] = padRange(bookLo, bookHi);
    if (!(revHi > revLo)) {
      revLo = 0;
      revHi = 1;
    }
    if (!(bookHi > bookLo)) {
      bookLo = 0;
      bookHi = 1;
    }

    const xAt = (i) => ML + (i / (n - 1)) * iw;
    const yRev = (r) => MT + ih * (1 - (r - revLo) / (revHi - revLo));
    const yBook = (b) => MT + ih * (1 - (b - bookLo) / (bookHi - bookLo));

    const revPoints = data.map((d, i) => ({ x: xAt(i), y: yRev(d.revenue) }));
    const bookPoints = data.map((d, i) => ({ x: xAt(i), y: yBook(d.bookings) }));

    const revenueLineD = revPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    const revenueAreaD = `M ${revPoints[0].x},${MT + ih} ${revPoints.map((p) => `L ${p.x},${p.y}`).join(' ')} L ${revPoints[n - 1].x},${MT + ih} Z`;
    const bookingsLineD = bookPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

    const tickYs = [0, 0.25, 0.5, 0.75, 1].map((t) => MT + ih * (1 - t));
    const revTicks = tickYs.map((y) => {
      const v = revLo + (1 - (y - MT) / ih) * (revHi - revLo);
      return { y, label: formatNprTick(v) };
    });
    const bookTicks = tickYs.map((y) => {
      const v = bookLo + (1 - (y - MT) / ih) * (bookHi - bookLo);
      return { y, label: Math.round(v).toLocaleString() };
    });

    const gridLines = tickYs.map((y) => ({ y }));

    return {
      W,
      H,
      ML,
      MR,
      MT,
      MB,
      data,
      revenueLineD,
      revenueAreaD,
      bookingsLineD,
      revTicks,
      bookTicks,
      gridLines,
      xAt,
      monthY: MT + ih + 18,
    };
  }, [chartRows]);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div 
      className={`flex-1 p-8 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}
      style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
    >
        {/* Search & Notification Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <SearchAndNotificationBar
            searchPlaceholder="Search anything..."
            showSearch={true}
            showTime={true}
          />
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
            <p className="text-gray-500">Welcome back, Super Admin</p>
          </div>

          {adminSummaryError && !adminSummaryLoading ? (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {adminSummaryError} — KPI cards below may be incomplete until the API succeeds.
            </div>
          ) : null}

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={stat.iconColor} size={24} />
                    </div>
                    {stat.pillLoading ? (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                        <Loader2 size={16} className="animate-spin text-cyan-500" />
                      </div>
                    ) : stat.pill ? (
                      <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        {stat.pill}
                      </div>
                    ) : (
                      <div className="h-9 w-9" aria-hidden />
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-400 text-xs">{stat.subtitle}</p>
                </div>
              );
            })}
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {secondaryStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={stat.iconColor} size={24} />
                    </div>
                    {stat.pillLoading ? (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                        <Loader2 size={16} className="animate-spin text-cyan-500" />
                      </div>
                    ) : stat.pill ? (
                      <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        {stat.pill}
                      </div>
                    ) : (
                      <div className="h-9 w-9" aria-hidden />
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                </div>
              );
            })}
          </div>

          {/* Revenue Chart and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Overview Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Revenue Overview</h2>
                  <p className="text-gray-500 text-sm">
                    Platform share (NPR) and booking counts by month — same source as Analytics
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span className="text-gray-600 text-sm">Platform NPR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 text-sm">Bookings</span>
                  </div>
                </div>
              </div>

              {/* Chart: dual Y-axis; explicit SVG size + inline fills so it always paints */}
              <div className="h-64 w-full min-h-[16rem]">
                {adminSummaryLoading || !chartGeometry ? (
                  <div className="flex h-full min-h-[16rem] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/80">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                      <span className="text-sm">Loading chart…</span>
                    </div>
                  </div>
                ) : (
                  <svg
                    width="100%"
                    height="256"
                    className="block max-w-full"
                    style={{ minHeight: '16rem' }}
                    viewBox={`0 0 ${chartGeometry.W} ${chartGeometry.H}`}
                    preserveAspectRatio="xMidYMid meet"
                    role="img"
                    aria-label="Monthly platform revenue and booking counts"
                  >
                    <defs>
                      <linearGradient id={`revGrad-${chartId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {chartGeometry.gridLines.map((g, i) => (
                      <line
                        key={i}
                        x1={chartGeometry.ML}
                        y1={g.y}
                        x2={chartGeometry.W - chartGeometry.MR}
                        y2={g.y}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    ))}

                    <path d={chartGeometry.revenueAreaD} fill={`url(#revGrad-${chartId})`} />
                    <path
                      d={chartGeometry.revenueLineD}
                      fill="none"
                      stroke="#0891b2"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    <path
                      d={chartGeometry.bookingsLineD}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />

                    {chartGeometry.revTicks.map((t, i) => (
                      <text
                        key={`rl-${i}`}
                        x={chartGeometry.ML - 6}
                        y={t.y + 4}
                        textAnchor="end"
                        fill="#64748b"
                        style={{ fontSize: '11px' }}
                      >
                        {t.label}
                      </text>
                    ))}
                    {chartGeometry.bookTicks.map((t, i) => (
                      <text
                        key={`br-${i}`}
                        x={chartGeometry.W - chartGeometry.MR + 6}
                        y={t.y + 4}
                        textAnchor="start"
                        fill="#059669"
                        style={{ fontSize: '11px' }}
                      >
                        {t.label}
                      </text>
                    ))}

                    {chartGeometry.data.map((d, i) => (
                      <text
                        key={`${d.month}-${i}`}
                        x={chartGeometry.xAt(i)}
                        y={chartGeometry.monthY}
                        textAnchor="middle"
                        fill="#64748b"
                        style={{ fontSize: '10px' }}
                      >
                        {d.month}
                      </text>
                    ))}
                  </svg>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Notifications</h2>
                  <p className="text-gray-500 text-sm">System updates and alerts</p>
                </div>
                <button
                  onClick={fetchNotifications}
                  className="text-cyan-500 text-sm font-medium hover:text-cyan-600 transition-colors"
                >
                  Refresh
                </button>
              </div>

              <div className="space-y-4">
                {notificationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    No notifications yet. Updates will appear here.
                  </div>
                ) : (
                  notifications.slice(0, 8).map((notif) => {
                    const Icon = typeToIcon[notif.type] || typeToIcon.default;
                    const style = typeToStyle[notif.type] || typeToStyle.default;
                    return (
                      <div
                        key={notif._id}
                        className={`flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0 last:pb-0 ${!notif.isRead ? 'bg-cyan-50/50 -mx-2 px-2 rounded-lg' : ''}`}
                      >
                        <div className={`w-10 h-10 ${style.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className={style.color} size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium text-sm mb-0.5">{notif.title}</p>
                          <p className="text-gray-600 text-sm mb-1 line-clamp-2">{notif.message}</p>
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <Clock size={12} />
                            <span>{formatNotificationTime(notif.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;