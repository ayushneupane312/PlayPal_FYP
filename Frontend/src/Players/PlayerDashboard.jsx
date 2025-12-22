import React, { useState } from 'react';
import { Calendar, CreditCard, Users, Trophy, Video, Heart, Settings, HelpCircle, LogOut, Bell, MapPin, Clock, User, ChevronRight, Plus } from 'lucide-react';

const PlayerDashboard = () => {
  const [activeNav, setActiveNav] = useState('dashboard');

  const stats = [
    {
      icon: Calendar,
      value: '3',
      label: 'Upcoming Matches',
      detail: '+2 this week',
      detailColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500'
    },
    {
      icon: CreditCard,
      value: 'Rs. 1,500',
      label: 'Pending Payments',
      detail: '2 invoices',
      detailColor: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500'
    },
    {
      icon: Trophy,
      value: '#12',
      label: 'Tournament Rank',
      detail: '+5 positions',
      detailColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500'
    },
    {
      icon: Heart,
      value: '98%',
      label: 'Health Score',
      detail: 'All clear',
      detailColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500'
    }
  ];

  const upcomingBookings = [
    {
      venue: 'Kathmandu Sports Arena',
      date: 'Today',
      time: '6:00 PM - 7:00 PM',
      players: '8 players joined',
      status: 'confirmed',
      statusColor: 'bg-green-500/10 text-green-500'
    },
    {
      venue: 'Patan Futsal Ground',
      date: 'Tomorrow',
      time: '5:30 PM - 6:30 PM',
      players: '6 players joined',
      status: 'pending',
      statusColor: 'bg-yellow-500/10 text-yellow-500'
    },
    {
      venue: 'Lalitpur Sports Complex',
      date: 'Sat, Dec 28',
      time: '4:00 PM - 5:00 PM',
      players: '10 players joined',
      status: 'confirmed',
      statusColor: 'bg-green-500/10 text-green-500'
    }
  ];

  const payments = [
    { venue: 'Kathmandu Sports Arena - Dec 22', amount: 'Rs. 800', status: 'pending', players: '8 players' },
    { venue: 'Tournament Entry Fee', amount: 'Rs. 700', status: 'pending', players: '' },
    { venue: 'Patan Futsal Ground - Dec 18', amount: 'Rs. 600', status: 'paid', players: '6 players' }
  ];

  const tournaments = [
    {
      name: 'Winter Futsal Championship',
      date: 'Dec 28 - Jan 5',
      teams: '16 teams',
      venue: 'Kathmandu Sports Arena',
      status: 'Registered',
      statusColor: 'bg-green-500/10 text-green-500',
      progress: 75
    },
    {
      name: 'New Year Cup 2024',
      date: 'Jan 10 - Jan 15',
      teams: '8 teams',
      venue: 'Lalitpur Sports Complex',
      status: 'Open',
      statusColor: 'bg-yellow-500/10 text-yellow-500',
      progress: 0
    }
  ];

  const menuItems = [
    { id: 'dashboard', icon: Calendar, label: 'Dashboard' },
    { id: 'bookings', icon: Calendar, label: 'Bookings', badge: 3 },
    { id: 'payments', icon: CreditCard, label: 'Payments', badge: 2 },
    { id: 'teams', icon: Users, label: 'Teams' },
    { id: 'tournaments', icon: Trophy, label: 'Tournaments' },
    { id: 'highlights', icon: Video, label: 'Highlights' },
    { id: 'health', icon: Heart, label: 'Health' }
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 fixed left-0 top-0 h-screen flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <span className="text-white font-bold text-xl">PlayPal</span>
          </div>
          <span className="text-slate-400 text-xs">Futsal Manager</span>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all ${
                  activeNav === item.id
                    ? 'bg-green-500/10 text-green-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="bg-yellow-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Menu */}
        <div className="p-3 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Settings size={20} />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <HelpCircle size={20} />
            <span className="text-sm font-medium">Help</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg relative">
              RK
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Rajan Karki</h2>
                <span className="bg-green-500/10 text-green-600 text-xs font-medium px-2 py-1 rounded">Pro Player</span>
              </div>
              <p className="text-gray-500 text-sm">Midfielder • Rating: 4.8 ⭐</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="text-gray-600" size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Settings className="text-gray-600 cursor-pointer" size={20} />
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 text-sm cursor-pointer outline-none">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={stat.iconColor} size={24} />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                  <p className={`${stat.detailColor} text-xs font-medium`}>{stat.detail}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Bookings */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Calendar className="text-green-500" size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Upcoming Bookings</h2>
                </div>
                <button className="text-green-500 text-sm font-medium hover:text-green-600 flex items-center gap-1">
                  View All <ChevronRight size={16} />
                </button>
              </div>

              <div className="space-y-4 mb-4">
                {upcomingBookings.map((booking, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{booking.venue}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${booking.statusColor}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Clock size={14} />
                        <span>{booking.date} • {booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <User size={14} />
                        <span>{booking.players}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium">
                <Calendar size={18} />
                Book New Slot
              </button>
            </div>

            {/* Payments & Tournaments */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payments */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="text-yellow-500" size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Payments</h2>
                  </div>
                  <button className="text-green-500 text-sm font-medium hover:text-green-600 flex items-center gap-1">
                    History <ChevronRight size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                    <p className="text-yellow-700 text-sm mb-1">Pending</p>
                    <h3 className="text-2xl font-bold text-yellow-900">Rs. 1500</h3>
                  </div>
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <p className="text-green-700 text-sm mb-1">Paid this month</p>
                    <h3 className="text-2xl font-bold text-green-900">Rs. 3200</h3>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {payments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <Clock className="text-gray-400" size={16} />
                        <div>
                          <p className="text-gray-900 font-medium text-sm">{payment.venue}</p>
                          {payment.players && <p className="text-gray-500 text-xs">{payment.players}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">{payment.amount}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          payment.status === 'paid' 
                            ? 'bg-green-500/10 text-green-600' 
                            : 'bg-yellow-500/10 text-yellow-600'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium">
                    Pay Now
                  </button>
                  <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Split Bill
                  </button>
                </div>
              </div>

              {/* Tournaments */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                      <Trophy className="text-yellow-500" size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Tournaments</h2>
                  </div>
                  <button className="text-green-500 text-sm font-medium hover:text-green-600 flex items-center gap-1">
                    All Events <ChevronRight size={16} />
                  </button>
                </div>

                <div className="space-y-4 mb-4">
                  {tournaments.map((tournament, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{tournament.name}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${tournament.statusColor}`}>
                          {tournament.status}
                        </span>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar size={14} />
                          <span>{tournament.date}</span>
                          <span className="mx-2">•</span>
                          <Users size={14} />
                          <span>{tournament.teams}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPin size={14} />
                          <span>{tournament.venue}</span>
                        </div>
                      </div>
                      {tournament.progress > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Team Progress</span>
                            <span className="text-xs font-semibold text-green-600">{tournament.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${tournament.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium">
                  <Trophy size={18} />
                  Browse Tournaments
                </button>
              </div>

              {/* Matchmaking */}
              <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-xl border border-green-500/20 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Users className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Matchmaking</h3>
                      <p className="text-gray-600 text-sm">Find players for your next game</p>
                    </div>
                  </div>
                  <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;