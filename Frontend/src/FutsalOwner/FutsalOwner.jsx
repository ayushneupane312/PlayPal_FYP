import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Users, TrendingUp, Clock, Trophy, Bell, Search, Settings, LayoutDashboard, MapPin, CreditCard, BarChart3, Menu, X } from 'lucide-react';
import FutsalOwnerSidebar from './FutsalOwnerSidebar';
import Header from '../FutsalOwner/components/Header';
import { useAuthStore } from '../store/authStore'; // ✅ ADD THIS IMPORT
import { getVenueInfo } from '../store/venueService';
import { getVenueBookings, getOwnerEarnings } from '../store/bookingStore';
import { listMyTournaments } from '../store/tournamentService';
import { showToast } from './components/Toast';

const OWNER_SHARE = 0.5;

function formatNpr(n) {
  return `NPR ${Math.round(Number(n) || 0).toLocaleString('en-NP')}`;
}

/** Fallback when no paid bookings in the window (keeps chart readable). */
const EMPTY_WEEK_SERIES = [0, 0, 0, 0, 0, 0, 0];

function formatBookingStatus(status) {
  const s = (status || 'pending').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function statusBadgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed' || s === 'completed') return 'bg-green-100 text-green-700';
  if (s === 'pending') return 'bg-yellow-100 text-yellow-700';
  if (s === 'rejected' || s === 'cancelled') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
}

