import React, { useState } from 'react';
import {
  FaCalendarAlt,
  FaCreditCard,
  FaStar,
  FaUserFriends,
  FaMedal,
  FaPlus,
  FaHeartbeat
} from 'react-icons/fa';

import PlayerSidebar from './PlayerSidebar';
import PlayerHeader from './PlayerHeader';
import { useAuthStore } from '../store/authStore';

const FutsalDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [timeFilter, setTimeFilter] = useState('This Week');
  const { user } = useAuthStore();

  const statsCards = [
    {
      id: 1,
      title: 'Upcoming Matches',
      value: '3',
      subtitle: '+2 this week',
      icon: <FaCalendarAlt />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      id: 2,
      title: 'Pending Payments',
      value: 'Rs. 1,500',
      subtitle: '2 invoices',
      icon: <FaCreditCard />,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      id: 3,
      title: 'Tournament Rank',
      value: '#12',
      subtitle: '+5 positions',
      icon: <FaMedal />,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 4,
      title: 'Health Score',
      value: '98%',
      subtitle: 'All clear',
      icon: <FaHeartbeat />,
      color: 'bg-green-50 text-green-600',
    },
  ];

  const upcomingBookings = [
    {
      id: 1,
      venue: 'Futsal Arena City Center',
      date: 'Fri, 15 Mar 2024',
      time: '6:00 PM - 8:00 PM',
      playersJoined: 8,
      totalPlayers: 10,
      status: 'confirmed',
    },
    {
      id: 2,
      venue: 'Pro Sports Complex',
      date: 'Sat, 16 Mar 2024',
      time: '4:00 PM - 6:00 PM',
      playersJoined: 5,
      totalPlayers: 10,
      status: 'pending',
    },
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
            <p className="text-gray-500">Welcome back, {user?.name || 'User'}! Here's your futsal overview</p>
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

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Bookings</h2>
              <p className="text-sm text-gray-600">Your scheduled matches</p>
            </div>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center gap-2">
              <FaPlus className="text-sm" /> Book Slot
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {upcomingBookings.map((b) => (
              <div key={b.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold">
                    {b.venue.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{b.venue}</div>
                    <div className="text-sm text-gray-600">{b.date} • {b.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <FaUserFriends className="text-emerald-500" />
                    <span className="text-sm text-gray-600">
                      <span className="font-medium text-emerald-600">{b.playersJoined}</span>
                      <span className="text-gray-400">/{b.totalPlayers}</span>
                    </span>
                  </div>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FutsalDashboard;