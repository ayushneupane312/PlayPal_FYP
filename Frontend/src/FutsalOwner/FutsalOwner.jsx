import React, { useState } from 'react';
import { Calendar, DollarSign, Users, TrendingUp, Clock, Trophy, Bell, Search, Settings, LayoutDashboard, MapPin, CreditCard, BarChart3, Menu, X } from 'lucide-react';
import FutsalOwnerSidebar from './FutsalOwnerSidebar';
import Header from '../FutsalOwner/components/Header';
import { useAuthStore } from '../store/authStore'; // ✅ ADD THIS IMPORT

export default function FutsalDashboard() {
  // ✅ ADD THIS LINE - Get user from auth store
  const { user } = useAuthStore();
  
  // ✅ Add the missing state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New booking request', desc: 'Team Alpha requested Court 1 for tomorrow at 6 PM', time: 'Just now' },
    { id: 2, title: 'Payment received', desc: 'Rs. 2,500 received for booking #1234', time: '5 min ago' },
    { id: 3, title: 'Tournament registration', desc: '5 new teams registered for Weekend Cup', time: '1 hour ago' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    { label: "Today's Bookings", value: '12', change: '+3 from yesterday', icon: Calendar, color: 'bg-blue-500' },
    { label: 'Monthly Revenue', value: 'Rs. 2.4L', change: '+12% from last month', icon: DollarSign, color: 'bg-green-500' },
    { label: 'Active Courts', value: '4', change: '2 in maintenance', icon: MapPin, color: 'bg-purple-500' }
  ];

  const recentBookings = [
    { team: 'Team Alpha', court: 'Court 1', time: '6:00 PM - 7:00 PM', price: 'Rs. 2,500', status: 'Confirmed', initial: 'T' },
    { team: 'Striker FC', court: 'Court 2', time: '7:00 PM - 8:00 PM', price: 'Rs. 2,500', status: 'Pending', initial: 'S' },
    { team: 'Goal Getters', court: 'Court 3', time: '5:00 PM - 6:00 PM', price: 'Rs. 2,500', status: 'Confirmed', initial: 'G' },
    { team: 'FC Warriors', court: 'Court 1', time: '8:00 PM - 9:00 PM', price: 'Rs. 2,500', status: 'Confirmed', initial: 'F' }
  ];

  const tournaments = [
    { name: 'Weekend Cup 2024', date: 'Dec 28-29', prize: 'Rs. 50,000', entry: 'Rs. 5,000', teams: 12, maxTeams: 16 },
    { name: 'New Year Championship', date: 'Jan 1-2', prize: 'Rs. 100,000', entry: 'Rs. 8,000', teams: 8, maxTeams: 16 }
  ];

  const peakHours = [
    { time: '6 AM', bookings: 2 },
    { time: '8 AM', bookings: 5 },
    { time: '10 AM', bookings: 4 },
    { time: '12 PM', bookings: 3 },
    { time: '2 PM', bookings: 6 },
    { time: '4 PM', bookings: 8 },
    { time: '6 PM', bookings: 12 },
    { time: '8 PM', bookings: 11 },
    { time: '10 PM', bookings: 7 }
  ];

  const maxBookings = Math.max(...peakHours.map(h => h.bookings));

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
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
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
                <text x="30" y="20" className="text-xs fill-gray-500">Rs.28k</text>
                <text x="30" y="60" className="text-xs fill-gray-500">Rs.21k</text>
                <text x="30" y="100" className="text-xs fill-gray-500">Rs.14k</text>
                <text x="30" y="140" className="text-xs fill-gray-500">Rs.7k</text>
                <text x="30" y="180" className="text-xs fill-gray-500">Rs.0k</text>

                {/* Area chart */}
                <path
                  d="M 80,120 L 150,100 L 220,110 L 290,80 L 360,95 L 430,85 L 500,60 L 570,50 L 640,70 L 640,180 L 80,180 Z"
                  fill="url(#revenueGradient)"
                />
                <path
                  d="M 80,120 L 150,100 L 220,110 L 290,80 L 360,95 L 430,85 L 500,60 L 570,50 L 640,70"
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
                      <div className="text-sm text-gray-600">{booking.court} • Today</div>
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