export default function FutsalDashboard() {
  const navigate = useNavigate();
  // ✅ ADD THIS LINE - Get user from auth store
  const { user } = useAuthStore();
  
  // ✅ Add the missing state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New booking request', desc: 'Team Alpha requested Court 1 for tomorrow at 6 PM', time: 'Just now' },
    { id: 2, title: 'Payment received', desc: 'NPR 2,500 received for booking #1234', time: '5 min ago' },
    { id: 3, title: 'Tournament registration', desc: '5 new teams registered for Weekend Cup', time: '1 hour ago' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    todaysBookings: 0,
    monthlyOwnerNet: 0,
    earningsSource: null,
    earningsLoaded: false,
    activeCourts: 0,
    courtsInMaintenance: 0,
    weeklyOwnerShare: [...EMPTY_WEEK_SERIES],
    weekChartLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    peakHours: [
      { time: '6 AM', bookings: 0 },
      { time: '8 AM', bookings: 0 },
      { time: '10 AM', bookings: 0 },
      { time: '12 PM', bookings: 0 },
      { time: '2 PM', bookings: 0 },
      { time: '4 PM', bookings: 0 },
      { time: '6 PM', bookings: 0 },
      { time: '8 PM', bookings: 0 },
      { time: '10 PM', bookings: 0 }
    ]
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekDays = [];
        for (let i = 6; i >= 0; i -= 1) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          weekDays.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
        }
        const weekChartLabels = weekDays.map((ds) => {
          const [y, m, day] = ds.split('-').map(Number);
          return weekDayLabels[new Date(y, m - 1, day).getDay()];
        });

        const [venueRes, todayBookingsRes, activityBookingsRes, tournamentsRes, earningsRes] =
          await Promise.all([
            getVenueInfo().catch(() => null),
            getVenueBookings({ date: today, limit: 100 }).catch(() => null),
            getVenueBookings({ limit: 400, sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => null),
            listMyTournaments().catch(() => null),
            getOwnerEarnings().catch(() => null),
          ]);

        const venue = venueRes?.data || venueRes || null;
        const activeCourts = (venue?.courts || []).filter((c) => c?.isActive !== false).length;
        const courtsInMaintenance = Math.max((venue?.courts || []).length - activeCourts, 0);

        const todaysBookings = Array.isArray(todayBookingsRes?.data) ? todayBookingsRes.data.length : 0;

        const activityBookings = Array.isArray(activityBookingsRes?.data) ? activityBookingsRes.data : [];
        const hourBuckets = { 6: 0, 8: 0, 10: 0, 12: 0, 14: 0, 16: 0, 18: 0, 20: 0, 22: 0 };
        activityBookings.forEach((b) => {
          const startTime = b?.timeSlot?.startTime;
          const hour = Number((startTime || '0:00').split(':')[0]);
          if (Number.isFinite(hour)) {
            const nearest = [6, 8, 10, 12, 14, 16, 18, 20, 22].reduce((prev, curr) =>
              Math.abs(curr - hour) < Math.abs(prev - hour) ? curr : prev
            );
            hourBuckets[nearest] += 1;
          }
        });
        const peakHours = [
          { time: '6 AM', bookings: hourBuckets[6] },
          { time: '8 AM', bookings: hourBuckets[8] },
          { time: '10 AM', bookings: hourBuckets[10] },
          { time: '12 PM', bookings: hourBuckets[12] },
          { time: '2 PM', bookings: hourBuckets[14] },
          { time: '4 PM', bookings: hourBuckets[16] },
          { time: '6 PM', bookings: hourBuckets[18] },
          { time: '8 PM', bookings: hourBuckets[20] },
          { time: '10 PM', bookings: hourBuckets[22] }
        ];

        const mappedRecent = activityBookings.slice(0, 6).map((b) => {
          const userName = b?.user?.name || b?.playerInfo?.name || 'Guest';
          const rawStatus = b?.bookingStatus || 'pending';
          const bookingDate = b?.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : '';
          return {
            id: b?._id,
            team: userName,
            court: b?.court?.name || 'Court',
            time: `${bookingDate ? `${bookingDate} · ` : ''}${b?.timeSlot?.startTime || '--'} - ${b?.timeSlot?.endTime || '--'}`,
            price: `NPR ${Number(b?.pricing?.totalAmount ?? 0).toLocaleString()}`,
            status: formatBookingStatus(rawStatus),
            statusClass: statusBadgeClass(rawStatus),
            initial: userName.charAt(0).toUpperCase() || 'B'
          };
        });

        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const rawTournaments = Array.isArray(tournamentsRes?.data) ? tournamentsRes.data : [];
        const upcomingTournaments = rawTournaments
          .filter((t) => t?.endDate && new Date(t.endDate) >= startOfToday)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        const mappedTournaments = upcomingTournaments.slice(0, 4).map((t) => {
          const maxTeams = Math.max(Number(t?.maxTeams || 0), 1);
          const teams = Number(t?.stats?.registeredTeams ?? 0);
          return {
            id: t?._id,
            name: t?.name || 'Tournament',
            date: `${new Date(t?.startDate).toLocaleDateString()} – ${new Date(t?.endDate).toLocaleDateString()}`,
            prize: `NPR ${Number(t?.totalPrizePool || 0).toLocaleString()}`,
            entry: `NPR ${Number(t?.entryFeePerTeam || 0).toLocaleString()}`,
            teams,
            maxTeams,
            registrationPct: Math.min(100, Math.round((teams / maxTeams) * 100))
          };
        });

        const earningsData = earningsRes?.success ? earningsRes.data : null;
        const monthlyOwnerNet = Number(earningsData?.monthOwnerNet) || 0;
        const earningsSource = earningsData?.source || null;

        const bookingDayKey = (b) => {
          if (!b?.bookingDate) return null;
          const d = new Date(b.bookingDate);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };
        const paidGross = (b) => Number(b?.pricing?.totalAmount) || 0;
        const weeklyOwnerShare = weekDays.map((dayStr) =>
          activityBookings
            .filter(
              (b) =>
                String(b?.payment?.status || '').toLowerCase() === 'paid' && bookingDayKey(b) === dayStr
            )
            .reduce((sum, b) => sum + paidGross(b) * OWNER_SHARE, 0)
        );

        setDashboardStats({
          todaysBookings,
          monthlyOwnerNet,
          earningsSource,
          earningsLoaded: Boolean(earningsRes?.success),
          activeCourts,
          courtsInMaintenance,
          weeklyOwnerShare,
          weekChartLabels,
          peakHours
        });
        setRecentBookings(mappedRecent);
        setTournaments(mappedTournaments);
      } catch (err) {
        showToast.error('Failed to load dashboard data');
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: "Today's Bookings",
      value: String(dashboardStats.todaysBookings),
      change: `${dashboardStats.todaysBookings} for today`,
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      label: 'Monthly net (your share)',
      value: formatNpr(dashboardStats.monthlyOwnerNet),
      change: dashboardStats.earningsLoaded
        ? `Same API as Earnings · ${dashboardStats.earningsSource === 'ledger' ? 'ledger' : 'estimate'}`
        : 'Open Earnings after venue setup',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      label: 'Active Courts',
      value: String(dashboardStats.activeCourts),
      change: `${dashboardStats.courtsInMaintenance} in maintenance`,
      icon: MapPin,
      color: 'bg-purple-500'
    }
  ];

  const peakHours = dashboardStats.peakHours;

  const maxBookings = Math.max(...peakHours.map(h => h.bookings), 1);

  const weeklyRevSeries = dashboardStats.weeklyOwnerShare;
  const maxWeeklyRev = Math.max(...weeklyRevSeries, 1);
  const revAxisLabels = [
    maxWeeklyRev,
    Math.round(maxWeeklyRev * 0.75),
    Math.round(maxWeeklyRev * 0.5),
    Math.round(maxWeeklyRev * 0.25),
    0
  ];
  const fmtRevAxis = (n) => (n >= 1000 ? `NPR ${(n / 1000).toFixed(0)}k` : `NPR ${n}`);
  const chartXs = [80, 150, 220, 290, 360, 430, 500];
  const weekLabels = dashboardStats.weekChartLabels;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <FutsalOwnerSidebar onCollapseChange={setIsSidebarCollapsed} />

      {/* ✅ Fixed Main Content - Single wrapper div */}
      <div 
        className={`flex-1 p-8 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >

        {/* Header */}
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          sidebarOpen={sidebarOpen} 
        />

        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-500">
              Welcome back, {user?.name || 'User'}!{" "}
              {"Here's what's happening at your venue."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/EarningsPage')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition whitespace-nowrap"
          >
            <BarChart3 className="w-4 h-4" />
            Earnings &amp; payouts
          </button>
        </div>
      
        {loading && (
          <div className="mb-4 text-sm text-gray-500">Loading live dashboard data...</div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 text-sm">{stat.label}</span>
                <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-green-600 text-sm">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly owner share (50% of paid gross, by booking day) */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Your share (last 7 days)</h2>
              <p className="text-sm text-gray-600">
                Paid bookings only — 50% of court gross per day. Matches the policy on the{' '}
                <button
                  type="button"
                  onClick={() => navigate('/EarningsPage')}
                  className="text-emerald-600 font-medium hover:underline"
                >
                  Earnings
                </button>{' '}
                page.
              </p>
            </div>
            <div className="h-64">
              <svg viewBox="0 0 700 200" className="w-full h-full">
                <defs>
                  <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0.05 }} />
                  </linearGradient>
                </defs>

                {revAxisLabels.map((val, i) => (
                  <text key={i} x="8" y={20 + i * 40} className="text-xs fill-gray-500">
                    {fmtRevAxis(val)}
                  </text>
                ))}

                {(() => {
                  const ys = weeklyRevSeries.map((v) => 180 - (v / maxWeeklyRev) * 120);
                  const lineD = chartXs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x},${ys[i]}`).join(' ');
                  const areaD = `${lineD} L ${chartXs[6]},180 L ${chartXs[0]},180 Z`;
                  return (
                    <>
                      <path d={areaD} fill="url(#revenueGradient)" />
                      <path d={lineD} fill="none" stroke="#10b981" strokeWidth="2" />
                    </>
                  );
                })()}

                {chartXs.map((x, i) => (
                  <text key={i} x={x - 12} y="195" className="text-xs fill-gray-500">
                    {weekLabels[i] || ''}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Peak Hours</h2>
              <p className="text-sm text-gray-600">Bookings by time of day (latest activity, up to 400 records)</p>
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {peakHours.map((hour, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t-lg transition-all hover:from-green-600 hover:to-green-400"
                    style={{ height: `${(hour.bookings / maxBookings) * 100}%`, minHeight: '20px' }}
                  ></div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">{hour.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                <p className="text-sm text-gray-600">Latest booking requests</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/futsalowner/booking-management')}
                className="text-green-600 text-sm font-medium hover:text-green-700"
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {recentBookings.length === 0 && !loading && (
                <div className="p-6 text-sm text-gray-500">No bookings yet.</div>
              )}
              {recentBookings.map((booking) => (
                <div key={booking.id || booking.team} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                      {booking.initial}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{booking.team}</div>
                      <div className="text-sm text-gray-600">{booking.court}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 mb-1">{booking.time}</div>
                    <div className="text-sm text-gray-600">{booking.price}</div>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${booking.statusClass}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tournaments */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Tournaments</h2>
                <p className="text-sm text-gray-600">Manage your events</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/futsalowner/Tournaments')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
              >
                Create New →
              </button>
            </div>
            <div className="p-6 space-y-4">
              {tournaments.length === 0 && (
                <div className="text-sm text-gray-500">No tournaments found.</div>
              )}
              {tournaments.map((tournament) => (
                <div key={tournament.id || tournament.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{tournament.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Calendar className="w-4 h-4" />
                          {tournament.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">Prize: {tournament.prize}</div>
                      <div className="text-xs text-gray-600">Entry: {tournament.entry}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Team Registration</span>
                      <span className="font-medium text-gray-900">{tournament.teams}/{tournament.maxTeams}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${tournament.registrationPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}