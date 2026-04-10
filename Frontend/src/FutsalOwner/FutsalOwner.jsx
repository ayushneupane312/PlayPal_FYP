import React, { useEffect, useState } from 'react';
import { Calendar, DollarSign, Users, TrendingUp, Clock, Trophy, Bell, Search, Settings, LayoutDashboard, MapPin, CreditCard, BarChart3, Menu, X } from 'lucide-react';
import FutsalOwnerSidebar from './FutsalOwnerSidebar';
import Header from '../FutsalOwner/components/Header';
import { useAuthStore } from '../store/authStore'; // ✅ ADD THIS IMPORT
import { getVenueInfo } from '../store/venueService';
import { getOwnerEarnings, getVenueBookings } from '../store/bookingStore';
import { listMyTournaments } from '../store/tournamentService';
import { showToast } from './components/Toast';

export default function FutsalDashboard() {
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
    monthlyRevenue: 0,
    activeCourts: 0,
    courtsInMaintenance: 0,
    weeklyRevenue: [0, 0, 0, 0, 0, 0, 0],
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
        const today = now.toISOString().split('T')[0];
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekDays = [];
        for (let i = 6; i >= 0; i -= 1) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          weekDays.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
        }
        const weekRevenueMap = Object.fromEntries(weekDays.map((d) => [d, 0]));

        const [venueRes, todayBookingsRes, allBookingsRes, earningsRes, tournamentsRes] = await Promise.all([
          getVenueInfo().catch(() => null),
          getVenueBookings({ date: today, limit: 50 }).catch(() => null),
          getVenueBookings({ limit: 200 }).catch(() => null),
          getOwnerEarnings().catch(() => null),
          listMyTournaments().catch(() => null)
        ]);

        const venue = venueRes?.data || venueRes || null;
        const activeCourts = (venue?.courts || []).filter((c) => c?.isActive !== false).length;
        const courtsInMaintenance = Math.max((venue?.courts || []).length - activeCourts, 0);

        const todaysBookings = Array.isArray(todayBookingsRes?.data) ? todayBookingsRes.data.length : 0;

        const paidBookings = earningsRes?.data?.bookings || [];
        paidBookings.forEach((b) => {
          const d = new Date(b.bookingDate);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          if (weekRevenueMap[key] != null) {
            weekRevenueMap[key] += Number(b?.pricing?.totalAmount || 0);
          }
        });
        const weeklyRevenue = weekDays.map((d) => weekRevenueMap[d]);
        const monthlyRevenue = Number(earningsRes?.data?.monthlyEarnings?.[monthKey] || 0);

        const allBookings = allBookingsRes?.data || [];
        const hourBuckets = { 6: 0, 8: 0, 10: 0, 12: 0, 14: 0, 16: 0, 18: 0, 20: 0, 22: 0 };
        allBookings.forEach((b) => {
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

        const mappedRecent = allBookings.slice(0, 5).map((b) => {
          const userName = b?.user?.name || b?.playerInfo?.name || 'Booking';
          const status = b?.bookingStatus || 'pending';
          return {
            team: userName,
            court: b?.court?.name || 'Court',
            time: `${b?.timeSlot?.startTime || '--'} - ${b?.timeSlot?.endTime || '--'}`,
            price: `NPR ${Number(b?.pricing?.totalAmount || 0).toLocaleString()}`,
            status: status.charAt(0).toUpperCase() + status.slice(1),
            initial: userName.charAt(0).toUpperCase() || 'B'
          };
        });

        const mappedTournaments = (tournamentsRes?.data || []).slice(0, 4).map((t) => ({
          name: t?.name || 'Tournament',
          date: `${new Date(t?.startDate).toLocaleDateString()} - ${new Date(t?.endDate).toLocaleDateString()}`,
          prize: `NPR ${Number(t?.totalPrizePool || 0).toLocaleString()}`,
          entry: `NPR ${Number(t?.entryFeePerTeam || 0).toLocaleString()}`,
          teams: Number(t?.stats?.registeredTeams || 0),
          maxTeams: Number(t?.maxTeams || 0)
        }));

        setDashboardStats({
          todaysBookings,
          monthlyRevenue,
          activeCourts,
          courtsInMaintenance,
          weeklyRevenue,
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
      label: 'Monthly Revenue',
      value: `NPR ${(dashboardStats.monthlyRevenue / 100000).toFixed(2)}L`,
      change: `NPR ${dashboardStats.monthlyRevenue.toLocaleString()} this month`,
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

        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
            {/* ✅ FIXED - Now uses actual user name */}
            <p className="text-gray-500">
              Welcome back, {user?.name || 'User'}! Here's what's happening at your venue.
            </p>
          </div>
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
          {/* Weekly Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Weekly Revenue</h2>
              <p className="text-sm text-gray-600">Revenue and booking trends</p>
            </div>
            <div className="h-64">
              <svg viewBox="0 0 700 200" className="w-full h-full">
                <defs>
                  <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0.05 }} />
                  </linearGradient>
                </defs>
                
                {/* Y-axis labels */}
                <text x="30" y="20" className="text-xs fill-gray-500">NPR 28k</text>
                <text x="30" y="60" className="text-xs fill-gray-500">NPR 21k</text>
                <text x="30" y="100" className="text-xs fill-gray-500">NPR 14k</text>
                <text x="30" y="140" className="text-xs fill-gray-500">NPR 7k</text>
                <text x="30" y="180" className="text-xs fill-gray-500">NPR 0k</text>

                {/* Area chart */}
                <path
                  d={`M 80,${180 - (dashboardStats.weeklyRevenue[0] / (Math.max(...dashboardStats.weeklyRevenue, 1)) * 120)}
                      L 150,${180 - (dashboardStats.weeklyRevenue[1] / (Math.max(...dashboardStats.weeklyRevenue, 1)) * 120)}
                      L 220,${180 - (dashboardStats.weeklyRevenue[2] / (Math.max(...dashboardStats.weeklyRevenue, 1)) * 120)}
                      L 290,${180 - (dashboardStats.weeklyRevenue[3] / (Math.max(...dashboardStats.weeklyRevenue, 1)) * 120)}
                      L 360,${180 - (dashboardStats.weeklyRevenue[4] / (Math.max(...dashboardStats.weeklyRevenue, 1)) * 120)}
                      L 430,${180 - (dashboardStats.weeklyRevenue[5] / (Math.max(...dashboardStats.weeklyRevenue, 1)) * 120)}
                      L 500,${180 - (dashboardStats.weeklyRevenue[6] / (Math.max(...dashboardStats.weeklyRevenue, 1)) * 120)}
                      L 500,180 L 80,180 Z`}
                  fill="url(#revenueGradient)"
                />
                <path
                  d={`M 80,${180 - (dashboardStats.weeklyRevenue[0] / (Math.max(...dashboardStats.weeklyRevenue, 1)) * 120)}
                      L 150,${180 - (dashboardStats.weeklyRevenue[1] / (Math.max(...dashboardStats.weeklyRevenue, 1)) * 120)}
                      L 220,${180 - (dashboardStats.weeklyRevenue[2] / (Math.max(...dashboardStats.weeklyRevenue, 1)) * 120)}
                      L 290,${180 - (dashboardStats.weeklyRevenue[3] / (Math.max(...dashboardStats.weeklyRevenue, 1)) * 120)}
                      L 360,${180 - (dashboardStats.weeklyRevenue[4] / (Math.max(...dashboardStats.weeklyRevenue, 1)) * 120)}
                      L 430,${180 - (dashboardStats.weeklyRevenue[5] / (Math.max(...dashboardStats.weeklyRevenue, 1)) * 120)}
                      L 500,${180 - (dashboardStats.weeklyRevenue[6] / (Math.max(...dashboardStats.weeklyRevenue, 1)) * 120)}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />

                {/* X-axis labels */}
                <text x="80" y="195" className="text-xs fill-gray-500">Mon</text>
                <text x="150" y="195" className="text-xs fill-gray-500">Tue</text>
                <text x="220" y="195" className="text-xs fill-gray-500">Wed</text>
                <text x="290" y="195" className="text-xs fill-gray-500">Thu</text>
                <text x="360" y="195" className="text-xs fill-gray-500">Fri</text>
                <text x="430" y="195" className="text-xs fill-gray-500">Sat</text>
                <text x="500" y="195" className="text-xs fill-gray-500">Sun</text>
              </svg>
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Peak Hours</h2>
              <p className="text-sm text-gray-600">Bookings by time of day</p>
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
              <button className="text-green-600 text-sm font-medium hover:text-green-700">View All</button>
            </div>
            <div className="divide-y divide-gray-100">
              {recentBookings.map((booking, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
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
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                      booking.status === 'Confirmed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
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
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">
                Create New →
              </button>
            </div>
            <div className="p-6 space-y-4">
              {tournaments.length === 0 && (
                <div className="text-sm text-gray-500">No tournaments found.</div>
              )}
              {tournaments.map((tournament, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
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
                        style={{ width: `${(tournament.teams / tournament.maxTeams) * 100}%` }}
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