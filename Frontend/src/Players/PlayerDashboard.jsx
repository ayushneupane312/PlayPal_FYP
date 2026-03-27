import React, { useEffect, useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaCreditCard,
  FaPlus,
  FaUserFriends,
  FaUsers,
  FaTrophy,
  FaArrowRight
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import PlayerSidebar from './PlayerSidebar';
import PlayerHeader from './PlayerHeader';
import { useAuthStore } from '../store/authStore';
import { showToast } from '../FutsalOwner/components/Toast';
import { getMyBookings } from '../store/bookingStore';
import matchmakingService from '../store/matchmakingService';

const FutsalDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState('This Month');
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [pendingInviteCount, setPendingInviteCount] = useState(0);
  const { user } = useAuthStore();

  const filterToLimit = {
    'This Week': 7,
    'This Month': 15,
    'Last 30 Days': 30
  };

  const statsCards = useMemo(() => {
    const now = new Date();
    const upcomingBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.bookingDate);
      return !Number.isNaN(bookingDate.getTime()) && bookingDate >= now;
    });

    const pendingPayments = bookings
      .filter((b) => b?.payment?.status !== 'paid')
      .reduce((sum, b) => sum + (b?.pricing?.totalAmount || 0), 0);

    const teamSlots = teams.reduce((sum, t) => {
      const maxPlayers = Number(t?.maxPlayers || 0);
      const currentPlayers = Number(t?.players?.length || 0);
      return sum + Math.max(maxPlayers - currentPlayers, 0);
    }, 0);

    return [
      {
        id: 1,
        title: 'Upcoming Matches',
        value: `${upcomingBookings.length}`,
        subtitle: 'Confirmed and pending bookings',
        icon: <FaCalendarAlt />,
        color: 'bg-blue-50 text-blue-600',
      },
      {
        id: 2,
        title: 'Pending Payments',
        value: `Rs. ${pendingPayments.toLocaleString()}`,
        subtitle: 'Unpaid booking amount',
        icon: <FaCreditCard />,
        color: 'bg-amber-50 text-amber-600',
      },
      {
        id: 3,
        title: 'My Teams',
        value: `${teams.length}`,
        subtitle: pendingInviteCount > 0 ? `${pendingInviteCount} pending invite(s)` : 'No pending invitations',
        icon: <FaUsers />,
        color: 'bg-emerald-50 text-emerald-600',
      },
      {
        id: 4,
        title: 'Open Team Slots',
        value: `${teamSlots}`,
        subtitle: 'Available spots across your teams',
        icon: <FaTrophy />,
        color: 'bg-purple-50 text-purple-600',
      },
    ];
  }, [bookings, pendingInviteCount, teams]);

  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((b) => {
        const bookingDate = new Date(b.bookingDate);
        return !Number.isNaN(bookingDate.getTime()) && bookingDate >= now;
      })
      .slice(0, 5);
  }, [bookings]);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const limit = filterToLimit[timeFilter] || 15;
      const [bookingsRes, teamsRes, invitesRes] = await Promise.all([
        getMyBookings({ page: 1, limit }),
        matchmakingService.getMyTeams(),
        matchmakingService.getMyInvitations()
      ]);

      setBookings(bookingsRes?.data || []);
      setTeams(teamsRes?.data || []);
      setPendingInviteCount((invitesRes?.data || []).length);
    } catch (error) {
      showToast.error(error?.message || 'Failed to load dashboard data');
      setBookings([]);
      setTeams([]);
      setPendingInviteCount(0);
    } finally {
      setLoading(false);
    }
  };

  const formatBookingDate = (date) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return 'Invalid date';
    return parsed.toLocaleDateString();
  };

  const getPlayersCount = (booking) => {
    const splitCount = Array.isArray(booking?.splitPlayers) ? booking.splitPlayers.length : 0;
    if (splitCount > 0) return splitCount;
    return booking?.playerInfo?.numberOfPlayers || 0;
  };

  const getBookingStatusClass = (status) => {
    if (status === 'confirmed') return 'bg-emerald-100 text-emerald-700';
    if (status === 'pending') return 'bg-amber-100 text-amber-700';
    if (status === 'cancelled') return 'bg-gray-100 text-gray-700';
    if (status === 'completed') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const teamActions = [
    {
      title: 'Create Team',
      description: 'Set up a new squad and invite players.',
      actionText: 'Create Now',
      onClick: () => navigate('/player/matchmaking/create-team'),
      icon: <FaPlus className="text-green-600" />,
      iconBg: 'bg-green-100'
    },
    {
      title: 'My Teams',
      description: 'Manage your teams, invites and members.',
      actionText: 'Open My Teams',
      onClick: () => navigate('/player/teams'),
      icon: <FaUserFriends className="text-blue-600" />,
      iconBg: 'bg-blue-100'
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      {/* ✅ Single Main Content Wrapper - Fixed */}
      <div 
        className={`flex-1 p-8 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        {/* Header */}
        <PlayerHeader 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Player Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.name || 'User'}! Here is your latest activity overview.</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl py-2 px-4 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option>This Week</option>
              <option>This Month</option>
              <option>Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statsCards.map((card) => (
            <div key={card.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <p className="text-gray-500 text-sm">{card.title}</p>
              <p className="text-2xl font-bold mt-2">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
              <div className={`inline-block mt-4 p-3 rounded-xl ${card.color}`}>
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Team Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {teamActions.map((item) => (
            <div key={item.title} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                  {item.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mt-4">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              <button
                onClick={item.onClick}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition"
              >
                {item.actionText}
                <FaArrowRight className="text-xs" />
              </button>
            </div>
          ))}
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Bookings</h2>
              <p className="text-sm text-gray-600">Your scheduled matches</p>
            </div>
            <button
              onClick={() => navigate('/player/venues')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition flex items-center gap-2"
            >
              <FaPlus className="text-sm" /> Book Slot
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading bookings...</div>
          ) : upcomingBookings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 mb-3">No upcoming bookings found.</p>
              <button
                onClick={() => navigate('/player/venues')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
              >
                Book Your First Slot
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {upcomingBookings.map((b) => (
                <div
                  key={b._id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/player/bookings/${b._id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold">
                      {(b?.venue?.venueName || 'V').charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{b?.venue?.venueName || 'Unknown Venue'}</div>
                      <div className="text-sm text-gray-600">
                        {formatBookingDate(b.bookingDate)} • {b?.timeSlot?.startTime || '--'} - {b?.timeSlot?.endTime || '--'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <FaUserFriends className="text-emerald-500" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium text-emerald-600">{getPlayersCount(b)}</span>
                      </span>
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getBookingStatusClass(b.bookingStatus)}`}>
                      {b.bookingStatus || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FutsalDashboard;