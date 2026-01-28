import React, { useState } from 'react';
import {
  FaCalendarAlt,
  FaCreditCard,
  FaStar,
  FaUserFriends,
  FaMedal,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaSearch,
  FaFilter,
  FaBell,
  FaPlus,
  FaUsers,
  FaHeartbeat
} from 'react-icons/fa';

import PlayerSidebar from './PlayerSidebar';

const FutsalDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [timeFilter, setTimeFilter] = useState('This Week');

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

  const paymentItems = [
    { id: 1, matchName: 'Weekend League Match', amount: 'Rs. 800', status: 'pending' },
    { id: 2, matchName: 'Training Session - March', amount: 'Rs. 700', status: 'pending' },
    { id: 3, matchName: 'Tournament Registration', amount: 'Rs. 1700', status: 'paid' },
  ];

  const tournamentCards = [
    {
      id: 1,
      name: 'Winter Futsal Championship',
      badge: 'Registered',
      dateRange: 'Mar 20 - Apr 15, 2024',
      location: 'National Sports Complex',
      progress: 75,
      teams: 24,
    },
    {
      id: 2,
      name: 'New Year Cup 2024',
      badge: 'Open',
      date: 'Apr 5, 2024',
      location: 'City Futsal Arena',
      teams: 16,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      {/* Main Content */}
      <div 
        className={`flex-1 p-8 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Player Dashboard</h1>
            <p className="text-gray-500">Welcome back! Here's your futsal overview</p>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl py-2 px-4 shadow-sm"
            >
              <option>This Week</option>
              <option>This Month</option>
              <option>Last 30 Days</option>
            </select>

            <div className="relative">
              <FaBell className="text-2xl text-gray-500 cursor-pointer" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </div>

            <div className="flex items-center bg-white p-3 rounded-xl shadow-sm">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajan"
                alt="avatar"
                className="w-12 h-12 rounded-full border-2 border-emerald-100"
              />
              <div className="ml-3">
                <h3 className="font-bold">Rajan Karki</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <FaStar className="text-amber-500 mr-1" /> 4.8
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card) => (
            <div key={card.id} className="bg-white p-6 rounded-2xl shadow-sm">
              <p className="text-gray-500 text-sm">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-gray-500">{card.subtitle}</p>
              <div className={`inline-block mt-4 p-3 rounded-xl ${card.color}`}>
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Upcoming Bookings</h2>
            <button className="bg-emerald-500 text-white px-4 py-2 rounded-xl flex items-center">
              <FaPlus className="mr-2" /> Book Slot
            </button>
          </div>

          {upcomingBookings.map((b) => (
            <div key={b.id} className="flex justify-between p-4 border rounded-xl mb-3">
              <div>
                <h3 className="font-medium">{b.venue}</h3>
                <p className="text-sm text-gray-500">{b.date} • {b.time}</p>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <FaUserFriends className="mr-1" />
                  {b.playersJoined}/{b.totalPlayers}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  b.status === 'confirmed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {b.status}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8">
          PlayPal Futsal Manager • © 2024
        </div>
      </div>
    </div>
  );
};

export default FutsalDashboard;
